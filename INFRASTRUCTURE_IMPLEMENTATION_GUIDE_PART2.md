# Koh Atlas Infrastructure Implementation Guide - Part 2

## Infrastructure Components (Continued)

#### **4. API Gateway**

**Component ID:** `n4`  
**Type:** `api-gateway`  
**Zone:** Application Tier (Private Subnet)

**Technology:**
- Node.js 22 LTS
- Express 4.19 + TypeScript 5.7
- PM2 Cluster Mode (all CPU cores)

**Server Specifications:**
```yaml
instance_type: t3.large (2 vCPU, 8GB RAM)
instances: 4 (auto-scaling: 2-10 based on CPU > 70%)
memory_per_instance: 2GB
clustering: PM2 with all CPU cores
```

**Authentication & Authorization:**

```typescript
// JWT Configuration
{
  algorithm: "RS256",  // Asymmetric signing
  access_token_expiry: "15 minutes",
  refresh_token_expiry: "7 days",
  issuer: "https://api.kohatlas.com",
  audience: "kohatlas-app",
  
  // Keys stored in Vault
  public_key: "vault:pki/cert/jwt-public",
  private_key: "vault:pki/cert/jwt-private"
}

// RBAC Roles
roles = ["admin", "architect", "viewer", "auditor"]

// Permissions (resource:action format)
permissions = [
  "design:read",
  "design:write",
  "design:delete",
  "analysis:run",
  "user:manage"
]
```

**Input Validation with Zod:**
```typescript
import { z } from 'zod';

const CreateDesignSchema = z.object({
  name: z.string().min(1).max(100),
  nodes: z.array(z.object({
    id: z.string(),
    type: z.string(),
    position: z.object({ x: z.number(), y: z.number() }),
    data: z.record(z.any())
  })).max(100),
  edges: z.array(z.object({
    id: z.string(),
    source: z.string(),
    target: z.string(),
    label: z.string().optional()
  })).max(200)
});

// Usage in route handler
app.post('/api/v1/designs', async (req, res) => {
  const result = CreateDesignSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: result.error.issues 
    });
  }
  // Process valid data
});
```

**Rate Limiting (Redis-backed):**
```typescript
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

const limiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:',
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Endpoint-specific limits
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts
  skipSuccessfulRequests: true,
});

app.use('/api/v1/', limiter);
app.use('/api/v1/auth/login', authLimiter);
```

**Security Middleware Stack:**
```typescript
import helmet from 'helmet';
import cors from 'cors';

// Helmet (15 security headers)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'strict-dynamic'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "wss://api.kohatlas.com"],
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS Configuration
app.use(cors({
  origin: [
    'https://app.kohatlas.com',
    'https://admin.kohatlas.com'
  ],
  credentials: true,
  maxAge: 86400
}));
```

**Vault Integration for Secrets:**
```typescript
import Vault from 'node-vault';

const vault = Vault({
  apiVersion: 'v1',
  endpoint: process.env.VAULT_ADDR,
  token: process.env.VAULT_TOKEN, // AppRole token from init
});

// Fetch database credentials (dynamic, 1-hour TTL)
async function getDatabaseCredentials() {
  const result = await vault.read('database/creds/api-gateway');
  return {
    username: result.data.username,
    password: result.data.password,
    expires_at: result.data.lease_duration
  };
}

// Auto-renew credentials before expiration
setInterval(async () => {
  const newCreds = await getDatabaseCredentials();
  await updateDatabasePool(newCreds);
}, 3000 * 1000); // 50 minutes (before 1h expiry)
```

**API Endpoints:**

| Method | Endpoint | Description | Auth | Rate Limit |
|--------|----------|-------------|------|------------|
| POST | `/api/v1/auth/register` | User registration | None | 5/15min |
| POST | `/api/v1/auth/login` | User login (JWT) | None | 5/15min |
| POST | `/api/v1/auth/refresh` | Refresh access token | Refresh Token | 10/hour |
| GET | `/api/v1/designs` | List user designs (paginated) | JWT | 100/min |
| POST | `/api/v1/designs` | Create new design | JWT | 20/min |
| GET | `/api/v1/designs/:id` | Get design by ID | JWT | 100/min |
| PUT | `/api/v1/designs/:id` | Update design | JWT | 20/min |
| DELETE | `/api/v1/designs/:id` | Delete design | JWT | 10/min |
| POST | `/api/v1/analysis/security` | Run AI security analysis (async) | JWT | 5/min |
| GET | `/api/v1/analysis/:jobId/status` | Check analysis job status | JWT | 60/min |
| GET | `/api/v1/admin/users` | List all users | JWT (admin) | 30/min |

**Logging (Winston):**
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
    winston.format((info) => {
      // Redact PII
      if (info.email) info.email = '[REDACTED]';
      if (info.password) info.password = '[REDACTED]';
      if (info.token) info.token = '[REDACTED]';
      return info;
    })()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({ format: winston.format.simple() })
  ]
});
```

**Monitoring (Prometheus):**
```typescript
import client from 'prom-client';

// Metrics
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

// Expose metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});
```

**Deployment (Docker + ECS/EKS):**
```dockerfile
# Dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:22-alpine
RUN apk add --no-cache tini
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
USER node
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/server.js"]
```

**Cost:** $150-$300/month (4x t3.large instances)

---

#### **5. App Server (Services)**

**Component ID:** `n5`  
**Type:** `app-server`  
**Zone:** Application Tier (Private Subnet)

**Technology:**
- Node.js 22 LTS
- Microservices architecture
- Event-driven design (EventEmitter)

**Purpose:**
Business logic layer that handles:
- Design validation and processing
- User management operations
- Architecture analysis coordination
- Report generation
- Webhook processing

**Services Architecture:**
```typescript
// Service Registry Pattern
services/
  ├── design.service.ts        // Design CRUD operations
  ├── analysis.service.ts      // Security analysis orchestration
  ├── user.service.ts          // User management
  ├── export.service.ts        // PDF/JSON export generation
  ├── notification.service.ts  // Email/webhook notifications
  └── audit.service.ts         // Audit log management
```

**Example Service Implementation:**
```typescript
// design.service.ts
import { PrismaClient } from '@prisma/client';
import { Redis } from 'ioredis';

export class DesignService {
  constructor(
    private prisma: PrismaClient,
    private redis: Redis,
    private vault: VaultClient
  ) {}

  async createDesign(userId: string, data: DesignInput) {
    // Validate design structure
    const validated = await this.validateDesign(data);
    
    // Store in PostgreSQL
    const design = await this.prisma.design.create({
      data: {
        userId,
        name: data.name,
        nodes: data.nodes,
        edges: data.edges,
        version: 1,
      }
    });

    // Invalidate user's design cache
    await this.redis.del(`user:${userId}:designs`);

    // Log audit event
    await this.auditLog('design.created', userId, design.id);

    return design;
  }

  async getDesign(id: string, userId: string) {
    // Check cache first
    const cached = await this.redis.get(`design:${id}`);
    if (cached) return JSON.parse(cached);

    // Query database with RLS (Row-Level Security)
    const design = await this.prisma.design.findFirst({
      where: { id, userId }  // RLS enforcement
    });

    if (!design) throw new NotFoundError('Design not found');

    // Cache for 5 minutes
    await this.redis.setex(`design:${id}`, 300, JSON.stringify(design));

    return design;
  }
}
```

**Deployment:**
- Same as API Gateway (Node.js + Docker + ECS)
- Deployed in private subnet (no direct internet access)
- Communicates with API Gateway via internal ALB

**Cost:** $100-$200/month (2-4x t3.medium instances)

---

#### **6. PostgreSQL Database**

**Component ID:** `n6`  
**Type:** `database`  
**Zone:** Data Tier (Isolated Subnet)

**Technology:**
- PostgreSQL 16.1 (latest stable)
- AWS RDS PostgreSQL or self-hosted on EC2

**Architecture:**
```yaml
deployment: Primary-Replica
primary: 1 instance (us-east-1a)
replicas:
  - replica_1: us-east-1b (async replication)
  - replica_2: us-east-1c (async replication)
  - standby: us-east-1a (sync replication for HA)
failover: Automatic via Patroni + etcd (30s)
cross_region_replica: us-west-2 (disaster recovery, RPO < 5min)
```

**RDS Configuration:**
```yaml
instance_class: db.r6g.2xlarge
  - vcpu: 8 (ARM Graviton3)
  - memory: 64 GB
  - network: Up to 10 Gbps

storage:
  type: gp3 (General Purpose SSD)
  size: 3 TB (auto-scaling to 10TB)
  iops: 16000
  throughput: 1000 MB/s

max_connections: 500
  - reserved_api: 200
  - reserved_workers: 100
  - reserved_analytics: 100
  - reserved_admin: 100
```

**Encryption:**
```yaml
# At Rest
encryption: AES-256
key_management: AWS KMS with yearly rotation
storage_encrypted: true

# In Transit
ssl_mode: require  # TLS 1.3 mandatory
ssl_cert_auth: true  # mTLS with client certificates
certificate_source: Vault PKI

# Column-Level Encryption (pgcrypto)
encrypted_columns:
  - users.password_hash (bcrypt, cost=12)
  - users.mfa_secret (AES-256-GCM via Vault Transit)
  - audit_log.sensitive_data (AES-256-GCM)
```

**Authentication:**
```yaml
# Dynamic Credentials from Vault
method: SCRAM-SHA-256
vault_integration: true
credential_ttl: 1 hour
auto_rotation: true

# Service Accounts
accounts:
  - name: api_gateway
    privileges: [SELECT, INSERT, UPDATE, DELETE]
    schema: public
    tables: [users, designs, analysis_results, sessions]
    
  - name: analytics
    privileges: [SELECT]
    schema: public
    tables: [reporting_views]
    
  - name: backup
    privileges: [SUPERUSER]
    purpose: pg_dump execution
    
  - name: replication
    privileges: [REPLICATION]
    purpose: streaming replication
```

**Database Schema:**
```sql
-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,  -- bcrypt
  mfa_secret BYTEA,  -- Encrypted via Vault
  role VARCHAR(50) NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_login TIMESTAMP,
  CONSTRAINT valid_role CHECK (role IN ('admin', 'architect', 'viewer', 'auditor'))
);

CREATE INDEX idx_users_email ON users(email);

-- Designs Table
CREATE TABLE designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  nodes JSONB NOT NULL,  -- Architecture nodes
  edges JSONB NOT NULL,  -- Architecture connections
  version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_version CHECK (version >= 1)
);

CREATE INDEX idx_designs_user_id ON designs(user_id);
CREATE INDEX idx_designs_nodes_gin ON designs USING GIN(nodes);
CREATE INDEX idx_designs_edges_gin ON designs USING GIN(edges);

-- Analysis Results Table
CREATE TABLE analysis_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  design_id UUID NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
  security_score DECIMAL(3,1),  -- 0.0 to 10.0
  issues JSONB NOT NULL,  -- Array of security findings
  ai_recommendations JSONB,  -- AI-generated recommendations
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_analysis_design_id ON analysis_results(design_id);
CREATE INDEX idx_analysis_issues_gin ON analysis_results USING GIN(issues);

-- Audit Log Table (Partitioned by Month)
CREATE TABLE audit_log (
  id BIGSERIAL,
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  request_id UUID,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id, timestamp)
) PARTITION BY RANGE (timestamp);

-- Create partitions for 12 months
CREATE TABLE audit_log_2025_12 PARTITION OF audit_log
  FOR VALUES FROM ('2025-12-01') TO ('2026-01-01');

CREATE INDEX idx_audit_user_timestamp ON audit_log(user_id, timestamp);
CREATE INDEX idx_audit_action ON audit_log(action);

-- Sessions Table
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,  -- SHA-256 hash of JWT
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
```

**Row-Level Security (RLS):**
```sql
-- Enable RLS on designs table
ALTER TABLE designs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own designs
CREATE POLICY user_designs_isolation ON designs
  FOR ALL
  TO api_user
  USING (user_id = current_setting('app.current_user_id')::UUID);

-- Policy: Admins bypass RLS
ALTER ROLE admin BYPASSRLS;

-- Set user context in application
-- SET app.current_user_id = 'user-uuid-here';
```

**Performance Tuning:**
```sql
-- PostgreSQL Configuration (postgresql.conf)
shared_buffers = 16GB                  -- 25% of RAM
effective_cache_size = 48GB            -- 75% of RAM
work_mem = 256MB                       -- Per query sorting/hashing
maintenance_work_mem = 2GB             -- For VACUUM, CREATE INDEX
random_page_cost = 1.1                 -- SSD-optimized
effective_io_concurrency = 200         -- SSD parallel I/O

-- Connection Pooling (PgBouncer)
pool_mode = transaction                -- Release connection after transaction
max_client_conn = 500                  -- Max client connections
default_pool_size = 25                 -- Connections per database
reserve_pool_size = 5                  -- Emergency pool

-- Autovacuum (prevent bloat)
autovacuum = on
autovacuum_vacuum_scale_factor = 0.1   -- VACUUM when 10% of rows change
autovacuum_analyze_scale_factor = 0.05 -- ANALYZE when 5% change
```

**Backup & Recovery:**
```yaml
# Continuous Archiving (PITR)
method: pg_basebackup + WAL archiving
frequency:
  full: Daily at 2 AM UTC
  incremental: WAL every 5 minutes

storage:
  primary: S3 (us-east-1)
  replica: S3 (us-west-2)
  encryption: AES-256 + S3 bucket encryption
  versioning: enabled
  mfa_delete: enabled

retention:
  daily: 7 backups
  weekly: 4 backups
  monthly: 12 backups
  yearly: 7 backups

testing:
  restore_drill: Monthly to staging
  validate_rto: < 1 hour
  validate_rpo: < 5 minutes

# Recovery Steps
restore_process:
  1. Stop PostgreSQL
  2. Restore base backup from S3
  3. Replay WAL files to target point-in-time
  4. Start PostgreSQL in recovery mode
  5. Validate data integrity
  6. Promote to primary (if needed)
```

**Monitoring:**
```yaml
metrics:
  - queries_per_second
  - cache_hit_ratio (target: >95%)
  - replication_lag (alert if >10s)
  - connection_utilization (alert if >90%)
  - disk_usage (alert if >80%)
  - slow_queries (log if >1s)

alerts:
  - replication_lag > 60s → CRITICAL
  - cache_hit_ratio < 90% → WARNING
  - connections > 450 → WARNING
  - disk_usage > 85% → WARNING (triggers auto-scaling)
```

**Cost:** $600-$1200/month (RDS r6g.2xlarge + storage + backups)

---

#### **7. Redis (Cache + Queue)**

**Component ID:** `n7`  
**Type:** `cache`  
**Zone:** Data Tier (Isolated Subnet)

**Technology:**
- Redis 7.x (latest stable)
- AWS ElastiCache Redis or self-hosted

**Use Cases:**
1. **Session Storage:** User sessions, JWT token blacklist
2. **API Caching:** GET request responses (5-60min TTL)
3. **Rate Limiting:** Token bucket counters (sliding window)
4. **Job Queue:** BullMQ for background jobs

**Architecture:**
```yaml
deployment: Cluster Mode with Read Replicas
primary: 1 node (us-east-1a)
replicas: 2 nodes (us-east-1b, us-east-1c)
replication: Async replication
failover: Automatic (30-60s)
```

**ElastiCache Configuration:**
```yaml
node_type: cache.r6g.large
  - vcpu: 2 (ARM Graviton2)
  - memory: 13.07 GB
  - network: Up to 10 Gbps

cluster:
  engine: Redis 7.0
  replicas: 2
  multi_az: true
  auto_failover: enabled
  encryption_at_rest: enabled
  encryption_in_transit: enabled (TLS 1.3)
```

**Security:**
```yaml
# Authentication
auth_token: enabled  # Redis AUTH
token_source: Vault
rotation: 90 days

# TLS Encryption
tls_version: 1.3
require_tls: true

# Access Control Lists (Redis 6+)
users:
  - name: api_gateway
    commands: [GET, SET, SETEX, DEL, INCR, EXPIRE]
    keys: ["session:*", "cache:*", "rl:*"]
    
  - name: workers
    commands: [RPUSH, LPOP, BRPOP, LLEN]
    keys: ["queue:*"]
    
  - name: admin
    commands: [ALL]
    keys: ["*"]
```

**Use Case Examples:**

**1. Session Storage:**
```typescript
// Store session (15min idle timeout)
await redis.setex(`session:${sessionId}`, 900, JSON.stringify({
  userId: 'user-123',
  role: 'architect',
  loginAt: Date.now()
}));

// Retrieve session
const session = await redis.get(`session:${sessionId}`);
```

**2. API Response Caching:**
```typescript
// Cache middleware
async function cacheMiddleware(req, res, next) {
  const key = `cache:${req.path}:${JSON.stringify(req.query)}`;
  
  // Check cache
  const cached = await redis.get(key);
  if (cached) {
    return res.json(JSON.parse(cached));
  }
  
  // Intercept res.json to cache response
  const originalJson = res.json.bind(res);
  res.json = (data) => {
    redis.setex(key, 300, JSON.stringify(data)); // 5min TTL
    return originalJson(data);
  };
  
  next();
}
```

**3. Rate Limiting (Sliding Window):**
```typescript
import { RateLimiterRedis } from 'rate-limiter-flexible';

const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'rl',
  points: 100, // 100 requests
  duration: 60, // per 60 seconds
  blockDuration: 0, // Do not block, return 429
});

async function rateLimitMiddleware(req, res, next) {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch {
    res.status(429).json({ error: 'Too many requests' });
  }
}
```

**4. Job Queue (BullMQ):**
```typescript
import { Queue, Worker } from 'bullmq';

// Create queue
const analysisQueue = new Queue('analysis', {
  connection: redisClient,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 50,
  }
});

// Enqueue job (API Gateway)
await analysisQueue.add('security-analysis', {
  designId: 'design-123',
  userId: 'user-456'
}, {
  priority: 1,
  delay: 0
});

// Process job (Background Worker)
const worker = new Worker('analysis', async (job) => {
  const { designId, userId } = job.data;
  
  // Fetch design
  const design = await getDesign(designId);
  
  // Run AI analysis
  const result = await runAIAnalysis(design);
  
  // Store results
  await saveAnalysisResult(designId, result);
  
  // Update progress
  await job.updateProgress(100);
  
  return result;
}, { connection: redisClient });
```

**Monitoring:**
```yaml
metrics:
  - memory_usage (alert if >85%)
  - cpu_usage (alert if >80%)
  - cache_hit_ratio (target: >80%)
  - evictions_per_second (alert if >100)
  - connected_clients
  - replication_lag

alerts:
  - memory_fragmentation_ratio > 1.5 → WARNING
  - evictions > 1000/min → CRITICAL (increase memory)
  - replication_lag > 5s → WARNING
```

**Cost:** $150-$250/month (ElastiCache r6g.large + replicas)

---

