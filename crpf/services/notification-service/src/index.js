const express = require('express');
const amqplib = require('amqplib');

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 4006;

// In-memory store for connected clients (SSE or WebSocket would use this)
const subscribers = new Map();

// ── RabbitMQ Consumer: Listen for order events ───────────────────
async function startConsumer() {
  try {
    const conn = await amqplib.connect(process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672');
    const channel = await conn.createChannel();
    await channel.assertExchange('order_events', 'fanout', { durable: true });
    const q = await channel.assertQueue('notification_queue', { durable: true });
    await channel.bindQueue(q.queue, 'order_events', '');

    channel.consume(q.queue, (msg) => {
      if (!msg) return;
      try {
        const event = JSON.parse(msg.content.toString());
        console.log(`🔔 Notification event: ${event.type} for order ${event.data.id}`);

        // In production, this would push to Firebase Cloud Messaging, 
        // send SMS via Twilio, or use Server-Sent Events
        if (event.type === 'ORDER_STATUS_UPDATED') {
          const userId = event.data.user_id;
          console.log(`📢 Notifying user ${userId}: Order ${event.data.id} → ${event.data.status}`);
        }
        
        channel.ack(msg);
      } catch (e) {
        console.error('Notification consumer error:', e.message);
        channel.nack(msg, false, true);
      }
    });
    console.log('📡 Notification consumer listening');
  } catch (err) {
    console.warn('⚠️ RabbitMQ not available for notifications:', err.message);
  }
}

// ── SSE endpoint for real-time notifications ─────────────────────
app.get('/notifications/stream/:userId', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const userId = req.params.userId;
  subscribers.set(userId, res);

  req.on('close', () => {
    subscribers.delete(userId);
  });
});

// ── Send notification (internal, called by other services) ───────
app.post('/notifications/send', (req, res) => {
  const { userId, title, message } = req.body;
  const subscriber = subscribers.get(userId);
  if (subscriber) {
    subscriber.write(`data: ${JSON.stringify({ title, message, timestamp: new Date().toISOString() })}\n\n`);
  }
  res.json({ sent: !!subscriber });
});

app.get('/notifications/health', (req, res) => res.json({ status: 'ok', service: 'notification-service' }));

startConsumer().then(() => {
  app.listen(PORT, () => console.log(`📢 Notification Service running on port ${PORT}`));
});
