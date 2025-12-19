# GCP Production Infrastructure - Technical Specification

**Version:** 1.5.0  
**Environment:** Production  
**Security Score:** 9.5/10  
**SLA:** 99.95%

---

## Infrastructure Overview

This document provides comprehensive technical details for each component in the GCP Production Infrastructure. The infrastructure is designed for production readiness with regional high availability, comprehensive security controls, and full compliance support (SOC 2 Type II, ISO 27001, GDPR, HIPAA).

---

## Edge Layer Components

### 1. Cloud CDN

**Service:** Google Cloud CDN  
**Quantity:** 1 global CDN configuration

**Purpose:**
- Reduces latency for global users by caching static content at Google's edge locations
- Offloads traffic from backend infrastructure
- Provides Layer 7 DDoS protection

**Functionality:**
- Static assets (CSS, JavaScript, images, fonts)
- Cacheable API responses
- Application frontend resources
- Edge caching with 1-hour default TTL

**Relations to Other Components:**
- **Routes to:** HTTPS Load Balancer
- **Serves traffic to:** Global end users before hitting origin servers
- **Cache invalidation:** Triggered by CI/CD deployments

**Configuration Details:**
- Cache mode: CACHE_ALL_STATIC
- Default TTL: 3600 seconds (1 hour)
- Negative caching: Enabled (caches 404s to reduce origin load)
- Signed URLs: Enabled for secure content delivery

---

### 2. Global HTTPS Load Balancer

**Service:** Google Cloud Load Balancing  
**Quantity:** 1 global load balancer

**Purpose:**
- Provides single global anycast IP for all users
- Terminates SSL/TLS connections with managed certificates
- Routes traffic to healthy backend services
- Integrates Cloud Armor for application-layer security

**Functionality:**
- HTTPS traffic termination (SSL/TLS offloading)
- Layer 7 load balancing with health checks
- Automatic SSL certificate provisioning and renewal
- Backend service routing to Cloud Endpoints and GKE

**Relations to Other Components:**
- **Receives traffic from:** Cloud CDN edge locations
- **Routes to:** Cloud Armor WAF for security filtering
- **SSL certificates:** Managed by Google (auto-renewal)
- **Backend:** GKE Ingress via Cloud Endpoints

**Configuration Details:**
- Protocol: HTTPS with HTTP→HTTPS redirect
- SSL Policy: MODERN (TLS 1.2+)
- Backend service: GKE Ingress via ESP/ESPv2
- Health checks: HTTP/HTTPS every 10 seconds
- Session affinity: Cookie-based (optional)

---

### 3. Cloud Armor Security Policy

**Service:** Google Cloud Armor  
**Quantity:** 1 security policy with 5 custom rules

**Purpose:**
- Protects against OWASP Top 10 vulnerabilities (SQLi, XSS, etc.)
- Provides adaptive DDoS protection at Layer 7
- Rate limiting prevents abuse and brute-force attacks
- Geo-blocking reduces attack surface

**Functionality:**
- Web Application Firewall (WAF) protection
- DDoS mitigation (application layer)
- Bot detection and mitigation
- Rate limiting per IP address
- Geographic access controls

**Relations to Other Components:**
- **Receives traffic from:** HTTPS Load Balancer
- **Routes to:** Cloud Endpoints after WAF filtering
- **Logs to:** Cloud Logging for security analysis
- **Alerts via:** Security Command Center on rule violations

**Configuration Details:**
- OWASP ModSecurity Core Rule Set 3.3
- Rate limiting: 100 requests/minute per IP
- Geo-blocking: Allow US/EU only, deny all others
- Adaptive protection: Enabled (ML-based DDoS detection)
- Priority rules: SQLi detection (100), XSS detection (200), Bot detection (300)

---

## Network Layer Components

### 4. Shared VPC

**Service:** Google Virtual Private Cloud  
**Quantity:** 1 regional VPC with 3 subnets

**Purpose:**
- Provides private network isolation for all resources
- Enables centralized network management across projects
- Private Google Access eliminates public IP exposure
- Foundation for zero-trust networking

**Functionality:**
- Private IP address space for GKE, Cloud SQL, Redis
- Subnet segmentation (pods, services, proxies)
- VPC Flow Logs for security monitoring
- Private connectivity to Google APIs

**Relations to Other Components:**
- **Hosts:** GKE cluster, Cloud SQL, Redis, Cloud Run
- **Deployment target for:** GKE, Cloud Run
- **Connects to:** Cloud NAT for egress
- **Protected by:** VPC Service Controls perimeter
- **Monitored via:** VPC Flow Logs → Cloud Logging
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

### 5. VPC Service Controls

**Service:** Google VPC Service Controls  
**Quantity:** 1 security perimeter

**Purpose:**
- Prevents data exfiltration from Google-managed services
- Creates security boundary around sensitive data
- Enforces context-aware access to Google APIs
- Protects against accidental or malicious data leaks

**Functionality:**
- Data exfiltration prevention for Cloud Storage, Cloud SQL, Redis
- Ingress/egress policy enforcement for Google APIs
- VPC-based context for API access (no internet exposure)
- Compliance boundary for regulated data

**Relations to Other Components:**
- **Protects:** Cloud Storage, Cloud SQL, Redis, Cloud Run
- **Controls access to:** Google APIs (sqladmin, storage, redis, secretmanager)
- **Allows ingress from:** Cloud Load Balancing, Cloud Build (CI/CD)
- **Logs violations to:** Security Command Center

**Configuration Details:**
- Perimeter name: production-perimeter
- Access level: Corporate network only (IP-based + device policy)
- Protected services:
  - storage.googleapis.com
  - sqladmin.googleapis.com
  - redis.googleapis.com
  - run.googleapis.com
  - secretmanager.googleapis.com
- Ingress rules: Allow from Google-managed load balancers
- Egress rules: Allow to specified Google APIs only

---

### 6. Cloud NAT

**Service:** Google Cloud NAT  
**Quantity:** 1 regional NAT gateway

**Purpose:**
- Provides static egress IP addresses for external API calls
- Enables internet access for private GKE nodes and Cloud Run
- Comprehensive logging for security monitoring and compliance

**Functionality:**
- Outbound internet connectivity for private resources
- Static IP assignment for allow-listing on third-party APIs
- Connection logging for audit trails
- Source NAT for GKE pods and Cloud Run instances

**Relations to Other Components:**
- **Provides egress for:** GKE cluster, Cloud Run
- **Receives traffic from:** Secure Web Proxy
- **Routes to:** Internet (external APIs)
- **Logs to:** Cloud Logging for analysis
- **Subnet:** ALL_SUBNETWORKS_ALL_IP_RANGES

**Configuration Details:**
- Region: us-central1
- NAT IP allocation: Automatic (Google-managed IPs)
- Source subnet: All subnets in VPC
- Logging: ALL connections (100% sample rate)
- Timeout: TCP established 1200s, transitory 30s
- Min ports per VM: 64, Max ports per VM: 65536

---

### 7. Secure Web Proxy

**Service:** Cloud Run (Squid proxy container) or Secure Web Proxy Preview  
**Quantity:** 1 regional proxy (auto-scaling 0-3 instances)

**Purpose:**
- Enforces FQDN-based allow-listing for internet egress
- VPC firewall rules only support IP ranges, not domain names
- Provides detailed request logging for audit trails
- Prevents data exfiltration to unauthorized endpoints

**Functionality:**
- FQDN allow-list enforcement
- HTTP/HTTPS proxy for outbound traffic
- Request/response logging and inspection
- Workload Identity-based authentication
- Deny-by-default egress policy

**Relations to Other Components:**
- **Receives requests from:** Cloud Run workers, GKE pods
- **Routes through:** Cloud NAT for static IP
- **Allows access to:** Approved external API endpoints
- **Logs to:** Cloud Logging
- **Alerts on:** Unauthorized domain access via SCC

**Configuration Details:**
- Deployment: Cloud Run container (Squid 5.x or similar)
- CPU: 1 vCPU, Memory: 512 MB
- Min instances: 0 (scale to zero)
- Max instances: 3 (auto-scaling)
- Default action: DENY (block all other domains)
- Authentication: Workload Identity required
- Logging: Full request/response headers

---

### 8. Anthos Service Mesh

**Service:** Google Anthos Service Mesh (Managed Istio)  
**Quantity:** 1 managed service mesh

**Purpose:**
- Provides automatic mTLS for all pod-to-pod communication
- Zero-trust networking within the cluster
- Service-to-service authorization policies (deny-by-default)
- Observability (telemetry, tracing) for microservices

**Functionality:**
- Mutual TLS (mTLS) for pod-to-pod traffic
- Traffic management (retries, timeouts, circuit breaking)
- Service discovery and load balancing
- Distributed tracing with Cloud Trace
- Authorization policies (RBAC at service level)

**Relations to Other Components:**
- **Manages traffic between:** All GKE pods
- **Certificate issuance:** Certificate Authority Service issues mTLS certs
- **Does NOT cover:** Managed services (Cloud SQL, Redis, Storage use TLS+IAM)
- **Telemetry to:** Cloud Monitoring
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

### 9. GKE Regional Cluster

**Service:** Google Kubernetes Engine (Autopilot)  
**Quantity:** 1 regional cluster (3 zones, 6-12 auto-scaled nodes)

**Purpose:**
- Runs containerized application workloads
- Regional deployment provides 99.95% SLA (zone failure tolerance)
- Autopilot mode: Google-managed infrastructure, security, scaling
- Confidential Computing protects data in use (encrypted memory)

**Functionality:**
- Application pods (API server, frontend, background workers)
- Autopilot workload management (auto-scaling, auto-repair)
- Workload Identity for secure GCP API access
- Private cluster (no public endpoints)
- Binary Authorization admission control

**Relations to Other Components:**
- **Deployed in:** Shared VPC
- **Receives traffic from:** Cloud Endpoints
- **Service mesh:** Anthos Service Mesh for pod-to-pod mTLS
- **Enforced by:** Policy Controller
- **Connects to:** Cloud SQL via Auth Proxy
- **Connects to:** Redis via private IP + TLS
- **Connects to:** Cloud Storage via Workload Identity
- **Invokes:** Cloud Run workers for processing
- **Gets secrets from:** Secret Manager
- **Image validation:** Binary Authorization
- **Egress via:** Secure Web Proxy + Cloud NAT
- **Monitored by:** Security Command Center, Cloud Monitoring
- **Logs to:** Cloud Logging

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

### 10. Policy Controller

**Service:** Anthos Config Management (Policy Controller)  
**Quantity:** 1 policy controller per cluster

**Purpose:**
- Enforces Pod Security Standards (PSS) "restricted" profile
- Prevents privileged containers and host access
- OPA-based policy enforcement (admission control)
- Security policy as code

**Functionality:**
- Admission webhook for policy enforcement
- Pod Security Standards validation
- Resource limit requirements
- Image vulnerability scanning enforcement

**Relations to Other Components:**
- **Enforces policies on:** GKE cluster workloads
- **Works with:** Binary Authorization for image policies
- **Logs violations to:** Cloud Logging
- **Alerts via:** Security Command Center

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

### 11. Cloud Run Workers

**Service:** Google Cloud Run  
**Quantity:** 0-10 instances (auto-scaling)

**Purpose:**
- Serverless execution for processing workloads
- Auto-scaling to zero (cost optimization when idle)
- Isolated execution environment for external API integrations
- Faster scaling than GKE for burst workloads

**Functionality:**
- External API integration
- Background job processing
- Async task execution triggered by GKE
- Serverless functions with VPC connectivity

**Relations to Other Components:**
- **Deployed in:** Shared VPC
- **Invoked by:** GKE pods via HTTPS + IAM authentication
- **Connects to:** Secure Web Proxy for external APIs
- **Gets secrets from:** Secret Manager
- **Image validation:** Binary Authorization
- **Protected by:** VPC-SC
- **Encryption:** CMEK via Cloud KMS
- **Monitored by:** Security Command Center, Cloud Monitoring
- **Logs to:** Cloud Logging

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

---

## Data Layer Components

### 12. Cloud SQL PostgreSQL HA

**Service:** Google Cloud SQL for PostgreSQL  
**Quantity:** 1 primary + 1 standby + 1 read replica

**Purpose:**
- Primary relational database
- High availability with automatic failover (99.95% SLA)
- Regional redundancy prevents data loss from zone failures
- Point-in-time recovery (PITR) for disaster recovery

**Functionality:**
- User accounts and authentication data
- Application metadata and configurations
- Audit logs and application state
- Relational data with ACID guarantees

**Relations to Other Components:**
- **Accessed via:** Cloud SQL Auth Proxy only (no direct access)
- **Clients:** GKE pods via sidecar proxy
- **Backups to:** Google-managed storage (encrypted with CMEK)
- **Encrypted by:** Cloud KMS for data at rest
- **Scanned by:** Cloud DLP API for PII/PHI detection
- **Protected by:** VPC-SC, Private IP only
- **Monitored by:** Cloud Monitoring
- **Logs to:** Cloud Logging

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

### 13. Cloud SQL Auth Proxy

**Service:** Cloud SQL Auth Proxy (sidecar container)  
**Quantity:** 1 sidecar per pod that needs database access

**Purpose:**
- Eliminates password-based authentication (uses IAM)
- Automatic TLS encryption (no manual certificate management)
- Prevents direct database access (security best practice)
- Connection pooling and multiplexing

**Functionality:**
- Secure connection tunnel to Cloud SQL
- IAM-based authentication via Workload Identity
- Automatic TLS encryption
- Connection lifecycle management

**Relations to Other Components:**
- **Runs in:** GKE pods as sidecar container
- **Connects to:** Cloud SQL PostgreSQL
- **Authentication via:** Workload Identity (no passwords)
- **Encryption:** Automatic TLS 1.3
- **Monitored:** Cloud Monitoring for connection metrics

**Configuration Details:**
- Deployment: Sidecar container in Kubernetes pods
- Authentication: IAM (Workload Identity)
- Encryption: Automatic TLS 1.3 (Google-managed certificates)
- Port: 5432 (localhost only, pod-scoped)
- Connection limit: 100 concurrent connections
- Timeout: 30 seconds connection timeout
- Image: gcr.io/cloud-sql-connectors/cloud-sql-proxy:latest
- Auto-reconnect: Enabled

---

### 14. Memorystore Redis HA

**Service:** Google Memorystore for Redis  
**Quantity:** 1 primary + 1 replica (regional HA)

**Purpose:**
- Session storage for stateless application scaling
- Cache layer for database query results (performance)
- Real-time data for dashboards and analytics
- High availability with automatic failover

**Functionality:**
- User session data (authentication state)
- Application cache
- Rate limiting counters (API throttling)
- Real-time analytics data
- Pub/sub messaging (optional)

**Relations to Other Components:**
- **Accessed by:** GKE pods via private IP
- **Connection:** TLS + Redis AUTH (password-based)
- **Encrypted by:** Cloud KMS for data at rest
- **Password stored in:** Secret Manager
- **Protected by:** VPC-SC, Shared VPC
- **Monitored by:** Cloud Monitoring

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

### 15. Cloud Storage

**Service:** Google Cloud Storage  
**Quantity:** 1 regional bucket

**Purpose:**
- Stores user-uploaded files and exports
- Static asset hosting
- Backup storage
- Versioning for data protection and recovery

**Functionality:**
- File uploads and exports
- Static assets
- Backup archives
- Lifecycle management for cost optimization

**Relations to Other Components:**
- **Accessed by:** GKE pods, Cloud Run via Workload Identity
- **Served via:** Cloud CDN for static content
- **Encrypted by:** Cloud KMS for objects at rest
- **Scanned by:** Cloud DLP API for PII/PHI detection
- **Protected by:** VPC-SC, IAM policies
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

---

## Security Layer Components

### 16. Cloud KMS

**Service:** Google Cloud Key Management Service  
**Quantity:** 1 key ring with 5 encryption keys

**Purpose:**
- Customer-managed encryption keys (CMEK) for all data
- Centralized key management and rotation
- Compliance requirement (HIPAA, GDPR, PCI DSS)
- Separation of duties (key management vs. data access)
- Audit trail for key usage

**Functionality:**
- Encryption keys for GKE persistent disks
- Encryption keys for Cloud SQL database
- Encryption keys for Redis cache
- Encryption keys for Cloud Storage buckets
- Encryption keys for Secret Manager secrets

**Relations to Other Components:**
- **Encrypts data for:** Cloud SQL, Redis, Cloud Storage
- **Encrypts secrets for:** Secret Manager
- **Encrypts disks for:** GKE
- **Key access:** IAM-based (Workload Identity for services)
- **Logging:** All key operations logged to Cloud Logging
- **Monitoring:** Key usage metrics in Cloud Monitoring
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

### 17. Secret Manager

**Service:** Google Secret Manager  
**Quantity:** 1 secret manager instance with 4 secrets

**Purpose:**
- Centralized secrets storage (no secrets in code or config files)
- CMEK encryption for secret values (compliance)
- Automatic secret rotation (90-day lifecycle)
- Version control for secret values (rollback capability)
- Workload Identity integration (no service account keys)

**Functionality:**
- API keys for external services
- Redis AUTH password
- OAuth client secrets
- JWT signing keys

**Relations to Other Components:**
- **Accessed by:** GKE pods, Cloud Run via Workload Identity
- **Encryption:** Cloud KMS for secret values
- **Rotation triggers:** Cloud Functions (future) or manual
- **Audit logging:** Cloud Logging tracks all access
- **Monitoring:** Cloud Monitoring for access metrics

**Configuration Details:**
- Replication: Automatic (multi-region for availability)
- Encryption: CMEK (customer-managed keys via Cloud KMS)
- Rotation:
  - Enabled: Yes
  - Period: 90 days
  - Method: Manual trigger or Cloud Functions
- Version control: Enabled (keep last 5 versions)
- Access control: IAM-based (Workload Identity, no service account keys)
- Audit: All secret access operations logged

---

### 18. Binary Authorization

**Service:** Google Binary Authorization  
**Quantity:** 1 policy enforced on GKE and Cloud Run

**Purpose:**
- Prevents deployment of unsigned or unverified container images
- Vulnerability scanning enforcement (no critical CVEs allowed)
- Supply chain security (trusted image sources only)
- Attestation-based deployment (cryptographic signatures)

**Functionality:**
- Admission control for GKE and Cloud Run
- Container image signature verification
- Vulnerability scanning policy enforcement
- Trusted registry allow-listing
- Build provenance validation

**Relations to Other Components:**
- **Validates images for:** GKE cluster, Cloud Run
- **Image validation requested by:** Cloud Run
- **Attestation authority:** Certificate Authority Service
- **Image registry:** Google Container Registry
- **Scanning:** Container Analysis API (built-in)
- **Alerts:** Security Command Center on violations

**Configuration Details:**
- Default admission rule: DENY_ALL (explicit allow required)
- Allowed registries: gcr.io/production-registry only
- Attestation authority: GCP Certificate Authority Service
- Vulnerability scanning policy:
  - Max critical CVEs: 0 (block deployment)
  - Max high CVEs: 0 (block deployment)
  - Max medium CVEs: 5 (warning only)
- Signature verification: Required (RSA 4096-bit)
- Exemptions: None (all images must be signed)
- Dry-run mode: Disabled (enforcement active)

---

### 19. Certificate Authority Service

**Service:** Google Certificate Authority Service  
**Quantity:** 1 private CA

**Purpose:**
- Private Certificate Authority for Anthos Service Mesh (mTLS)
- Issues certificates for pod-to-pod authentication
- Automatic certificate rotation (short-lived certificates)
- Eliminates self-signed certificate management

**Functionality:**
- mTLS certificates for service mesh
- Internal service-to-service authentication
- Certificate issuance and revocation
- Automatic certificate lifecycle management
- Attestation authority for Binary Authorization

**Relations to Other Components:**
- **Issues mTLS certificates to:** Anthos Service Mesh workloads
- **Signs images for:** Binary Authorization attestation
- **Certificate distribution:** Automatic via Istio control plane
- **Monitoring:** Cloud Monitoring for certificate metrics

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

### 20. Cloud Identity

**Service:** Google Cloud Identity Premium  
**Quantity:** 10 licensed users

**Purpose:**
- Centralized identity and access management
- Single Sign-On (SSO) for GCP Console and applications
- Multi-factor authentication (MFA) enforcement
- Password policies and session management

**Functionality:**
- User authentication for GCP Console
- SSO integration with corporate directory
- MFA enforcement (TOTP, security keys)
- Password policy enforcement
- Session timeout and device management

**Relations to Other Components:**
- **Provides SSO to:** Firebase Authentication
- **Authenticates:** GCP Console users and administrators
- **Integrated with:** Security Command Center for audit logs
- **Logs to:** Cloud Logging

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
- Users: 10 administrators
- Groups: 3 (Admin, Developer, Viewer)

---

### 21. Security Command Center Premium

**Service:** Google Security Command Center Premium  
**Quantity:** 1 organization-wide SCC instance

**Purpose:**
- Centralized security monitoring and threat detection
- Event Threat Detection for anomaly detection
- Container Threat Detection for runtime security
- Web Security Scanner for vulnerability scanning

**Functionality:**
- Real-time threat detection and alerting
- Security posture management
- Vulnerability scanning (web and container)
- Compliance monitoring (CIS benchmarks)
- Security analytics and reporting

**Relations to Other Components:**
- **Monitors:** GKE, Cloud Run, Cloud SQL, Storage, all GCP resources
- **Receives events from:** Cloud Logging, VPC-SC
- **Scans containers in:** GKE, Cloud Run
- **Notifications to:** PubSub + Email (alerts on findings)
- **Integrated with:** Cloud Armor, Binary Authorization

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
- Notifications: PubSub topic + Email
- Retention: 365 days (1 year of findings)
- Export: BigQuery (long-term analytics)

---

### 22. Cloud DLP API

**Service:** Google Cloud Data Loss Prevention API  
**Quantity:** 1 DLP configuration with 3 templates

**Purpose:**
- Automatic PII/PHI detection in data at rest
- Data classification for compliance (GDPR, HIPAA, CCPA)
- De-identification of sensitive data (masking, redaction)
- Prevents accidental exposure of sensitive information

**Functionality:**
- PII detection (SSN, credit cards, emails, phone numbers)
- PHI detection (medical records, patient data)
- Data classification (confidential, sensitive, public)
- Automatic redaction and masking
- Compliance reporting

**Relations to Other Components:**
- **Scans data in:** Cloud SQL, Cloud Storage
- **Findings to:** Security Command Center
- **Logs to:** Cloud Logging
- **Scheduled scans:** Daily at 02:00 UTC (Cloud Scheduler)

**Configuration Details:**
- Inspect templates:
  1. PII_DETECTION (SSN, credit card, email, phone, address)
  2. PHI_DETECTION (medical records, prescriptions, diagnoses)
  3. CREDIT_CARD_DETECTION (PAN, CVV, expiration dates)
- De-identify methods:
  - MASKING (replace with asterisks: 123-45-****)
  - REDACTION (remove entirely)
  - TOKENIZATION (replace with reversible token)
- Scan schedule: Daily (full scan at 02:00 UTC)
- Likelihood threshold: POSSIBLE (minimize false negatives)
- Max findings per item: 100
- Sample method: ALL (scan all data, not sample)

---

## API & Application Layer Components

### 23. Cloud Endpoints

**Service:** Google Cloud Endpoints (ESP/ESPv2)  
**Quantity:** 1 API gateway (ESPv2 sidecar in GKE)

**Purpose:**
- API management and gateway
- Authentication via JWT validation
- Rate limiting and quota management
- API analytics and monitoring
- OpenAPI 3.0 specification enforcement

**Functionality:**
- API gateway
- Request authentication and authorization
- Rate limiting (100 req/min per user)
- API versioning and routing
- Request/response logging

**Relations to Other Components:**
- **Receives traffic from:** Cloud Armor WAF
- **Routes to:** GKE application pods
- **Validates JWT from:** Firebase Authentication
- **Logs to:** Cloud Logging
- **Metrics to:** Cloud Monitoring

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

### 24. Firebase Authentication

**Service:** Google Firebase Authentication  
**Quantity:** 1 Firebase project (up to 10 users)

**Purpose:**
- User authentication
- OAuth 2.0 / OpenID Connect integration
- Session management with secure JWTs
- MFA support (optional for users)
- Token lifecycle controls (revocation on password change)

**Functionality:**
- User sign-up and sign-in (email/password, Google, SSO)
- JWT token issuance and validation
- Session management and refresh tokens
- Password reset and email verification
- MFA (TOTP, SMS) for enhanced security

**Relations to Other Components:**
- **Issues JWT tokens to:** Cloud Endpoints
- **SSO integration from:** Cloud Identity
- **Logs to:** Cloud Logging
- **User data stored in:** Cloud SQL

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
- Password policy: 14+ chars

---

## Observability Layer Components

### 25. Cloud Logging

**Service:** Google Cloud Logging  
**Quantity:** 1 logging instance with 2 export sinks

**Purpose:**
- Centralized logging for all GCP resources
- Immutable audit trail (WORM storage)
- Compliance requirement (7-year retention)
- Dual sink redundancy (analytics + archive)
- Security incident investigation

**Functionality:**
- Admin activity logs (IAM changes, resource creation)
- Data access logs (who accessed what data)
- System logs (VM, GKE, Cloud Run)
- Application logs
- Security logs (authentication, authorization)

**Relations to Other Components:**
- **Receives logs from:** GKE, Cloud Run, Cloud SQL, all GCP resources
- **Exports to:**
  1. BigQuery (bq-logs dataset) for analytics
  2. Cloud Storage Archive bucket for immutable storage
- **Queried by:** Cloud Monitoring for alerting
- **Analyzed in:** Security Command Center

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

### 26. Cloud Monitoring

**Service:** Google Cloud Monitoring  
**Quantity:** 1 monitoring workspace with 3 dashboards and 5 alert policies

**Purpose:**
- Real-time application and infrastructure monitoring
- SLO tracking (99.95% uptime target)
- Alerting for performance and security issues
- Capacity planning and cost optimization

**Functionality:**
- Infrastructure metrics (CPU, memory, disk, network)
- Application metrics (request rate, latency, errors)
- Custom metrics (business KPIs)
- SLO/SLI monitoring and reporting
- Alert notifications (email, PagerDuty)

**Relations to Other Components:**
- **Monitors:** GKE, Cloud Run, Cloud SQL, Redis, all GCP resources
- **Receives metrics from:** Anthos Service Mesh, Cloud Run
- **Queries logs from:** Cloud Logging
- **Sends alerts to:** PubSub, Email, PagerDuty
- **Integrated with:** Security Command Center

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

## Infrastructure Relationships Summary

### Traffic Flow (Client Request Path)

1. **User** → **Cloud CDN** → **HTTPS Load Balancer**
2. **HTTPS Load Balancer** → **Cloud Armor WAF** (inline filtering)
3. **Cloud Armor** → **Cloud Endpoints** (API gateway)
4. **Cloud Endpoints** → **Firebase Auth** (JWT validation)
5. **Cloud Endpoints** → **GKE** (application pods)
6. **GKE pods** → **Anthos Service Mesh** (pod-to-pod mTLS)

### Data Access Path

1. **GKE pods** → **Cloud SQL Auth Proxy** → **Cloud SQL**
2. **GKE pods** → **Redis** (TLS + AUTH)
3. **GKE pods** → **Cloud Storage** (Workload Identity)
4. **GKE pods** → **Secret Manager** (Workload Identity)

### External API Access Path

1. **GKE/Cloud Run** → **Secure Web Proxy** (FQDN allow-list)
2. **Secure Web Proxy** → **Cloud NAT** (static IP)
3. **Cloud NAT** → **Internet** (external APIs)

### Security Enforcement Layers

1. **Network:** VPC-SC, Cloud Armor, Shared VPC
2. **Compute:** Binary Authorization, Policy Controller, Shielded/Confidential GKE
3. **Data:** CMEK, VPC-SC, Private IPs, TLS everywhere
4. **Access:** Workload Identity, Cloud Identity, Firebase Auth
5. **Detection:** SCC Premium, Cloud Logging, Cloud DLP

### Encryption Layers

1. **In-transit:** TLS 1.2+ (all connections), mTLS (pod-to-pod via ASM)
2. **At-rest:** CMEK via Cloud KMS for all data stores
3. **In-use:** Confidential GKE (AMD SEV memory encryption)

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

## Maintenance Schedule

### Daily
- Automated backups (Cloud SQL, Redis)
- DLP scanning (Cloud Storage, Cloud SQL)
- Log exports (BigQuery, Archive)

### Weekly
- Vulnerability scanning (Container Analysis)
- Security findings review (SCC Premium)

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
