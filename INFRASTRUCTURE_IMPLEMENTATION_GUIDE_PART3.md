# Koh Atlas Infrastructure Implementation Guide - Part 3

## Infrastructure Components (Continued)

#### **8. Object Storage (S3)**

**Component ID:** `n8`  
**Type:** `cloud-storage`  
**Zone:** Storage Tier

**Technology:**
- AWS S3 (Simple Storage Service)
- Alternative: Azure Blob Storage / Google Cloud Storage

**Use Cases:**
1. **Architecture Exports:** JSON, PDF, PNG diagrams
2. **Database Backups:** PostgreSQL WAL files + full backups
3. **Static Assets:** CDN origin for images, fonts
4. **User Uploads:** Architecture import files

**Bucket Structure:**
```
koh-atlas-production/
├── exports/
│   ├── {userId}/
│   │   ├── {designId}_v1.json
│   │   ├── {designId}_v1.pdf
│   │   └── {designId}_diagram.png
│
├── backups/
│   ├── postgres/
│   │   ├── daily/
│   │   │   ├── 2025-12-06_full.backup.gz.enc
│   │   │   └── wal/
│   │   ├── weekly/
│   │   └── monthly/
│   └── redis/
│       └── rdb_dumps/
│
├── static/
│   ├── images/
│   ├── fonts/
│   └── icons/
│
└── uploads/
    └── {userId}/
        └── import_{timestamp}.json
```

**S3 Bucket Configuration:**
```yaml
# Terraform Configuration
resource "aws_s3_bucket" "main" {
  bucket = "koh-atlas-production"
  
  versioning {
    enabled = true  # Keep file history
  }
  
  lifecycle_rule {
    enabled = true
    
    # Transition to cheaper storage classes
    transition {
      days          = 30
      storage_class = "STANDARD_IA"  # Infrequent Access
    }
    
    transition {
      days          = 90
      storage_class = "GLACIER_IR"  # Glacier Instant Retrieval
    }
    
    transition {
      days          = 365
      storage_class = "DEEP_ARCHIVE"  # Long-term archive
    }
    
    # Delete old versions after 90 days
    noncurrent_version_expiration {
      days = 90
    }
  }
  
  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm     = "aws:kms"
        kms_master_key_id = aws_kms_key.s3.arn
      }
    }
  }
  
  # Block all public access
  public_access_block {
    block_public_acls       = true
    block_public_policy     = true
    ignore_public_acls      = true
    restrict_public_buckets = true
  }
  
  # Enable MFA delete (requires root account)
  mfa_delete = true
  
  # Logging
  logging {
    target_bucket = aws_s3_bucket.logs.id
    target_prefix = "s3-access-logs/"
  }
  
  # Object lock (WORM - Write Once Read Many)
  object_lock_configuration {
    object_lock_enabled = "Enabled"
    rule {
      default_retention {
        mode = "GOVERNANCE"
        days = 30
      }
    }
  }
}

# Bucket Policy (Restrict access to VPC endpoint only)
resource "aws_s3_bucket_policy" "main" {
  bucket = aws_s3_bucket.main.id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "DenyInsecureTransport"
        Effect = "Deny"
        Principal = "*"
        Action = "s3:*"
        Resource = [
          aws_s3_bucket.main.arn,
          "${aws_s3_bucket.main.arn}/*"
        ]
        Condition = {
          Bool = {
            "aws:SecureTransport" = "false"
          }
        }
      },
      {
        Sid    = "AllowVPCEndpointOnly"
        Effect = "Deny"
        Principal = "*"
        Action = "s3:*"
        Resource = [
          aws_s3_bucket.main.arn,
          "${aws_s3_bucket.main.arn}/*"
        ]
        Condition = {
          StringNotEquals = {
            "aws:SourceVpce" = aws_vpc_endpoint.s3.id
          }
        }
      }
    ]
  })
}
```

**Security:**
```yaml
encryption:
  at_rest: AES-256 via AWS KMS
  in_transit: TLS 1.3 required
  kms_key_rotation: Automatic yearly

access_control:
  iam_policies: Least privilege per service
  vpc_endpoint: Private access only (no internet gateway)
  signed_urls: Pre-signed URLs for temporary access (15min expiry)
  
versioning: enabled
mfa_delete: enabled  # Require MFA to delete objects

compliance:
  - HIPAA: PHI data encrypted with CMK
  - PCI-DSS: Cardholder data encrypted
  - GDPR: Right to be forgotten (automated deletion)
```

**IAM Policy (API Gateway):**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowExportOperations",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::koh-atlas-production/exports/*",
      "Condition": {
        "StringEquals": {
          "s3:x-amz-server-side-encryption": "aws:kms"
        }
      }
    },
    {
      "Sid": "AllowListBucket",
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::koh-atlas-production",
      "Condition": {
        "StringLike": {
          "s3:prefix": "exports/*"
        }
      }
    }
  ]
}
```

**Application Code (Upload to S3):**
```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({
  region: 'us-east-1',
  credentials: await getVaultAWSCredentials(), // Dynamic creds from Vault
});

// Upload export file
async function uploadExport(userId: string, designId: string, data: Buffer) {
  const key = `exports/${userId}/${designId}_v1.pdf`;
  
  const command = new PutObjectCommand({
    Bucket: 'koh-atlas-production',
    Key: key,
    Body: data,
    ContentType: 'application/pdf',
    ServerSideEncryption: 'aws:kms',
    KMSKeyId: process.env.KMS_KEY_ID,
    Metadata: {
      userId,
      designId,
      timestamp: new Date().toISOString(),
    }
  });
  
  await s3.send(command);
  
  // Generate pre-signed URL (15min expiry)
  const downloadUrl = await getSignedUrl(s3, new GetObjectCommand({
    Bucket: 'koh-atlas-production',
    Key: key,
  }), { expiresIn: 900 });
  
  return downloadUrl;
}
```

**Cost:** $50-$150/month (storage + requests + data transfer)

---

#### **9. HashiCorp Vault (Secrets Management)**

**Component ID:** `n9`  
**Type:** `bastion-host`  
**Zone:** Security Tier (Isolated Subnet)

**Technology:**
- HashiCorp Vault Enterprise 1.15+ (or Open Source)
- High Availability cluster with 3+ nodes

**Deployment Architecture:**
```yaml
nodes: 3 (active-active cluster)
storage_backend: Raft Integrated Storage (consensus)
backup_backend: PostgreSQL snapshots
deployment: ECS Fargate or EKS
networking: Private subnet, no internet access
load_balancer: Internal ALB (HTTPS only)
```

**Secrets Engines Configuration:**

**1. KV v2 (Static Secrets):**
```bash
# Enable KV v2 engine
vault secrets enable -path=kv -version=2 kv

# Store API keys
vault kv put kv/api-gateway/anthropic \
  api_key="sk-ant-xxxxx" \
  max_tokens=100000 \
  model="claude-sonnet-4.5"

vault kv put kv/external/stripe \
  secret_key="sk_live_xxxxx" \
  webhook_secret="whsec_xxxxx"

# Read secret
vault kv get kv/api-gateway/anthropic
```

**2. Database Engine (Dynamic Credentials):**
```bash
# Enable database engine
vault secrets enable database

# Configure PostgreSQL connection
vault write database/config/postgresql \
  plugin_name=postgresql-database-plugin \
  connection_url="postgresql://{{username}}:{{password}}@postgres.internal:5432/kohatlas" \
  allowed_roles="api-gateway,analytics,workers" \
  username="vault-admin" \
  password="vault-password"

# Create role with 1-hour TTL
vault write database/roles/api-gateway \
  db_name=postgresql \
  creation_statements="CREATE ROLE \"{{name}}\" WITH LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}' IN ROLE api_user;" \
  default_ttl="1h" \
  max_ttl="24h"

# Generate credentials (automatically rotated)
vault read database/creds/api-gateway
# Output:
# username: v-token-api-gat-abcd1234
# password: A1b2C3d4E5f6G7h8
# lease_duration: 3600s
```

**3. PKI Engine (TLS Certificates):**
```bash
# Enable PKI engine
vault secrets enable pki

# Set max TTL to 10 years
vault secrets tune -max-lease-ttl=87600h pki

# Generate root CA
vault write -field=certificate pki/root/generate/internal \
  common_name="Koh Atlas Root CA" \
  ttl=87600h > CA_cert.crt

# Configure CA and CRL URLs
vault write pki/config/urls \
  issuing_certificates="https://vault.internal:8200/v1/pki/ca" \
  crl_distribution_points="https://vault.internal:8200/v1/pki/crl"

# Create role for service certificates
vault write pki/roles/services \
  allowed_domains="*.internal,*.kohatlas.com" \
  allow_subdomains=true \
  max_ttl="720h" \
  generate_lease=true

# Issue certificate
vault write pki/issue/services common_name="api-gateway.internal" ttl="720h"
```

**4. Transit Engine (Encryption as a Service):**
```bash
# Enable transit engine
vault secrets enable transit

# Create encryption key
vault write -f transit/keys/customer-data \
  type="aes256-gcm96" \
  auto_rotate_period="2160h"  # 90 days

# Encrypt data
vault write transit/encrypt/customer-data \
  plaintext=$(echo "sensitive-data" | base64)
# Output: vault:v1:abcd1234...

# Decrypt data
vault write transit/decrypt/customer-data \
  ciphertext="vault:v1:abcd1234..."
```

**AppRole Authentication (for services):**
```bash
# Enable AppRole auth
vault auth enable approle

# Create policy for API Gateway
vault policy write api-gateway - <<EOF
path "kv/data/api-gateway/*" {
  capabilities = ["read", "list"]
}

path "database/creds/api-gateway" {
  capabilities = ["read"]
}

path "transit/encrypt/customer-data" {
  capabilities = ["update"]
}

path "transit/decrypt/customer-data" {
  capabilities = ["update"]
}
EOF

# Create AppRole
vault write auth/approle/role/api-gateway \
  token_policies="api-gateway" \
  token_ttl=1h \
  token_max_ttl=4h \
  secret_id_ttl=0  # Never expire

# Get Role ID and Secret ID
vault read auth/approle/role/api-gateway/role-id
vault write -f auth/approle/role/api-gateway/secret-id
```

**Application Integration:**
```typescript
import Vault from 'node-vault';

// Initialize Vault client
const vault = Vault({
  apiVersion: 'v1',
  endpoint: 'https://vault.internal:8200',
});

// Login with AppRole
async function loginToVault() {
  const result = await vault.approleLogin({
    role_id: process.env.VAULT_ROLE_ID,
    secret_id: process.env.VAULT_SECRET_ID,
  });
  
  vault.token = result.auth.client_token;
  
  // Auto-renew token before expiry
  setInterval(async () => {
    await vault.tokenRenewSelf();
  }, 3000 * 1000); // 50 minutes (before 1h expiry)
}

// Get database credentials
async function getDatabaseCredentials() {
  const result = await vault.read('database/creds/api-gateway');
  return {
    username: result.data.username,
    password: result.data.password,
    lease_id: result.lease_id,
    lease_duration: result.lease_duration,
  };
}

// Get API key
async function getAnthropicAPIKey() {
  const result = await vault.read('kv/data/api-gateway/anthropic');
  return result.data.data.api_key;
}

// Encrypt sensitive data
async function encryptPII(plaintext: string) {
  const result = await vault.write('transit/encrypt/customer-data', {
    plaintext: Buffer.from(plaintext).toString('base64'),
  });
  return result.data.ciphertext;
}

// Decrypt sensitive data
async function decryptPII(ciphertext: string) {
  const result = await vault.write('transit/decrypt/customer-data', {
    ciphertext,
  });
  return Buffer.from(result.data.plaintext, 'base64').toString('utf-8');
}
```

**Audit Logging:**
```bash
# Enable file audit device
vault audit enable file file_path=/vault/logs/audit.log

# Log format: JSON with timestamp, client IP, operation
{
  "time": "2025-12-06T10:30:45.123Z",
  "type": "response",
  "auth": {
    "client_token": "hmac-sha256:abcd1234",
    "accessor": "hmac-sha256:efgh5678",
    "display_name": "approle-api-gateway",
    "policies": ["api-gateway", "default"],
    "token_policies": ["api-gateway", "default"]
  },
  "request": {
    "id": "12345678-1234-1234-1234-123456789012",
    "operation": "read",
    "client_token": "hmac-sha256:abcd1234",
    "path": "database/creds/api-gateway",
    "remote_address": "10.0.2.15"
  },
  "response": {
    "data": {
      "username": "hmac-sha256:username-hash",
      "password": "hmac-sha256:password-hash"
    }
  }
}
```

**Monitoring:**
```yaml
metrics:
  - vault_core_unsealed (should be 1)
  - vault_core_leader (1 if leader, 0 otherwise)
  - vault_token_count_by_policy
  - vault_secret_lease_creation
  - vault_audit_log_request_failure

alerts:
  - vault_core_unsealed == 0 → CRITICAL (Vault sealed)
  - vault_core_leader == 0 for >5min → WARNING (no leader)
  - vault_audit_log_request_failure > 10/min → CRITICAL
```

**Cost:** $300-$500/month (3x t3.medium + EBS storage)

---

#### **10. Background Workers**

**Component ID:** `n10`  
**Type:** `worker`  
**Zone:** Application Tier (Private Subnet)

**Technology:**
- Node.js 22 + TypeScript
- BullMQ for job queue processing

**Purpose:**
Process asynchronous jobs that don't need immediate response:
- AI security analysis (3-30s processing time)
- PDF/JSON export generation (1-5s)
- Database backups to S3 (5-30min)
- Email notifications (1-2s)
- Webhook deliveries with retry (1-5s)

**Worker Implementation:**
```typescript
import { Worker, Job } from 'bullmq';
import { Redis } from 'ioredis';

// Redis connection
const connection = new Redis({
  host: 'redis.internal',
  port: 6379,
  tls: { rejectUnauthorized: false },
  password: await getVaultRedisPassword(),
});

// AI Analysis Worker
const analysisWorker = new Worker('analysis', async (job: Job) => {
  const { designId, userId } = job.data;
  
  console.log(`Processing analysis for design ${designId}...`);
  
  // Update progress
  await job.updateProgress(10);
  
  // Fetch design from database
  const design = await prisma.design.findUnique({
    where: { id: designId }
  });
  
  await job.updateProgress(30);
  
  // Call AI API (Anthropic Claude)
  const anthropicKey = await vault.read('kv/data/api-gateway/anthropic');
  const analysis = await callAnthropicAPI(design, anthropicKey.data.data.api_key);
  
  await job.updateProgress(70);
  
  // Store results in database
  await prisma.analysisResult.create({
    data: {
      designId,
      securityScore: analysis.score,
      issues: analysis.issues,
      aiRecommendations: analysis.recommendations,
    }
  });
  
  await job.updateProgress(90);
  
  // Send notification to user
  await sendNotification(userId, {
    type: 'analysis_complete',
    designId,
    score: analysis.score,
  });
  
  await job.updateProgress(100);
  
  console.log(`Analysis complete for design ${designId}`);
  return analysis;
  
}, {
  connection,
  concurrency: 5,  // Process 5 jobs in parallel
  limiter: {
    max: 10,  // Max 10 jobs per second
    duration: 1000,
  },
});

// Export Worker
const exportWorker = new Worker('export', async (job: Job) => {
  const { designId, userId, format } = job.data;  // format: 'pdf' | 'json' | 'png'
  
  // Fetch design
  const design = await getDesign(designId);
  
  // Generate export
  let fileBuffer: Buffer;
  let contentType: string;
  
  if (format === 'pdf') {
    fileBuffer = await generatePDF(design);
    contentType = 'application/pdf';
  } else if (format === 'json') {
    fileBuffer = Buffer.from(JSON.stringify(design, null, 2));
    contentType = 'application/json';
  } else if (format === 'png') {
    fileBuffer = await generateDiagram(design);
    contentType = 'image/png';
  }
  
  // Upload to S3
  const s3Key = `exports/${userId}/${designId}_v1.${format}`;
  await uploadToS3(s3Key, fileBuffer, contentType);
  
  // Generate pre-signed URL (15min expiry)
  const downloadUrl = await getSignedS3Url(s3Key, 900);
  
  // Store URL in database
  await prisma.export.create({
    data: {
      designId,
      userId,
      format,
      s3Key,
      downloadUrl,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    }
  });
  
  return { downloadUrl, expiresAt: Date.now() + 900000 };
  
}, { connection, concurrency: 3 });

// Backup Worker
const backupWorker = new Worker('backup', async (job: Job) => {
  const { type } = job.data;  // type: 'postgres' | 'redis'
  
  if (type === 'postgres') {
    // Run pg_dump via subprocess
    const dumpFile = `/tmp/postgres_${Date.now()}.backup`;
    await runCommand(`pg_dump -Fc -f ${dumpFile} $DATABASE_URL`);
    
    // Encrypt backup
    const encryptedFile = await encryptFile(dumpFile);
    
    // Upload to S3
    const s3Key = `backups/postgres/daily/${new Date().toISOString().split('T')[0]}_full.backup.gz.enc`;
    await uploadToS3(s3Key, fs.readFileSync(encryptedFile));
    
    // Clean up temp files
    fs.unlinkSync(dumpFile);
    fs.unlinkSync(encryptedFile);
    
    return { s3Key, size: fs.statSync(encryptedFile).size };
  }
  
}, { connection, concurrency: 1 });

// Error handling
analysisWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
  // Send alert to monitoring system
  sendAlert('worker_failure', {
    jobId: job?.id,
    queue: 'analysis',
    error: err.message,
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down workers...');
  await analysisWorker.close();
  await exportWorker.close();
  await backupWorker.close();
  process.exit(0);
});
```

**Deployment (Docker):**
```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

CMD ["node", "dist/workers/index.js"]
```

**Scaling:**
```yaml
# ECS Service Definition
service:
  desired_count: 3
  min_count: 2
  max_count: 10
  
  autoscaling:
    target_metric: QueueDepth
    target_value: 100  # Scale when queue > 100 jobs
    scale_in_cooldown: 300s
    scale_out_cooldown: 60s
```

**Cost:** $100-$200/month (3x t3.medium instances)

---

#### **11. Monitoring & Logging**

**Component ID:** `n11`  
**Type:** `monitoring`  
**Zone:** Observability Tier

**Technology Stack:**
- **Metrics:** Prometheus + Grafana
- **Logs:** Elasticsearch + Kibana + Filebeat
- **Traces:** Jaeger (OpenTelemetry)
- **Alerts:** Alertmanager + PagerDuty

**Architecture:**
```
Application → Prometheus (Metrics) → Grafana (Dashboards)
            → Filebeat (Logs) → Elasticsearch → Kibana
            → Jaeger (Traces) → Jaeger UI
            → Alertmanager → PagerDuty → On-call engineer
```

**Prometheus Configuration:**
```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  # API Gateway metrics
  - job_name: 'api-gateway'
    static_configs:
      - targets: ['api-gateway-1:3000', 'api-gateway-2:3000']
    metrics_path: '/metrics'
    
  # PostgreSQL exporter
  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']
    
  # Redis exporter
  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']
    
  # Node exporter (system metrics)
  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']

# Alerting rules
rule_files:
  - 'alerts.yml'

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['alertmanager:9093']
```

**Alert Rules:**
```yaml
# alerts.yml
groups:
  - name: api_alerts
    interval: 30s
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.01
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value | humanizePercentage }}"
      
      - alert: HighLatency
        expr: histogram_quantile(0.95, http_request_duration_seconds_bucket) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "API latency is high"
          description: "P95 latency is {{ $value }}s"
      
      - alert: DatabaseConnectionsHigh
        expr: pg_stat_database_numbackends / pg_settings_max_connections > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "PostgreSQL connections near limit"
      
      - alert: RedisMemoryHigh
        expr: redis_memory_used_bytes / redis_memory_max_bytes > 0.85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Redis memory usage high"
```

**Grafana Dashboards:**
```yaml
# Key Metrics Dashboard
- API Request Rate (requests/sec)
- API Error Rate (errors/sec, %)
- API Latency (p50, p95, p99)
- Database Connections (active, idle, max)
- Database Query Time (p50, p95, p99)
- Redis Hit Rate (%)
- Queue Depth (jobs pending)
- Worker Throughput (jobs/min)
- System CPU Usage (%)
- System Memory Usage (%)
- Disk Usage (%)
- Network I/O (MB/s)
```

**ELK Stack (Logging):**
```yaml
# Filebeat configuration
filebeat.inputs:
  - type: log
    enabled: true
    paths:
      - /var/log/api-gateway/*.log
      - /var/log/workers/*.log
    fields:
      service: api-gateway
      environment: production
    
  - type: log
    enabled: true
    paths:
      - /var/log/postgresql/*.log
    fields:
      service: postgresql
      environment: production

output.elasticsearch:
  hosts: ["elasticsearch:9200"]
  index: "logs-%{+yyyy.MM.dd}"
  
processors:
  - add_host_metadata: ~
  - add_cloud_metadata: ~
```

**Cost:** $200-$400/month (monitoring infrastructure)

---

## Network Architecture

### VPC Design

```yaml
vpc:
  cidr: 10.0.0.0/16
  region: us-east-1
  
  subnets:
    public:  # Internet-facing (ALB, NAT Gateway)
      - cidr: 10.0.1.0/24
        az: us-east-1a
      - cidr: 10.0.2.0/24
        az: us-east-1b
      - cidr: 10.0.3.0/24
        az: us-east-1c
    
    private:  # Application tier (API Gateway, Workers)
      - cidr: 10.0.10.0/24
        az: us-east-1a
      - cidr: 10.0.11.0/24
        az: us-east-1b
      - cidr: 10.0.12.0/24
        az: us-east-1c
    
    data:  # Data tier (PostgreSQL, Redis)
      - cidr: 10.0.20.0/24
        az: us-east-1a
      - cidr: 10.0.21.0/24
        az: us-east-1b
      - cidr: 10.0.22.0/24
        az: us-east-1c
    
    security:  # Security tier (Vault)
      - cidr: 10.0.30.0/24
        az: us-east-1a
      - cidr: 10.0.31.0/24
        az: us-east-1b
      - cidr: 10.0.32.0/24
        az: us-east-1c
```

### Security Groups

```yaml
# ALB Security Group
sg-alb:
  ingress:
    - port: 443
      protocol: TCP
      source: 0.0.0.0/0
      description: "HTTPS from internet"
  egress:
    - port: 3000
      protocol: TCP
      destination: sg-api-gateway
      description: "Forward to API Gateway"

# API Gateway Security Group
sg-api-gateway:
  ingress:
    - port: 3000
      protocol: TCP
      source: sg-alb
      description: "From ALB"
  egress:
    - port: 5432
      protocol: TCP
      destination: sg-postgres
      description: "To PostgreSQL"
    - port: 6379
      protocol: TCP
      destination: sg-redis
      description: "To Redis"
    - port: 8200
      protocol: TCP
      destination: sg-vault
      description: "To Vault"
    - port: 443
      protocol: TCP
      destination: 0.0.0.0/0
      description: "External APIs (Anthropic, etc.)"

# PostgreSQL Security Group
sg-postgres:
  ingress:
    - port: 5432
      protocol: TCP
      source: sg-api-gateway
      description: "From API Gateway"
    - port: 5432
      protocol: TCP
      source: sg-workers
      description: "From Workers"
  egress: []

# Redis Security Group
sg-redis:
  ingress:
    - port: 6379
      protocol: TCP
      source: sg-api-gateway
      description: "From API Gateway"
    - port: 6379
      protocol: TCP
      source: sg-workers
      description: "From Workers"
  egress: []

# Vault Security Group
sg-vault:
  ingress:
    - port: 8200
      protocol: TCP
      source: sg-api-gateway
      description: "From API Gateway"
    - port: 8200
      protocol: TCP
      source: sg-workers
      description: "From Workers"
    - port: 8201
      protocol: TCP
      source: sg-vault
      description: "Raft replication (cluster)"
  egress:
    - port: 5432
      protocol: TCP
      destination: sg-postgres
      description: "To PostgreSQL (for storage)"
```

---

## Security Implementation

### Defense-in-Depth Layers

**Layer 1: Edge Security (Cloudflare)**
- DDoS protection (134 Tbps capacity)
- WAF with OWASP rules
- Bot management
- Rate limiting (10K req/min per IP)
- Geo-blocking

**Layer 2: Network Security**
- VPC isolation with private subnets
- Security groups (stateful firewall)
- NACLs (stateless firewall)
- VPC Flow Logs
- No direct internet access for data tier

**Layer 3: Application Security**
- JWT authentication (RS256)
- RBAC/ABAC authorization
- Input validation (Zod)
- SQL injection prevention (Prisma ORM)
- XSS protection (DOMPurify, CSP headers)
- CSRF protection (double submit cookie)
- Rate limiting (Redis-backed)

**Layer 4: Data Security**
- Encryption at rest (AES-256 via KMS)
- Encryption in transit (TLS 1.3, mTLS)
- Column-level encryption (pgcrypto)
- Dynamic credentials (Vault, 1h TTL)
- Row-level security (RLS in PostgreSQL)

**Layer 5: Monitoring & Audit**
- Comprehensive logging (ELK)
- Metrics collection (Prometheus)
- Distributed tracing (Jaeger)
- Audit logs (Vault, PostgreSQL)
- Real-time alerts (PagerDuty)

---

## Cost Estimation

### Monthly Infrastructure Costs

| Component | Service | Quantity | Unit Cost | Total |
|-----------|---------|----------|-----------|-------|
| **Edge** | Cloudflare Enterprise | 1 | $200-500 | $350 |
| **Compute** | ALB | 1 | $25-50 | $35 |
| | API Gateway (t3.large) | 4 | $60 | $240 |
| | Workers (t3.medium) | 3 | $35 | $105 |
| **Database** | RDS PostgreSQL (r6g.2xlarge) | 1 | $800-1200 | $1000 |
| | ElastiCache Redis (r6g.large) | 1 + 2 replicas | $150-250 | $200 |
| **Security** | Vault (t3.medium) | 3 | $35 | $105 |
| **Storage** | S3 (1TB + requests) | - | $50-150 | $100 |
| **Monitoring** | Prometheus + Grafana + ELK | - | $200-400 | $300 |
| **Network** | Data Transfer + NAT Gateway | - | $100-200 | $150 |
| **Backups** | S3 + Glacier | - | $50-100 | $75 |
| **Total** | | | | **$2,660/month** |

**Annual Cost:** ~$32,000/year

### Cost Optimization Strategies
1. Use Reserved Instances (30-40% discount)
2. Right-size instances based on actual usage
3. Use S3 Intelligent-Tiering for automatic cost optimization
4. Implement CloudFront caching to reduce compute load
5. Use Spot Instances for non-critical workers (70% discount)

---

## Deployment Guide

### Prerequisites
- AWS account with admin access
- Terraform installed (v1.5+)
- kubectl installed (for EKS deployment)
- Domain registered (kohatlas.com)
- GitHub repository for code

### Step 1: Infrastructure as Code (Terraform)

```bash
# Clone repository
git clone https://github.com/kohrasheed/koh-atlas-infrastructure.git
cd koh-atlas-infrastructure

# Initialize Terraform
terraform init

# Review plan
terraform plan -var-file=production.tfvars

# Apply infrastructure
terraform apply -var-file=production.tfvars
```

### Step 2: Deploy Application

```bash
# Build Docker images
docker build -t koh-atlas-api:latest ./api
docker build -t koh-atlas-workers:latest ./workers

# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account>.dkr.ecr.us-east-1.amazonaws.com
docker push <account>.dkr.ecr.us-east-1.amazonaws.com/koh-atlas-api:latest
docker push <account>.dkr.ecr.us-east-1.amazonaws.com/koh-atlas-workers:latest

# Deploy to ECS
aws ecs update-service --cluster koh-atlas --service api-gateway --force-new-deployment
aws ecs update-service --cluster koh-atlas --service workers --force-new-deployment
```

### Step 3: Configure Vault

```bash
# Initialize Vault
vault operator init -key-shares=5 -key-threshold=3

# Unseal Vault (repeat 3 times with different keys)
vault operator unseal <key-1>
vault operator unseal <key-2>
vault operator unseal <key-3>

# Login as root
vault login <root-token>

# Enable secrets engines
vault secrets enable -path=kv -version=2 kv
vault secrets enable database
vault secrets enable pki
vault secrets enable transit

# Configure database engine
vault write database/config/postgresql \
  plugin_name=postgresql-database-plugin \
  connection_url="postgresql://{{username}}:{{password}}@<rds-endpoint>:5432/kohatlas" \
  allowed_roles="api-gateway,workers" \
  username="vault-admin" \
  password="<password>"
```

### Step 4: DNS Configuration

```bash
# Add Cloudflare DNS records
api.kohatlas.com → CNAME → <alb-dns-name>
app.kohatlas.com → CNAME → <cloudflare-cdn>
```

### Step 5: Monitoring Setup

```bash
# Deploy monitoring stack (Helm charts)
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/kube-prometheus-stack

helm repo add elastic https://helm.elastic.co
helm install elasticsearch elastic/elasticsearch
helm install kibana elastic/kibana
```

---

## Success Criteria

### Performance Benchmarks
- ✅ API response time p50 < 200ms
- ✅ API response time p95 < 1s
- ✅ Database query time p95 < 100ms
- ✅ Cache hit ratio > 80%
- ✅ Page load time < 2s
- ✅ Time to first byte < 500ms

### Reliability Targets
- ✅ Uptime 99.95% (4.4 hours downtime/year)
- ✅ RTO (Recovery Time Objective) < 1 hour
- ✅ RPO (Recovery Point Objective) < 5 minutes
- ✅ Zero data loss during failover

### Security Compliance
- ✅ SOC2 Type II certified
- ✅ ISO 27001 compliant
- ✅ HIPAA compliant
- ✅ PCI-DSS Level 1 compliant
- ✅ GDPR compliant
- ✅ Penetration test passed
- ✅ Vulnerability scan score A+

### Scalability
- ✅ Support 100K concurrent users
- ✅ Handle 10K requests/second
- ✅ Auto-scale from 2 to 20 instances
- ✅ Database supports 500 connections

---

## Contact & Support

**Project Owner:** Koh Atlas Team  
**Email:** devops@kohatlas.com  
**Documentation:** https://docs.kohatlas.com  
**Support Portal:** https://support.kohatlas.com  

**Implementation Partners:**
- DevOps consultation: contact@devops-firm.com
- Security audit: security@audit-firm.com
- Cloud architecture: architects@cloud-consulting.com

---

**Document Version:** 1.0  
**Last Updated:** December 6, 2025  
**Next Review:** March 6, 2026

