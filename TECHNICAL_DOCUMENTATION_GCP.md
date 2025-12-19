# Koh Atlas - Technical Documentation (GCP Environment)

**Version:** 1.0  
**Date:** December 12, 2025  
**Cloud Provider:** Google Cloud Platform (GCP)  
**Environment:** Production-ready deployment on GKE

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
│                 APPLICATION LAYER (GKE)                 │
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
│  │  Cloud SQL   │  │ Memorystore│  │ Cloud Storage│     │
│  │  PostgreSQL  │  │   Redis    │  │   (Backups)  │     │
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

### Cloud Infrastructure (GCP)

| Service | Purpose |
|---------|---------|
| **GKE (Google Kubernetes Engine)** | Container orchestration |
| **Cloud SQL for PostgreSQL** | Managed database |
| **Memorystore for Redis** | Managed cache |
| **Cloud Storage** | Object storage (backups, exports) |
| **Cloud Load Balancing** | Global HTTPS load balancer |
| **Cloud Armor** | WAF & DDoS protection |
| **Cloud Monitoring** | Metrics & alerting |
| **Cloud Logging** | Centralized logging |
| **Secret Manager** | Secrets management |
| **Cloud Build** | CI/CD pipeline |
| **Artifact Registry** | Docker image registry |

### Development Tools

| Tool | Purpose |
|------|---------|
| **Git** | Version control |
| **Docker** | Containerization |
| **Terraform** | Infrastructure as Code |
| **kubectl** | Kubernetes management |
| **gcloud CLI** | GCP management |
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

# GCP CLI
gcloud --version  # Latest

# Kubernetes CLI
kubectl version --client  # 1.28+

# Terraform (for infrastructure)
terraform --version  # 1.6+

# Docker (optional)
docker --version  # 24.0+
```

### Production Environment (GCP)

**GKE Cluster:**
```yaml
Kubernetes Version: 1.28+ (GKE regular channel)
Node Pool:
  Machine Type: n2-standard-2 (2 vCPU, 8GB RAM)
  Nodes: 3-10 (auto-scaling)
  Disk: 100GB SSD per node
  Zone: Multi-zonal (us-central1-a, us-central1-b, us-central1-c)
  
Cluster Configuration:
  Workload Identity: Enabled
  Binary Authorization: Enabled (production)
  Network Policy: Enabled (Dataplane V2)
  Monitoring: Cloud Operations Suite
  Logging: Cloud Logging
```

**Cloud SQL (PostgreSQL):**
```yaml
Version: PostgreSQL 16
Instance Type: db-custom-8-32768 (8 vCPU, 32GB RAM)
High Availability: Enabled (automatic failover)
Backups: Automated daily backups (7-day retention)
Storage: 500GB SSD (auto-resize enabled)
Encryption: Customer-managed encryption keys (CMEK)
```

**Memorystore (Redis):**
```yaml
Version: Redis 7.x
Tier: Standard (High Availability)
Capacity: 10GB
Persistence: RDB snapshots enabled
Replication: Automatic (read replicas in HA mode)
```

**Cloud Storage:**
```yaml
Buckets:
  - koh-atlas-prod-exports (Standard storage)
  - koh-atlas-prod-backups (Coldline storage)
  - koh-atlas-prod-static (Standard + CDN)
Versioning: Enabled
Lifecycle: Auto-tier to Coldline after 90 days
```

### Network Requirements

**Bandwidth:**
- Minimum: 100 Mbps
- Recommended: 1 Gbps
- CDN: Cloud CDN (Google's global network)

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
  - Cloud SQL (dev instance)
Redis: 
  - Local Redis (Docker) OR
  - Memorystore (dev tier)
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

### 2. Staging (GKE)

**Purpose:** Pre-production testing, QA validation

```yaml
Environment: staging
GCP Project: koh-atlas-staging
URL: https://staging.kohatlas.com
Namespace: staging
Database: Cloud SQL (db-custom-2-8192)
Redis: Memorystore (5GB)
Monitoring: Full (Cloud Operations)
Auto-scaling: 2-4 pods
```

**GKE Deployment:**
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
      containers:
      - name: api
        image: gcr.io/koh-atlas-staging/api:latest
        env:
        - name: NODE_ENV
          value: "staging"
        - name: DATABASE_HOST
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: host
```

### 3. Production (GKE)

**Purpose:** Live production environment serving end users

```yaml
Environment: production
GCP Project: koh-atlas-production
URL: https://app.kohatlas.com
Namespace: production
Database: Cloud SQL (db-custom-8-32768 + read replica)
Redis: Memorystore (10GB HA)
Monitoring: Full + PagerDuty alerts
Auto-scaling: 3-10 pods
High Availability: Multi-zone (3 zones)
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
| **Infrastructure** | Local/Docker | GKE (small) | GKE (full) |
| **Database** | Local/dev instance | Cloud SQL (2 vCPU) | Cloud SQL (8 vCPU + replica) |
| **Redis** | Local/dev tier | Memorystore 5GB | Memorystore 10GB HA |
| **Auto-scaling** | N/A | 2-4 pods | 3-10 pods |
| **High Availability** | No | No | Yes (multi-zone) |
| **Monitoring** | Logs only | Full monitoring | Full + alerts |
| **Backups** | None | Daily (3-day retention) | Hourly (30-day retention) |
| **SSL/TLS** | Self-signed | Let's Encrypt | Google-managed |
| **Cost** | $0 (local) | ~$300/month | ~$1,350/month |

---

## Build Instructions

### Prerequisites

```bash
# 1. Install Node.js 22 LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Install gcloud CLI
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
gcloud auth login

# 3. Install kubectl
gcloud components install kubectl

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

# 2. Tag for GCR (Google Container Registry)
docker tag koh-atlas-api:latest \
  gcr.io/koh-atlas-production/api:latest

# 3. Push to GCR
gcloud auth configure-docker
docker push gcr.io/koh-atlas-production/api:latest

# 4. Verify image
gcloud container images list --repository=gcr.io/koh-atlas-production
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

### CI/CD Pipeline (Cloud Build)

**Trigger:** Git push to `main` branch

```yaml
# cloudbuild.yaml
steps:
  # 1. Install dependencies
  - name: 'node:22'
    entrypoint: 'npm'
    args: ['ci']
  
  # 2. Run tests
  - name: 'node:22'
    entrypoint: 'npm'
    args: ['test']
  
  # 3. Build Docker image
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'build'
      - '-t'
      - 'gcr.io/$PROJECT_ID/api:$COMMIT_SHA'
      - '-t'
      - 'gcr.io/$PROJECT_ID/api:latest'
      - '.'
  
  # 4. Push to Artifact Registry
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/api:$COMMIT_SHA']
  
  # 5. Deploy to GKE
  - name: 'gcr.io/cloud-builders/gke-deploy'
    args:
      - 'run'
      - '--filename=k8s/'
      - '--image=gcr.io/$PROJECT_ID/api:$COMMIT_SHA'
      - '--location=us-central1'
      - '--cluster=koh-atlas-cluster'
      - '--namespace=production'

images:
  - 'gcr.io/$PROJECT_ID/api:$COMMIT_SHA'
  - 'gcr.io/$PROJECT_ID/api:latest'

options:
  machineType: 'N1_HIGHCPU_8'
  timeout: '1200s'
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
    spec:
      containers:
      - name: api
        image: gcr.io/koh-atlas-production/api:latest
        
        ports:
        - containerPort: 3000
        
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
        
        # Workload Identity
        serviceAccountName: api-gateway-sa

---
apiVersion: v1
kind: Service
metadata:
  name: api-gateway
  namespace: production
spec:
  type: ClusterIP
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
gcloud builds submit --tag gcr.io/koh-atlas-production/api:v1.2.3

# 2. Update Kubernetes deployment
kubectl set image deployment/api-gateway \
  api=gcr.io/koh-atlas-production/api:v1.2.3 \
  --namespace=production

# 3. Monitor rollout
kubectl rollout status deployment/api-gateway -n production

# 4. Verify deployment
kubectl get pods -n production
kubectl logs -f deployment/api-gateway -n production

# 5. Run smoke tests
curl https://api.kohatlas.com/health

# 6. Rollback if needed
kubectl rollout undo deployment/api-gateway -n production
```

### Blue-Green Deployment (Optional)

For critical updates with instant rollback capability:

```yaml
# Blue deployment (current)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway-blue
spec:
  replicas: 5
  template:
    metadata:
      labels:
        app: api-gateway
        version: blue

---
# Green deployment (new version)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway-green
spec:
  replicas: 5
  template:
    metadata:
      labels:
        app: api-gateway
        version: green

---
# Service (switch by changing selector)
apiVersion: v1
kind: Service
metadata:
  name: api-gateway
spec:
  selector:
    app: api-gateway
    version: blue  # Change to 'green' to switch traffic
```

---

## Configuration & Secrets

### Secret Manager (GCP)

**Storing secrets:**

```bash
# 1. Create secret
echo -n "sk-ant-prod-***" | gcloud secrets create anthropic-api-key \
  --data-file=-

# 2. Grant access to GKE service account
gcloud secrets add-iam-policy-binding anthropic-api-key \
  --member="serviceAccount:api-gateway-sa@koh-atlas-production.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# 3. Create Kubernetes secret from Secret Manager
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
  namespace: production
type: Opaque
stringData:
  ANTHROPIC_API_KEY: "projects/koh-atlas-production/secrets/anthropic-api-key/versions/latest"
EOF
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
      "rejectUnauthorized": true
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
| **Database Password** | Local only | Secret Manager | Secret Manager |
| **Redis Password** | None | Secret Manager | Secret Manager |
| **Anthropic API Key** | Dev key (limited) | Staging key | Production key |
| **JWT Private Key** | Generated locally | Secret Manager | Secret Manager |
| **Encryption Key** | Test key | Secret Manager | Secret Manager |
| **Stripe API Key** | Test mode | Test mode | Live mode |

### Secret Rotation

**Automated rotation (every 90 days):**

```bash
#!/bin/bash
# rotate-secrets.sh

# 1. Generate new JWT key pair
openssl genrsa -out private.pem 4096
openssl rsa -in private.pem -pubout -out public.pem

# 2. Store in Secret Manager
gcloud secrets versions add jwt-private-key --data-file=private.pem
gcloud secrets versions add jwt-public-key --data-file=public.pem

# 3. Update Kubernetes deployment
kubectl rollout restart deployment/api-gateway -n production

# 4. Verify rotation
kubectl logs -f deployment/api-gateway -n production | grep "Secrets rotated"
```

---

## Networking Requirements

### Network Architecture

```
Internet
   ↓
Cloud Armor (DDoS + WAF)
   ↓
Cloud Load Balancer (Global HTTPS)
   ↓
GKE Cluster (Private Nodes)
   ├── API Gateway Pods (10.0.1.0/24)
   ├── Worker Pods (10.0.2.0/24)
   ↓
Cloud SQL (Private IP: 10.1.0.0/24)
Memorystore Redis (Private IP: 10.2.0.0/24)
```

### VPC Configuration

```yaml
# Terraform - VPC
resource "google_compute_network" "vpc" {
  name                    = "koh-atlas-vpc"
  auto_create_subnetworks = false
  routing_mode            = "GLOBAL"
}

resource "google_compute_subnetwork" "private" {
  name          = "private-subnet"
  ip_cidr_range = "10.0.0.0/20"
  region        = "us-central1"
  network       = google_compute_network.vpc.id
  
  secondary_ip_range {
    range_name    = "gke-pods"
    ip_cidr_range = "10.4.0.0/14"
  }
  
  secondary_ip_range {
    range_name    = "gke-services"
    ip_cidr_range = "10.8.0.0/20"
  }
}
```

### Firewall Rules

```yaml
# Allow internal cluster communication
resource "google_compute_firewall" "allow_internal" {
  name    = "allow-internal"
  network = google_compute_network.vpc.name
  
  allow {
    protocol = "tcp"
    ports    = ["0-65535"]
  }
  
  source_ranges = ["10.0.0.0/8"]
}

# Allow health checks
resource "google_compute_firewall" "allow_health_check" {
  name    = "allow-health-check"
  network = google_compute_network.vpc.name
  
  allow {
    protocol = "tcp"
    ports    = ["3000"]
  }
  
  source_ranges = [
    "35.191.0.0/16",
    "130.211.0.0/22"
  ]
}
```

### DNS Configuration

**Cloud DNS zones:**

```bash
# 1. Create DNS zone
gcloud dns managed-zones create kohatlas-com \
  --dns-name="kohatlas.com" \
  --description="Koh Atlas production"

# 2. Add A record for app
gcloud dns record-sets transaction start --zone=kohatlas-com
gcloud dns record-sets transaction add <LB_IP_ADDRESS> \
  --name="app.kohatlas.com" \
  --ttl=300 \
  --type=A \
  --zone=kohatlas-com
gcloud dns record-sets transaction execute --zone=kohatlas-com
```

### SSL/TLS Certificates

**Google-managed certificates:**

```yaml
apiVersion: networking.gke.io/v1
kind: ManagedCertificate
metadata:
  name: kohatlas-cert
  namespace: production
spec:
  domains:
    - app.kohatlas.com
    - api.kohatlas.com
```

### Ingress Configuration

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: kohatlas-ingress
  namespace: production
  annotations:
    kubernetes.io/ingress.class: "gce"
    kubernetes.io/ingress.global-static-ip-name: "kohatlas-ip"
    networking.gke.io/managed-certificates: "kohatlas-cert"
    kubernetes.io/ingress.allow-http: "false"
spec:
  rules:
  - host: app.kohatlas.com
    http:
      paths:
      - path: /*
        pathType: ImplementationSpecific
        backend:
          service:
            name: api-gateway
            port:
              number: 80
```

### Network Policies

**Restrict pod-to-pod communication:**

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-gateway-policy
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: api-gateway
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: production
    ports:
    - protocol: TCP
      port: 3000
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: postgres
    ports:
    - protocol: TCP
      port: 5432
  - to:
    - podSelector:
        matchLabels:
          app: redis
    ports:
    - protocol: TCP
      port: 6379
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
| **Sentry** | Error tracking | SDK | Cloud Logging |

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

### External Service Dependencies

**Health check endpoints:**

| Service | Health Check URL | Timeout | Retry |
|---------|-----------------|---------|-------|
| **Anthropic API** | https://api.anthropic.com/v1/health | 5s | 3 |
| **Stripe API** | https://api.stripe.com/healthcheck | 5s | 3 |
| **SendGrid API** | https://api.sendgrid.com/v3/health | 5s | 3 |

### Dependency Monitoring

```typescript
// Health check for external services
async function checkExternalDependencies() {
  const checks = {
    anthropic: await checkAnthropicAPI(),
    stripe: await checkStripeAPI(),
    sendgrid: await checkSendGridAPI(),
  };
  
  return {
    status: Object.values(checks).every(c => c.healthy) ? 'healthy' : 'degraded',
    checks,
  };
}
```

---

## Data & Databases

### PostgreSQL Database Schema

**Cloud SQL for PostgreSQL 16**

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

**Connection pooling with PgBouncer:**

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
    ca: process.env.DATABASE_CA_CERT,
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

### Redis Cache

**Memorystore for Redis 7.x**

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
# Cloud SQL automated backups
Frequency: Daily at 2:00 AM UTC
Retention: 30 days
Type: Full backup + transaction logs
Recovery Point Objective (RPO): 5 minutes
Recovery Time Objective (RTO): 1 hour

# Manual backup
gcloud sql backups create \
  --instance=koh-atlas-db \
  --description="Pre-deployment backup"
```

**Export to Cloud Storage:**

```bash
# Export database to GCS
gcloud sql export sql koh-atlas-db \
  gs://koh-atlas-prod-backups/manual/backup-$(date +%Y%m%d).sql \
  --database=kohatlas_production
```

### Data Retention Policy

| Data Type | Retention Period | Archive After | Delete After |
|-----------|-----------------|---------------|--------------|
| **User accounts** | Indefinite | N/A | On user request |
| **Architecture designs** | Indefinite | 1 year inactive | On user request |
| **Security analyses** | 90 days | 30 days | 90 days |
| **Session logs** | 30 days | 7 days | 30 days |
| **Application logs** | 90 days | 30 days | 90 days |
| **Database backups** | 30 days | N/A | 30 days |

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
- Database: Cloud SQL with CMEK (Customer-Managed Encryption Keys)
- Storage: Cloud Storage with CMEK
- Secrets: Secret Manager with automatic encryption

**In-transit encryption:**
- TLS 1.3 for all HTTPS connections
- Cloud SQL Private IP (encrypted internal traffic)
- Kubernetes network policies with encryption

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

### Input Validation

```typescript
import { z } from 'zod';

const CreateDesignSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  nodes: z.array(z.object({
    id: z.string(),
    type: z.string(),
    position: z.object({
      x: z.number(),
      y: z.number(),
    }),
    data: z.record(z.any()),
  })).max(100),
  edges: z.array(z.object({
    id: z.string(),
    source: z.string(),
    target: z.string(),
  })).max(200),
});
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

**Cloud Security Command Center:**

```bash
# Enable Security Command Center
gcloud services enable securitycenter.googleapis.com

# View security findings
gcloud scc findings list --organization=<ORG_ID> \
  --filter="state=ACTIVE AND severity=HIGH"
```

**Vulnerability Scanning:**

```bash
# Enable Container Analysis
gcloud services enable containeranalysis.googleapis.com

# Scan Docker images
gcloud container images scan gcr.io/koh-atlas-production/api:latest

# View vulnerabilities
gcloud container images describe gcr.io/koh-atlas-production/api:latest \
  --show-package-vulnerability
```

---

## Appendix

### Useful Commands

```bash
# GKE cluster access
gcloud container clusters get-credentials koh-atlas-cluster \
  --region=us-central1

# View logs
kubectl logs -f deployment/api-gateway -n production

# Scale deployment
kubectl scale deployment/api-gateway --replicas=10 -n production

# Exec into pod
kubectl exec -it <pod-name> -n production -- /bin/sh

# Port forward (local testing)
kubectl port-forward svc/api-gateway 3000:80 -n production

# Database connection
gcloud sql connect koh-atlas-db --user=postgres

# View secrets
gcloud secrets versions access latest --secret="anthropic-api-key"
```

### Troubleshooting

**Common issues:**

1. **Pods not starting:** Check resource limits, image pull errors
2. **Database connection failed:** Verify Cloud SQL Auth Proxy, check credentials
3. **High latency:** Check database query performance, Redis cache hit ratio
4. **502 Bad Gateway:** Check pod health, readiness probes

### Support Contacts

- **Engineering:** engineering@kohatlas.com
- **DevOps:** devops@kohatlas.com
- **Security:** security@kohatlas.com
- **On-call:** PagerDuty (automated alerts)

---

**Document Version:** 1.0  
**Last Updated:** December 12, 2025  
**Maintained by:** Koh Atlas Engineering Team
