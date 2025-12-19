# Koh Atlas - Technical Documentation (AWS Environment)

**Version:** 1.0  
**Date:** December 12, 2025  
**Cloud Provider:** Amazon Web Services (AWS)  
**Environment:** Production-ready deployment on EKS

---

## Table of Contents

1. [Application Overview](#application-overview)
2. [Technology Stack](#technology-stack)
3. [System Requirements](#system-requirements)
4. [Environments](#environments)
5. [Build Instructions](#build-instructions)
6. [Deployment Approach](#deployment-approach)
7. [Configuration & Secrets](#configuration--secrets)
8. [Networking Requirements](#networking-requirements)
9. [External Dependencies](#external-dependencies)
10. [Data & Databases](#data--databases)
11. [Security Requirements](#security-requirements)

---

## Application Overview

### What is Koh Atlas?

Koh Atlas is a visual architecture design and security analysis platform that enables users to:

- **Design cloud architectures** using an intuitive drag-and-drop interface
- **Analyze security posture** using AI-powered threat detection (Claude Sonnet 4.5)
- **Export diagrams** in multiple formats (JSON, PDF, PNG)
- **Collaborate** on architecture designs with team members
- **Receive real-time security recommendations** based on industry best practices

### Architecture Pattern

**Type:** Modern 3-tier web application with microservices architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                         │
│  React 19 PWA (Progressive Web App)                     │
│  - Offline support via Service Workers                  │
│  - Real-time canvas editing                             │
│  - Responsive design (mobile + desktop)                 │
└─────────────────────────────────────────────────────────┘
                          ↓ HTTPS
┌─────────────────────────────────────────────────────────┐
│                 APPLICATION LAYER (EKS)                 │
│  ┌─────────────────┐    ┌──────────────────┐           │
│  │  API Gateway    │    │  Worker Services │           │
│  │  - Auth (JWT)   │    │  - AI Analysis   │           │
│  │  - Rate limiting│    │  - Export jobs   │           │
│  │  - Input valid. │    │  - Backups       │           │
│  └─────────────────┘    └──────────────────┘           │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    DATA LAYER                           │
│  ┌──────────────┐  ┌───────────┐  ┌──────────────┐     │
│  │  RDS         │  │ ElastiCache│  │  S3          │     │
│  │  PostgreSQL  │  │   Redis    │  │  (Backups)   │     │
│  └──────────────┘  └───────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────┘
```

### Key Features

- **Visual Architecture Designer:** Drag-and-drop components, connect with edges
- **AI Security Analysis:** Powered by Anthropic Claude Sonnet 4.5
- **Real-time Collaboration:** Multiple users can work on same design
- **Export Capabilities:** JSON, PDF, PNG formats
- **Offline Support:** Service Worker enables offline editing
- **Theme Support:** Dark/light mode with custom color palettes
- **Component Library:** Pre-built security components (WAF, VPC, etc.)

---

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.0.0 | UI framework |
| **TypeScript** | 5.7.3 | Type-safe JavaScript |
| **Vite** | 6.4.1 | Build tool & dev server |
| **React Flow** | 11.11.4 | Canvas/diagram library |
| **Radix UI** | Latest | Accessible UI components |
| **Tailwind CSS** | 3.4.17 | Utility-first CSS |
| **Zustand** | 5.0.2 | State management |
| **React Hook Form** | 7.54.2 | Form handling |
| **Zod** | 3.24.1 | Schema validation |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 22 LTS | Runtime environment |
| **Express** | 4.19+ | Web framework |
| **TypeScript** | 5.7+ | Type safety |
| **PostgreSQL** | 16 | Primary database |
| **Redis** | 7.x | Cache & sessions |
| **BullMQ** | 5.x | Job queue |

### AI/ML

| Service | Purpose |
|---------|---------|
| **Anthropic Claude Sonnet 4.5** | Security analysis, threat detection |
| **OpenAI GPT-4** | (Optional) Alternative AI provider |

### Cloud Infrastructure (AWS)

| Service | Purpose |
|---------|---------|
| **EKS (Elastic Kubernetes Service)** | Container orchestration |
| **RDS for PostgreSQL** | Managed database |
| **ElastiCache for Redis** | Managed cache |
| **S3 (Simple Storage Service)** | Object storage (backups, exports) |
| **ALB (Application Load Balancer)** | Load balancing |
| **AWS WAF** | Web application firewall |
| **CloudWatch** | Metrics & logging |
| **Secrets Manager** | Secrets management |
| **HashiCorp Vault** | Advanced secrets & encryption |
| **CodePipeline** | CI/CD pipeline |
| **ECR (Elastic Container Registry)** | Docker image registry |

### Development Tools

| Tool | Purpose |
|------|---------|
| **Git** | Version control |
| **Docker** | Containerization |
| **Terraform** | Infrastructure as Code |
| **kubectl** | Kubernetes management |
| **aws CLI** | AWS management |
| **ESLint** | Code linting |
| **Prettier** | Code formatting |

---

## System Requirements

### Development Environment

**Local Development:**
```yaml
OS: macOS, Linux, or Windows (WSL2)
Node.js: >= 22.0.0 LTS
npm: >= 10.0.0
Git: >= 2.40.0
Docker: >= 24.0.0 (optional, for local containers)
RAM: 8GB minimum, 16GB recommended
Disk Space: 10GB free space
```

**Required CLI Tools:**
```bash
# Node.js & npm
node --version  # v22.x.x
npm --version   # 10.x.x

# AWS CLI
aws --version  # aws-cli/2.x.x

# Kubernetes CLI
kubectl version --client  # 1.28+

# Terraform (for infrastructure)
terraform --version  # 1.6+

# Docker (optional)
docker --version  # 24.0+
```

### Production Environment (AWS)

**EKS Cluster:**
```yaml
Kubernetes Version: 1.28+ (EKS supported version)
Node Group:
  Instance Type: t3.large (2 vCPU, 8GB RAM)
  Nodes: 3-10 (auto-scaling)
  Disk: 100GB GP3 SSD per node
  Availability Zones: Multi-AZ (us-east-1a, us-east-1b, us-east-1c)
  
Cluster Configuration:
  IRSA: Enabled (IAM Roles for Service Accounts)
  Pod Security Policy: Enabled
  Network Policy: Calico
  Monitoring: CloudWatch Container Insights
  Logging: CloudWatch Logs
```

**RDS (PostgreSQL):**
```yaml
Version: PostgreSQL 16
Instance Type: db.r6g.2xlarge (8 vCPU, 64GB RAM)
Multi-AZ: Enabled (automatic failover)
Backups: Automated daily backups (7-day retention)
Storage: 500GB GP3 SSD (auto-scaling enabled)
Encryption: AWS KMS (at rest)
Performance Insights: Enabled
```

**ElastiCache (Redis):**
```yaml
Version: Redis 7.x
Node Type: cache.r6g.large (2 vCPU, 13.07GB RAM)
Cluster Mode: Enabled (High Availability)
Replicas: 2 read replicas
Persistence: RDB snapshots enabled
Encryption: At rest and in transit
```

**S3 Buckets:**
```yaml
Buckets:
  - koh-atlas-prod-exports (Standard storage)
  - koh-atlas-prod-backups (Glacier storage)
  - koh-atlas-prod-static (Standard + CloudFront CDN)
Versioning: Enabled
Lifecycle: Auto-tier to Glacier after 90 days
Encryption: SSE-KMS (AWS managed keys)
```

### Network Requirements

**Bandwidth:**
- Minimum: 100 Mbps
- Recommended: 1 Gbps
- CDN: CloudFront (AWS global network)

**Latency Targets:**
- API response (p50): < 200ms
- API response (p95): < 1000ms
- Database query (avg): < 50ms
- Cache hit: < 5ms

---

## Environments

### 1. Development (Local)

**Purpose:** Local development on developer machines

```yaml
Environment: development
URL: http://localhost:5000
Database: 
  - Local PostgreSQL (Docker) OR
  - RDS (dev instance)
Redis: 
  - Local Redis (Docker) OR
  - ElastiCache (dev tier)
API Keys: Development keys (limited quota)
Monitoring: Console logs only
```

**Environment Variables (`.env.development`):**
```bash
NODE_ENV=development
VITE_API_URL=http://localhost:3000
VITE_APP_URL=http://localhost:5000

# Database
DATABASE_URL=postgresql://localhost:5432/kohatlas_dev
DATABASE_SSL=false

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# AI
ANTHROPIC_API_KEY=sk-ant-dev-***
ANTHROPIC_MODEL=claude-sonnet-4.5-20241022

# Debug
DEBUG=true
LOG_LEVEL=debug
```

### 2. Staging (EKS)

**Purpose:** Pre-production testing, QA validation

```yaml
Environment: staging
AWS Account: koh-atlas-staging
URL: https://staging.kohatlas.com
Namespace: staging
Database: RDS db.t3.large
Redis: ElastiCache cache.t3.medium
Monitoring: Full (CloudWatch)
Auto-scaling: 2-4 pods
```

**EKS Deployment:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
  namespace: staging
spec:
  replicas: 2
  template:
    spec:
      serviceAccountName: api-gateway-sa
      containers:
      - name: api
        image: <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/api:latest
        env:
        - name: NODE_ENV
          value: "staging"
        - name: DATABASE_HOST
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: host
```

### 3. Production (EKS)

**Purpose:** Live production environment serving end users

```yaml
Environment: production
AWS Account: koh-atlas-production
URL: https://app.kohatlas.com
Namespace: production
Database: RDS db.r6g.2xlarge + read replica
Redis: ElastiCache cache.r6g.large (cluster mode)
Monitoring: Full + PagerDuty alerts
Auto-scaling: 3-10 pods
High Availability: Multi-AZ (3 zones)
```

**Environment Variables (Kubernetes Secrets):**
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
  namespace: production
type: Opaque
data:
  DATABASE_URL: <base64>
  REDIS_HOST: <base64>
  ANTHROPIC_API_KEY: <base64>
  JWT_PRIVATE_KEY: <base64>
  ENCRYPTION_KEY: <base64>
```

### Environment Comparison

| Feature | Development | Staging | Production |
|---------|-------------|---------|------------|
| **Infrastructure** | Local/Docker | EKS (small) | EKS (full) |
| **Database** | Local/dev instance | RDS db.t3.large | RDS db.r6g.2xlarge + replica |
| **Redis** | Local/dev tier | ElastiCache t3.medium | ElastiCache r6g.large cluster |
| **Auto-scaling** | N/A | 2-4 pods | 3-10 pods |
| **High Availability** | No | No | Yes (multi-AZ) |
| **Monitoring** | Logs only | Full monitoring | Full + alerts |
| **Backups** | None | Daily (3-day retention) | Hourly (30-day retention) |
| **SSL/TLS** | Self-signed | ACM certificate | ACM certificate |
| **Cost** | $0 (local) | ~$400/month | ~$1,862/month |

---

## Build Instructions

### Prerequisites

```bash
# 1. Install Node.js 22 LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
aws configure

# 3. Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# 4. Clone repository
git clone https://github.com/kohrasheed/koh-atlas-secure-arc.git
cd koh-atlas-secure-arc
```

### Local Development Build

```bash
# 1. Install dependencies
npm install

# 2. Create .env.development file
cat > .env.development << EOF
NODE_ENV=development
VITE_API_URL=http://localhost:3000
DATABASE_URL=postgresql://localhost:5432/kohatlas_dev
REDIS_HOST=localhost
ANTHROPIC_API_KEY=your-dev-key-here
EOF

# 3. Start development server
npm run dev

# Application runs at http://localhost:5000
```

### Production Build

```bash
# 1. Set production environment
export NODE_ENV=production

# 2. Install dependencies (production only)
npm ci --only=production

# 3. Build frontend
npm run build

# Output: dist/ folder with optimized assets

# 4. Verify build
npm run preview  # Preview production build locally
```

### Docker Build

```bash
# 1. Build Docker image
docker build -t koh-atlas-api:latest -f Dockerfile .

# 2. Tag for ECR (Elastic Container Registry)
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com

docker tag koh-atlas-api:latest \
  <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/koh-atlas-api:latest

# 3. Push to ECR
docker push <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/koh-atlas-api:latest

# 4. Verify image
aws ecr describe-images --repository-name koh-atlas-api
```

### Dockerfile

```dockerfile
# Multi-stage build for optimized production image
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "dist/server.js"]
```

### Build Optimization

**Production build optimizations:**
```json
{
  "build": {
    "target": "esnext",
    "minify": "terser",
    "sourcemap": false,
    "rollupOptions": {
      "output": {
        "manualChunks": {
          "vendor": ["react", "react-dom"],
          "ui": ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu"],
          "canvas": ["reactflow"]
        }
      }
    },
    "chunkSizeWarningLimit": 1000
  }
}
```

---

## Deployment Approach

### CI/CD Pipeline (AWS CodePipeline)

**Trigger:** Git push to `main` branch

```yaml
# buildspec.yml
version: 0.2

phases:
  pre_build:
    commands:
      # Login to ECR
      - aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY
      - COMMIT_HASH=$(echo $CODEBUILD_RESOLVED_SOURCE_VERSION | cut -c 1-7)
      - IMAGE_TAG=${COMMIT_HASH:=latest}
  
  build:
    commands:
      # Install dependencies
      - npm ci
      
      # Run tests
      - npm test
      
      # Build Docker image
      - docker build -t $ECR_REPOSITORY:$IMAGE_TAG .
      - docker tag $ECR_REPOSITORY:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
      - docker tag $ECR_REPOSITORY:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY:latest
  
  post_build:
    commands:
      # Push to ECR
      - docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
      - docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest
      
      # Update kube config
      - aws eks update-kubeconfig --name $EKS_CLUSTER_NAME --region $AWS_REGION
      
      # Deploy to EKS
      - kubectl set image deployment/api-gateway api=$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG -n production
      - kubectl rollout status deployment/api-gateway -n production

artifacts:
  files:
    - k8s/**/*
    - appspec.yml
```

### Kubernetes Deployment Strategy

**Rolling Update (Zero Downtime):**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
  namespace: production
spec:
  replicas: 5
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 2        # Create 2 extra pods during update
      maxUnavailable: 1  # Max 1 pod can be unavailable
  
  template:
    metadata:
      labels:
        app: api-gateway
        version: "1.0.0"
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "3000"
        prometheus.io/path: "/metrics"
    spec:
      serviceAccountName: api-gateway-sa
      
      containers:
      - name: api
        image: <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/koh-atlas-api:latest
        
        ports:
        - containerPort: 3000
          name: http
        
        # Health checks
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
          failureThreshold: 3
        
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
          failureThreshold: 3
        
        # Resource limits
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        
        # Environment from secrets
        envFrom:
        - secretRef:
            name: app-secrets
        - configMapRef:
            name: app-config

---
apiVersion: v1
kind: Service
metadata:
  name: api-gateway
  namespace: production
  annotations:
    service.beta.kubernetes.io/aws-load-balancer-type: "nlb"
spec:
  type: LoadBalancer
  selector:
    app: api-gateway
  ports:
  - port: 80
    targetPort: 3000

---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-gateway-hpa
  namespace: production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-gateway
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### Deployment Process

**Step-by-step deployment:**

```bash
# 1. Build and push Docker image
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com
docker build -t koh-atlas-api:v1.2.3 .
docker tag koh-atlas-api:v1.2.3 <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/koh-atlas-api:v1.2.3
docker push <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/koh-atlas-api:v1.2.3

# 2. Update kubeconfig
aws eks update-kubeconfig --name koh-atlas-cluster --region us-east-1

# 3. Update Kubernetes deployment
kubectl set image deployment/api-gateway \
  api=<AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/koh-atlas-api:v1.2.3 \
  --namespace=production

# 4. Monitor rollout
kubectl rollout status deployment/api-gateway -n production

# 5. Verify deployment
kubectl get pods -n production
kubectl logs -f deployment/api-gateway -n production

# 6. Run smoke tests
curl https://api.kohatlas.com/health

# 7. Rollback if needed
kubectl rollout undo deployment/api-gateway -n production
```

---

## Configuration & Secrets

### AWS Secrets Manager

**Storing secrets:**

```bash
# 1. Create secret
aws secretsmanager create-secret \
  --name prod/kohatlas/anthropic-key \
  --secret-string "sk-ant-prod-***" \
  --region us-east-1

# 2. Grant IAM access to EKS pods (via IRSA)
aws iam create-policy \
  --policy-name KohAtlasSecretsAccess \
  --policy-document file://secrets-policy.json

# 3. Attach to service account role
aws iam attach-role-policy \
  --role-name eks-api-gateway-role \
  --policy-arn arn:aws:iam::<AWS_ACCOUNT_ID>:policy/KohAtlasSecretsAccess
```

**IAM Policy (secrets-policy.json):**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue",
        "secretsmanager:DescribeSecret"
      ],
      "Resource": "arn:aws:secretsmanager:us-east-1:<AWS_ACCOUNT_ID>:secret:prod/kohatlas/*"
    }
  ]
}
```

### HashiCorp Vault (Primary Secrets)

**Vault cluster on EKS:**

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: vault
  namespace: vault
spec:
  serviceName: vault
  replicas: 3
  template:
    spec:
      containers:
      - name: vault
        image: hashicorp/vault:1.15
        env:
        - name: VAULT_ADDR
          value: "http://127.0.0.1:8200"
        ports:
        - containerPort: 8200
          name: http
        - containerPort: 8201
          name: internal
```

**Using Vault from application:**

```typescript
import Vault from 'node-vault';

const vault = Vault({
  endpoint: process.env.VAULT_ADDR,
  token: process.env.VAULT_TOKEN,
});

// Read database credentials
async function getDatabaseCredentials() {
  const result = await vault.read('database/creds/api-gateway');
  return {
    username: result.data.username,
    password: result.data.password,
  };
}
```

### Configuration Files

**1. Application Configuration (`config/production.json`):**

```json
{
  "app": {
    "name": "Koh Atlas",
    "version": "1.0.0",
    "port": 3000,
    "env": "production"
  },
  "database": {
    "pool": {
      "min": 2,
      "max": 20,
      "idleTimeoutMillis": 30000,
      "connectionTimeoutMillis": 5000
    },
    "ssl": {
      "rejectUnauthorized": true,
      "ca": "/path/to/rds-ca-bundle.pem"
    }
  },
  "redis": {
    "maxRetriesPerRequest": 3,
    "enableReadyCheck": true,
    "enableOfflineQueue": false
  },
  "security": {
    "jwtExpiry": "15m",
    "refreshTokenExpiry": "7d",
    "bcryptRounds": 12,
    "csrfEnabled": true
  },
  "rateLimit": {
    "windowMs": 60000,
    "max": 100
  },
  "cors": {
    "origin": ["https://app.kohatlas.com"],
    "credentials": true
  }
}
```

**2. Kubernetes ConfigMap:**

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: production
data:
  NODE_ENV: "production"
  LOG_LEVEL: "info"
  API_TIMEOUT: "30000"
  MAX_REQUEST_SIZE: "10mb"
  
  # Database
  DATABASE_POOL_MIN: "2"
  DATABASE_POOL_MAX: "20"
  
  # Redis
  REDIS_PORT: "6379"
  REDIS_DB: "0"
  
  # AI
  ANTHROPIC_MODEL: "claude-sonnet-4.5-20241022"
  ANTHROPIC_MAX_TOKENS: "4096"
```

### Environment-Specific Secrets

| Secret | Development | Staging | Production |
|--------|-------------|---------|------------|
| **Database Password** | Local only | Secrets Manager | Vault (dynamic) |
| **Redis Password** | None | Secrets Manager | Vault (dynamic) |
| **Anthropic API Key** | Dev key (limited) | Staging key | Production key |
| **JWT Private Key** | Generated locally | Secrets Manager | Vault |
| **Encryption Key** | Test key | Secrets Manager | Vault |
| **Stripe API Key** | Test mode | Test mode | Live mode |

---

## Networking Requirements

### Network Architecture

```
Internet
   ↓
Cloudflare (DDoS + WAF)
   ↓
ALB (Application Load Balancer)
   ↓
EKS Cluster (Private Subnets)
   ├── API Gateway Pods (10.0.1.0/24)
   ├── Worker Pods (10.0.2.0/24)
   ↓
RDS (Private Subnet: 10.0.10.0/24)
ElastiCache (Private Subnet: 10.0.20.0/24)
```

### VPC Configuration

```yaml
# Terraform - VPC
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {
    Name = "koh-atlas-vpc"
  }
}

# Public subnets (for ALB)
resource "aws_subnet" "public" {
  count             = 3
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]
  
  map_public_ip_on_launch = true
  
  tags = {
    Name = "public-subnet-${count.index + 1}"
    "kubernetes.io/role/elb" = "1"
  }
}

# Private subnets (for EKS, RDS, ElastiCache)
resource "aws_subnet" "private" {
  count             = 3
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 10}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]
  
  tags = {
    Name = "private-subnet-${count.index + 1}"
    "kubernetes.io/role/internal-elb" = "1"
  }
}

# NAT Gateway (for private subnet internet access)
resource "aws_nat_gateway" "main" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public[0].id
  
  tags = {
    Name = "koh-atlas-nat-gw"
  }
}
```

### Security Groups

```yaml
# EKS cluster security group
resource "aws_security_group" "eks_cluster" {
  name        = "eks-cluster-sg"
  description = "Security group for EKS cluster"
  vpc_id      = aws_vpc.main.id
  
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# RDS security group
resource "aws_security_group" "rds" {
  name        = "rds-sg"
  description = "Allow PostgreSQL from EKS"
  vpc_id      = aws_vpc.main.id
  
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.eks_cluster.id]
  }
}

# ElastiCache security group
resource "aws_security_group" "redis" {
  name        = "elasticache-sg"
  description = "Allow Redis from EKS"
  vpc_id      = aws_vpc.main.id
  
  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.eks_cluster.id]
  }
}
```

### DNS Configuration (Route 53)

```bash
# 1. Create hosted zone
aws route53 create-hosted-zone \
  --name kohatlas.com \
  --caller-reference $(date +%s)

# 2. Add A record for app
cat > change-batch.json << EOF
{
  "Changes": [{
    "Action": "CREATE",
    "ResourceRecordSet": {
      "Name": "app.kohatlas.com",
      "Type": "A",
      "AliasTarget": {
        "HostedZoneId": "<ALB_HOSTED_ZONE_ID>",
        "DNSName": "<ALB_DNS_NAME>",
        "EvaluateTargetHealth": true
      }
    }
  }]
}
EOF

aws route53 change-resource-record-sets \
  --hosted-zone-id <HOSTED_ZONE_ID> \
  --change-batch file://change-batch.json
```

### SSL/TLS Certificates (ACM)

```bash
# Request certificate
aws acm request-certificate \
  --domain-name kohatlas.com \
  --subject-alternative-names "*.kohatlas.com" \
  --validation-method DNS \
  --region us-east-1

# Get validation CNAME records
aws acm describe-certificate \
  --certificate-arn <CERT_ARN> \
  --region us-east-1

# Add CNAME records to Route 53 for validation
```

---

## External Dependencies

### Third-Party Services

| Service | Purpose | Integration | Fallback |
|---------|---------|-------------|----------|
| **Anthropic Claude** | AI security analysis | REST API | OpenAI GPT-4 |
| **Stripe** | Payment processing | Stripe.js SDK | Manual billing |
| **SendGrid** | Email delivery | SMTP/API | AWS SES |
| **PagerDuty** | Incident management | Webhooks | Email alerts |
| **Sentry** | Error tracking | SDK | CloudWatch Logs |

### API Integrations

**1. Anthropic Claude API:**

```typescript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function analyzeArchitecture(design: Design) {
  const response = await client.messages.create({
    model: 'claude-sonnet-4.5-20241022',
    max_tokens: 4096,
    messages: [{
      role: 'user',
      content: `Analyze this architecture for security issues: ${JSON.stringify(design)}`
    }]
  });
  
  return response.content[0].text;
}
```

**2. Stripe Payment API:**

```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

async function createSubscription(customerId: string, priceId: string) {
  return await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
    expand: ['latest_invoice.payment_intent'],
  });
}
```

---

## Data & Databases

### PostgreSQL Database Schema

**RDS for PostgreSQL 16**

**Database:** `kohatlas_production`

**Key Tables:**

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- Architecture designs table
CREATE TABLE designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  nodes JSONB NOT NULL DEFAULT '[]',
  edges JSONB NOT NULL DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_public BOOLEAN DEFAULT false,
  version INTEGER DEFAULT 1
);

CREATE INDEX idx_designs_user_id ON designs(user_id);
CREATE INDEX idx_designs_created_at ON designs(created_at DESC);
CREATE INDEX idx_designs_nodes_gin ON designs USING gin(nodes);

-- Security analyses table
CREATE TABLE security_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  design_id UUID REFERENCES designs(id) ON DELETE CASCADE,
  analysis_result JSONB NOT NULL,
  severity VARCHAR(50),
  findings_count INTEGER,
  ai_model VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  execution_time_ms INTEGER
);

CREATE INDEX idx_analyses_design_id ON security_analyses(design_id);
CREATE INDEX idx_analyses_created_at ON security_analyses(created_at DESC);

-- Sessions table (for auth)
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX idx_sessions_token_hash ON sessions(token_hash);
```

### Database Connection

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DATABASE_HOST,
  port: 5432,
  database: 'kohatlas_production',
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync('/path/to/rds-ca-bundle.pem').toString(),
  },
  min: 2,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Test connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('Database connected:', res.rows[0].now);
  }
});
```

### Redis Cache (ElastiCache)

**Use cases:**
- Session storage
- Rate limiting counters
- API response cache
- Job queue (BullMQ)

**Connection:**

```typescript
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: 6379,
  password: process.env.REDIS_PASSWORD,
  db: 0,
  tls: {
    rejectUnauthorized: true,
  },
  retryStrategy: (times) => {
    return Math.min(times * 50, 2000);
  },
  maxRetriesPerRequest: 3,
});

// Session storage
async function setSession(sessionId: string, data: object, ttl: number) {
  await redis.setex(`session:${sessionId}`, ttl, JSON.stringify(data));
}

// Rate limiting
async function checkRateLimit(userId: string, limit: number, window: number) {
  const key = `ratelimit:${userId}`;
  const count = await redis.incr(key);
  
  if (count === 1) {
    await redis.expire(key, window);
  }
  
  return count <= limit;
}
```

### Backups

**Automated backups:**

```yaml
# RDS automated backups
Frequency: Daily at 2:00 AM UTC
Retention: 30 days
Type: Full backup + transaction logs
Recovery Point Objective (RPO): 5 minutes
Recovery Time Objective (RTO): 1 hour

# Manual backup
aws rds create-db-snapshot \
  --db-instance-identifier koh-atlas-db \
  --db-snapshot-identifier manual-backup-$(date +%Y%m%d)
```

**Export to S3:**

```bash
# Export database to S3
aws rds start-export-task \
  --export-task-identifier export-$(date +%Y%m%d) \
  --source-arn arn:aws:rds:us-east-1:<ACCOUNT_ID>:snapshot:manual-backup-$(date +%Y%m%d) \
  --s3-bucket-name koh-atlas-prod-backups \
  --iam-role-arn arn:aws:iam::<ACCOUNT_ID>:role/rds-s3-export-role \
  --kms-key-id arn:aws:kms:us-east-1:<ACCOUNT_ID>:key/<KMS_KEY_ID>
```

---

## Security Requirements

### Authentication & Authorization

**JWT-based authentication:**

```typescript
import jwt from 'jsonwebtoken';

// Generate JWT token
function generateToken(user: User) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_PRIVATE_KEY,
    {
      algorithm: 'RS256',
      expiresIn: '15m',
      issuer: 'kohatlas.com',
      audience: 'kohatlas-app',
    }
  );
}

// Verify JWT token
function verifyToken(token: string) {
  return jwt.verify(token, process.env.JWT_PUBLIC_KEY, {
    algorithms: ['RS256'],
    issuer: 'kohatlas.com',
    audience: 'kohatlas-app',
  });
}
```

**Role-Based Access Control (RBAC):**

| Role | Permissions |
|------|-------------|
| **User** | Create/edit own designs, run analyses, export |
| **Premium** | All User permissions + unlimited analyses |
| **Admin** | All permissions + user management |
| **Auditor** | Read-only access to all designs and logs |

### Encryption

**At-rest encryption:**
- Database: RDS with AWS KMS encryption
- Storage: S3 with SSE-KMS
- Secrets: AWS Secrets Manager + Vault

**In-transit encryption:**
- TLS 1.3 for all HTTPS connections
- RDS SSL/TLS connections
- ElastiCache in-transit encryption

**Application-level encryption:**

```typescript
import crypto from 'crypto';

const algorithm = 'aes-256-gcm';
const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

function encrypt(text: string) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
  };
}
```

### Security Headers

```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.anthropic.com"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));
```

### Compliance Requirements

| Standard | Status | Requirements |
|----------|--------|--------------|
| **SOC 2 Type II** | ✅ Compliant | Annual audit, access controls, encryption |
| **ISO 27001** | ✅ Compliant | ISMS documentation, risk assessment |
| **GDPR** | ✅ Compliant | Data privacy, right to deletion, consent |
| **HIPAA** | ⚠️ Optional | PHI encryption, audit logs, BAA required |
| **PCI-DSS** | ✅ Compliant | Payment data handled by Stripe (PCI Level 1) |

### Security Monitoring

**AWS Security Hub:**

```bash
# Enable Security Hub
aws securityhub enable-security-hub --region us-east-1

# View findings
aws securityhub get-findings \
  --filters '{"SeverityLabel":[{"Value":"CRITICAL","Comparison":"EQUALS"}]}' \
  --region us-east-1
```

**GuardDuty (Threat Detection):**

```bash
# Enable GuardDuty
aws guardduty create-detector --enable --region us-east-1

# View threats
aws guardduty list-findings --detector-id <DETECTOR_ID> --region us-east-1
```

---

## Appendix

### Useful Commands

```bash
# EKS cluster access
aws eks update-kubeconfig --name koh-atlas-cluster --region us-east-1

# View logs
kubectl logs -f deployment/api-gateway -n production

# Scale deployment
kubectl scale deployment/api-gateway --replicas=10 -n production

# Exec into pod
kubectl exec -it <pod-name> -n production -- /bin/sh

# Port forward (local testing)
kubectl port-forward svc/api-gateway 3000:80 -n production

# RDS connection
aws rds describe-db-instances --db-instance-identifier koh-atlas-db

# View secrets
aws secretsmanager get-secret-value --secret-id prod/kohatlas/anthropic-key
```

### Troubleshooting

**Common issues:**

1. **Pods not starting:** Check ECR image pull permissions, resource limits
2. **Database connection failed:** Verify security groups, RDS Auth Proxy
3. **High latency:** Check RDS Performance Insights, query optimization
4. **502 Bad Gateway:** Check ALB target health, pod readiness probes

### Support Contacts

- **Engineering:** engineering@kohatlas.com
- **DevOps:** devops@kohatlas.com
- **Security:** security@kohatlas.com
- **On-call:** PagerDuty (automated alerts)

---

**Document Version:** 1.0  
**Last Updated:** December 12, 2025  
**Maintained by:** Koh Atlas Engineering Team
