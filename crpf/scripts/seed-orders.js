const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5433,
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'adminpassword',
  database: process.env.DB_NAME || 'servesmart',
});

async function seedOrders() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get a soldier user
    const usersResult = await client.query("SELECT id FROM users WHERE role = 'soldier' LIMIT 1");
    if (usersResult.rows.length === 0) {
      throw new Error('No soldier user found in db');
    }
    const userId = usersResult.rows[0].id;

    // Get menu items
    const menuResult = await client.query("SELECT id, price FROM menu_items");
    const menuItems = menuResult.rows;

    if (menuItems.length === 0) {
      throw new Error('No menu items found in db');
    }

    // Generate random orders over the last 7 days
    const now = new Date();
    for (let i = 0; i < 7; i++) {
        // Random number of orders per day between 5 and 15
        const ordersPerDay = Math.floor(Math.random() * 11) + 5;
        
        for (let j = 0; j < ordersPerDay; j++) {
            const date = new Date(now);
            date.setDate(now.getDate() - i);
            // Random hour between 8 AM and 8 PM
            date.setHours(8 + Math.floor(Math.random() * 13), Math.floor(Math.random() * 60), 0);

            // Create Order
            let totalAmount = 0;
            const itemsInOrder = Math.floor(Math.random() * 3) + 1; // 1 to 3 items
            const orderItemsInsert = [];

            for (let k = 0; k < itemsInOrder; k++) {
                const menuItem = menuItems[Math.floor(Math.random() * menuItems.length)];
                const quantity = Math.floor(Math.random() * 3) + 1; // 1 to 3 qty
                totalAmount += menuItem.price * quantity;
                orderItemsInsert.push({ id: menuItem.id, quantity, price: menuItem.price });
            }

            const statuses = ['Pending', 'Completed', 'Cancelled', 'Accepted', 'Preparing', 'Ready'];
            let status = 'Completed';
            if (i === 0) { // If today, some orders can be active
                 status = statuses[Math.floor(Math.random() * statuses.length)];
            }

            const insertOrderQuery = `
                INSERT INTO orders (user_id, total_amount, status, created_at, updated_at) 
                VALUES ($1, $2, $3, $4, $4) RETURNING id
            `;
            const orderRes = await client.query(insertOrderQuery, [userId, totalAmount, status, date]);
            const orderId = orderRes.rows[0].id;

            for (const item of orderItemsInsert) {
                await client.query(`
                    INSERT INTO order_items (order_id, menu_item_id, quantity, price_at_time) 
                    VALUES ($1, $2, $3, $4)
                `, [orderId, item.id, item.quantity, item.price]);
            }
        }
    }

    await client.query('COMMIT');
    console.log('✅ Successfully seeded fake historical historical orders!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding orders:', error);
  } finally {
    client.release();
    pool.end();
  }
}

seedOrders();
