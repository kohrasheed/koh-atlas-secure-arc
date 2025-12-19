# Koh Atlas Infrastructure Implementation Guide - GCP (Part 2)

## Infrastructure Components (Continued)

### **9. Background Workers (Cloud Run Jobs OR GKE)**

**Component ID:** `n10`  
**Type:** `worker`  
**Zone:** Application Tier

You have two options for background workers on GCP:

#### **Option A: Cloud Run Jobs (Serverless, Recommended)**

Cloud Run Jobs are perfect for asynchronous background tasks - you only pay when jobs are running.

```yaml
# Terraform - Cloud Run Job
resource "google_cloud_run_v2_job" "analysis_worker" {
  name     = "analysis-worker"
  location = "us-central1"
  
  template {
    template {
      containers {
        image = "gcr.io/koh-atlas/analysis-worker:latest"
        
        resources {
          limits = {
            cpu    = "2"
            memory = "2Gi"
          }
        }
        
        env {
          name  = "NODE_ENV"
          value = "production"
        }
        
        env {
          name = "DATABASE_PASSWORD"
          value_source {
            secret_key_ref {
              secret  = "database-password"
              version = "latest"
            }
          }
        }
      }
      
      max_retries = 3
      timeout     = "600s"  # 10 minutes max
      
      service_account = "workers-sa@${var.project_id}.iam.gserviceaccount.com"
    }
  }
}
```

**Trigger jobs via Pub/Sub:**
```typescript
import { PubSub } from '@google-cloud/pubsub';

const pubsub = new PubSub();

// Enqueue analysis job
async function enqueueAnalysisJob(designId: string, userId: string) {
  const topic = pubsub.topic('analysis-jobs');
  
  const data = JSON.stringify({
    designId,
    userId,
    timestamp: Date.now(),
  });
  
  await topic.publishMessage({ data: Buffer.from(data) });
}

// Worker processes messages
import { CloudRunJobsClient } from '@google-cloud/run';

const client = new CloudRunJobsClient();

async function processMessage(message: Message) {
  const { designId, userId } = JSON.parse(message.data.toString());
  
  // Run analysis
  const analysis = await runAIAnalysis(designId);
  
  // Save results
  await saveResults(designId, analysis);
  
  message.ack();
}
```

**Cost:** $0.10 per 1M requests + compute time (~$50-100/month for typical usage)

#### **Option B: GKE Deployment (Same cluster as API)**

Deploy workers as separate deployment in same GKE cluster:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: background-workers
spec:
  replicas: 2
  selector:
    matchLabels:
      app: workers
  template:
    metadata:
      labels:
        app: workers
    spec:
      containers:
      - name: worker
        image: gcr.io/koh-atlas/workers:latest
        env:
        - name: REDIS_HOST
          valueFrom:
            secretKeyRef:
              name: redis-credentials
              key: host
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
```

**Cost:** $100-$200/month (if using GKE pods)

**Recommendation:** Use Cloud Run Jobs for cost efficiency (serverless).

---

### **10. Monitoring & Logging (Cloud Operations Suite)**

**Component ID:** `n11`  
**Type:** `monitoring`  
**Zone:** Observability Tier

**Technology:** Cloud Monitoring, Cloud Logging, Cloud Trace, Cloud Profiler

Google's Cloud Operations Suite (formerly Stackdriver) is natively integrated and much simpler than running your own Prometheus + ELK stack.

#### **Cloud Monitoring (Metrics)**

**Built-in metrics automatically collected:**
- GKE: Pod CPU, memory, network, disk
- Cloud SQL: Connections, queries/sec, replication lag
- Memorystore: Memory usage, cache hit ratio, operations/sec
- Cloud Run: Request count, latency, errors
- Load Balancer: Request count, latency, backend health

**Custom metrics from application:**

```typescript
import { MetricServiceClient } from '@google-cloud/monitoring';

const client = new MetricServiceClient();

// Create custom metric
async function writeMetric(metricName: string, value: number) {
  const projectId = await client.getProjectId();
  const projectPath = client.projectPath(projectId);
  
  const dataPoint = {
    interval: {
      endTime: {
        seconds: Date.now() / 1000,
      },
    },
    value: {
      doubleValue: value,
    },
  };
  
  const timeSeriesData = {
    metric: {
      type: `custom.googleapis.com/${metricName}`,
    },
    resource: {
      type: 'gke_container',
      labels: {
        project_id: projectId,
        cluster_name: 'koh-atlas-cluster',
        namespace_name: 'default',
        pod_name: process.env.HOSTNAME,
      },
    },
    points: [dataPoint],
  };
  
  await client.createTimeSeries({
    name: projectPath,
    timeSeries: [timeSeriesData],
  });
}

// Usage - track API metrics
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', async () => {
    const duration = Date.now() - start;
    await writeMetric('api/request_duration', duration);
    await writeMetric('api/request_count', 1);
  });
  
  next();
});
```

**Alerting Policies:**

```yaml
# Terraform - Alerting Policies
resource "google_monitoring_alert_policy" "high_error_rate" {
  display_name = "High API Error Rate"
  combiner     = "OR"
  
  conditions {
    display_name = "Error rate > 1%"
    
    condition_threshold {
      filter          = "resource.type=\"k8s_container\" AND metric.type=\"logging.googleapis.com/log_entry_count\" AND metric.labels.severity=\"ERROR\""
      duration        = "300s"
      comparison      = "COMPARISON_GT"
      threshold_value = 10
      
      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_RATE"
      }
    }
  }
  
  notification_channels = [
    google_monitoring_notification_channel.pagerduty.id
  ]
  
  alert_strategy {
    auto_close = "1800s"
  }
}

resource "google_monitoring_alert_policy" "high_latency" {
  display_name = "High API Latency"
  combiner     = "OR"
  
  conditions {
    display_name = "P95 latency > 1s"
    
    condition_threshold {
      filter          = "resource.type=\"k8s_container\" AND metric.type=\"custom.googleapis.com/api/request_duration\""
      duration        = "300s"
      comparison      = "COMPARISON_GT"
      threshold_value = 1000
      
      aggregations {
        alignment_period     = "60s"
        per_series_aligner   = "ALIGN_PERCENTILE_95"
        cross_series_reducer = "REDUCE_MEAN"
      }
    }
  }
  
  notification_channels = [
    google_monitoring_notification_channel.pagerduty.id
  ]
}

resource "google_monitoring_alert_policy" "database_connections_high" {
  display_name = "Database Connections Near Limit"
  combiner     = "OR"
  
  conditions {
    display_name = "Connections > 90% of max"
    
    condition_threshold {
      filter          = "resource.type=\"cloudsql_database\" AND metric.type=\"cloudsql.googleapis.com/database/postgresql/num_backends\""
      duration        = "300s"
      comparison      = "COMPARISON_GT"
      threshold_value = 450  # 90% of 500
      
      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_MEAN"
      }
    }
  }
  
  notification_channels = [
    google_monitoring_notification_channel.slack.id
  ]
}

# Notification channels
resource "google_monitoring_notification_channel" "pagerduty" {
  display_name = "PagerDuty"
  type         = "pagerduty"
  
  labels = {
    service_key = var.pagerduty_service_key
  }
}

resource "google_monitoring_notification_channel" "slack" {
  display_name = "Slack #alerts"
  type         = "slack"
  
  labels = {
    channel_name = "#alerts"
    url          = var.slack_webhook_url
  }
}
```

**Dashboards:**

```yaml
# Terraform - Monitoring Dashboard
resource "google_monitoring_dashboard" "koh_atlas" {
  dashboard_json = jsonencode({
    displayName = "Koh Atlas - Production"
    
    gridLayout = {
      widgets = [
        {
          title = "API Request Rate"
          xyChart = {
            dataSets = [{
              timeSeriesQuery = {
                timeSeriesFilter = {
                  filter = "resource.type=\"k8s_container\" AND metric.type=\"custom.googleapis.com/api/request_count\""
                  aggregation = {
                    alignmentPeriod    = "60s"
                    perSeriesAligner   = "ALIGN_RATE"
                    crossSeriesReducer = "REDUCE_SUM"
                  }
                }
              }
            }]
          }
        },
        {
          title = "API Latency (P50, P95, P99)"
          xyChart = {
            dataSets = [
              {
                timeSeriesQuery = {
                  timeSeriesFilter = {
                    filter = "resource.type=\"k8s_container\" AND metric.type=\"custom.googleapis.com/api/request_duration\""
                    aggregation = {
                      alignmentPeriod    = "60s"
                      perSeriesAligner   = "ALIGN_PERCENTILE_50"
                      crossSeriesReducer = "REDUCE_MEAN"
                    }
                  }
                }
                plotType = "LINE"
                targetAxis = "Y1"
              },
              {
                timeSeriesQuery = {
                  timeSeriesFilter = {
                    filter = "resource.type=\"k8s_container\" AND metric.type=\"custom.googleapis.com/api/request_duration\""
                    aggregation = {
                      alignmentPeriod    = "60s"
                      perSeriesAligner   = "ALIGN_PERCENTILE_95"
                      crossSeriesReducer = "REDUCE_MEAN"
                    }
                  }
                }
                plotType = "LINE"
                targetAxis = "Y1"
              }
            ]
          }
        },
        {
          title = "Database Connections"
          xyChart = {
            dataSets = [{
              timeSeriesQuery = {
                timeSeriesFilter = {
                  filter = "resource.type=\"cloudsql_database\" AND metric.type=\"cloudsql.googleapis.com/database/postgresql/num_backends\""
                  aggregation = {
                    alignmentPeriod  = "60s"
                    perSeriesAligner = "ALIGN_MEAN"
                  }
                }
              }
            }]
          }
        }
      ]
    }
  })
}
```

#### **Cloud Logging (Logs)**

All GCP services automatically send logs to Cloud Logging. No agent installation needed!

**Application logging:**

```typescript
import { LoggingBunyan } from '@google-cloud/logging-bunyan';
import bunyan from 'bunyan';

const loggingBunyan = new LoggingBunyan({
  projectId: process.env.GCP_PROJECT_ID,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  logName: 'api-gateway',
});

const logger = bunyan.createLogger({
  name: 'api-gateway',
  streams: [
    { stream: process.stdout, level: 'info' },
    loggingBunyan.stream('info'),
  ],
});

// Usage
logger.info({ userId: '123', action: 'login' }, 'User logged in');
logger.error({ err, designId: '456' }, 'Failed to save design');
```

**Log-based metrics (for alerting):**

```bash
# Create log-based metric for errors
gcloud logging metrics create error_count \
  --description="Count of error logs" \
  --log-filter='severity>=ERROR'

# Create alert based on log metric
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="High Error Count" \
  --condition-display-name="Error count > 10/min" \
  --condition-threshold-value=10 \
  --condition-threshold-duration=60s \
  --condition-filter='metric.type="logging.googleapis.com/user/error_count"'
```

#### **Cloud Trace (Distributed Tracing)**

```typescript
import { TraceExporter } from '@google-cloud/opentelemetry-cloud-trace-exporter';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';

const provider = new NodeTracerProvider();
const exporter = new TraceExporter();

provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
provider.register();

registerInstrumentations({
  instrumentations: [
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
  ],
});

// Traces automatically sent to Cloud Trace
// View in console: https://console.cloud.google.com/traces
```

#### **Cloud Profiler (Performance Profiling)**

```typescript
import { start } from '@google-cloud/profiler';

// Start profiler (production only)
if (process.env.NODE_ENV === 'production') {
  start({
    serviceContext: {
      service: 'api-gateway',
      version: '1.0.0',
    },
  });
}

// Profiler automatically samples CPU and memory usage
// View flame graphs in console: https://console.cloud.google.com/profiler
```

**Cost:** $0.50 per GB of logs ingested + $0.01 per GB of logs stored  
**Estimated:** $100-$200/month (much cheaper than self-hosted ELK stack)

---

## Network Architecture

### VPC Design

```yaml
# Terraform - VPC Network
resource "google_compute_network" "vpc" {
  name                    = "koh-atlas-vpc"
  auto_create_subnetworks = false
  routing_mode            = "GLOBAL"
}

# Subnets
resource "google_compute_subnetwork" "private" {
  name          = "private-subnet"
  ip_cidr_range = "10.0.0.0/20"
  region        = "us-central1"
  network       = google_compute_network.vpc.id
  
  private_ip_google_access = true
  
  secondary_ip_range {
    range_name    = "gke-pods"
    ip_cidr_range = "10.4.0.0/14"
  }
  
  secondary_ip_range {
    range_name    = "gke-services"
    ip_cidr_range = "10.8.0.0/20"
  }
  
  log_config {
    aggregation_interval = "INTERVAL_5_SEC"
    flow_sampling        = 0.5
    metadata             = "INCLUDE_ALL_METADATA"
  }
}

# Cloud NAT (for private instances to access internet)
resource "google_compute_router" "router" {
  name    = "koh-atlas-router"
  region  = google_compute_subnetwork.private.region
  network = google_compute_network.vpc.id
}

resource "google_compute_router_nat" "nat" {
  name                               = "koh-atlas-nat"
  router                             = google_compute_router.router.name
  region                             = google_compute_router.router.region
  nat_ip_allocate_option             = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"
  
  log_config {
    enable = true
    filter = "ERRORS_ONLY"
  }
}

# Private Service Connection (for Cloud SQL, Memorystore)
resource "google_compute_global_address" "private_ip_address" {
  name          = "private-ip-address"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.vpc.id
}

resource "google_service_networking_connection" "private_vpc_connection" {
  network                 = google_compute_network.vpc.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_address.name]
}
```

### Firewall Rules

```yaml
# Allow internal communication within VPC
resource "google_compute_firewall" "allow_internal" {
  name    = "allow-internal"
  network = google_compute_network.vpc.name
  
  allow {
    protocol = "tcp"
    ports    = ["0-65535"]
  }
  
  allow {
    protocol = "udp"
    ports    = ["0-65535"]
  }
  
  allow {
    protocol = "icmp"
  }
  
  source_ranges = ["10.0.0.0/8"]
}

# Allow health checks from load balancer
resource "google_compute_firewall" "allow_health_check" {
  name    = "allow-health-check"
  network = google_compute_network.vpc.name
  
  allow {
    protocol = "tcp"
    ports    = ["3000"]
  }
  
  source_ranges = [
    "35.191.0.0/16",  # Google health check IPs
    "130.211.0.0/22"
  ]
  
  target_tags = ["api-gateway"]
}

# Deny all ingress by default (except allowed rules)
resource "google_compute_firewall" "deny_all" {
  name     = "deny-all-ingress"
  network  = google_compute_network.vpc.name
  priority = 65535
  
  deny {
    protocol = "all"
  }
  
  source_ranges = ["0.0.0.0/0"]
}
```

---

## Security Implementation

### Defense-in-Depth Layers (GCP-Specific)

**Layer 1: Edge Security**
- Cloud Armor or Cloudflare WAF
- DDoS protection (Google has massive infrastructure)
- Bot Management via reCAPTCHA Enterprise

**Layer 2: Network Security**
- VPC with private subnets
- Cloud NAT for outbound traffic
- VPC Flow Logs for audit
- Private Google Access (no public IPs needed)
- Private Service Connect

**Layer 3: Identity & Access**
- Workload Identity (Kubernetes → GCP IAM)
- Service accounts with least privilege
- Organization Policy constraints
- VPC Service Controls (perimeter security)

**Layer 4: Data Security**
- Encryption at rest (Google-managed or CMEK)
- Encryption in transit (TLS 1.3)
- Cloud KMS for key management
- DLP API for PII detection

**Layer 5: Application Security**
- Binary Authorization (only signed images)
- Vulnerability scanning (Container Analysis)
- Security Command Center
- Identity-Aware Proxy (IAP)

**Layer 6: Monitoring & Response**
- Cloud Monitoring + Alerting
- Cloud Logging + Log Analysis
- Security Command Center
- Chronicle (SIEM) for large orgs

---

### Binary Authorization (Only run trusted code)

```yaml
# Terraform - Binary Authorization Policy
resource "google_binary_authorization_policy" "policy" {
  admission_whitelist_patterns {
    name_pattern = "gcr.io/${var.project_id}/*"
  }
  
  default_admission_rule {
    evaluation_mode  = "REQUIRE_ATTESTATION"
    enforcement_mode = "ENFORCED_BLOCK_AND_AUDIT_LOG"
    
    require_attestations_by = [
      google_binary_authorization_attestor.attestor.name
    ]
  }
  
  cluster_admission_rules {
    cluster                = "us-central1.koh-atlas-cluster"
    evaluation_mode        = "REQUIRE_ATTESTATION"
    enforcement_mode       = "ENFORCED_BLOCK_AND_AUDIT_LOG"
    require_attestations_by = [
      google_binary_authorization_attestor.attestor.name
    ]
  }
}

# Attestor (signs trusted images)
resource "google_binary_authorization_attestor" "attestor" {
  name = "production-attestor"
  
  attestation_authority_note {
    note_reference = google_container_analysis_note.note.name
  }
}
```

---

### VPC Service Controls (Data exfiltration protection)

```yaml
# Terraform - VPC Service Controls
resource "google_access_context_manager_service_perimeter" "perimeter" {
  parent = "accessPolicies/${var.access_policy}"
  name   = "accessPolicies/${var.access_policy}/servicePerimeters/koh_atlas_perimeter"
  title  = "Koh Atlas Security Perimeter"
  
  status {
    restricted_services = [
      "storage.googleapis.com",
      "sql-component.googleapis.com",
      "secretmanager.googleapis.com",
    ]
    
    resources = [
      "projects/${var.project_number}"
    ]
    
    vpc_accessible_services {
      enable_restriction = true
      allowed_services   = [
        "storage.googleapis.com",
        "sql-component.googleapis.com",
      ]
    }
  }
}
```

---

## Deployment Guide

### Prerequisites

```bash
# Install gcloud CLI
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Authenticate
gcloud auth login
gcloud config set project koh-atlas-production

# Install kubectl
gcloud components install kubectl

# Install Terraform
brew install terraform  # macOS
# or
wget https://releases.hashicorp.com/terraform/1.6.0/terraform_1.6.0_linux_amd64.zip
```

### Step-by-Step Deployment

#### **Phase 1: Project Setup (Week 1)**

```bash
# 1. Create GCP project
gcloud projects create koh-atlas-production \
  --name="Koh Atlas Production" \
  --organization=${ORG_ID}

# 2. Link billing account
gcloud beta billing projects link koh-atlas-production \
  --billing-account=${BILLING_ACCOUNT_ID}

# 3. Enable required APIs
gcloud services enable compute.googleapis.com \
  container.googleapis.com \
  sqladmin.googleapis.com \
  redis.googleapis.com \
  storage-api.googleapis.com \
  secretmanager.googleapis.com \
  cloudkms.googleapis.com \
  monitoring.googleapis.com \
  logging.googleapis.com \
  cloudtrace.googleapis.com \
  cloudprofiler.googleapis.com

# 4. Set up Terraform backend (for state)
gsutil mb -l us-central1 gs://koh-atlas-terraform-state
gsutil versioning set on gs://koh-atlas-terraform-state

# 5. Initialize Terraform
cd infrastructure/terraform
terraform init \
  -backend-config="bucket=koh-atlas-terraform-state" \
  -backend-config="prefix=terraform/state"
```

#### **Phase 2: Infrastructure Deployment (Week 2-3)**

```bash
# 1. Review Terraform plan
terraform plan -var-file=production.tfvars -out=tfplan

# 2. Apply infrastructure
terraform apply tfplan

# 3. Configure kubectl for GKE
gcloud container clusters get-credentials koh-atlas-cluster \
  --region=us-central1 \
  --project=koh-atlas-production

# 4. Verify cluster access
kubectl get nodes
kubectl get namespaces
```

#### **Phase 3: Application Deployment (Week 4-5)**

```bash
# 1. Build and push Docker images
docker build -t gcr.io/koh-atlas-production/api-gateway:latest ./api
docker build -t gcr.io/koh-atlas-production/workers:latest ./workers

docker push gcr.io/koh-atlas-production/api-gateway:latest
docker push gcr.io/koh-atlas-production/workers:latest

# 2. Create Kubernetes secrets
kubectl create secret generic database-credentials \
  --from-literal=host=$(terraform output -raw cloudsql_private_ip) \
  --from-literal=username=api_gateway \
  --from-literal=password=$(terraform output -raw db_password)

kubectl create secret generic api-keys \
  --from-literal=anthropic=$(cat secrets/anthropic-key.txt) \
  --from-literal=stripe=$(cat secrets/stripe-key.txt)

# 3. Deploy applications
kubectl apply -f k8s/api-gateway-deployment.yaml
kubectl apply -f k8s/workers-deployment.yaml

# 4. Verify deployments
kubectl get deployments
kubectl get pods
kubectl logs -f deployment/api-gateway
```

#### **Phase 4: Monitoring & Testing (Week 6-7)**

```bash
# 1. Verify monitoring
gcloud monitoring dashboards list
gcloud logging logs list

# 2. Run load test
kubectl run load-test --image=williamyeh/wrk --rm -it -- \
  -t4 -c100 -d30s https://api.kohatlas.com/health

# 3. Test failover
# Simulate instance failure
kubectl delete pod <api-gateway-pod>
# Verify new pod starts automatically

# 4. Test backup restore
gcloud sql backups list --instance=koh-atlas-db
gcloud sql backups restore BACKUP_ID --backup-instance=koh-atlas-db
```

#### **Phase 5: Go-Live (Week 8)**

```bash
# 1. Update DNS to point to load balancer
gcloud compute addresses describe koh-atlas-lb-ip --global --format="value(address)"

# Add A record: api.kohatlas.com → <LB_IP>

# 2. Enable production alerting
gcloud alpha monitoring policies list
# Verify all critical alerts are configured

# 3. Final security audit
gcloud security-command-center findings list --organization=${ORG_ID}

# 4. Go live!
echo "🚀 Production deployment complete!"
```

---

## Cost Estimation

### Monthly Infrastructure Costs (GCP)

| Component | Service | Quantity | Unit Cost | Total |
|-----------|---------|----------|-----------|-------|
| **Edge** | Cloud Armor | 1 policy + 10 rules | $5 + $10 | $15 |
| **Compute** | GKE Cluster Management | 1 cluster | $75 | $75 |
| | GKE Nodes (n2-standard-2) | 6 nodes | $48/node | $288 |
| **Database** | Cloud SQL (db-custom-8-32) | 1 primary + 1 replica | $650 + $200 | $850 |
| **Cache** | Memorystore Redis (10GB HA) | 1 | $180 | $180 |
| **Security** | Secret Manager | 10K operations | $0.60 | $10 |
| **Storage** | Cloud Storage (1TB + requests) | - | $50-100 | $75 |
| **Monitoring** | Cloud Operations Suite | - | $150-200 | $175 |
| **Network** | Cloud NAT + Load Balancer + Data Transfer | - | $100-200 | $150 |
| **Workers** | Cloud Run Jobs | per-use | $50-100 | $75 |
| **Backups** | Cloud Storage Coldline | - | $30-50 | $40 |
| **DNS** | Cloud DNS | 1 zone | $0.20/zone + queries | $5 |
| **Total** | | | | **$1,938/mo** |

**With sustained use discounts (automatic 30% off):** ~**$1,550/month**

**With committed use discounts (1-year, 57% off compute):** ~**$1,350/month**

---

### Cost Optimization Strategies (GCP-Specific)

1. **Committed Use Discounts**
   - 1-year: 37% discount
   - 3-year: 55% discount
   - Applied automatically to eligible resources

2. **Sustained Use Discounts**
   - Automatic 30% discount for running >25% of month
   - No upfront commitment required

3. **Preemptible VMs / Spot Instances**
   - 60-91% cheaper for non-critical workloads
   - Use for background workers

4. **Cloud Storage Lifecycle Policies**
   - Automatic tiering: Standard → Nearline → Coldline → Archive

5. **Cloud CDN Caching**
   - Reduce compute/database load
   - Lower data transfer costs

6. **Rightsizing Recommendations**
   - Cloud Console automatically suggests VM size optimizations

---

## GCP vs AWS Comparison

### Cost Comparison

| Category | AWS (Monthly) | GCP (Monthly) | Savings |
|----------|---------------|---------------|---------|
| **Compute** | $380 | $288 | 24% |
| **Database** | $1,000 | $850 | 15% |
| **Cache** | $200 | $180 | 10% |
| **Storage** | $100 | $75 | 25% |
| **Monitoring** | $300 | $175 | 42% |
| **Security** | $105 (Vault) | $10 (Secret Manager) | 90% |
| **Load Balancer** | $35 | $20 | 43% |
| **Total** | **$2,660** | **$1,938** | **27%** |
| **With Discounts** | **$1,862** (RI) | **$1,350** (CUD) | **27%** |

**Winner:** GCP is ~$500/month cheaper (~27% savings)

---

### Feature Comparison

| Feature | AWS | GCP | Winner |
|---------|-----|-----|--------|
| **Kubernetes** | EKS | GKE | GCP (better, cheaper) |
| **Networking** | Good | Excellent (global private network) | GCP |
| **Database (PostgreSQL)** | RDS | Cloud SQL | Tie |
| **Monitoring** | CloudWatch | Cloud Operations | GCP (native, cheaper) |
| **Secrets Management** | Secrets Manager + Vault | Secret Manager + Vault | GCP (cheaper) |
| **Serverless Compute** | Lambda, Fargate | Cloud Run, Cloud Functions | GCP (faster cold start) |
| **Auto-scaling** | Good | Better (GKE HPA) | GCP |
| **Global Load Balancing** | Extra setup | Native | GCP |
| **Compliance** | Extensive | Extensive | Tie |
| **Marketplace / Ecosystem** | Larger | Growing | AWS |
| **Support** | Good | Good | Tie |

**Overall Winner:** GCP for this architecture (cost + Kubernetes-native)

---

## Recommendation

### When to Choose GCP:
✅ You want 20-30% cost savings  
✅ You're using Kubernetes (GKE is superior)  
✅ You want simpler networking (global by default)  
✅ You value integrated monitoring (Cloud Operations)  
✅ You're a startup (generous free tier + credits)  

### When to Choose AWS:
✅ You need the largest ecosystem  
✅ You have existing AWS infrastructure  
✅ You need specific AWS-only services  
✅ Your team has AWS expertise  

**For Koh Atlas:** GCP is recommended due to Kubernetes-first design, lower costs, and simpler operations.

---

## Next Steps

1. **Review this GCP implementation guide**
2. **Compare costs:** GCP ($1,350-1,938/mo) vs AWS ($1,862-2,660/mo)
3. **Choose cloud provider** based on requirements
4. **Request GCP credits** (Google offers startup credits)
5. **Begin Phase 1: Project Setup**

---

**Questions?** Contact GCP sales or your implementation partner.

**Document Version:** 1.0  
**Last Updated:** December 7, 2025  
**Prepared by:** Koh Atlas Engineering Team

