# TIER 1 ENTERPRISE TECHNICAL DOCUMENTATION
## Part 1: Executive Overview & Architecture

**Project:** Koh Atlas Security Architecture - Tier 1 Minimal Enterprise  
**Date:** December 14, 2025  
**Version:** 1.0  
**Implementation Approach:** DIY + Claude Sonnet 4.5  
**Target Scale:** 25-50 clients @ $500/month

---

## EXECUTIVE SUMMARY

### Project Scope

This document provides complete technical specifications, bill of quantities, and cost breakdown for implementing **Tier 1 Minimal Enterprise** security enhancements to the Koh Atlas Security Architecture Designer platform.

**Current State:** Production-ready startup architecture (6/10 security)  
**Target State:** Enterprise-ready with SOC 2 compliance path (7.5/10 security)  
**Implementation Method:** DIY with Claude Sonnet 4.5 assistance (90% automation)

### Investment Summary

| Category | Amount | Notes |
|----------|--------|-------|
| **One-Time Implementation** | $2,400 | DIY labor + tools |
| **Year 1 Operations** | $11,544 | Monthly recurring costs |
| **Total Year 1** | $13,944 | Complete investment |
| **Current Year 1 (Baseline)** | $6,684 | Existing costs |
| **Additional Investment** | $7,260 | Net new spending |

### Financial Projections (25 Clients @ $500/month)

| Metric | Amount |
|--------|--------|
| **Annual Revenue** | $150,000 |
| **Infrastructure Costs** | $11,544 |
| **Implementation (amortized)** | $2,400 |
| **Stripe Fees (2.9% + $0.30)** | $4,470 |
| **Total Costs** | $18,414 |
| **Net Profit** | $131,586 |
| **Profit Margin** | 88% |
| **ROI** | 715% |

### Key Deliverables

1. **Security Enhancements (15 components)**
   - Multi-factor authentication (MFA)
   - Single Sign-On (SSO) with SAML
   - Customer-managed encryption keys (CMEK)
   - Data Loss Prevention (DLP)
   - Advanced threat detection

2. **API Security Suite (12 components)**
   - OAuth 2.0 authentication
   - Advanced rate limiting
   - API analytics and monitoring
   - Threat protection
   - Complete API documentation

3. **Compliance Readiness**
   - SOC 2 Type I preparation
   - 7-year audit log retention
   - Policy enforcement automation
   - Extended backup retention

4. **Enhanced Operations**
   - 30-day database backups
   - Advanced monitoring
   - Incident response procedures
   - Security runbooks

---

## ARCHITECTURE OVERVIEW

### Current Architecture (Baseline)

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT TIER                          │
│  Browser/PWA → Cloud CDN + Cloud Armor (WAF)               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    LOAD BALANCER TIER                       │
│        Cloud Load Balancing (HTTPS) + Static IP            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION TIER                          │
│  GKE Cluster (3 nodes)                                      │
│  ├─ Nginx Ingress (API Gateway)                            │
│  ├─ App Server Pods (3 replicas)                           │
│  └─ Background Worker Pods (2 replicas)                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                        DATA TIER                            │
│  ├─ Cloud SQL PostgreSQL (db-custom-2-7680)                │
│  └─ Memorystore Redis (2GB Basic)                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    STORAGE & SECURITY                       │
│  ├─ Cloud Storage (Standard + Nearline)                    │
│  ├─ HashiCorp Vault (self-hosted)                          │
│  ├─ Secret Manager (10 secrets)                            │
│  └─ Cloud Monitoring + Logging                             │
└─────────────────────────────────────────────────────────────┘
```

**Current Monthly Cost:** $537  
**Security Score:** 6/10  
**SLA:** 99.5% (single-zone)

---

### Tier 1 Enhanced Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT TIER                          │
│  Browser/PWA → Cloud CDN + Cloud Armor (WAF)               │
│                    ↓ reCAPTCHA Enterprise                   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  IDENTITY & ACCESS LAYER (NEW)              │
│  ├─ Cloud Identity Premium (MFA, SSO, SAML)               │
│  ├─ Identity-Aware Proxy (IAP)                            │
│  └─ OAuth 2.0 / OIDC Gateway                              │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    LOAD BALANCER TIER                       │
│        Cloud Load Balancing (HTTPS) + Static IP            │
│                 + VPC Service Controls (NEW)                │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              APPLICATION TIER (ENHANCED)                     │
│  Private GKE Cluster (3 nodes) (NEW: Private IPs)          │
│  ├─ Nginx Ingress + OAuth2-Proxy                          │
│  ├─ App Server Pods (3 replicas)                           │
│  ├─ Background Worker Pods (2 replicas)                    │
│  └─ Network Policies (NEW: Pod isolation)                  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  DATA TIER (ENCRYPTED)                      │
│  ├─ Cloud SQL PostgreSQL + CMEK (NEW)                     │
│  ├─ Memorystore Redis + CMEK (NEW)                        │
│  ├─ Private Service Connect (NEW)                         │
│  └─ Data Loss Prevention Scanning (NEW)                   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│               STORAGE & SECURITY (ENHANCED)                 │
│  ├─ Cloud Storage + CMEK (NEW)                            │
│  ├─ Cloud KMS (5 encryption keys) (NEW)                   │
│  ├─ HashiCorp Vault (self-hosted)                         │
│  ├─ Secret Manager (20 secrets)                           │
│  ├─ Security Command Center Premium (NEW)                 │
│  ├─ Cloud Monitoring + Advanced Metrics (NEW)             │
│  └─ Cloud Logging + 7-year Archive (NEW)                  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  GOVERNANCE & COMPLIANCE (NEW)              │
│  ├─ Policy Controller (OPA)                               │
│  ├─ Config Sync (GitOps)                                  │
│  ├─ Cloud Asset Inventory                                 │
│  ├─ Binary Authorization                                  │
│  └─ Terraform Drift Detection                             │
└─────────────────────────────────────────────────────────────┘
```

**Tier 1 Monthly Cost:** $962  
**Security Score:** 7.5/10  
**SLA:** 99.5% (will upgrade to 99.95% in Tier 2)

---

## NEW COMPONENTS SUMMARY

### Security Components (15 items)

| # | Component | Purpose | Monthly Cost |
|---|-----------|---------|--------------|
| 1 | Cloud Identity Premium | MFA, SSO, SAML | $72 |
| 2 | Identity-Aware Proxy | Zero-trust access | $0 |
| 3 | Cloud KMS | Customer-managed keys | $5 |
| 4 | CMEK for Cloud SQL | Database encryption | Included |
| 5 | CMEK for Redis | Cache encryption | Included |
| 6 | CMEK for Storage | Object encryption | Included |
| 7 | Data Loss Prevention | PII/PHI scanning | $50 |
| 8 | Security Command Center Premium | Threat detection | $25 |
| 9 | Private GKE Cluster | Network isolation | $0 |
| 10 | Private Service Connect | Private DB access | $15 |
| 11 | VPC Service Controls | Data perimeter | $0 |
| 12 | Network Policies | Pod isolation | $0 |
| 13 | Binary Authorization | Image signing | $0 |
| 14 | Extended Audit Logs | 7-year retention | $32 |
| 15 | Policy Controller | OPA enforcement | $20 |

**Security Components Total:** $219/month

### API Security Components (12 items)

| # | Component | Purpose | Monthly Cost |
|---|-----------|---------|--------------|
| 1 | OAuth 2.0 Proxy | API authentication | $0 |
| 2 | Advanced Rate Limiting | Per-user quotas | $0 |
| 3 | API Analytics | BigQuery logging | $25 |
| 4 | API Documentation | Swagger UI | $5 |
| 5 | API Threat Protection | Bot detection | $10 |
| 6 | reCAPTCHA Enterprise | Anti-scraping | $10 |
| 7 | ModSecurity WAF | API firewall | $0 |
| 8 | API Observability | Cloud Trace | $15 |
| 9 | API Governance | Compliance reports | $15 |
| 10 | API Request Signing | HMAC validation | $0 |
| 11 | API Versioning | Lifecycle mgmt | $0 |
| 12 | Input Validation | JSON Schema | $0 |

**API Components Total:** $80/month

### Enhanced Operations (8 items)

| # | Component | Purpose | Monthly Cost |
|---|-----------|---------|--------------|
| 1 | Extended DB Backups | 30-day retention | $24 |
| 2 | Advanced Monitoring | Custom metrics | $20 |
| 3 | Enhanced Observability | Tracing, profiling | $15 |
| 4 | Incident Management | PagerDuty Free | $0 |
| 5 | Security Runbooks | Notion/Confluence | $10 |
| 6 | Terraform Cloud | Drift detection | $20 |
| 7 | Backup Testing | Automated tests | $0 |
| 8 | Cost Monitoring | Budget alerts | $0 |

**Operations Total:** $89/month

---

## TOTAL COST BREAKDOWN

### Monthly Recurring Costs

| Category | Current | Tier 1 | Change |
|----------|---------|--------|--------|
| **GCP Infrastructure** | $459 | $459 | $0 |
| **Third-Party Services** | $78 | $78 | $0 |
| **Security Enhancements** | $0 | $219 | +$219 |
| **API Security** | $0 | $80 | +$80 |
| **Enhanced Operations** | $0 | $89 | +$89 |
| **Contingency Buffer (10%)** | $0 | $37 | +$37 |
| ****TOTAL MONTHLY**** | **$537** | **$962** | **+$425** |

### Annual Costs

| Item | Amount |
|------|--------|
| **Monthly Operations** | $962 |
| **Annual Operations** | $11,544 |
| **One-Time Implementation** | $2,400 |
| **Total Year 1** | $13,944 |

### Implementation Cost Breakdown

| Phase | Description | Hours | Claude Cost | Tools Cost | Total |
|-------|-------------|-------|-------------|------------|-------|
| **Phase 1** | Identity & Access | 40h | $100 | $72 | $172 |
| **Phase 2** | Encryption (CMEK) | 24h | $80 | $5 | $85 |
| **Phase 3** | DLP & Scanning | 32h | $90 | $50 | $140 |
| **Phase 4** | Threat Detection | 16h | $60 | $25 | $85 |
| **Phase 5** | API Security | 48h | $120 | $80 | $200 |
| **Phase 6** | Network Security | 32h | $100 | $15 | $115 |
| **Phase 7** | Compliance & Audit | 40h | $110 | $52 | $162 |
| **Phase 8** | Operations Setup | 24h | $80 | $89 | $169 |
| **Phase 9** | Testing & QA | 40h | $120 | $100 | $220 |
| **Phase 10** | Documentation | 24h | $90 | $10 | $100 |
| **Contingency** | 10% buffer | - | $95 | $97 | $192 |
| ****TOTAL**** | **320 hours** | **$1,045** | **$595** | **$2,400** |

---

## IMPLEMENTATION TIMELINE

### 3-Month Rollout Plan

**Month 1: Foundation (Weeks 1-4)**
- Identity & Access Management (Cloud Identity, IAP)
- Encryption setup (Cloud KMS, CMEK)
- Private GKE cluster migration

**Month 2: Security & API (Weeks 5-8)**
- Data Loss Prevention deployment
- Security Command Center setup
- Complete API security suite
- Network security hardening

**Month 3: Compliance & Testing (Weeks 9-12)**
- Extended audit logs
- Policy enforcement
- Backup enhancements
- End-to-end testing
- Documentation completion

---

## NEXT SECTIONS

This document continues in:
- **Part 2:** Detailed Bill of Quantities (all 320+ line items)
- **Part 3:** Implementation Procedures (step-by-step)
- **Part 4:** Testing & Validation
- **Part 5:** Operations Runbooks

---

**Document Status:** Part 1 of 5 Complete  
**Next:** Part 2 - Detailed Bill of Quantities
