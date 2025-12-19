# Koh Atlas Infrastructure Implementation Guide - Google Cloud Platform (GCP)

**Version:** 1.0  
**Date:** December 7, 2025  
**Cloud Provider:** Google Cloud Platform  
**Estimated Monthly Cost:** $2,450 (~$29,400/year)  
**Implementation Time:** 6-8 weeks

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [GCP Architecture Overview](#gcp-architecture-overview)
3. [Infrastructure Components](#infrastructure-components)
4. [Network Architecture](#network-architecture)
5. [Security Implementation](#security-implementation)
6. [Deployment Guide](#deployment-guide)
7. [Cost Estimation](#cost-estimation)



















8. [GCP vs AWS Comparison](#gcp-vs-aws-comparison)

---

## Executive Summary

### Why Google Cloud Platform?

**Advantages:**
- **Lower costs:** ~8% cheaper than AWS ($2,450 vs $2,660/month)
- **Superior networking:** Global private network with lower latency
- **Better Kubernetes:** GKE (Google Kubernetes Engine) is industry-leading
- **BigQuery integration:** Excellent for analytics and data warehousing
- **Commitment discounts:** Automatic sustained use discounts (no upfront commitment)
- **Live migration:** VMs can be migrated without downtime during maintenance

**Key Differences from AWS:**
- Cloud SQL instead of RDS
- Memorystore instead of ElastiCache
- Cloud Storage instead of S3
- Cloud Load Balancing instead of ALB/ELB
- GKE instead of EKS
- Secret Manager instead of AWS Secrets Manager (but we still use Vault)

---

## GCP Architecture Overview

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT TIER                              │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  React PWA (Browser) - TypeScript + Vite               │     │
│  │  - Service Worker (Offline Mode)                        │     │
│  │  - CSP Headers, XSS Protection                          │     │
│  └────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTPS:443
┌─────────────────────────────────────────────────────────────────┐
│                         EDGE LAYER                               │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  Cloudflare CDN + WAF + DDoS Protection (134 Tbps)     │     │
│  │  OR                                                     │     │
│  │  Cloud CDN + Cloud Armor (DDoS + WAF)                  │     │
│  └────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTPS:443
┌─────────────────────────────────────────────────────────────────┐
│                    PUBLIC SUBNET (DMZ)                           │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  Cloud Load Balancer (Global HTTPS Load Balancer)      │     │
│  │  - SSL Termination (TLS 1.3)                           │     │
│  │  - Health Checks                                        │     │
│  │  - Cloud Armor WAF                                     │     │
│  │  - Auto-scaling backends                               │     │
│  └────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTP/HTTPS (Internal)
┌─────────────────────────────────────────────────────────────────┐
│              APPLICATION TIER (Private Subnet)                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  GKE Cluster (Kubernetes) OR Compute Engine VMs         │  │
│  │  ┌───────────────────────┐  ┌──────────────────────┐    │  │
│  │  │  API Gateway Pods     │  │  Worker Pods         │    │  │
│  │  │  - Express + TS       │  │  - Background Jobs   │    │  │
│  │  │  - JWT Auth           │  │  - BullMQ Queue      │    │  │
│  │  │  - Rate Limiting      │  │  - AI Analysis       │    │  │
│  │  │  - Auto-scaling HPA   │  │  - Exports           │    │  │
│  │  └───────────────────────┘  └──────────────────────┘    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                    ↓                    ↓
┌─────────────────────────────────────────────────────────────────┐
│                DATA TIER (Private Subnet)                        │
│  ┌──────────────────────┐  ┌────────────────────────────────┐  │
│  │  Cloud SQL           │  │  Memorystore for Redis         │  │
│  │  - PostgreSQL 16     │  │  - Redis 7.x                   │  │
│  │  - Primary + Replica │  │  - High Availability           │  │
│  │  - Automated Backup  │  │  - Automatic Failover          │  │
│  │  - Regional HA       │  │  - TLS 1.3                     │  │
│  │  - Point-in-time     │  │  - Auth via Secret Manager     │  │
│  └──────────────────────┘  └────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                       STORAGE TIER                               │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  Cloud Storage (Object Storage)                        │     │
│  │  - Architecture Exports (JSON, PDF, PNG)               │     │
│  │  - Database Backups (Encrypted)                        │     │
│  │  - Static Assets (CDN Origin)                          │     │
│  │  - Lifecycle Policies (Archive → Coldline)            │     │
│  │  - Versioning + Object Lock                            │     │
│  └────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    SECURITY & OBSERVABILITY                      │
│  ┌─────────────────────┐  ┌────────────────────────────────┐   │
│  │  Secret Manager     │  │  Monitoring Stack               │   │
│  │  OR HashiCorp Vault │  │  - Cloud Monitoring (Metrics)   │   │
│  │  - API Keys         │  │  - Cloud Logging (Logs)         │   │
│  │  - DB Credentials   │  │  - Cloud Trace (Distributed)    │   │
│  │  - TLS Certs        │  │  - Cloud Profiler (Performance) │   │
│  │  - Auto-rotation    │  │  - Alerting Policies            │   │
│  └─────────────────────┘  └────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Infrastructure Components

### Component Mapping: GCP vs AWS

| Component | AWS Service | GCP Service | Notes |
|-----------|-------------|-------------|-------|
| **Compute** | EC2, ECS | Compute Engine, GKE | GKE recommended |
| **Database** | RDS PostgreSQL | Cloud SQL for PostgreSQL | Fully managed |
| **Cache** | ElastiCache Redis | Memorystore for Redis | Fully managed |
| **Storage** | S3 | Cloud Storage | Similar features |
| **Load Balancer** | ALB/NLB | Cloud Load Balancing | Global by default |
| **CDN** | CloudFront | Cloud CDN | Integrated with LB |
| **WAF/DDoS** | AWS WAF, Shield | Cloud Armor | Integrated with LB |
| **Secrets** | Secrets Manager | Secret Manager | Or use Vault |
| **Container Orchestration** | EKS | GKE | GKE is superior |
| **Monitoring** | CloudWatch | Cloud Monitoring | Better integration |
| **Logging** | CloudWatch Logs | Cloud Logging | Centralized |
| **Tracing** | X-Ray | Cloud Trace | OpenTelemetry |
| **DNS** | Route53 | Cloud DNS | Global anycast |
| **VPC** | VPC | VPC | Similar concepts |
| **IAM** | IAM | IAM + Workload Identity | More granular |

---

### **1. Client (Browser / PWA)**

**Component ID:** `n1`  
**Type:** `web-browser`  
**Zone:** Client Tier

**Technology:** Same as AWS version
- React 19 + TypeScript 5.7
- Vite 6, Service Worker, Tailwind CSS

**GCP Hosting Options:**

**Option A: Firebase Hosting (Recommended for PWA)**
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Initialize Firebase
firebase init hosting

# Deploy
firebase deploy --only hosting
```

**Configuration:**
```json
{
  "hosting": {
    "public": "dist",
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "Content-Security-Policy",
            "value": "default-src 'self'; script-src 'self' 'strict-dynamic'; connect-src 'self' wss://api.kohatlas.com"
          },
          {
            "key": "Strict-Transport-Security",
            "value": "max-age=31536000; includeSubDomains; preload"
          },
          {
            "key": "X-Frame-Options",
            "value": "DENY"
          }
        ]
      }
    ]
  }
}
```

**Option B: Cloud Storage + Cloud CDN**
```bash
# Create bucket
gsutil mb -l us-central1 gs://app.kohatlas.com

# Upload files
gsutil -m cp -r dist/* gs://app.kohatlas.com/

# Make public
gsutil iam ch allUsers:objectViewer gs://app.kohatlas.com

# Enable CDN
gcloud compute backend-buckets create app-backend \
  --gcs-bucket-name=app.kohatlas.com \
  --enable-cdn
```

**Cost:** $0-$20/month (Firebase Hosting or Cloud Storage + CDN)

---

### **2. Cloudflare CDN + WAF OR Cloud CDN + Cloud Armor**

**Component ID:** `n2`  
**Type:** `edge-cdn`  
**Zone:** Edge Security Layer

You have two options for edge security:

#### **Option A: Cloudflare (Same as AWS version)**
- Use Cloudflare Enterprise as described in AWS guide
- Benefits: 134 Tbps DDoS protection, best WAF, global PoPs
- Cost: $200-$500/month

#### **Option B: Google Cloud CDN + Cloud Armor (Native GCP)**

**Cloud CDN Configuration:**
```bash
# Enable Cloud CDN on backend service
gcloud compute backend-services update api-backend \
  --enable-cdn \
  --cache-mode=CACHE_ALL_STATIC \
  --default-ttl=3600 \
  --max-ttl=86400 \
  --client-ttl=3600

# Configure cache key
gcloud compute backend-services update api-backend \
  --cache-key-include-host \
  --cache-key-include-protocol \
  --cache-key-include-query-string
```

**Cloud Armor (WAF + DDoS) Configuration:**

```yaml
# Terraform Configuration
resource "google_compute_security_policy" "policy" {
  name        = "koh-atlas-security-policy"
  description = "WAF + DDoS protection for Koh Atlas"

  # Default rule (allow all)
  rule {
    action   = "allow"
    priority = "2147483647"
    match {
      versioned_expr = "SRC_IPS_V1"
      config {
        src_ip_ranges = ["*"]
      }
    }
  }

  # Block specific countries (optional)
  rule {
    action   = "deny(403)"
    priority = "1000"
    match {
      expr {
        expression = "origin.region_code in ['CN', 'RU', 'KP']"
      }
    }
    description = "Block high-risk countries"
  }

  # Rate limiting (1000 req/min per IP)
  rule {
    action   = "rate_based_ban"
    priority = "2000"
    match {
      versioned_expr = "SRC_IPS_V1"
      config {
        src_ip_ranges = ["*"]
      }
    }
    rate_limit_options {
      conform_action = "allow"
      exceed_action  = "deny(429)"
      enforce_on_key = "IP"
      rate_limit_threshold {
        count        = 1000
        interval_sec = 60
      }
      ban_duration_sec = 600
    }
    description = "Rate limit: 1000 req/min per IP"
  }

  # OWASP ModSecurity Core Rule Set
  rule {
    action   = "deny(403)"
    priority = "3000"
    match {
      expr {
        expression = "evaluatePreconfiguredExpr('sqli-v33-stable')"
      }
    }
    description = "SQL Injection protection"
  }

  rule {
    action   = "deny(403)"
    priority = "3100"
    match {
      expr {
        expression = "evaluatePreconfiguredExpr('xss-v33-stable')"
      }
    }
    description = "XSS protection"
  }

  rule {
    action   = "deny(403)"
    priority = "3200"
    match {
      expr {
        expression = "evaluatePreconfiguredExpr('lfi-v33-stable')"
      }
    }
    description = "Local File Inclusion protection"
  }

  rule {
    action   = "deny(403)"
    priority = "3300"
    match {
      expr {
        expression = "evaluatePreconfiguredExpr('rce-v33-stable')"
      }
    }
    description = "Remote Code Execution protection"
  }

  # Adaptive DDoS protection
  adaptive_protection_config {
    layer_7_ddos_defense_config {
      enable = true
    }
  }

  # Advanced options
  advanced_options_config {
    log_level    = "VERBOSE"
    json_parsing = "STANDARD"
  }
}

# Attach to backend service
resource "google_compute_backend_service" "api" {
  name                  = "api-backend"
  security_policy       = google_compute_security_policy.policy.id
  load_balancing_scheme = "EXTERNAL"
  # ... other config
}
```

**Cloud Armor Pricing:**
- Security policy: $5/month per policy
- Rules: $1/month per rule
- Requests: $0.75 per million requests
- **Estimated cost:** $50-$100/month (much cheaper than Cloudflare)

**Comparison:**

| Feature | Cloudflare Enterprise | Cloud Armor |
|---------|----------------------|-------------|
| DDoS Capacity | 134 Tbps | "Google-scale" (not disclosed, but massive) |
| WAF Rules | OWASP CRS + Custom | OWASP CRS + Custom via CEL |
| Rate Limiting | ✅ Advanced | ✅ Native |
| Bot Management | ✅ ML-based | ✅ reCAPTCHA Enterprise integration |
| Global PoPs | 300+ | 100+ (but on Google's network) |
| Cost | $200-500/mo | $50-100/mo |
| **Recommendation** | Best for multi-cloud | Best for GCP-native |

**Cost:** $50-$100/month (Cloud Armor) or $200-$500/month (Cloudflare)

---

### **3. Cloud Load Balancing**

**Component ID:** `n3`  
**Type:** `load-balancer-global`  
**Zone:** Public Subnet

**Technology:** Google Cloud Global HTTPS Load Balancer

**Architecture:**
```yaml
type: Global HTTPS Load Balancer
ssl_termination: Yes (Google-managed or custom certificates)
backend: GKE cluster or Compute Engine instance groups
health_checks: HTTP/HTTPS health probes
cdn: Cloud CDN enabled
waf: Cloud Armor attached
auto_scaling: Yes (via instance groups or HPA)
```

**Terraform Configuration:**

```hcl
# Reserve global static IP
resource "google_compute_global_address" "default" {
  name = "koh-atlas-lb-ip"
}

# SSL certificate (Google-managed)
resource "google_compute_managed_ssl_certificate" "default" {
  name = "koh-atlas-cert"
  
  managed {
    domains = ["api.kohatlas.com", "app.kohatlas.com"]
  }
}

# Backend service (GKE)
resource "google_compute_backend_service" "api" {
  name                  = "api-backend"
  protocol              = "HTTP"
  port_name             = "http"
  timeout_sec           = 30
  enable_cdn            = true
  security_policy       = google_compute_security_policy.policy.id
  
  backend {
    group           = google_container_node_pool.default.instance_group_urls[0]
    balancing_mode  = "RATE"
    max_rate_per_instance = 100
    capacity_scaler = 1.0
  }
  
  health_check {
    http_health_check {
      port         = 3000
      request_path = "/health"
    }
  }
  
  log_config {
    enable      = true
    sample_rate = 1.0
  }
  
  iap {
    oauth2_client_id     = var.oauth2_client_id
    oauth2_client_secret = var.oauth2_client_secret
  }
}

# URL map
resource "google_compute_url_map" "default" {
  name            = "koh-atlas-lb"
  default_service = google_compute_backend_service.api.id
  
  host_rule {
    hosts        = ["api.kohatlas.com"]
    path_matcher = "api"
  }
  
  path_matcher {
    name            = "api"
    default_service = google_compute_backend_service.api.id
    
    path_rule {
      paths   = ["/api/v1/*"]
      service = google_compute_backend_service.api.id
    }
  }
}

# HTTPS proxy
resource "google_compute_target_https_proxy" "default" {
  name             = "koh-atlas-https-proxy"
  url_map          = google_compute_url_map.default.id
  ssl_certificates = [google_compute_managed_ssl_certificate.default.id]
  ssl_policy       = google_compute_ssl_policy.default.id
}

# SSL policy (TLS 1.3 only)
resource "google_compute_ssl_policy" "default" {
  name            = "koh-atlas-ssl-policy"
  profile         = "MODERN"
  min_tls_version = "TLS_1_3"
}

# Forwarding rule
resource "google_compute_global_forwarding_rule" "https" {
  name       = "koh-atlas-https"
  target     = google_compute_target_https_proxy.default.id
  port_range = "443"
  ip_address = google_compute_global_address.default.address
}

# HTTP to HTTPS redirect
resource "google_compute_global_forwarding_rule" "http" {
  name       = "koh-atlas-http"
  target     = google_compute_target_http_proxy.redirect.id
  port_range = "80"
  ip_address = google_compute_global_address.default.address
}

resource "google_compute_target_http_proxy" "redirect" {
  name    = "koh-atlas-http-redirect"
  url_map = google_compute_url_map.redirect.id
}

resource "google_compute_url_map" "redirect" {
  name = "koh-atlas-redirect"
  
  default_url_redirect {
    https_redirect         = true
    redirect_response_code = "MOVED_PERMANENTLY_DEFAULT"
    strip_query            = false
  }
}
```

**Features:**
- **Global load balancing:** Anycast IP routes to nearest region
- **SSL/TLS 1.3:** Automatic certificate management
- **Health checks:** Every 5 seconds
- **Session affinity:** Cookie-based or IP-based
- **Cloud CDN:** Integrated caching
- **Cloud Armor:** Integrated WAF/DDoS
- **Logging:** 100% sampled to Cloud Logging

**Cost:** $20-$40/month (much cheaper than AWS ALB)

---

### **4. API Gateway (GKE - Google Kubernetes Engine)**

**Component ID:** `n4`  
**Type:** `api-gateway`  
**Zone:** Application Tier

**Technology:** Node.js 22 + Express running in GKE

**Why GKE over Compute Engine?**
- Better auto-scaling (Horizontal Pod Autoscaler)
- Built-in health checks and self-healing
- Rolling updates with zero downtime
- Easier secrets management (Workload Identity)
- Better monitoring integration
- Industry-leading Kubernetes platform

**GKE Cluster Configuration:**

```yaml
# Terraform - GKE Cluster
resource "google_container_cluster" "primary" {
  name     = "koh-atlas-cluster"
  location = "us-central1"
  
  # Zonal cluster with 3 zones for HA
  node_locations = [
    "us-central1-a",
    "us-central1-b",
    "us-central1-c"
  ]
  
  # Remove default node pool (we'll create custom one)
  remove_default_node_pool = true
  initial_node_count       = 1
  
  # Network configuration
  network    = google_compute_network.vpc.name
  subnetwork = google_compute_subnetwork.private.name
  
  # Private cluster (nodes don't have public IPs)
  private_cluster_config {
    enable_private_nodes    = true
    enable_private_endpoint = false
    master_ipv4_cidr_block  = "172.16.0.0/28"
  }
  
  # Workload Identity (for accessing GCP services securely)
  workload_identity_config {
    workload_pool = "${var.project_id}.svc.id.goog"
  }
  
  # Enable Autopilot features
  addons_config {
    http_load_balancing {
      disabled = false
    }
    horizontal_pod_autoscaling {
      disabled = false
    }
    network_policy_config {
      disabled = false
    }
    gce_persistent_disk_csi_driver_config {
      enabled = true
    }
  }
  
  # Network policy
  network_policy {
    enabled = true
  }
  
  # Binary authorization
  binary_authorization {
    evaluation_mode = "PROJECT_SINGLETON_POLICY_ENFORCE"
  }
  
  # Maintenance window
  maintenance_policy {
    daily_maintenance_window {
      start_time = "03:00"  # 3 AM UTC
    }
  }
  
  # Logging and monitoring
  logging_service    = "logging.googleapis.com/kubernetes"
  monitoring_service = "monitoring.googleapis.com/kubernetes"
}

# Node pool for application workloads
resource "google_container_node_pool" "primary_nodes" {
  name       = "app-node-pool"
  cluster    = google_container_cluster.primary.name
  location   = "us-central1"
  node_count = 2  # Per zone (6 total across 3 zones)
  
  autoscaling {
    min_node_count = 2
    max_node_count = 10
  }
  
  node_config {
    machine_type = "n2-standard-2"  # 2 vCPU, 8GB RAM
    disk_size_gb = 100
    disk_type    = "pd-standard"
    
    # Preemptible nodes for cost savings (non-critical workloads)
    preemptible  = false
    
    # OAuth scopes
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]
    
    # Workload Identity
    workload_metadata_config {
      mode = "GKE_METADATA"
    }
    
    # Security
    shielded_instance_config {
      enable_secure_boot          = true
      enable_integrity_monitoring = true
    }
    
    # Labels
    labels = {
      environment = "production"
      app         = "koh-atlas"
    }
    
    # Taints (optional - for dedicated workloads)
    # taint {
    #   key    = "workload"
    #   value  = "api"
    #   effect = "NO_SCHEDULE"
    # }
  }
  
  management {
    auto_repair  = true
    auto_upgrade = true
  }
}
```

**Kubernetes Deployment (API Gateway):**

```yaml
# api-gateway-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
  namespace: default
  labels:
    app: api-gateway
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api-gateway
  template:
    metadata:
      labels:
        app: api-gateway
    spec:
      serviceAccountName: api-gateway-sa
      
      containers:
      - name: api-gateway
        image: gcr.io/koh-atlas/api-gateway:latest
        ports:
        - containerPort: 3000
          name: http
        
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "3000"
        - name: DATABASE_HOST
          valueFrom:
            secretKeyRef:
              name: database-credentials
              key: host
        - name: DATABASE_USER
          valueFrom:
            secretKeyRef:
              name: database-credentials
              key: username
        - name: DATABASE_PASSWORD
          valueFrom:
            secretKeyRef:
              name: database-credentials
              key: password
        - name: REDIS_HOST
          valueFrom:
            secretKeyRef:
              name: redis-credentials
              key: host
        - name: ANTHROPIC_API_KEY
          valueFrom:
            secretKeyRef:
              name: api-keys
              key: anthropic
        
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 2
        
        securityContext:
          runAsNonRoot: true
          runAsUser: 1000
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          capabilities:
            drop:
            - ALL

---
apiVersion: v1
kind: Service
metadata:
  name: api-gateway-service
  labels:
    app: api-gateway
spec:
  type: ClusterIP
  selector:
    app: api-gateway
  ports:
  - port: 80
    targetPort: 3000
    protocol: TCP
    name: http

---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-gateway-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-gateway
  minReplicas: 3
  maxReplicas: 20
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
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
      - type: Percent
        value: 100
        periodSeconds: 30
      - type: Pods
        value: 4
        periodSeconds: 30
      selectPolicy: Max
```

**Workload Identity (Secure GCP Access):**

```bash
# Create Kubernetes service account
kubectl create serviceaccount api-gateway-sa

# Create GCP service account
gcloud iam service-accounts create api-gateway-sa \
  --display-name="API Gateway Service Account"

# Bind Kubernetes SA to GCP SA
gcloud iam service-accounts add-iam-policy-binding \
  api-gateway-sa@${PROJECT_ID}.iam.gserviceaccount.com \
  --role roles/iam.workloadIdentityUser \
  --member "serviceAccount:${PROJECT_ID}.svc.id.goog[default/api-gateway-sa]"

# Annotate Kubernetes SA
kubectl annotate serviceaccount api-gateway-sa \
  iam.gke.io/gcp-service-account=api-gateway-sa@${PROJECT_ID}.iam.gserviceaccount.com

# Grant permissions to GCP SA
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:api-gateway-sa@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/cloudsql.client"

gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:api-gateway-sa@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

**Cost:** $200-$400/month (GKE cluster + nodes)

---

### **5. Cloud SQL for PostgreSQL**

**Component ID:** `n6`  
**Type:** `database`  
**Zone:** Data Tier

**Technology:** Cloud SQL for PostgreSQL 16

**Configuration:**

```yaml
# Terraform - Cloud SQL Instance
resource "google_sql_database_instance" "main" {
  name             = "koh-atlas-db"
  database_version = "POSTGRES_16"
  region           = "us-central1"
  
  settings {
    tier = "db-custom-8-32768"  # 8 vCPU, 32GB RAM
    
    # Availability
    availability_type = "REGIONAL"  # High availability with automatic failover
    
    # Disk
    disk_type       = "PD_SSD"
    disk_size       = 500  # GB
    disk_autoresize = true
    disk_autoresize_limit = 3000  # Max 3TB
    
    # Backups
    backup_configuration {
      enabled                        = true
      start_time                     = "02:00"  # 2 AM UTC
      point_in_time_recovery_enabled = true
      transaction_log_retention_days = 7
      backup_retention_settings {
        retained_backups = 30
        retention_unit   = "COUNT"
      }
    }
    
    # Maintenance
    maintenance_window {
      day          = 7  # Sunday
      hour         = 3  # 3 AM UTC
      update_track = "stable"
    }
    
    # IP configuration
    ip_configuration {
      ipv4_enabled    = false  # No public IP
      private_network = google_compute_network.vpc.id
      require_ssl     = true
      
      # Authorized networks (if public IP enabled)
      # authorized_networks {
      #   name  = "office"
      #   value = "203.0.113.0/24"
      # }
    }
    
    # Database flags
    database_flags {
      name  = "max_connections"
      value = "500"
    }
    
    database_flags {
      name  = "shared_buffers"
      value = "8388608"  # 8GB in 8KB pages
    }
    
    database_flags {
      name  = "effective_cache_size"
      value = "25165824"  # 24GB in 8KB pages
    }
    
    database_flags {
      name  = "work_mem"
      value = "262144"  # 256MB in KB
    }
    
    database_flags {
      name  = "random_page_cost"
      value = "1.1"  # SSD-optimized
    }
    
    database_flags {
      name  = "log_min_duration_statement"
      value = "1000"  # Log queries > 1s
    }
    
    # Insights
    insights_config {
      query_insights_enabled  = true
      query_plans_per_minute  = 5
      query_string_length     = 4096
      record_application_tags = true
      record_client_address   = true
    }
    
    # Deletion protection
    deletion_protection_enabled = true
  }
  
  # Encryption (using Google-managed keys)
  # For customer-managed keys:
  # encryption_key_name = google_kms_crypto_key.sql_key.id
}

# Database
resource "google_sql_database" "database" {
  name     = "kohatlas"
  instance = google_sql_database_instance.main.name
  charset  = "UTF8"
  collation = "en_US.UTF8"
}

# User
resource "google_sql_user" "users" {
  name     = "api_gateway"
  instance = google_sql_database_instance.main.name
  password = random_password.db_password.result
}

# Read replica (for scaling reads)
resource "google_sql_database_instance" "replica" {
  name                 = "koh-atlas-db-replica"
  master_instance_name = google_sql_database_instance.main.name
  region               = "us-east1"  # Different region for DR
  database_version     = "POSTGRES_16"
  
  replica_configuration {
    failover_target = false
  }
  
  settings {
    tier              = "db-custom-4-16384"  # Smaller than primary
    availability_type = "ZONAL"
    disk_type         = "PD_SSD"
    disk_size         = 500
  }
}
```

**Connection from GKE (Cloud SQL Proxy):**

```yaml
# In Kubernetes deployment, add sidecar container
containers:
- name: cloud-sql-proxy
  image: gcr.io/cloud-sql-connectors/cloud-sql-proxy:latest
  args:
    - "--port=5432"
    - "--private-ip"
    - "koh-atlas-db:us-central1:koh-atlas-db"
  securityContext:
    runAsNonRoot: true
  resources:
    requests:
      memory: "64Mi"
      cpu: "50m"
    limits:
      memory: "128Mi"
      cpu: "100m"
```

**Alternative: Direct Private IP Connection**
```typescript
// In application code
const pool = new Pool({
  host: '10.0.2.5',  // Private IP of Cloud SQL instance
  port: 5432,
  database: 'kohatlas',
  user: 'api_gateway',
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync('/etc/ssl/certs/server-ca.pem'),
    key: fs.readFileSync('/etc/ssl/certs/client-key.pem'),
    cert: fs.readFileSync('/etc/ssl/certs/client-cert.pem'),
  },
  max: 20,  // Connection pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});
```

**Cost:** $600-$900/month (db-custom-8-32768 + storage + backups + replica)

---

### **6. Memorystore for Redis**

**Component ID:** `n7`  
**Type:** `cache`  
**Zone:** Data Tier

**Technology:** Memorystore for Redis 7.x

**Configuration:**

```yaml
# Terraform - Memorystore Redis
resource "google_redis_instance" "cache" {
  name           = "koh-atlas-redis"
  tier           = "STANDARD_HA"  # High availability with automatic failover
  memory_size_gb = 10
  region         = "us-central1"
  
  # Network
  authorized_network      = google_compute_network.vpc.id
  connect_mode            = "PRIVATE_SERVICE_ACCESS"
  redis_version           = "REDIS_7_0"
  display_name            = "Koh Atlas Redis Cache"
  reserved_ip_range       = "10.0.30.0/29"
  replica_count           = 1
  read_replicas_mode      = "READ_REPLICAS_ENABLED"
  
  # Maintenance
  maintenance_policy {
    weekly_maintenance_window {
      day = "SUNDAY"
      start_time {
        hours   = 3
        minutes = 0
      }
    }
  }
  
  # Configuration
  redis_configs = {
    maxmemory-policy = "allkeys-lru"
    notify-keyspace-events = "Ex"
  }
  
  # Auth
  auth_enabled            = true
  transit_encryption_mode = "SERVER_AUTHENTICATION"
  
  # Persistence (RDB snapshots)
  persistence_config {
    persistence_mode    = "RDB"
    rdb_snapshot_period = "ONE_HOUR"
  }
}

# Output Redis connection info
output "redis_host" {
  value = google_redis_instance.cache.host
}

output "redis_port" {
  value = google_redis_instance.cache.port
}
```

**Application Connection:**
```typescript
import { Redis } from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST,  // From Secret Manager
  port: 6379,
  password: process.env.REDIS_AUTH,
  tls: {
    rejectUnauthorized: false,
  },
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});
```

**Cost:** $150-$250/month (10GB Standard HA tier)

---

### **7. Cloud Storage**

**Component ID:** `n8`  
**Type:** `cloud-storage`  
**Zone:** Storage Tier

**Technology:** Google Cloud Storage

**Bucket Configuration:**

```yaml
# Terraform - Cloud Storage Buckets
resource "google_storage_bucket" "exports" {
  name          = "koh-atlas-exports"
  location      = "US"  # Multi-region
  storage_class = "STANDARD"
  
  uniform_bucket_level_access = true
  
  versioning {
    enabled = true
  }
  
  lifecycle_rule {
    condition {
      age = 30
    }
    action {
      type          = "SetStorageClass"
      storage_class = "NEARLINE"  # Move to cheaper storage after 30 days
    }
  }
  
  lifecycle_rule {
    condition {
      age = 90
    }
    action {
      type          = "SetStorageClass"
      storage_class = "COLDLINE"  # Even cheaper after 90 days
    }
  }
  
  lifecycle_rule {
    condition {
      age = 365
    }
    action {
      type          = "SetStorageClass"
      storage_class = "ARCHIVE"  # Long-term storage after 1 year
    }
  }
  
  # Encryption (Google-managed by default)
  encryption {
    default_kms_key_name = google_kms_crypto_key.storage_key.id
  }
  
  # Logging
  logging {
    log_bucket = google_storage_bucket.logs.name
  }
  
  # CORS (if serving directly to browsers)
  cors {
    origin          = ["https://app.kohatlas.com"]
    method          = ["GET", "HEAD"]
    response_header = ["*"]
    max_age_seconds = 3600
  }
}

# Bucket for backups
resource "google_storage_bucket" "backups" {
  name          = "koh-atlas-backups"
  location      = "US"
  storage_class = "COLDLINE"  # Cheaper for infrequent access
  
  uniform_bucket_level_access = true
  
  versioning {
    enabled = true
  }
  
  lifecycle_rule {
    condition {
      age = 7
      num_newer_versions = 7
    }
    action {
      type = "Delete"
    }
  }
  
  retention_policy {
    retention_period = 2592000  # 30 days (WORM - Write Once Read Many)
  }
}
```

**IAM Permissions:**
```bash
# Allow API Gateway to write exports
gcloud storage buckets add-iam-policy-binding gs://koh-atlas-exports \
  --member="serviceAccount:api-gateway-sa@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/storage.objectCreator"

# Allow workers to write backups
gcloud storage buckets add-iam-policy-binding gs://koh-atlas-backups \
  --member="serviceAccount:workers-sa@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"
```

**Cost:** $50-$100/month (storage + requests)

---

### **8. Secret Manager (OR HashiCorp Vault)**

**Component ID:** `n9`  
**Type:** `bastion-host`  
**Zone:** Security Tier

You have two options:

#### **Option A: Google Secret Manager (Recommended for GCP)**

```yaml
# Terraform - Secret Manager
resource "google_secret_manager_secret" "db_password" {
  secret_id = "database-password"
  
  replication {
    automatic = true
  }
  
  labels = {
    environment = "production"
    component   = "database"
  }
}

resource "google_secret_manager_secret_version" "db_password" {
  secret = google_secret_manager_secret.db_password.id
  secret_data = random_password.db_password.result
}

# IAM binding (allow API Gateway to access secret)
resource "google_secret_manager_secret_iam_member" "api_gateway" {
  secret_id = google_secret_manager_secret.db_password.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:api-gateway-sa@${PROJECT_ID}.iam.gserviceaccount.com"
}
```

**Access from application:**
```typescript
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const client = new SecretManagerServiceClient();

async function getSecret(name: string): Promise<string> {
  const [version] = await client.accessSecretVersion({
    name: `projects/${PROJECT_ID}/secrets/${name}/versions/latest`,
  });
  
  return version.payload.data.toString();
}

// Usage
const dbPassword = await getSecret('database-password');
const anthropicKey = await getSecret('anthropic-api-key');
```

**Cost:** $0.06 per 10,000 access operations (~$10/month)

#### **Option B: HashiCorp Vault (Same as AWS version)**

Deploy Vault on GKE using Helm chart - see AWS guide for details.

**Cost:** $300-$500/month (if using Vault)

**Recommendation:** Use Google Secret Manager for simplicity and cost savings.

---

