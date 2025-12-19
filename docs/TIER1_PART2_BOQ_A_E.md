# TIER 1 ENTERPRISE TECHNICAL DOCUMENTATION
## Part 2: Detailed Bill of Quantities

**Project:** Koh Atlas Security Architecture - Tier 1 Minimal Enterprise  
**Date:** December 14, 2025  
**Version:** 1.0  
**Document:** Part 2 of 5

---

## SECTION A: IDENTITY & ACCESS MANAGEMENT (IAM)

### A.1 Cloud Identity Premium

| Item ID | Description | Unit | Qty | Unit Price | Monthly | Annual | Implementation |
|---------|-------------|------|-----|------------|---------|--------|----------------|
| **A.1.1** | Cloud Identity Premium Licenses | user | 12 | $6.00 | $72.00 | $864.00 | Week 1 |
| **A.1.2** | SSO Configuration | config | 1 | $0 | $0 | $0 | Week 1 |
| **A.1.3** | SAML Integration (Okta/Azure AD) | integration | 1 | $0 | $0 | $0 | Week 1 |
| **A.1.4** | MFA Enforcement Policies | policy | 5 | $0 | $0 | $0 | Week 1 |
| **A.1.5** | Password Policy Configuration | policy | 1 | $0 | $0 | $0 | Week 1 |
| **A.1.6** | User Provisioning Automation | automation | 1 | $0 | $0 | $0 | Week 2 |
| **A.1.7** | Group Management Setup | groups | 8 | $0 | $0 | $0 | Week 1 |
| **A.1.8** | Session Management Config | config | 1 | $0 | $0 | $0 | Week 2 |
| ****SECTION A.1 TOTAL**** | | | | | **$72.00** | **$864.00** | |

**Claude Tasks for A.1:**
- Generate Terraform for Cloud Identity setup (2 hours)
- Create SSO configuration scripts (3 hours)
- Build MFA enforcement policies (2 hours)
- Develop user provisioning automation (4 hours)
- **Total Claude Time:** 11 hours (~$35 value)

---

### A.2 Identity-Aware Proxy (IAP)

| Item ID | Description | Unit | Qty | Unit Price | Monthly | Annual | Implementation |
|---------|-------------|------|-----|------------|---------|--------|----------------|
| **A.2.1** | IAP Enablement (GCP Service) | service | 1 | $0 | $0 | $0 | Week 2 |
| **A.2.2** | IAP OAuth Configuration | config | 1 | $0 | $0 | $0 | Week 2 |
| **A.2.3** | IAP Access Policies | policy | 10 | $0 | $0 | $0 | Week 2 |
| **A.2.4** | IAP for GKE Ingress | integration | 1 | $0 | $0 | $0 | Week 2 |
| **A.2.5** | Context-Aware Access Rules | rules | 5 | $0 | $0 | $0 | Week 2 |
| **A.2.6** | Device Policies (Corporate/BYOD) | policy | 2 | $0 | $0 | $0 | Week 2 |
| ****SECTION A.2 TOTAL**** | | | | | **$0** | **$0** | |

**Claude Tasks for A.2:**
- Generate IAP Terraform configuration (3 hours)
- Create access policy templates (2 hours)
- Build context-aware rules (2 hours)
- **Total Claude Time:** 7 hours (~$20 value)

---

### A.3 OAuth 2.0 / OIDC Gateway

| Item ID | Description | Unit | Qty | Unit Price | Monthly | Annual | Implementation |
|---------|-------------|------|-----|------------|---------|--------|----------------|
| **A.3.1** | oauth2-proxy Deployment | deployment | 1 | $0 | $0 | $0 | Week 3 |
| **A.3.2** | OAuth 2.0 Provider Setup | provider | 1 | $0 | $0 | $0 | Week 3 |
| **A.3.3** | OIDC Discovery Configuration | config | 1 | $0 | $0 | $0 | Week 3 |
| **A.3.4** | JWT Validation Middleware | middleware | 1 | $0 | $0 | $0 | Week 3 |
| **A.3.5** | API Key Management System | system | 1 | $0 | $0 | $0 | Week 3 |
| **A.3.6** | Token Refresh Logic | logic | 1 | $0 | $0 | $0 | Week 3 |
| **A.3.7** | OAuth Scopes Definition | scopes | 15 | $0 | $0 | $0 | Week 3 |
| ****SECTION A.3 TOTAL**** | | | | | **$0** | **$0** | |

**Claude Tasks for A.3:**
- Generate oauth2-proxy Helm chart (4 hours)
- Build OAuth provider configuration (3 hours)
- Create JWT validation code (4 hours)
- Develop API key management (5 hours)
- **Total Claude Time:** 16 hours (~$45 value)

---

### A.4 RBAC System

| Item ID | Description | Unit | Qty | Unit Price | Monthly | Annual | Implementation |
|---------|-------------|------|-----|------------|---------|--------|----------------|
| **A.4.1** | Role Definitions (Database Schema) | schema | 1 | $0 | $0 | $0 | Week 3 |
| **A.4.2** | Permission Matrix | permissions | 50 | $0 | $0 | $0 | Week 3 |
| **A.4.3** | Role Assignment API | API endpoints | 5 | $0 | $0 | $0 | Week 4 |
| **A.4.4** | Multi-Tenant Isolation | isolation | 1 | $0 | $0 | $0 | Week 4 |
| **A.4.5** | Predefined Roles (Admin, User, Viewer) | roles | 5 | $0 | $0 | $0 | Week 3 |
| **A.4.6** | Custom Role Builder | feature | 1 | $0 | $0 | $0 | Week 4 |
| **A.4.7** | Permission Caching (Redis) | caching | 1 | $0 | $0 | $0 | Week 4 |
| ****SECTION A.4 TOTAL**** | | | | | **$0** | **$0** | |

**Claude Tasks for A.4:**
- Design RBAC database schema (3 hours)
- Generate role management API code (6 hours)
- Build permission checking middleware (4 hours)
- Create multi-tenant isolation logic (5 hours)
- **Total Claude Time:** 18 hours (~$50 value)

---

## SECTION B: ENCRYPTION & KEY MANAGEMENT

### B.1 Cloud Key Management Service (KMS)

| Item ID | Description | Unit | Qty | Unit Price | Monthly | Annual | Implementation |
|---------|-------------|------|-----|------------|---------|--------|----------------|
| **B.1.1** | Cloud KMS Service Fee | service | 1 | $0 | $0 | $0 | Week 2 |
| **B.1.2** | Encryption Key: Database | key | 1 | $1.00 | $1.00 | $12.00 | Week 2 |
| **B.1.3** | Encryption Key: Storage | key | 1 | $1.00 | $1.00 | $12.00 | Week 2 |
| **B.1.4** | Encryption Key: Backups | key | 1 | $1.00 | $1.00 | $12.00 | Week 2 |
| **B.1.5** | Encryption Key: Secrets | key | 1 | $1.00 | $1.00 | $12.00 | Week 2 |
| **B.1.6** | Encryption Key: Redis | key | 1 | $1.00 | $1.00 | $12.00 | Week 2 |
| **B.1.7** | Key Rotation Schedule (90 days) | schedule | 5 | $0 | $0 | $0 | Week 3 |
| **B.1.8** | Key Usage Logging | logging | 1 | $0 | $0 | $0 | Week 3 |
| **B.1.9** | Crypto Operations (10K/month) | operations | 10,000 | $0.00003 | $0.30 | $3.60 | Ongoing |
| ****SECTION B.1 TOTAL**** | | | | | **$5.30** | **$63.60** | |

**Claude Tasks for B.1:**
- Generate KMS Terraform configuration (4 hours)
- Create key rotation automation (3 hours)
- Build key usage monitoring (2 hours)
- **Total Claude Time:** 9 hours (~$25 value)

---

### B.2 Customer-Managed Encryption Keys (CMEK)

| Item ID | Description | Unit | Qty | Unit Price | Monthly | Annual | Implementation |
|---------|-------------|------|-----|------------|---------|--------|----------------|
| **B.2.1** | Cloud SQL CMEK Configuration | config | 1 | $0 | $0 | $0 | Week 3 |
| **B.2.2** | Cloud Storage CMEK Config | config | 1 | $0 | $0 | $0 | Week 3 |
| **B.2.3** | Memorystore CMEK Config | config | 1 | $0 | $0 | $0 | Week 3 |
| **B.2.4** | Persistent Disk Encryption | config | 3 | $0 | $0 | $0 | Week 3 |
| **B.2.5** | Backup Encryption | config | 1 | $0 | $0 | $0 | Week 3 |
| **B.2.6** | Encryption Validation Tests | tests | 5 | $0 | $0 | $0 | Week 4 |
| ****SECTION B.2 TOTAL**** | | | | | **$0** | **$0** | |

**Claude Tasks for B.2:**
- Generate CMEK configuration for all services (6 hours)
- Create encryption validation scripts (3 hours)
- Build monitoring for encryption status (2 hours)
- **Total Claude Time:** 11 hours (~$30 value)

---

### B.3 Application-Level Encryption

| Item ID | Description | Unit | Qty | Unit Price | Monthly | Annual | Implementation |
|---------|-------------|------|-----|------------|---------|--------|----------------|
| **B.3.1** | Field-Level Encryption Library | library | 1 | $0 | $0 | $0 | Week 4 |
| **B.3.2** | Encrypted Fields (PII/PHI) | fields | 12 | $0 | $0 | $0 | Week 4 |
| **B.3.3** | Encryption Helper Functions | functions | 8 | $0 | $0 | $0 | Week 4 |
| **B.3.4** | Key Derivation Functions | functions | 3 | $0 | $0 | $0 | Week 4 |
| ****SECTION B.3 TOTAL**** | | | | | **$0** | **$0** | |

**Claude Tasks for B.3:**
- Build encryption utility library (AES-256-GCM) (8 hours)
- Create field-level encryption middleware (6 hours)
- Generate test cases for encrypted fields (4 hours)
- **Total Claude Time:** 18 hours (~$50 value)

---

## SECTION C: DATA PROTECTION & DLP

### C.1 Cloud Data Loss Prevention (DLP)

| Item ID | Description | Unit | Qty | Unit Price | Monthly | Annual | Implementation |
|---------|-------------|------|-----|------------|---------|--------|----------------|
| **C.1.1** | Cloud DLP Service | service | 1 | $0 | $0 | $0 | Week 5 |
| **C.1.2** | Data Scanning (50GB/month) | GB scanned | 50 | $1.00 | $50.00 | $600.00 | Ongoing |
| **C.1.3** | PII Detection Templates | templates | 15 | $0 | $0 | $0 | Week 5 |
| **C.1.4** | PHI Detection Templates | templates | 10 | $0 | $0 | $0 | Week 5 |
| **C.1.5** | Custom InfoTypes | infotypes | 8 | $0 | $0 | $0 | Week 5 |
| **C.1.6** | De-identification Configs | configs | 5 | $0 | $0 | $0 | Week 5 |
| **C.1.7** | DLP Inspection Jobs | jobs | 10 | $0 | $0 | $0 | Week 6 |
| **C.1.8** | DLP Findings Storage (BigQuery) | storage | 1 | $5 | $5.00 | $60.00 | Ongoing |
| ****SECTION C.1 TOTAL**** | | | | | **$55.00** | **$660.00** | |

**Claude Tasks for C.1:**
- Generate DLP inspection templates (6 hours)
- Create de-identification configurations (4 hours)
- Build DLP findings dashboard (5 hours)
- Develop automated remediation (7 hours)
- **Total Claude Time:** 22 hours (~$60 value)

---

### C.2 Input Validation & Sanitization

| Item ID | Description | Unit | Qty | Unit Price | Monthly | Annual | Implementation |
|---------|-------------|------|-----|------------|---------|--------|----------------|
| **C.2.1** | JSON Schema Validation | schemas | 25 | $0 | $0 | $0 | Week 6 |
| **C.2.2** | Input Sanitization Middleware | middleware | 1 | $0 | $0 | $0 | Week 6 |
| **C.2.3** | SQL Injection Protection | protection | 1 | $0 | $0 | $0 | Week 6 |
| **C.2.4** | XSS Protection | protection | 1 | $0 | $0 | $0 | Week 6 |
| **C.2.5** | File Upload Validation | validation | 1 | $0 | $0 | $0 | Week 6 |
| **C.2.6** | Content-Type Validation | validation | 1 | $0 | $0 | $0 | Week 6 |
| ****SECTION C.2 TOTAL**** | | | | | **$0** | **$0** | |

**Claude Tasks for C.2:**
- Generate JSON schema definitions (4 hours)
- Build input validation middleware (6 hours)
- Create sanitization utilities (4 hours)
- **Total Claude Time:** 14 hours (~$40 value)

---

## SECTION D: THREAT DETECTION & RESPONSE

### D.1 Security Command Center (SCC) Premium

| Item ID | Description | Unit | Qty | Unit Price | Monthly | Annual | Implementation |
|---------|-------------|------|-----|------------|---------|--------|----------------|
| **D.1.1** | SCC Premium License | project | 1 | $25.00 | $25.00 | $300.00 | Week 7 |
| **D.1.2** | Event Threat Detection | service | 1 | $0 | $0 | $0 | Week 7 |
| **D.1.3** | Container Threat Detection | service | 1 | $0 | $0 | $0 | Week 7 |
| **D.1.4** | Web Security Scanner | service | 1 | $0 | $0 | $0 | Week 7 |
| **D.1.5** | Security Health Analytics | service | 1 | $0 | $0 | $0 | Week 7 |
| **D.1.6** | Compliance Monitoring (CIS) | benchmarks | 5 | $0 | $0 | $0 | Week 7 |
| **D.1.7** | Threat Intelligence Feed | feed | 1 | $0 | $0 | $0 | Week 7 |
| **D.1.8** | Findings Export to BigQuery | export | 1 | $2 | $2.00 | $24.00 | Ongoing |
| ****SECTION D.1 TOTAL**** | | | | | **$27.00** | **$324.00** | |

**Claude Tasks for D.1:**
- Configure SCC Premium notifications (2 hours)
- Create threat detection rules (4 hours)
- Build SCC findings dashboard (3 hours)
- Develop automated playbooks (6 hours)
- **Total Claude Time:** 15 hours (~$42 value)

---

### D.2 Automated Incident Response

| Item ID | Description | Unit | Qty | Unit Price | Monthly | Annual | Implementation |
|---------|-------------|------|-----|------------|---------|--------|----------------|
| **D.2.1** | PagerDuty Free Tier | account | 1 | $0 | $0 | $0 | Week 8 |
| **D.2.2** | Incident Response Playbooks | playbooks | 10 | $0 | $0 | $0 | Week 8 |
| **D.2.3** | Cloud Functions (Auto-remediation) | functions | 5 | $0 | $0 | $0 | Week 8 |
| **D.2.4** | Alert Routing Rules | rules | 15 | $0 | $0 | $0 | Week 8 |
| **D.2.5** | Incident Documentation Templates | templates | 5 | $0 | $0 | $0 | Week 8 |
| **D.2.6** | Post-Mortem Process | process | 1 | $0 | $0 | $0 | Week 8 |
| ****SECTION D.2 TOTAL**** | | | | | **$0** | **$0** | |

**Claude Tasks for D.2:**
- Generate incident response playbooks (8 hours)
- Create auto-remediation functions (10 hours)
- Build alert routing logic (4 hours)
- **Total Claude Time:** 22 hours (~$62 value)

---

## SECTION E: API SECURITY SUITE

### E.1 API Authentication & Authorization

| Item ID | Description | Unit | Qty | Unit Price | Monthly | Annual | Implementation |
|---------|-------------|------|-----|------------|---------|--------|----------------|
| **E.1.1** | OAuth 2.0 Implementation | implementation | 1 | $0 | $0 | $0 | Week 5 |
| **E.1.2** | JWT Token Generation | service | 1 | $0 | $0 | $0 | Week 5 |
| **E.1.3** | API Key Management | system | 1 | $0 | $0 | $0 | Week 5 |
| **E.1.4** | Request Signing (HMAC-SHA256) | signing | 1 | $0 | $0 | $0 | Week 5 |
| **E.1.5** | Signature Validation Middleware | middleware | 1 | $0 | $0 | $0 | Week 5 |
| ****SECTION E.1 TOTAL**** | | | | | **$0** | **$0** | |

**Claude Tasks for E.1:**
- Build OAuth 2.0 server (12 hours)
- Create JWT utilities (4 hours)
- Develop request signing logic (6 hours)
- **Total Claude Time:** 22 hours (~$62 value)

---

### E.2 API Rate Limiting & Throttling

| Item ID | Description | Unit | Qty | Unit Price | Monthly | Annual | Implementation |
|---------|-------------|------|-----|------------|---------|--------|----------------|
| **E.2.1** | Redis Rate Limiter (uses existing) | service | 1 | $0 | $0 | $0 | Week 6 |
| **E.2.2** | Per-User Rate Limits | limits | 3 | $0 | $0 | $0 | Week 6 |
| **E.2.3** | Per-API-Key Rate Limits | limits | 5 | $0 | $0 | $0 | Week 6 |
| **E.2.4** | Burst Protection | protection | 1 | $0 | $0 | $0 | Week 6 |
| **E.2.5** | Rate Limit Headers | headers | 1 | $0 | $0 | $0 | Week 6 |
| **E.2.6** | Quota Management System | system | 1 | $0 | $0 | $0 | Week 6 |
| ****SECTION E.2 TOTAL**** | | | | | **$0** | **$0** | |

**Claude Tasks for E.2:**
- Build rate limiting middleware (8 hours)
- Create quota management system (6 hours)
- Develop burst protection logic (4 hours)
- **Total Claude Time:** 18 hours (~$50 value)

---

### E.3 API Analytics & Monitoring

| Item ID | Description | Unit | Qty | Unit Price | Monthly | Annual | Implementation |
|---------|-------------|------|-----|------------|---------|--------|----------------|
| **E.3.1** | BigQuery API Logs | storage | 50GB | $0.02 | $1.00 | $12.00 | Ongoing |
| **E.3.2** | BigQuery Analysis Queries | queries | 100GB | $5/TB | $0.50 | $6.00 | Ongoing |
| **E.3.3** | Looker Studio Dashboards | dashboards | 5 | $0 | $0 | $0 | Week 7 |
| **E.3.4** | API Performance Metrics | metrics | 20 | $0.25 | $5.00 | $60.00 | Ongoing |
| **E.3.5** | Error Rate Tracking | tracking | 1 | $0 | $0 | $0 | Week 7 |
| **E.3.6** | Latency Percentiles (p50, p95, p99) | metrics | 1 | $0 | $0 | $0 | Week 7 |
| **E.3.7** | API Usage Reports (Automated) | reports | 1 | $2 | $2.00 | $24.00 | Ongoing |
| ****SECTION E.3 TOTAL**** | | | | | **$8.50** | **$102.00** | |

**Claude Tasks for E.3:**
- Create BigQuery logging pipeline (6 hours)
- Build Looker Studio dashboards (8 hours)
- Generate automated reports (4 hours)
- **Total Claude Time:** 18 hours (~$50 value)

---

**Continued in Part 3...**

---

**Document Status:** Part 2 of 5 - Sections A through E Complete  
**Items Documented:** 150+ line items  
**Next:** Part 3 - Sections F through J (Network Security, Compliance, Operations)
