# 🌐 Production Deployment Guide: ServeSmart

This document details the production architecture, containerization strategy, cloud infrastructure provisioning, and step-by-step instructions for deploying the ServeSmart Canteen Management System to a production-grade cloud environment (such as AWS or Kubernetes).

---

## 🏗️ Production Architecture Overview

In local development, all microservices and infrastructure databases run on a single machine via Docker Compose. For production, the system must decouple persistence layers from execution layers to guarantee high availability, durability, and scaling.

```
                  ┌────────────────────────┐
                  │   Next.js Frontend     │
                  │   (Vercel / CDN)       │
                  └───────────┬────────────┘
                              │ HTTPS / WSS
                              ▼
                  ┌────────────────────────┐
                  │    AWS ALB / Ingress   │
                  └───────────┬────────────┘
                              │
                              ▼
                  ┌────────────────────────┐
                  │   API Gateway (EKS)    │
                  └───────────┬────────────┘
                              │
         ┌────────────┬───────┼────────────┬────────────┐
         ▼            ▼       ▼            ▼            ▼
    ┌──────────┐ ┌────────┐┌──────┐   ┌─────────┐ ┌──────────────┐
    │  Auth    │ │  Menu  ││Order │   │Payment  │ │ Notification │
    │ Service  │ │Service ││Serv. │   │Service  │ │   Service    │
    └────┬─────┘ └───┬────┘└──┬───┘   └────┬────┘ └──────┬───────┘
         │           │        │            │             │
         │   ┌───────┼────────┴────────────┼─────────────┘
         │   │       │                     │
         ▼   ▼       ▼                     ▼
      ┌─────────┐ ┌──────────────┐   ┌─────────────┐
      │ AWS RDS │ │ AWS Elasti-  │   │  Amazon MQ  │
      │ (Post-  │ │ Cache Redis  │   │ (RabbitMQ)  │
      │  greSQL)│ └──────────────┘   └─────────────┘
      └─────────┘
```

---

## 🗄️ 1. Infrastructure Provisioning (Persistence & Brokers)

Never run databases or message queues as stateful Docker containers inside normal VM clusters without managed backup and automated failover. Use the following cloud services:

### A. Managed Database: AWS RDS PostgreSQL
1. Create a PostgreSQL 15 instance inside your VPC.
2. Select Multi-AZ deployment for production high-availability.
3. Configure the Security Group to allow inbound access on port `5432` only from the EKS/ECS security group.
4. Initialize the tables using the schema located at [schema.sql](file:///c:/Users/vedant/Downloads/crpf-canteenpro-main%20%282%29/crpf-canteenpro-main/crpf/docs/schema.sql).

### B. Managed Cache: AWS ElastiCache for Redis
1. Deploy a Redis replication group (v7.x).
2. Enable encryption in transit and rest.
3. Allow incoming traffic on port `6379` from the microservices subnet.

### C. Managed Broker: Amazon MQ (RabbitMQ)
1. Deploy a clustered RabbitMQ broker instance (RabbitMQ engine v3.x).
2. Secure with Username/Password credentials.
3. Note the AMQP connection endpoint (e.g. `amqps://username:password@broker-id.mq.region.amazonaws.com:5671`).

---

## 📦 2. Containerization (Dockerizing Microservices)

Every backend microservice and the API gateway requires a production-optimized `Dockerfile`. Here is the recommended `Dockerfile` structure for the Node.js services (e.g. `auth-service`, `order-service`):

Create a `Dockerfile` in the root of each service folder:
```dockerfile
# Build / Execution Stage
FROM node:18-alpine AS runner

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy source code files
COPY src ./src

# Expose service port
EXPOSE 4001

ENV NODE_ENV=production

CMD ["node", "src/index.js"]
```

### Steps to Build and Push Images to Amazon ECR:
1. Log in to your Amazon ECR registry:
   ```bash
   aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <aws_account_id>.dkr.ecr.<region>.amazonaws.com
   ```
2. Build, tag, and push each service:
   ```bash
   # Example for auth-service
   docker build -t servesmart-auth-service ./services/auth-service
   docker tag servesmart-auth-service:latest <aws_account_id>.dkr.ecr.<region>.amazonaws.com/servesmart-auth-service:latest
   docker push <aws_account_id>.dkr.ecr.<region>.amazonaws.com/servesmart-auth-service:latest
   ```

---

## 🚀 3. Kubernetes Deployment (EKS)

Deploying to AWS EKS requires deploying manifests for each microservice. Below is an example manifest structure for the **Order Service**. Create matching manifests for each service, adjusting ports and environment variables.

### Example Order Service Manifest (`k8s/order-service.yaml`):
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: order-service
  namespace: servesmart
  labels:
    app: order-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: order-service
  template:
    metadata:
      labels:
        app: order-service
    spec:
      containers:
      - name: order-service
        image: <aws_account_id>.dkr.ecr.<region>.amazonaws.com/servesmart-order-service:latest
        imagePullPolicy: Always
        ports:
        - containerPort: 4003
        resources:
          limits:
            cpu: "500m"
            memory: "512Mi"
          requests:
            cpu: "200m"
            memory: "256Mi"
        env:
        - name: PORT
          value: "4003"
        - name: DB_HOST
          value: "rds-postgres-endpoint.amazonaws.com"
        - name: DB_PORT
          value: "5432"
        - name: DB_NAME
          value: "servesmart"
        - name: DB_USER
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: username
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: password
        - name: RABBITMQ_URL
          valueFrom:
            secretKeyRef:
              name: rabbitmq-credentials
              key: url
        - name: QR_SECRET
          valueFrom:
            secretKeyRef:
              name: security-secrets
              key: qr-secret
---
apiVersion: v1
kind: Service
metadata:
  name: order-service
  namespace: servesmart
spec:
  selector:
    app: order-service
  ports:
    - protocol: TCP
      port: 4003
      targetPort: 4003
  type: ClusterIP
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: order-service-hpa
  namespace: servesmart
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: order-service
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 75
```

---

## 🎨 4. Frontend Deployment (Vercel / CDN)

The frontend Next.js application (`apps/web`) is stateless and should be deployed to **Vercel** or an S3 Bucket fronted by Amazon CloudFront.

### Vercel Deployment Steps:
1. Connect your Github/Gitlab repository to Vercel.
2. Select the Root Directory of the project and set the Framework Preset to **Next.js**.
3. Add the following Environment Variable:
   - `NEXT_PUBLIC_API_URL`: Set this to your production API Gateway address (e.g. `https://api.servesmart.crpf.gov.in/api/v1`).
4. Trigger the build. Vercel automatically handles SSL certs and edge caching.

---

## 🛡️ 5. Production Security & Hardening

1. **API Gateway Exposure:** Set up an AWS Application Load Balancer (ALB) that accepts SSL/TLS traffic on port `443` and routes it to the API Gateway ClusterIP service. Under no circumstances should backend services (Ports 4001 - 4006) be assigned public load balancers.
2. **Secrets Encryption:** Store database passwords, JWT secrets, and Twilio API keys in Kubernetes Secrets or pull them dynamically into pod environment variables using AWS Secrets Manager CSI driver.
3. **Database Migration Pipeline:** Incorporate database migration runs into your CI/CD workflow (e.g. Jenkins or GitHub Actions) before executing a blue-green deploy.
4. **Log Forwarding:** Mount a FluentBit daemonset in the EKS cluster to stream service output logs (`stdout` / `stderr`) to Amazon CloudWatch or an ElasticSearch cluster.
