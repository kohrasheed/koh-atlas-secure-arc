# Architecture Implementation Cost Breakdown

**Date:** December 12, 2025  
**Architecture:** Koh Atlas Security Architecture Designer  
**Scale:** 10 enterprise clients @ $199/month

---

## Architecture Overview

```
Client (Browser/PWA)
    ↓ HTTPS 443
Cloudflare CDN + WAF (Edge)
    ↓ HTTPS 443
App Load Balancer (Public Subnet)
    ↓ HTTP/HTTPS
API Gateway (App Tier) ←→ Vault (Secrets)
    ↓
App Server (Services) ←→ Background Workers
    ↓                      ↓
PostgreSQL ←→ Redis (Cache + Queue) ←→ Object Storage (S3)
    ↓           ↓           ↓
Monitoring & Logging (Observability)
```

---

## Component Mapping to GCP Services

| Architecture Component | GCP Service | Specification | Purpose |
|------------------------|-------------|---------------|---------|
| **Client** | Browser/PWA | N/A | User interface |
| **Cloudflare CDN + WAF** | Cloud CDN + Cloud Armor | Premium tier | Edge security & CDN |
| **App Load Balancer** | Cloud Load Balancing | HTTPS LB | Traffic distribution |
| **API Gateway** | GKE Ingress + Nginx | Nginx Ingress Controller | API routing |
| **App Server (Services)** | GKE (3 pods) | n2-standard-1 nodes | Application logic |
| **PostgreSQL** | Cloud SQL PostgreSQL | db-custom-2-7680 | Primary database |
| **Redis (Cache + Queue)** | Memorystore Redis | Basic 2GB | Cache + message queue |
| **Object Storage (S3)** | Cloud Storage | Standard tier | File storage |
| **Vault (Secrets Mgmt)** | Secret Manager + Vault | Hybrid approach | Secrets management |
| **Background Workers** | GKE (2 pods) | Same nodes as app | Async job processing |
| **Monitoring & Logging** | Cloud Monitoring + Logging | Standard tier | Observability |

---

## DETAILED COST BREAKDOWN

### 1. CLIENT TIER (No Cost)

| Component | Implementation | Monthly Cost | Annual Cost |
|-----------|----------------|--------------|-------------|
| **Browser/PWA** | React 19 + Vite | $0 | $0 |
| **Static Assets Hosting** | Cloud Storage + CDN | Included below | $0 |

---

### 2. EDGE TIER (Cloud CDN + Cloud Armor)

| Component | Specification | Monthly Cost | Annual Cost |
|-----------|---------------|--------------|-------------|
| **Cloud CDN** | Premium tier CDN | $50 | $600 |
| **CDN Cache Fill** | Origin → CDN data transfer | Included | $0 |
| **CDN Bandwidth** | ~500GB/month | Included | $0 |
| **Cloud Armor** | WAF + DDoS protection | $8 | $96 |
| **Security Policies** | 10 rules | Included | $0 |
| **Rate Limiting Rules** | Request throttling | Included | $0 |
| **SSL Certificate** | Google-managed SSL | $0 | $0 |
| **Custom Rules** | Advanced WAF rules | Included | $0 |
| ****EDGE TIER TOTAL**** | | **$58/month** | **$696/year** |

**Note:** This is fully native GCP solution (no third-party CDN)

---

### 3. PUBLIC SUBNET (Load Balancer)

| Component | Specification | Qty | Monthly Cost | Annual Cost |
|-----------|---------------|-----|--------------|-------------|
| **Cloud Load Balancing** | HTTPS Load Balancer | 1 | $18 | $216 |
| **Forwarding Rules** | 1 rule | 1 | $0 | $0 |
| **Backend Service** | GKE backend | 1 | $0 | $0 |
| **Health Checks** | HTTP health check | 1 | $0 | $0 |
| **SSL Certificate** | Google-managed SSL | 1 | $0 | $0 |
| **Static IP Address** | Regional IP | 1 | $3 | $36 |
| ****LOAD BALANCER TOTAL**** | | | **$21/month** | **$252/year** |

---

### 4. APP TIER (API Gateway + App Server + Workers)

#### 4A. GKE Cluster (Hosts API Gateway, App Server, Workers)

| Component | Specification | Qty | Monthly Cost | Annual Cost |
|-----------|---------------|-----|--------------|-------------|
| **GKE Cluster Fee** | Zonal cluster | 1 | $73 | $876 |
| **Worker Node 1** | n2-standard-1 (1 vCPU, 4GB) | 1 | $24 | $288 |
| **Worker Node 2** | n2-standard-1 (1 vCPU, 4GB) | 1 | $24 | $288 |
| **Worker Node 3** | n2-standard-1 (1 vCPU, 4GB) | 1 | $24 | $288 |
| **Persistent Disks** | 20GB SSD per node | 3 | $10 | $120 |
| ****GKE SUBTOTAL**** | | | **$155/month** | **$1,860/year** |

#### 4B. API Gateway (Nginx Ingress Controller)

| Component | Specification | Qty | Monthly Cost | Annual Cost |
|-----------|---------------|-----|--------------|-------------|
| **Nginx Ingress Controller** | Kubernetes deployment | 1 pod | $0 (runs on GKE) | $0 |
| **Ingress Resources** | K8s ingress rules | 5 rules | $0 | $0 |
| **Rate Limiting** | Nginx rate limit | Built-in | $0 | $0 |
| **Request Routing** | Path-based routing | Built-in | $0 | $0 |
| ****API GATEWAY SUBTOTAL**** | | | **$0** | **$0** |

**Alternative (Cloud Endpoints):** $30/month - NOT recommended for this scale

#### 4C. App Server (Services)

| Component | Specification | Qty | Monthly Cost | Annual Cost |
|-----------|---------------|-----|--------------|-------------|
| **App Pods** | Node.js 22 containers | 3 replicas | $0 (on GKE) | $0 |
| **CPU Request** | 250m per pod | 750m total | Included | $0 |
| **Memory Request** | 512Mi per pod | 1.5Gi total | Included | $0 |
| **HPA (Auto-scaler)** | Scale 3-10 pods | 1 | $0 | $0 |
| ****APP SERVER SUBTOTAL**** | | | **$0** | **$0** |

#### 4D. Background Workers

| Component | Specification | Qty | Monthly Cost | Annual Cost |
|-----------|---------------|-----|--------------|-------------|
| **Worker Pods** | Node.js 22 containers | 2 replicas | $0 (on GKE) | $0 |
| **CPU Request** | 250m per pod | 500m total | Included | $0 |
| **Memory Request** | 512Mi per pod | 1Gi total | Included | $0 |
| **Job Queue** | Redis-based queue | 1 | Included in Redis | $0 |
| ****WORKERS SUBTOTAL**** | | | **$0** | **$0** |

**APP TIER TOTAL:** $155/month (GKE cluster only, apps run on it for free)

---

### 5. DATA TIER (PostgreSQL + Redis)

#### 5A. PostgreSQL Database

| Component | Specification | Qty | Monthly Cost | Annual Cost |
|-----------|---------------|-----|--------------|-------------|
| **Cloud SQL Instance** | db-custom-2-7680 (2 vCPU, 7.5GB) | 1 | $68 | $816 |
| **SSD Storage** | 100GB SSD | 1 | $17 | $204 |
| **Automated Backups** | 7-day retention | 1 | $8 | $96 |
| **Network Egress** | ~10GB/month | 1 | $1 | $12 |
| ****POSTGRESQL TOTAL**** | | | **$94/month** | **$1,128/year** |

#### 5B. Redis (Cache + Queue)

| Component | Specification | Qty | Monthly Cost | Annual Cost |
|-----------|---------------|-----|--------------|-------------|
| **Memorystore Redis** | Basic tier, 2GB | 1 | $79 | $948 |
| **Cache Storage** | 2GB memory | 1 | Included | $0 |
| **Queue Operations** | Unlimited ops | 1 | Included | $0 |
| ****REDIS TOTAL**** | | | **$79/month** | **$948/year** |

**DATA TIER TOTAL:** $173/month | $2,076/year

---

### 6. STORAGE TIER (Object Storage)

| Component | Specification | Usage | Monthly Cost | Annual Cost |
|-----------|---------------|-------|--------------|-------------|
| **Standard Storage** | Hot data | 50GB | $1.00 | $12 |
| **Nearline Storage** | Infrequent access | 20GB | $0.20 | $2.40 |
| **Storage Operations** | API calls | 100K/mo | $0.50 | $6 |
| **Network Egress** | Data transfer | 10GB/mo | $1.20 | $14.40 |
| ****STORAGE TOTAL**** | | | **$2.90/month** | **$35/year** |

---

### 7. SECURITY TIER (Vault + Secrets Management)

| Component | Specification | Qty | Monthly Cost | Annual Cost |
|-----------|---------------|-----|--------------|-------------|
| **Secret Manager (GCP)** | 10 secrets | 1 | $0.60 | $7.20 |
| **HashiCorp Vault** | Self-hosted on GKE | 1 pod | $0 (on GKE) | $0 |
| **Vault Storage** | Secret storage | Included | $0 | $0 |
| **Workload Identity** | K8s service accounts | 5 | $0 | $0 |
| **IAM Policies** | Access control | 10 policies | $0 | $0 |
| ****SECURITY TOTAL**** | | | **$0.60/month** | **$7/year** |

**Alternative (Vault Enterprise):** $1,500/month - NOT needed for this scale

---

### 8. OBSERVABILITY TIER (Monitoring + Logging)

| Component | Specification | Usage | Monthly Cost | Annual Cost |
|-----------|---------------|-------|--------------|-------------|
| **Cloud Monitoring** | Metrics ingestion | 20GB/mo | $5 | $60 |
| **Cloud Logging** | Log ingestion | 10GB/mo | $0 (free tier) | $0 |
| **Cloud Trace** | Distributed tracing | 2M spans/mo | $0 (free tier) | $0 |
| **Error Reporting** | Error aggregation | Built-in | $0 | $0 |
| **Uptime Checks** | Synthetic monitoring | 3 checks | $0 (free tier) | $0 |
| **Custom Dashboards** | Grafana/GCP dashboards | 5 dashboards | $0 | $0 |
| **Alerting Policies** | Alert rules | 10 policies | $0 | $0 |
| ****MONITORING TOTAL**** | | | **$5/month** | **$60/year** |

---

### 9. NETWORKING & VPC

| Component | Specification | Qty | Monthly Cost | Annual Cost |
|-----------|---------------|-----|--------------|-------------|
| **VPC Network** | Custom mode VPC | 1 | $0 | $0 |
| **Subnets** | Public + Private | 2 | $0 | $0 |
| **Cloud NAT** | NAT gateway | 1 | $32 | $384 |
| **NAT Data Processing** | 50GB/mo | 1 | $2.25 | $27 |
| **Cloud Router** | BGP routing | 1 | $0 | $0 |
| **Firewall Rules** | Security rules | 10 | $0 | $0 |
| **Network Egress** | 50GB/mo to internet | 1 | $6 | $72 |
| ****NETWORKING TOTAL**** | | | **$40/month** | **$483/year** |

---

### 10. CI/CD & ARTIFACTS

| Component | Specification | Usage | Monthly Cost | Annual Cost |
|-----------|---------------|-------|--------------|-------------|
| **Cloud Build** | Build minutes | 120 min/day (free) | $0 | $0 |
| **Artifact Registry** | Container images | 10GB | $1 | $12 |
| **Container Scanning** | Vulnerability scans | Automatic | $0 | $0 |
| **GitHub Actions** | CI/CD pipeline | 2,000 min/mo (free) | $0 | $0 |
| ****CI/CD TOTAL**** | | | **$1/month** | **$12/year** |

---

### 11. DNS

| Component | Specification | Usage | Monthly Cost | Annual Cost |
|-----------|---------------|-------|--------------|-------------|
| **Domain Name** | .com registration | 1 domain | $1 | $12 |
| **Cloud DNS** | Managed zone | 1 zone | $0.20 | $2.40 |
| **DNS Queries** | 1M queries/mo | 1M | $0.40 | $4.80 |
| ****DNS TOTAL**** | | | **$1.60/month** | **$19/year** |

---

## INFRASTRUCTURE COST SUMMARY (Monthly)

| Tier | Components | Monthly Cost | % of Total |
|------|------------|--------------|-----------|
| **Edge (GCP)** | Cloud CDN + Cloud Armor | $58 | 13% |
| **Public Subnet** | Load Balancer | $21 | 5% |
| **App Tier** | GKE (API Gateway + App + Workers) | $155 | 34% |
| **Data Tier** | PostgreSQL + Redis | $173 | 38% |
| **Storage Tier** | Cloud Storage | $3 | 1% |
| **Security Tier** | Vault + Secret Manager | $1 | 0.2% |
| **Observability** | Monitoring + Logging | $5 | 1% |
| **Networking** | VPC + NAT + Egress | $40 | 9% |
| **CI/CD** | Artifact Registry | $1 | 0.2% |
| **DNS** | Domain + DNS | $2 | 0.4% |
| ****INFRASTRUCTURE TOTAL**** | | **$459/month** | **100%** |

**Annual Infrastructure Cost:** $5,508

---

## THIRD-PARTY SERVICES

| Service | Specification | Monthly Cost | Annual Cost | Purpose |
|---------|---------------|--------------|-------------|---------|
| **Anthropic Claude API** | 2,000 analyses/mo | $17 | $204 | AI security analysis |
| **Stripe** | Payment processing | $61 | $732 | Subscriptions (2.9% + $0.30) |
| **SendGrid** | Email service | $0 | $0 | Free tier (100/day) |
| **Sentry** | Error tracking | $0 | $0 | Free tier (5K errors) |
| ****THIRD-PARTY TOTAL**** | | **$78/month** | **$936/year** |

**Note:** All infrastructure is now 100% GCP (no Cloudflare)

---

## IMPLEMENTATION COST (One-Time)

### DIY + Claude Approach

| Phase | Tasks | Hours | Claude Cost | Tools Cost | Total |
|-------|-------|-------|-------------|------------|-------|
| **Infrastructure Setup** | Terraform, GCP setup | 16h | $5 | $20 (GCP testing) | $25 |
| **Cloud CDN + Armor Setup** | CDN config, WAF rules | 4h | $3 | $58 (CDN/Armor 1mo testing) | $61 |
| **GKE Configuration** | K8s manifests, ingress | 12h | $8 | $0 | $8 |
| **API Gateway (Nginx)** | Ingress controller setup | 4h | $3 | $0 | $3 |
| **App Server Deploy** | Container build, deploy | 8h | $5 | $0 | $5 |
| **Background Workers** | Worker setup, queue config | 6h | $4 | $0 | $4 |
| **PostgreSQL Setup** | Schema, migrations | 6h | $4 | $1.50 (testing) | $5.50 |
| **Redis Setup** | Cache + queue config | 4h | $3 | $2.70 (testing) | $5.70 |
| **Vault Setup** | Self-hosted Vault | 6h | $4 | $0 | $4 |
| **Object Storage** | Bucket setup, policies | 2h | $2 | $0.20 | $2.20 |
| **Monitoring Setup** | Dashboards, alerts | 6h | $5 | $0.26 | $5.26 |
| **CI/CD Pipeline** | Cloud Build config | 6h | $6 | $0 | $6 |
| **Testing & QA** | Load tests, security scan | 12h | $8 | $49 (k6 Cloud) | $57 |
| **Documentation** | Runbooks, guides | 4h | $5 | $0 | $5 |
| **Domain & DNS** | Setup, testing | 2h | $1 | $13.24 | $14.24 |
| **Buffer/Contingency** | Unexpected issues | - | $10 | $15 | $25 |
| ****IMPLEMENTATION TOTAL**** | **98 hours** | **$76** | **$160** | **$236** |

**Rounded Implementation Cost:** **$240**

---

## YEAR 1 TOTAL COST

| Category | Amount | Notes |
|----------|--------|-------|
| **Implementation (one-time)** | $240 | DIY + Claude setup (100% GCP) |
| **GCP Infrastructure** | $5,508 | Annual GCP costs |
| **Third-Party Services** | $936 | Anthropic, Stripe |
| **Contingency** | $668 | 10% buffer |
| ****TOTAL YEAR 1**** | **$7,352** | |

---

## YEAR 1 FINANCIAL PROJECTION (10 Clients)

| Metric | Amount |
|--------|--------|
| **Revenue** (10 clients × $199/mo × 12) | $23,880 |
| **Infrastructure Costs** | $5,508 |
| **Third-Party Services** | $936 |
| **Implementation** | $240 |
| **Stripe Fees** (2.9% + $0.30) | $732 |
| **Contingency** | $668 |
| ****TOTAL COSTS**** | **$8,084** |
| ****NET PROFIT**** | **+$15,796** |
| ****PROFIT MARGIN**** | **66%** |
| ****ROI**** | **195%** |

---

## ARCHITECTURE-SPECIFIC FEATURES & COSTS

### What This Architecture Includes:

✅ **Cloud CDN + Cloud Armor** (+$58/mo)
- Global CDN with Premium tier routing
- Advanced WAF and DDoS protection
- 100% GCP-native (no third-party dependencies)
- Integrated with Cloud Load Balancing

✅ **API Gateway (Nginx Ingress)** ($0 - runs on GKE)
- Rate limiting per endpoint
- Request routing
- JWT validation
- Better than Cloud Endpoints ($30/mo)

✅ **Background Workers** ($0 - runs on GKE)
- Asynchronous job processing
- Redis-based queue
- Separate from API servers
- Auto-scaling

✅ **Vault for Secrets** (+$0.60/mo)
- Hybrid: Vault (self-hosted) + Secret Manager
- Dynamic secrets
- Encryption as a service
- Better security than Secret Manager alone

✅ **Dedicated Monitoring** ($5/mo)
- Full observability stack
- Custom dashboards
- Distributed tracing
- Error tracking

---

## COST COMPARISON WITH ALTERNATIVES

| Approach | Infrastructure | Implementation | Year 1 Total | Notes |
|----------|----------------|----------------|--------------|-------|
| **This Architecture (DIY + Claude)** | $459/mo | $240 | **$7,352** | 100% GCP native |
| **With Cloudflare CDN** | $421/mo | $200 | $7,170 | Third-party CDN (cheaper) |
| **With Cloud Endpoints** | $489/mo | $290 | $8,158 | Managed API Gateway |
| **With Vault Enterprise** | $1,959/mo | $240 | $23,748 | Overkill for this scale |
| **Standard Vendor** | $1,650/mo | $100,000 | $296,480 | Professional implementation |

**Savings vs Standard Vendor:** $289,128 (97.5% cheaper!)

---

## SCALING COSTS (Future Growth)

### At 25 Clients ($4,975/month revenue)

| Item | Cost |
|------|------|
| Infrastructure (scale nodes 3→5) | $565/mo |
| Third-Party Services | $98/mo |
| **Total Monthly** | **$663/mo** |
| **Annual** | $7,956 |
| **Revenue** | $59,700 |
| **Profit** | +$51,744 (87% margin) |

### At 50 Clients ($9,950/month revenue)

| Item | Cost |
|------|------|
| Infrastructure (scale nodes 5→8, DB upgrade) | $845/mo |
| Third-Party Services | $148/mo |
| **Total Monthly** | **$993/mo** |
| **Annual** | $11,916 |
| **Revenue** | $119,400 |
| **Profit** | +$107,484 (90% margin) |

---

## ARCHITECTURE OPTIMIZATION NOTES

### Included (Cost-Effective Choices):

✅ **100% GCP Native** - No third-party dependencies  
✅ **Cloud CDN + Armor** - Integrated edge security  
✅ **Nginx Ingress over Cloud Endpoints** - Saves $30/mo  
✅ **Self-hosted Vault** - Saves $1,500/mo vs Vault Enterprise  
✅ **GKE for workers** - No extra cost vs Cloud Functions ($15/mo)  
✅ **Memorystore Basic** - Saves $118/mo vs Standard HA  

### Not Included (To Save Money):

❌ Database HA replica - Save $94/mo (acceptable 99.5% uptime)  
❌ GKE regional cluster - Save $147/mo (zonal is fine)  
❌ Separate NAT per zone - Save $64/mo (single NAT sufficient)  
❌ Cloud Profiler - Save $50/mo (not needed yet)  

**Total Monthly Savings:** $473/month ($5,676/year)

---

## COMPONENT-BY-COMPONENT COST

| Node ID | Component | GCP Service | Monthly Cost |
|---------|-----------|-------------|--------------|
| **n1** | Client (Browser/PWA) | Static hosting | $0 |
| **n2** | Cloudflare CDN + WAF | **Cloud CDN + Cloud Armor** | **$58** |
| **n3** | App Load Balancer | Cloud Load Balancing | $21 |
| **n4** | API Gateway | Nginx on GKE | $0 (included) |
| **n5** | App Server (Services) | GKE pods | $155 (cluster) |
| **n6** | PostgreSQL | Cloud SQL | $94 |
| **n7** | Redis (Cache + Queue) | Memorystore | $79 |
| **n8** | Object Storage (S3) | Cloud Storage | $3 |
| **n9** | Vault (Secrets Mgmt) | Self-hosted Vault + Secret Manager | $1 |
| **n10** | Background Workers | GKE pods | $0 (same cluster) |
| **n11** | Monitoring & Logging | Cloud Monitoring + Logging | $5 |
| | **Networking (VPC, NAT, DNS)** | Various | $44 |
| | ****TOTAL INFRASTRUCTURE**** | | **$459/month** |

---

## BREAK-EVEN ANALYSIS

| Clients | Monthly Revenue | Monthly Costs | Monthly Profit |
|---------|-----------------|---------------|----------------|
| **1** | $199 | $537 | -$338 |
| **2** | $398 | $543 | -$145 |
| **3** | $597 | $549 | **+$48** ✅ |
| **5** | $995 | $561 | **+$434** |
| **10** | $1,990 | $592 | **+$1,398** |
| **25** | $4,975 | $701 | **+$4,274** |
| **50** | $9,950 | $1,031 | **+$8,919** |

**Break-even:** 3 clients (month 4)

---

## SUMMARY

### Total Cost to Build This Architecture:

| Item | Cost |
|------|------|
| **Implementation** | $240 |
| **Year 1 Operations** | $7,112 |
| ****TOTAL YEAR 1**** | **$7,352** |

### With 10 Clients:
- Revenue: $23,880
- **Net Profit: +$15,796** (66% margin, 195% ROI)
- **Break-even: 3 clients** (profitable from month 4)

### vs Professional Implementation:
- Standard Vendor: $296,480 Year 1
- **Your Cost: $7,352**
- **Savings: $289,128** (97.5% cheaper!)

### 100% GCP Native Benefits:
✅ No third-party CDN dependencies  
✅ Unified billing and management  
✅ Integrated monitoring across all services  
✅ Better security with Cloud Armor WAF  
✅ Premium tier global routing  

**Cost Difference vs Cloudflare:**
- With Cloudflare: $7,170 Year 1 (saves $182/year)
- **This GCP-only: $7,352 Year 1** (100% native, +$182/year premium)

---

**Recommendation:** This architecture is 100% GCP native, perfectly sized for 10 clients, and highly profitable with DIY + Claude approach!

---

**Document Version:** 2.0 (GCP Native)  
**Last Updated:** December 12, 2025  
**Architecture Source:** Koh Atlas Security Designer JSON Export  
**CDN Provider:** 100% Google Cloud Platform (Cloud CDN + Cloud Armor)
