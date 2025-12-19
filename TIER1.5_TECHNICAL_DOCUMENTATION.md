# Tier 1.5 GCP Production-Hardened Architecture - Technical Documentation

**Version:** 1.5.0  
**Environment:** Production  
**Total Monthly Cost:** $1,340  
**Security Score:** 9.5/10  
**SLA:** 99.95%  
**Maximum Clients:** 10 (scalable to 50)

---

## Architecture Overview

This document provides comprehensive technical details for each component in the Tier 1.5 GCP Production-Hardened Architecture for the Atlas Security Architecture Platform. The architecture is designed for production readiness with regional high availability, comprehensive security controls, and full compliance support (SOC 2 Type II, ISO 27001, GDPR, HIPAA).

---

## Edge Layer Components

### 1. Cloud CDN (cdn-1)

**Service:** Google Cloud CDN  
**Cost:** $40/month  
**Quantity:** 1 global CDN configuration

**Why Required:**
- Reduces latency for global users by caching static content at Google's edge locations
- Offloads traffic from backend infrastructure, reducing costs
- Provides Layer 7 DDoS protection
- Required for production applications serving geographically distributed users

**What It Serves:**
- Static assets (CSS, JavaScript, images, fonts)
- Cacheable API responses
- Application frontend resources
- Edge caching with 1-hour default TTL

**Relations to Other Components:**
- **Routes to:** HTTPS Load Balancer (lb-1)
- **Serves traffic to:** Global end users before hitting origin servers
- **Cache invalidation:** Triggered by CI/CD deployments

**Configuration Details:**
- Cache mode: CACHE_ALL_STATIC
- Default TTL: 3600 seconds (1 hour)
- Negative caching: Enabled (caches 404s to reduce origin load)
- Signed URLs: Enabled for secure content delivery

---

### 2. Global HTTPS Load Balancer (lb-1)

**Service:** Google Cloud Load Balancing  
**Cost:** $18/month (base) + $0.008 per GB processed  
**Quantity:** 1 global load balancer

**Why Required:**
- Provides single global anycast IP for all users
- Terminates SSL/TLS connections with managed certificates
- Routes traffic to healthy backend services
- Integrates Cloud Armor for application-layer security
- Required for 99.95% SLA (multi-region failover capability)

**What It Serves:**
- HTTPS traffic termination (SSL/TLS offloading)
- Layer 7 load balancing with health checks
- Automatic SSL certificate provisioning and renewal
- Backend service routing to Cloud Endpoints and GKE

**Relations to Other Components:**
- **Receives traffic from:** Cloud CDN (cdn-1) edge locations
- **Routes to:** Cloud Armor WAF (armor-1) for security filtering
- **SSL certificates:** Managed by Google (auto-renewal)
- **Backend:** GKE Ingress via Cloud Endpoints

**Configuration Details:**
- Protocol: HTTPS with HTTP→HTTPS redirect
- SSL Policy: MODERN (TLS 1.2+)
- Backend service: GKE Ingress via ESP/ESPv2
- Health checks: HTTP/HTTPS every 10 seconds
- Session affinity: Cookie-based (optional)

---

### 3. Cloud Armor Security Policy (armor-1)

**Service:** Google Cloud Armor  
**Cost:** $10/month (base policy) + $1 per million requests  
**Quantity:** 1 security policy with 5 custom rules

**Why Required:**
- Protects against OWASP Top 10 vulnerabilities (SQLi, XSS, etc.)
- Provides adaptive DDoS protection at Layer 7
- Rate limiting prevents abuse and brute-force attacks
- Geo-blocking reduces attack surface
- Required for SOC 2 and PCI DSS compliance

**What It Serves:**
- Web Application Firewall (WAF) protection
- DDoS mitigation (application layer)
- Bot detection and mitigation
- Rate limiting per IP address
- Geographic access controls

**Relations to Other Components:**
- **Receives traffic from:** HTTPS Load Balancer (lb-1)
- **Routes to:** Cloud Endpoints (endpoints-1) after WAF filtering
- **Logs to:** Cloud Logging (logging-1) for security analysis
- **Alerts via:** Security Command Center (scc-1) on rule violations

**Configuration Details:**
- OWASP ModSecurity Core Rule Set 3.3
- Rate limiting: 100 requests/minute per IP
- Geo-blocking: Allow US/EU only, deny all others
- Adaptive protection: Enabled (ML-based DDoS detection)
- Priority rules: SQLi detection (100), XSS detection (200), Bot detection (300)

---

## Network Layer Components

### 4. Shared VPC (vpc-1)

**Service:** Google Virtual Private Cloud  
**Cost:** $15/month (NAT gateway + flow logs)  
**Quantity:** 1 regional VPC with 3 subnets

**Why Required:**
- Provides private network isolation for all resources
- Enables centralized network management across projects
- Required for VPC Service Controls perimeter
- Private Google Access eliminates public IP exposure
- Foundation for zero-trust networking

**What It Serves:**
- Private IP address space for GKE, Cloud SQL, Redis
- Subnet segmentation (pods, services, proxies)
- VPC Flow Logs for security monitoring
- Private connectivity to Google APIs

**Relations to Other Components:**
- **Hosts:** GKE cluster (gke-1), Cloud SQL (cloudsql-1), Redis (redis-1), Cloud Run (cloudrun-1)
- **Deployment target for:** GKE (gke-1), Cloud Run (cloudrun-1)
- **Connects to:** Cloud NAT (nat-1) for egress
- **Protected by:** VPC Service Controls (vpc-sc-1) perimeter
- **Monitored via:** VPC Flow Logs → Cloud Logging (logging-1)
- **Firewall rules:** Control traffic between components

**Configuration Details:**
- Region: us-central1
- Subnets:
  - `gke-pods`: 10.0.0.0/16 (65,536 IPs for pods)
  - `gke-services`: 10.1.0.0/20 (4,096 IPs for services)
  - `proxy-only`: 10.2.0.0/24 (256 IPs for internal LB)
- VPC Flow Logs: Enabled (sample rate 50%)
- Private Google Access: Enabled
- Mode: Shared VPC (centralized management)

---

### 5. VPC Service Controls (vpc-sc-1)

**Service:** Google VPC Service Controls  
**Cost:** $0 (included with GCP)  
**Quantity:** 1 security perimeter

**Why Required:**
- Prevents data exfiltration from Google-managed services
- Creates security boundary around sensitive data
- Required for HIPAA and GDPR compliance
- Enforces context-aware access to Google APIs
- Protects against accidental or malicious data leaks

**What It Serves:**
- Data exfiltration prevention for Cloud Storage, Cloud SQL, Redis
- Ingress/egress policy enforcement for Google APIs
- VPC-based context for API access (no internet exposure)
- Compliance boundary for regulated data

**Relations to Other Components:**
- **Protects:** Cloud Storage (storage-1), Cloud SQL (cloudsql-1), Redis (redis-1), Cloud Run (cloudrun-1)
- **Controls access to:** Google APIs (sqladmin, storage, redis, secretmanager)
- **Allows ingress from:** Cloud Load Balancing, Cloud Build (CI/CD)
- **Logs violations to:** Security Command Center (scc-1)
- **Does NOT control:** Internet egress (handled by egress-proxy-1)

**Configuration Details:**
- Perimeter name: atlas-production
- Access level: Corporate network only (IP-based + device policy)
- Protected services:
  - storage.googleapis.com
  - sqladmin.googleapis.com
  - redis.googleapis.com
  - run.googleapis.com
  - secretmanager.googleapis.com
- Ingress rules: Allow from Google-managed load balancers
- Egress rules: Allow to specified Google APIs only
- Tested with Cloud Run: ✅ Verified compatible

---

### 6. Cloud NAT (nat-1)

**Service:** Google Cloud NAT  
**Cost:** $10/month (1 NAT gateway + data processing)  
**Quantity:** 1 regional NAT gateway

**Why Required:**
- Provides static egress IP addresses for external API calls
- Enables internet access for private GKE nodes and Cloud Run
- Comprehensive logging for security monitoring and compliance
- Required for Anthropic API access without public IPs

**What It Serves:**
- Outbound internet connectivity for private resources
- Static IP assignment for allow-listing on third-party APIs
- Connection logging for audit trails
- Source NAT for GKE pods and Cloud Run instances

**Relations to Other Components:**
- **Provides egress for:** GKE cluster (gke-1), Cloud Run (cloudrun-1)
- **Receives traffic from:** Secure Web Proxy (egress-proxy-1)
- **Routes to:** Internet (Anthropic API, Google OAuth)
- **Logs to:** Cloud Logging (logging-1) for analysis
- **Subnet:** ALL_SUBNETWORKS_ALL_IP_RANGES

**Configuration Details:**
- Region: us-central1
- NAT IP allocation: Automatic (Google-managed IPs)
- Source subnet: All subnets in VPC
- Logging: ALL connections (100% sample rate)
- Timeout: TCP established 1200s, transitory 30s
- Min ports per VM: 64, Max ports per VM: 65536

---

### 7. Secure Web Proxy (egress-proxy-1)

**Service:** Cloud Run (Squid proxy container) or Secure Web Proxy Preview  
**Cost:** $15/month (Cloud Run instance + egress traffic)  
**Quantity:** 1 regional proxy (auto-scaling 0-3 instances)

**Why Required:**
- Enforces FQDN-based allow-listing for internet egress
- VPC firewall rules only support IP ranges, not domain names
- Required for compliance (only approved external APIs allowed)
- Provides detailed request logging for audit trails
- Prevents data exfiltration to unauthorized endpoints

**What It Serves:**
- FQDN allow-list enforcement (api.anthropic.com only)
- HTTP/HTTPS proxy for outbound traffic
- Request/response logging and inspection
- Workload Identity-based authentication
- Deny-by-default egress policy

**Relations to Other Components:**
- **Receives requests from:** Cloud Run workers (cloudrun-1), GKE pods (gke-1)
- **Routes through:** Cloud NAT (nat-1) for static IP
- **Allows access to:** api.anthropic.com, accounts.google.com, *.googleapis.com
- **Logs to:** Cloud Logging (logging-1)
- **Alerts on:** Unauthorized domain access via SCC (scc-1)

**Configuration Details:**
- Deployment: Cloud Run container (Squid 5.x or similar)
- CPU: 1 vCPU, Memory: 512 MB
- Min instances: 0 (scale to zero)
- Max instances: 3 (auto-scaling)
- Allowed FQDNs:
  - api.anthropic.com (Anthropic Claude API)
  - accounts.google.com (OAuth)
  - *.googleapis.com (Google APIs)
- Default action: DENY (block all other domains)
- Authentication: Workload Identity required
- Logging: Full request/response headers

---

### 8. Anthos Service Mesh (asm-1)

**Service:** Google Anthos Service Mesh (Managed Istio)  
**Cost:** $50/month (managed control plane)  
**Quantity:** 1 managed service mesh

**Why Required:**
- Provides automatic mTLS for all pod-to-pod communication
- Zero-trust networking within the cluster
- Service-to-service authorization policies (deny-by-default)
- Observability (telemetry, tracing) for microservices
- Required for SOC 2 encryption-in-transit requirements

**What It Serves:**
- Mutual TLS (mTLS) for pod-to-pod traffic
- Traffic management (retries, timeouts, circuit breaking)
- Service discovery and load balancing
- Distributed tracing with Cloud Trace
- Authorization policies (RBAC at service level)

**Relations to Other Components:**
- **Manages traffic between:** All GKE pods (gke-1)
- **Certificate issuance:** Certificate Authority Service (cas-1) issues mTLS certs
- **Does NOT cover:** Managed services (Cloud SQL, Redis, Storage use TLS+IAM)
- **Telemetry to:** Cloud Monitoring (monitoring-1)
- **Traces to:** Cloud Trace
- **Authorization policies:** Enforced at service mesh layer

**Configuration Details:**
- Version: Managed (Google-managed control plane)
- mTLS mode: STRICT (required for all services)
- mTLS scope: Pod-to-pod within mesh only
- Authorization policy: DENY_ALL by default, explicit allow rules
- Certificate lifetime: 24 hours (auto-rotation)
- Certificate Authority: GCP Certificate Authority Service
- Telemetry: Enabled (Prometheus metrics)
- Tracing: Enabled (1% sample rate)

---

## Compute Layer Components

### 9. GKE Regional Cluster (gke-1)

**Service:** Google Kubernetes Engine (Autopilot)  
**Cost:** $220/month (regional cluster + compute)  
**Quantity:** 1 regional cluster (3 zones, 6-12 auto-scaled nodes)

**Why Required:**
- Runs Atlas application workloads (API, UI, workers)
- Regional deployment provides 99.95% SLA (zone failure tolerance)
- Autopilot mode: Google-managed infrastructure, security, scaling
- Confidential Computing protects data in use (encrypted memory)
- Foundation for all containerized workloads

**What It Serves:**
- Atlas application pods (API server, frontend, background workers)
- Autopilot workload management (auto-scaling, auto-repair)
- Workload Identity for secure GCP API access
- Private cluster (no public endpoints)
- Binary Authorization admission control

**Relations to Other Components:**
- **Deployed in:** Shared VPC (vpc-1)
- **Receives traffic from:** Cloud Endpoints (endpoints-1)
- **Service mesh:** Anthos Service Mesh (asm-1) for pod-to-pod mTLS
- **Enforced by:** Policy Controller (policy-1)
- **Connects to:** Cloud SQL via Auth Proxy (sqlproxy-1)
- **Connects to:** Redis (redis-1) via private IP + TLS
- **Connects to:** Cloud Storage (storage-1) via Workload Identity
- **Invokes:** Cloud Run workers (cloudrun-1) for AI processing
- **Gets secrets from:** Secret Manager (secrets-1)
- **Image validation:** Binary Authorization (binauth-1)
- **Egress via:** Secure Web Proxy (egress-proxy-1) + Cloud NAT (nat-1)
- **Monitored by:** Security Command Center (scc-1), Cloud Monitoring (monitoring-1)
- **Logs to:** Cloud Logging (logging-1)

**Configuration Details:**
- Mode: Autopilot (Google-managed nodes, scaling, security)
- Region: us-central1 (multi-zonal across a, b, c)
- Node count: 6-12 (auto-scaled based on workload)
- Machine type: n2d-standard-2 (2 vCPU, 8 GB RAM, Confidential VM)
- Disk encryption: CMEK (Cloud KMS managed keys)
- Release channel: REGULAR (stable with frequent updates)
- Workload Identity: Enabled (no service account keys)
- Binary Authorization: ENFORCED (only signed images allowed)
- Shielded nodes: Enabled (secure boot, vTPM, integrity monitoring)
- Confidential nodes: Enabled (AMD SEV memory encryption)
- Network policy: Enabled (Kubernetes NetworkPolicy enforcement)
- Pod Security: Restricted (Policy Controller enforced)
- Control plane: Private (no public endpoint)
- Node IPs: Private only (no external IPs)

---

### 10. Policy Controller (policy-1)

**Service:** Anthos Config Management (Policy Controller)  
**Cost:** $0 (included with Anthos Service Mesh)  
**Quantity:** 1 policy controller per cluster

**Why Required:**
- Enforces Pod Security Standards (PSS) "restricted" profile
- Prevents privileged containers and host access
- Required for Kubernetes hardening best practices
- OPA-based policy enforcement (admission control)
- Required for SOC 2 and ISO 27001 compliance

**What It Serves:**
- Admission webhook for policy enforcement
- Pod Security Standards validation
- Resource limit requirements
- Image vulnerability scanning enforcement
- Security policy as code

**Relations to Other Components:**
- **Enforces policies on:** GKE cluster (gke-1) workloads
- **Works with:** Binary Authorization (binauth-1) for image policies
- **Logs violations to:** Cloud Logging (logging-1)
- **Alerts via:** Security Command Center (scc-1)

**Configuration Details:**
- Policy library: Pod Security Policy (PSP) replacement
- Enforcement mode: Dryrun-then-enforce (testing before blocking)
- Policies enforced:
  - Pod Security Standards: restricted
  - No privileged containers (privileged: false required)
  - No host network/PID/IPC access
  - Read-only root filesystem required
  - Drop all capabilities (no CAP_SYS_ADMIN, etc.)
  - Seccomp profile: RuntimeDefault required
  - Resource limits: CPU/memory limits required
  - Image vulnerability scanning: Block critical/high CVEs

---

### 11. Cloud Run Workers (cloudrun-1)

**Service:** Google Cloud Run  
**Cost:** $45/month (serverless compute + requests)  
**Quantity:** 0-10 instances (auto-scaling)

**Why Required:**
- Serverless execution for AI processing workloads (Anthropic API calls)
- Auto-scaling to zero (cost optimization when idle)
- Isolated execution environment for external API integrations
- Faster scaling than GKE for burst workloads
- VPC-SC compatible for security perimeter enforcement

**What It Serves:**
- Anthropic Claude API integration (AI analysis)
- Background job processing (threat analysis, report generation)
- Async task execution triggered by GKE
- Serverless functions with VPC connectivity

**Relations to Other Components:**
- **Deployed in:** Shared VPC (vpc-1)
- **Invoked by:** GKE pods (gke-1) via HTTPS + IAM authentication
- **Connects to:** Secure Web Proxy (egress-proxy-1) for Anthropic API
- **Gets secrets from:** Secret Manager (secrets-1)
- **Image validation:** Binary Authorization (binauth-1)
- **Protected by:** VPC-SC (vpc-sc-1)
- **Encryption:** CMEK via Cloud KMS (kms-1)
- **Monitored by:** Security Command Center (scc-1), Cloud Monitoring (monitoring-1)
- **Logs to:** Cloud Logging (logging-1)

**Configuration Details:**
- CPU: 2 vCPU (per instance)
- Memory: 4 GiB (per instance)
- Max instances: 10 (concurrent request limit)
- Min instances: 0 (scale to zero when idle)
- Timeout: 300 seconds (5 minutes max execution)
- Concurrency: 80 requests per instance
- VPC connector: shared-vpc (private connectivity)
- VPC egress: private-ranges-only (all egress via NAT)
- Binary Authorization: ENFORCED (signed images only)
- Encryption: CMEK for container images and runtime data
- Authentication: Workload Identity (no service account keys)
- VPC-SC tested: ✅ Compatible with perimeter

---

## Data Layer Components

### 12. Cloud SQL PostgreSQL HA (cloudsql-1)

**Service:** Google Cloud SQL for PostgreSQL  
**Cost:** $260/month (HA configuration with read replica)  
**Quantity:** 1 primary + 1 standby + 1 read replica

**Why Required:**
- Primary relational database for Atlas application data
- High availability with automatic failover (99.95% SLA)
- Regional redundancy prevents data loss from zone failures
- Point-in-time recovery (PITR) for disaster recovery
- CMEK encryption for compliance (HIPAA, GDPR)

**What It Serves:**
- User accounts and authentication data
- Architecture designs and component catalog
- Project metadata and configurations
- Audit logs and application state
- Relational data with ACID guarantees

**Relations to Other Components:**
- **Accessed via:** Cloud SQL Auth Proxy (sqlproxy-1) only (no direct access)
- **Clients:** GKE pods (gke-1) via sidecar proxy
- **Backups to:** Google-managed storage (encrypted with CMEK)
- **Encrypted by:** Cloud KMS (kms-1) for data at rest
- **Scanned by:** Cloud DLP API (dlp-1) for PII/PHI detection
- **Protected by:** VPC-SC (vpc-sc-1), Private IP only
- **Monitored by:** Cloud Monitoring (monitoring-1)
- **Logs to:** Cloud Logging (logging-1)

**Configuration Details:**
- Engine: PostgreSQL 16 (latest stable)
- Tier: db-custom-2-8192 (2 vCPU, 8 GB RAM)
- Region: us-central1 (multi-zone)
- High Availability: Enabled (synchronous replication to standby)
- Read replicas: 1 (in same region for read scaling)
- Storage: 100 GB SSD (auto-expanding to 500 GB)
- Backups:
  - Automated daily backups at 03:00 UTC
  - Retention: 30 days
  - Point-in-time recovery: Enabled (7-day recovery window)
  - Transaction logs: Every 10 minutes
- Maintenance window: Sunday 04:00 UTC
- Encryption: CMEK (customer-managed encryption keys)
- SSL mode: REQUIRED (reject non-SSL connections)
- Authorized networks: None (private IP only)
- IAM authentication: Enabled (password-less access)
- Connection limit: 100 (Autopilot default)

---

### 13. Cloud SQL Auth Proxy (sqlproxy-1)

**Service:** Cloud SQL Auth Proxy (sidecar container)  
**Cost:** $0 (included, runs as sidecar in GKE)  
**Quantity:** 1 sidecar per pod that needs database access

**Why Required:**
- Eliminates password-based authentication (uses IAM)
- Automatic TLS encryption (no manual certificate management)
- Prevents direct database access (security best practice)
- Connection pooling and multiplexing
- Required for Workload Identity integration

**What It Serves:**
- Secure connection tunnel to Cloud SQL
- IAM-based authentication via Workload Identity
- Automatic TLS encryption
- Connection lifecycle management

**Relations to Other Components:**
- **Runs in:** GKE pods (gke-1) as sidecar container
- **Connects to:** Cloud SQL PostgreSQL (cloudsql-1)
- **Authentication via:** Workload Identity (no passwords)
- **Encryption:** Automatic TLS 1.3
- **Monitored:** Cloud Monitoring (monitoring-1) for connection metrics

**Configuration Details:**
- Deployment: Sidecar container in Kubernetes pods
- Authentication: IAM (Workload Identity)
- Encryption: Automatic TLS 1.3 (Google-managed certificates)
- Port: 5432 (localhost only, pod-scoped)
- Connection limit: 100 concurrent connections
- Timeout: 30 seconds connection timeout
- Image: gcr.io/cloud-sql-connectors/cloud-sql-proxy:latest
- Auto-reconnect: Enabled
- Connection pooling: Handled by application (not proxy)

---

### 14. Memorystore Redis HA (redis-1)

**Service:** Google Memorystore for Redis  
**Cost:** $115/month (Standard Tier with replication)  
**Quantity:** 1 primary + 1 replica (regional HA)

**Why Required:**
- Session storage for stateless application scaling
- Cache layer for database query results (performance)
- Real-time data for dashboards and analytics
- High availability with automatic failover
- CMEK encryption for compliance

**What It Serves:**
- User session data (authentication state)
- Application cache (component catalog, presets)
- Rate limiting counters (API throttling)
- Real-time analytics data
- Pub/sub messaging (optional)

**Relations to Other Components:**
- **Accessed by:** GKE pods (gke-1) via private IP
- **Connection:** TLS + Redis AUTH (password-based)
- **Encrypted by:** Cloud KMS (kms-1) for data at rest
- **Password stored in:** Secret Manager (secrets-1)
- **Protected by:** VPC-SC (vpc-sc-1), Shared VPC (vpc-1)
- **Monitored by:** Cloud Monitoring (monitoring-1)

**Configuration Details:**
- Tier: STANDARD (HA with automatic failover)
- Version: Redis 7.x (latest stable)
- Memory: 5 GB (cache size)
- Region: us-central1
- Replication: 1 read replica (async replication)
- Persistence: RDB snapshots + AOF (optional)
- Transit encryption: TLS 1.2+ (SERVER_AUTHENTICATION mode)
- AUTH: Enabled (password required)
- Maintenance window: Sunday 05:00 UTC
- Encryption at rest: CMEK (customer-managed keys)
- Network: Private IP only (shared-vpc)
- Connection limit: 65,000 (Redis default)
- Eviction policy: allkeys-lru (least recently used)

---

### 15. Cloud Storage (storage-1)

**Service:** Google Cloud Storage  
**Cost:** $23/month (100 GB STANDARD class + operations)  
**Quantity:** 1 regional bucket

**Why Required:**
- Stores user-uploaded architecture diagrams and exports
- Static asset hosting for application frontend
- Backup storage for database dumps (optional)
- Versioning for data protection and recovery
- CMEK encryption for compliance

**What It Serves:**
- Architecture design exports (JSON, PDF)
- User-uploaded images and files
- Application static assets (if not served via CDN)
- Backup archives
- Lifecycle management for cost optimization

**Relations to Other Components:**
- **Accessed by:** GKE pods (gke-1), Cloud Run (cloudrun-1) via Workload Identity
- **Served via:** Cloud CDN (cdn-1) for static content
- **Encrypted by:** Cloud KMS (kms-1) for objects at rest
- **Scanned by:** Cloud DLP API (dlp-1) for PII/PHI detection
- **Protected by:** VPC-SC (vpc-sc-1), IAM policies
- **Versioning:** Enabled (30-day version retention)

**Configuration Details:**
- Storage class: STANDARD (regional, low latency)
- Location: us-central1 (same region as compute)
- Versioning: Enabled (track file changes)
- Lifecycle policy:
  - Delete objects after 90 days (configurable)
  - Transition to NEARLINE after 30 days (cold data)
  - Delete non-current versions after 7 days
- Uniform bucket-level access: Enabled (IAM only, no ACLs)
- Encryption: CMEK (customer-managed encryption keys)
- CORS: Restricted (allow only specific origins)
- Public access: BLOCKED (private bucket, IAM required)
- Retention policy: None (configurable for immutability)

---

## Security Layer Components

### 16. Cloud KMS (kms-1)

**Service:** Google Cloud Key Management Service  
**Cost:** $1/month (5 active keys + operations)  
**Quantity:** 1 key ring with 5 encryption keys

**Why Required:**
- Customer-managed encryption keys (CMEK) for all data
- Centralized key management and rotation
- Compliance requirement (HIPAA, GDPR, PCI DSS)
- Separation of duties (key management vs. data access)
- Audit trail for key usage

**What It Serves:**
- Encryption keys for GKE persistent disks
- Encryption keys for Cloud SQL database
- Encryption keys for Redis cache
- Encryption keys for Cloud Storage buckets
- Encryption keys for Secret Manager secrets

**Relations to Other Components:**
- **Encrypts data for:** Cloud SQL (cloudsql-1), Redis (redis-1), Cloud Storage (storage-1)
- **Encrypts secrets for:** Secret Manager (secrets-1)
- **Encrypts disks for:** GKE (gke-1)
- **Key access:** IAM-based (Workload Identity for services)
- **Logging:** All key operations logged to Cloud Logging (logging-1)
- **Monitoring:** Key usage metrics in Cloud Monitoring (monitoring-1)
- **Rotation:** Automatic every 90 days

**Configuration Details:**
- Key ring location: us-central1 (regional, low latency)
- Rotation period: 90 days (automatic)
- Protection level: SOFTWARE (HSM optional for FIPS 140-2)
- Keys:
  1. gke-disk-encryption (GKE persistent disk volumes)
  2. cloudsql-encryption (Cloud SQL database and backups)
  3. redis-encryption (Memorystore Redis data)
  4. storage-encryption (Cloud Storage bucket objects)
  5. secret-manager-encryption (Secret Manager secret values)
- Destroy schedule: 30 days (key soft-delete)
- Permissions: Separate IAM roles for key admin vs. key user
- Audit logging: All key operations logged

---

### 17. Secret Manager (secrets-1)

**Service:** Google Secret Manager  
**Cost:** $1/month (4 active secrets + 500 access operations/month)  
**Quantity:** 1 secret manager instance with 4 secrets

**Why Required:**
- Centralized secrets storage (no secrets in code or config files)
- CMEK encryption for secret values (compliance)
- Automatic secret rotation (90-day lifecycle)
- Version control for secret values (rollback capability)
- Workload Identity integration (no service account keys)

**What It Serves:**
- Anthropic API key (Claude AI integration)
- Redis AUTH password
- OAuth client secrets (Firebase)
- JWT signing keys (API authentication)

**Relations to Other Components:**
- **Accessed by:** GKE pods (gke-1), Cloud Run (cloudrun-1) via Workload Identity
- **Encryption:** Cloud KMS (kms-1) for secret values
- **Rotation triggers:** Cloud Functions (future) or manual
- **Audit logging:** Cloud Logging (logging-1) tracks all access
- **Monitoring:** Cloud Monitoring (monitoring-1) for access metrics

**Configuration Details:**
- Replication: Automatic (multi-region for availability)
- Encryption: CMEK (customer-managed keys via Cloud KMS)
- Rotation:
  - Enabled: Yes
  - Period: 90 days
  - Method: Manual trigger or Cloud Functions
- Version control: Enabled (keep last 5 versions)
- Secrets stored:
  1. anthropic-api-key (Anthropic Claude API key)
  2. redis-auth-string (Redis password for AUTH command)
  3. oauth-client-secret (Firebase OAuth client secret)
  4. jwt-signing-key (RSA private key for JWT signing)
- Access control: IAM-based (Workload Identity, no service account keys)
- Audit: All secret access operations logged

---

### 18. Binary Authorization (binauth-1)

**Service:** Google Binary Authorization  
**Cost:** $0 (included with GKE)  
**Quantity:** 1 policy enforced on GKE and Cloud Run

**Why Required:**
- Prevents deployment of unsigned or unverified container images
- Vulnerability scanning enforcement (no critical CVEs allowed)
- Supply chain security (trusted image sources only)
- Required for SOC 2 Type II and ISO 27001
- Attestation-based deployment (cryptographic signatures)

**What It Serves:**
- Admission control for GKE and Cloud Run
- Container image signature verification
- Vulnerability scanning policy enforcement
- Trusted registry allow-listing
- Build provenance validation

**Relations to Other Components:**
- **Validates images for:** GKE cluster (gke-1), Cloud Run (cloudrun-1)
- **Image validation requested by:** Cloud Run (cloudrun-1)
- **Attestation authority:** Certificate Authority Service (cas-1)
- **Image registry:** Google Container Registry (gcr.io/atlas-production)
- **Scanning:** Container Analysis API (built-in)
- **Alerts:** Security Command Center (scc-1) on violations

**Configuration Details:**
- Default admission rule: DENY_ALL (explicit allow required)
- Allowed registries: gcr.io/atlas-production only
- Attestation authority: GCP Certificate Authority Service
- Vulnerability scanning policy:
  - Max critical CVEs: 0 (block deployment)
  - Max high CVEs: 0 (block deployment)
  - Max medium CVEs: 5 (warning only)
- Signature verification: Required (RSA 4096-bit)
- Exemptions: None (all images must be signed)
- Dry-run mode: Disabled (enforcement active)

---

### 19. Certificate Authority Service (cas-1)

**Service:** Google Certificate Authority Service  
**Cost:** $200/month (DevOps tier)  
**Quantity:** 1 private CA

**Why Required:**
- Private Certificate Authority for Anthos Service Mesh (mTLS)
- Issues certificates for pod-to-pod authentication
- Automatic certificate rotation (short-lived certificates)
- Eliminates self-signed certificate management
- Required for zero-trust networking architecture

**What It Serves:**
- mTLS certificates for service mesh (Anthos)
- Internal service-to-service authentication
- Certificate issuance and revocation
- Automatic certificate lifecycle management
- Attestation authority for Binary Authorization

**Relations to Other Components:**
- **Issues mTLS certificates to:** Anthos Service Mesh (asm-1) workloads
- **Signs images for:** Binary Authorization (binauth-1) attestation
- **Certificate distribution:** Automatic via Istio control plane
- **Monitoring:** Cloud Monitoring (monitoring-1) for certificate metrics

**Configuration Details:**
- Tier: DevOps (unlimited certificates, auto-renewal)
- CA lifetime: 10 years
- Key algorithm: RSA 4096-bit (highest security)
- Certificate lifetime: 90 days (short-lived for security)
- Auto-renewal: Enabled (24 hours before expiry)
- Subject Alternative Names (SAN): Enabled
- Key usage: digitalSignature, keyEncipherment
- Extended key usage: serverAuth, clientAuth
- Revocation: CRL and OCSP enabled
- Issuance rate: Unlimited (DevOps tier)

---

### 20. Cloud Identity (identity-1)

**Service:** Google Cloud Identity Premium  
**Cost:** $60/month (10 users × $6/user/month)  
**Quantity:** 10 licensed users

**Why Required:**
- Centralized identity and access management
- Single Sign-On (SSO) for GCP Console and applications
- Multi-factor authentication (MFA) enforcement
- Password policies and session management
- Required for SOC 2 Type II access controls

**What It Serves:**
- User authentication for GCP Console
- SSO integration with corporate directory
- MFA enforcement (TOTP, security keys)
- Password policy enforcement
- Session timeout and device management

**Relations to Other Components:**
- **Provides SSO to:** Firebase Authentication (firebaseauth-1)
- **Authenticates:** GCP Console users and administrators
- **SSO provider for:** Atlas application (via Firebase)
- **Integrated with:** Security Command Center (scc-1) for audit logs
- **Logs to:** Cloud Logging (logging-1)

**Configuration Details:**
- Edition: Premium (MFA, advanced security)
- SSO: Enabled (SAML 2.0 integration)
- MFA: ENFORCED (required for all users)
- Password policy:
  - Min length: 14 characters
  - Complexity: High (uppercase, lowercase, numbers, symbols)
  - Rotation: 90 days
  - History: Remember last 10 passwords
- Session timeout: 8 hours (re-authentication required)
- Device management: Enabled (endpoint verification)
- Users: 10 (Atlas platform administrators)
- Groups: 3 (Admin, Developer, Viewer)

---

### 21. Security Command Center Premium (scc-1)

**Service:** Google Security Command Center Premium  
**Cost:** $150/month (Premium tier with all modules)  
**Quantity:** 1 organization-wide SCC instance

**Why Required:**
- Centralized security monitoring and threat detection
- Event Threat Detection for anomaly detection
- Container Threat Detection for runtime security
- Web Security Scanner for vulnerability scanning
- Required for compliance and security operations

**What It Serves:**
- Real-time threat detection and alerting
- Security posture management
- Vulnerability scanning (web and container)
- Compliance monitoring (CIS benchmarks)
- Security analytics and reporting

**Relations to Other Components:**
- **Monitors:** GKE (gke-1), Cloud Run (cloudrun-1), Cloud SQL, Storage, all GCP resources
- **Receives events from:** Cloud Logging (logging-1), VPC-SC (vpc-sc-1)
- **Scans containers in:** GKE (gke-1), Cloud Run (cloudrun-1)
- **Notifications to:** PubSub + Email (alerts on findings)
- **Integrated with:** Cloud Armor (armor-1), Binary Authorization (binauth-1)

**Configuration Details:**
- Tier: Premium (all modules enabled)
- Modules:
  1. Event Threat Detection (anomaly detection)
  2. Container Threat Detection (runtime security)
  3. Web Security Scanner (OWASP Top 10)
  4. Security Health Analytics (CIS benchmarks)
- Alert rules (10 custom rules):
  1. Privileged container detected
  2. Unusual API call pattern (ML-based)
  3. Data exfiltration attempt (large egress)
  4. Binary authorization violation
  5. Service account key creation (not allowed)
  6. VPC-SC perimeter violation
  7. Failed authentication spike (>10 in 5 minutes)
  8. Crypto mining activity (CPU pattern detection)
  9. Malware detected in container image
  10. Anomalous egress traffic (unexpected destinations)
- Notifications: PubSub topic + Email (security@company.com)
- Retention: 365 days (1 year of findings)
- Export: BigQuery (long-term analytics)

---

### 22. Cloud DLP API (dlp-1)

**Service:** Google Cloud Data Loss Prevention API  
**Cost:** $15/month (scanning + inspection operations)  
**Quantity:** 1 DLP configuration with 3 templates

**Why Required:**
- Automatic PII/PHI detection in data at rest
- Data classification for compliance (GDPR, HIPAA, CCPA)
- De-identification of sensitive data (masking, redaction)
- Prevents accidental exposure of sensitive information
- Required for SOC 2 Type II data protection controls

**What It Serves:**
- PII detection (SSN, credit cards, emails, phone numbers)
- PHI detection (medical records, patient data)
- Data classification (confidential, sensitive, public)
- Automatic redaction and masking
- Compliance reporting

**Relations to Other Components:**
- **Scans data in:** Cloud SQL (cloudsql-1), Cloud Storage (storage-1)
- **Findings to:** Security Command Center (scc-1)
- **Logs to:** Cloud Logging (logging-1)
- **Scheduled scans:** Daily at 02:00 UTC (Cloud Scheduler)

**Configuration Details:**
- Inspect templates:
  1. PII_DETECTION (SSN, credit card, email, phone, address)
  2. PHI_DETECTION (medical records, prescriptions, diagnoses)
  3. CREDIT_CARD_DETECTION (PAN, CVV, expiration dates)
- De-identify methods:
  - MASKING (replace with asterisks: 123-45-**** )
  - REDACTION (remove entirely)
  - TOKENIZATION (replace with reversible token)
- Scan schedule: Daily (full scan at 02:00 UTC)
- Likelihood threshold: POSSIBLE (minimize false negatives)
- Max findings per item: 100
- Sample method: ALL (scan all data, not sample)

---

## API & Application Layer Components

### 23. Cloud Endpoints (endpoints-1)

**Service:** Google Cloud Endpoints (ESP/ESPv2)  
**Cost:** $35/month (management + traffic)  
**Quantity:** 1 API gateway (ESPv2 sidecar in GKE)

**Why Required:**
- API management and gateway for Atlas REST API
- Authentication via Firebase Auth + JWT validation
- Rate limiting and quota management
- API analytics and monitoring
- OpenAPI 3.0 specification enforcement

**What It Serves:**
- API gateway for Atlas application
- Request authentication and authorization
- Rate limiting (100 req/min per user)
- API versioning and routing
- Request/response logging

**Relations to Other Components:**
- **Receives traffic from:** Cloud Armor WAF (armor-1)
- **Routes to:** GKE application pods (gke-1)
- **Validates JWT from:** Firebase Authentication (firebaseauth-1)
- **Logs to:** Cloud Logging (logging-1)
- **Metrics to:** Cloud Monitoring (monitoring-1)

**Configuration Details:**
- Deployment: ESPv2 sidecar container in GKE pods
- OpenAPI spec: v3.0 (defined in Git repository)
- Authentication: Firebase Auth + JWT validation
- Rate limiting:
  - Requests per minute: 100 (per user)
  - Burst size: 200 (allow short bursts)
- Monitoring: Full request/response logging
- CORS: Enabled (allow specific origins)
- API keys: Required (validated on each request)
- Quota management: Per-client quotas configurable
- Timeout: 60 seconds (backend response timeout)

---

### 24. Firebase Authentication (firebaseauth-1)

**Service:** Google Firebase Authentication  
**Cost:** $0 (free tier, <50,000 MAU)  
**Quantity:** 1 Firebase project (up to 10 users)

**Why Required:**
- User authentication for Atlas application
- OAuth 2.0 / OpenID Connect integration
- Session management with secure JWTs
- MFA support (optional for users)
- Token lifecycle controls (revocation on password change)

**What It Serves:**
- User sign-up and sign-in (email/password, Google, SSO)
- JWT token issuance and validation
- Session management and refresh tokens
- Password reset and email verification
- MFA (TOTP, SMS) for enhanced security

**Relations to Other Components:**
- **Issues JWT tokens to:** Cloud Endpoints (endpoints-1)
- **SSO integration from:** Cloud Identity (identity-1)
- **Logs to:** Cloud Logging (logging-1)
- **User data stored in:** Cloud SQL (cloudsql-1)

**Configuration Details:**
- Providers:
  - Google (OAuth 2.0)
  - Email/Password (native)
  - SAML SSO (enterprise integration with Cloud Identity)
- Session management:
  - Token expiry: 1 hour (short-lived access tokens)
  - Refresh token expiry: 30 days (sliding window)
  - Revoke on password change: Enabled
  - Revoke on role change: Enabled
- MFA: Optional (user can enable TOTP or SMS)
- Rate limiting: 100 requests/hour per IP (brute-force protection)
- Email verification: Required for sign-up
- Password policy: Inherited from Cloud Identity (14+ chars)

---

## Observability Layer Components

### 25. Cloud Logging (logging-1)

**Service:** Google Cloud Logging  
**Cost:** $25/month (includes dual sinks + archive storage)  
**Quantity:** 1 logging instance with 2 export sinks

**Why Required:**
- Centralized logging for all GCP resources
- Immutable audit trail (WORM storage)
- Compliance requirement (7-year retention)
- Dual sink redundancy (analytics + archive)
- Security incident investigation

**What It Serves:**
- Admin activity logs (IAM changes, resource creation)
- Data access logs (who accessed what data)
- System logs (VM, GKE, Cloud Run)
- Application logs (Atlas app, worker logs)
- Security logs (authentication, authorization)

**Relations to Other Components:**
- **Receives logs from:** GKE (gke-1), Cloud Run (cloudrun-1), Cloud SQL (cloudsql-1), all GCP resources
- **Exports to:**
  1. BigQuery (bq-logs dataset) for analytics
  2. Cloud Storage Archive bucket for immutable storage
- **Queried by:** Cloud Monitoring (monitoring-1) for alerting
- **Analyzed in:** Security Command Center (scc-1)

**Configuration Details:**
- Retention in Cloud Logging: 30 days
- Log types: Admin, Data Access, System, Application
- Export destinations:
  1. **BigQuery:**
     - Purpose: Analytics and search
     - Retention: 90 days
     - Partitioning: Daily (by timestamp)
     - Clustering: severity, resource.type
  2. **Cloud Storage Archive:**
     - Purpose: Immutable audit trail (WORM)
     - Storage class: ARCHIVE (lowest cost)
     - Bucket Lock: ENABLED (7-year retention, cannot delete)
     - Encryption: CMEK via Cloud KMS
     - Format: JSON (gzip compressed)
- Filter exclusions: health-checks, metrics-polling (reduce noise)
- Advanced filtering: Include only severity >= INFO
- Log sampling: None (100% of logs captured)

---

### 26. Cloud Monitoring (monitoring-1)

**Service:** Google Cloud Monitoring  
**Cost:** $15/month (metrics ingestion + alerting)  
**Quantity:** 1 monitoring workspace with 3 dashboards and 5 alert policies

**Why Required:**
- Real-time application and infrastructure monitoring
- SLO tracking (99.95% uptime target)
- Alerting for performance and security issues
- Capacity planning and cost optimization
- Required for production operations

**What It Serves:**
- Infrastructure metrics (CPU, memory, disk, network)
- Application metrics (request rate, latency, errors)
- Custom metrics (business KPIs)
- SLO/SLI monitoring and reporting
- Alert notifications (email, PagerDuty)

**Relations to Other Components:**
- **Monitors:** GKE (gke-1), Cloud Run (cloudrun-1), Cloud SQL (cloudsql-1), Redis, all GCP resources
- **Receives metrics from:** Anthos Service Mesh (asm-1), Cloud Run (cloudrun-1)
- **Queries logs from:** Cloud Logging (logging-1)
- **Sends alerts to:** PubSub, Email, PagerDuty
- **Integrated with:** Security Command Center (scc-1)

**Configuration Details:**
- Dashboards (3):
  1. Infrastructure (CPU, memory, disk, network by resource)
  2. Application (request rate, latency, error rate, SLO burn rate)
  3. Security (failed auth, policy violations, anomalies)
- Alert policies (5):
  1. CPU > 80% for 5 minutes
  2. Memory > 85% for 5 minutes
  3. Error rate > 1% for 10 minutes
  4. Latency p95 > 500ms for 15 minutes
  5. Security event detected (from SCC)
- Notification channels:
  - Email: ops@company.com
  - PagerDuty: High-priority incidents
- Uptime checks: Every 1 minute (HTTP/HTTPS)
- Log-based metrics: Extracted from Cloud Logging
- Custom metrics: Application-specific KPIs

---

## Architecture Relationships Summary

### Traffic Flow (Client Request Path)

1. **User** → **Cloud CDN (cdn-1)** → **HTTPS Load Balancer (lb-1)**
2. **HTTPS Load Balancer** → **Cloud Armor WAF (armor-1)** (inline filtering)
3. **Cloud Armor** → **Cloud Endpoints (endpoints-1)** (API gateway)
4. **Cloud Endpoints** → **Firebase Auth (firebaseauth-1)** (JWT validation)
5. **Cloud Endpoints** → **GKE (gke-1)** (application pods)
6. **GKE pods** → **Anthos Service Mesh (asm-1)** (pod-to-pod mTLS)

### Data Access Path

1. **GKE pods** → **Cloud SQL Auth Proxy (sqlproxy-1)** → **Cloud SQL (cloudsql-1)**
2. **GKE pods** → **Redis (redis-1)** (TLS + AUTH)
3. **GKE pods** → **Cloud Storage (storage-1)** (Workload Identity)
4. **GKE pods** → **Secret Manager (secrets-1)** (Workload Identity)

### External API Access Path

1. **GKE/Cloud Run** → **Secure Web Proxy (egress-proxy-1)** (FQDN allow-list)
2. **Secure Web Proxy** → **Cloud NAT (nat-1)** (static IP)
3. **Cloud NAT** → **Internet** (Anthropic API)

### Security Enforcement Layers

1. **Network:** VPC-SC (vpc-sc-1), Cloud Armor (armor-1), Shared VPC (vpc-1)
2. **Compute:** Binary Authorization (binauth-1), Policy Controller (policy-1), Shielded/Confidential GKE
3. **Data:** CMEK (kms-1), VPC-SC, Private IPs, TLS everywhere
4. **Access:** Workload Identity, Cloud Identity (identity-1), Firebase Auth (firebaseauth-1)
5. **Detection:** SCC Premium (scc-1), Cloud Logging (logging-1), Cloud DLP (dlp-1)

### Encryption Layers

1. **In-transit:** TLS 1.2+ (all connections), mTLS (pod-to-pod via ASM)
2. **At-rest:** CMEK via Cloud KMS (kms-1) for all data stores
3. **In-use:** Confidential GKE (AMD SEV memory encryption)

---

## Cost Breakdown by Layer

### Edge Layer: $68/month
- Cloud CDN: $40
- HTTPS Load Balancer: $18
- Cloud Armor: $10

### Network Layer: $90/month
- Shared VPC: $15
- VPC Service Controls: $0
- Cloud NAT: $10
- Secure Web Proxy: $15
- Anthos Service Mesh: $50

### Compute Layer: $265/month
- GKE Regional Cluster: $220
- Policy Controller: $0
- Cloud Run Workers: $45

### Data Layer: $399/month
- Cloud SQL PostgreSQL HA: $260
- Cloud SQL Auth Proxy: $0
- Memorystore Redis HA: $115
- Cloud Storage: $23
- Cloud KMS: $1

### Security Layer: $428/month
- Secret Manager: $1
- Binary Authorization: $0
- Certificate Authority Service: $200
- Cloud Identity Premium: $60
- Security Command Center Premium: $150
- Cloud DLP API: $15
- Cloud Logging: $25 (with archive)
- Cloud Monitoring: $15

### Application Layer: $35/month
- Cloud Endpoints: $35
- Firebase Authentication: $0

**Total: $1,340/month**

---

## Compliance Mapping

### SOC 2 Type II Controls
- **Access Control:** Cloud Identity MFA, Workload Identity, IAM policies
- **Encryption:** CMEK for all data at rest, TLS 1.2+ in transit
- **Monitoring:** Cloud Logging, SCC Premium, DLP API
- **Availability:** Regional HA (99.95% SLA), automated backups
- **Change Management:** Binary Authorization, Policy Controller

### ISO 27001 Controls
- **A.9 Access Control:** Cloud Identity, Firebase Auth, IAM
- **A.10 Cryptography:** CMEK, TLS, Confidential Computing
- **A.12 Operations Security:** SCC Premium, Cloud Monitoring, Logging
- **A.14 System Acquisition:** Binary Authorization, vulnerability scanning
- **A.17 Business Continuity:** Regional HA, PITR, automated failover

### GDPR Requirements
- **Data Protection:** CMEK encryption, VPC-SC, DLP API
- **Right to Erasure:** Automated deletion workflows (Cloud Scheduler)
- **Data Portability:** Cloud Storage exports, BigQuery analytics
- **Breach Notification:** SCC Premium alerts, Cloud Logging
- **Audit Trail:** 7-year immutable logs (Cloud Storage Archive)

### HIPAA Controls
- **Access Control:** MFA, Workload Identity, audit logging
- **Encryption:** CMEK (at-rest), TLS 1.2+ (in-transit), Confidential GKE (in-use)
- **Audit Controls:** Cloud Logging (7-year retention), SCC Premium
- **Integrity Controls:** Binary Authorization, Policy Controller
- **Transmission Security:** TLS everywhere, mTLS for pod-to-pod

---

## Scaling Paths

### Tier 1.5 → Tier 2 (50 clients)
- **Cost:** +$600/month → $1,940/month total
- **Changes:**
  - GKE: 12-24 nodes (+$300)
  - Cloud SQL: db-custom-4-16384 (+$200)
  - Redis: 10 GB (+$100)
  - No architecture changes required

### Tier 2 → Tier 3 (500 clients)
- **Cost:** +$3,500/month → $5,440/month total
- **Changes:**
  - Multi-region deployment (2 regions)
  - Cloud SQL: Cross-region replication
  - Apigee API Management (replace Cloud Endpoints)
  - Cloud CDN Premium tier
  - GKE: Multi-cluster (2 regional clusters)

---

## Deployment Checklist

1. ✅ **Network Setup:** VPC, subnets, Cloud NAT, VPC-SC perimeter
2. ✅ **Security Foundation:** Cloud KMS keys, Certificate Authority, Cloud Identity
3. ✅ **Data Layer:** Cloud SQL HA, Redis HA, Cloud Storage bucket
4. ✅ **Compute:** GKE Regional Autopilot, Anthos Service Mesh, Policy Controller
5. ✅ **API Gateway:** Cloud Endpoints ESPv2, Firebase Auth
6. ✅ **Egress Control:** Secure Web Proxy, Cloud NAT
7. ✅ **Monitoring:** Cloud Logging dual sinks, Cloud Monitoring dashboards, SCC Premium
8. ✅ **Application:** Deploy Atlas container images, configure secrets
9. ✅ **Testing:** Load testing, failover testing, security scanning
10. ✅ **Documentation:** Runbooks, incident response procedures, compliance evidence

---

## Maintenance Schedule

### Daily
- Automated backups (Cloud SQL, Redis)
- DLP scanning (Cloud Storage, Cloud SQL)
- Log exports (BigQuery, Archive)

### Weekly
- Vulnerability scanning (Container Analysis)
- Security findings review (SCC Premium)
- Cost optimization review (Billing reports)

### Monthly
- Certificate rotation (Certificate Authority Service)
- Access review (IAM audit)
- Compliance reporting (SOC 2, ISO 27001)

### Quarterly
- Key rotation (Cloud KMS)
- Disaster recovery testing
- Penetration testing (third-party)

---

**Document Version:** 1.0  
**Last Updated:** December 17, 2025  
**Owner:** Atlas Platform Engineering Team
