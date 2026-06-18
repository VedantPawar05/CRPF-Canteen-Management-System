# ServeSmart v2 Deployment Guide

This guide outlines how to deploy the microservices architecture for the CRPF Canteen Management System.

## Architecture Components
- **API Gateway**: Nginx or Node.js routing.
- **Frontend**: Next.js App (served via Vercel or custom CDN).
- **Microservices**: Node.js apps deployed via Docker.
- **PostgreSQL**: Cloud-managed PostgreSQL (e.g., AWS RDS).
- **Redis**: Cloud-managed Redis (e.g., AWS ElastiCache).
- **Message Broker**: Managed RabbitMQ or Kafka (e.g., Amazon MQ).

## Local Development
To run the underlying infrastructure locally:
1. Ensure Docker Desktop is running.
2. Navigate to the `crpf/` folder.
3. Run `docker-compose up -d`. This will start:
   - PostgreSQL (port `5432`)
   - Redis (port `6379`)
   - RabbitMQ (port `5672` & `15672`)
   - Grafana (port `3000`)
   - Prometheus (port `9090`)

## Production Deployment (AWS / Kubernetes)

### 1. Database & Persistence Layer
Do not use Docker for the database in production.
- Provision an **AWS RDS PostgreSQL** instance.
- Provision an **AWS ElastiCache Redis** cluster.
- Seed the RDS instance using `docs/schema.sql`.

### 2. Container Registry
Push all built microservice Docker images to Amazon ECR (Elastic Container Registry).

### 3. Kubernetes Setup (EKS)
Apply standard Kubernetes configurations for each service:
- `Deployment`: 2-3 replicas per service.
- `Service`: ClusterIP for internal communication.
- `HPA` (Horizontal Pod Autoscaler): Scale based on CPU/Memory usage.
- `Ingress`: API Gateway to handle external traffic.

### 4. Frontend Deployment
- Push the `apps/web` application to **Vercel** or deploy as a static site backed by a CDN (CloudFront + S3).
- Configure environment variables to point to the API Gateway domain name.

## Security Practices
- Set `POSTGRES_PASSWORD` and all other secrets via Kubernetes Secrets or AWS Secrets Manager.
- Ensure API Gateway uses HTTPS with valid SSL certificates.
- Enforce strict CORS policies on the API Gateway.
- Only allow the API Gateway to talk to underlying microservices; services should not be exposed directly to the internet.
