# Koh Atlas Infrastructure Implementation Guide

**Version:** 1.0  
**Date:** December 6, 2025  
**Purpose:** Technical specification for implementing Koh Atlas secure architecture  
**Audience:** DevOps engineers, cloud architects, security engineers, implementation vendors

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Infrastructure Components](#infrastructure-components)
4. [Network Architecture](#network-architecture)
5. [Security Implementation](#security-implementation)
6. [Deployment Guide](#deployment-guide)
7. [Monitoring & Observability](#monitoring--observability)
8. [Cost Estimation](#cost-estimation)
9. [Success Criteria](#success-criteria)

---

## Executive Summary

### Project Scope
Implementation of a production-ready, secure, and scalable infrastructure for Koh Atlas - a visual architecture design and security analysis platform. The system follows a modern 3-tier architecture with defense-in-depth security, automated secrets management, and comprehensive observability.

### Key Requirements
- **Security:** SOC2, ISO27001, HIPAA, PCI-DSS compliant
- **Scalability:** Support 100K+ concurrent users
- **Availability:** 99.95% SLA with multi-AZ deployment
- **Performance:** <200ms API response time (p50), <1s (p95)
- **Recovery:** RTO < 1 hour, RPO < 5 minutes

### Technology Stack
- **Cloud Provider:** AWS (primary), multi-cloud capable
- **Frontend:** React 19 + TypeScript + Vite PWA
- **Backend:** Node.js 22 + Express + TypeScript
- **Database:** PostgreSQL 16 with read replicas
- **Cache:** Redis 7.x (session, rate limiting, queues)
- **CDN/WAF:** Cloudflare Enterprise
- **Secrets:** HashiCorp Vault
- **Monitoring:** Prometheus + Grafana + ELK Stack
- **IaC:** Terraform + Ansible

---

## Architecture Overview

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
│  │  - ModSecurity OWASP CRS 3.3                           │     │
│  │  - Rate Limiting: 10K req/min per IP                   │     │
│  │  - Bot Management + Geo-blocking                       │     │
│  │  - TLS 1.3, HTTP/3 (QUIC)                              │     │
│  └────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTPS:443
┌─────────────────────────────────────────────────────────────────┐
│                    PUBLIC SUBNET (DMZ)                           │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  Application Load Balancer (HAProxy/AWS ALB)           │     │
│  │  - SSL Termination (TLS 1.3)                           │     │
│  │  - Health Checks every 5s                              │     │
│  │  - Multi-AZ (3 zones)                                  │     │
│  │  - Sticky Sessions (cookie-based)                      │     │
│  └────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTP/HTTPS (Internal)
┌─────────────────────────────────────────────────────────────────┐
│                   APPLICATION TIER (Private Subnet)              │
│  ┌───────────────────────┐  ┌───────────────────────────────┐  │
│  │  API Gateway          │  │  App Server (Services)         │  │
│  │  - Express + TS       │  │  - Business Logic              │  │
│  │  - JWT Auth (RS256)   │  │  - Microservices               │  │
│  │  - Rate Limiting      │  │  - Job Queue Processing        │  │
│  │  - Input Validation   │  │  - Event Handlers              │  │
│  │  - RBAC/ABAC          │  └───────────────────────────────┘  │
│  └───────────────────────┘                                      │
│           ↓                         ↓                            │
│  ┌───────────────────────────────────────────────────────┐      │
│  │  Background Workers (Async Jobs)                       │      │
│  │  - AI Analysis, Exports, Backups                       │      │
│  │  - BullMQ + Redis Queue                                │      │
│  └───────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
                    ↓                    ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DATA TIER (Isolated Subnet)                   │
│  ┌──────────────────────┐  ┌────────────────────────────────┐  │
│  │  PostgreSQL 16       │  │  Redis 7.x                      │  │
│  │  - Primary + 2 Read  │  │  - Cache (Session, API)         │  │
│  │  - Streaming Replica │  │  - Rate Limit Counters          │  │
│  │  - WAL Archiving     │  │  - Job Queue (BullMQ)           │  │
│  │  - Encryption at Rest│  │  - TLS Required                 │  │
│  │  - TLS 1.3 + mTLS    │  │  - ACL with Vault Creds         │  │
│  └──────────────────────┘  └────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                       STORAGE TIER                               │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  Object Storage (S3 / Azure Blob)                      │     │
│  │  - Architecture Exports (JSON, PDF)                    │     │
│  │  - Backups (Encrypted AES-256)                         │     │
│  │  - Static Assets (CDN Origin)                          │     │
│  │  - Versioning Enabled, MFA Delete                      │     │
│  └────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    SECURITY & OBSERVABILITY                      │
│  ┌─────────────────────┐  ┌────────────────────────────────┐   │
│  │  HashiCorp Vault    │  │  Monitoring Stack               │   │
│  │  - Dynamic DB Creds │  │  - Prometheus (Metrics)         │   │
│  │  - API Keys         │  │  - Grafana (Dashboards)         │   │
│  │  - TLS Certificates │  │  - Elasticsearch (Logs)         │   │
│  │  - Encryption Keys  │  │  - Kibana (Log Analysis)        │   │
│  │  - Auto-rotation    │  │  - Jaeger (Tracing)             │   │
│  └─────────────────────┘  └────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

**Request Path (Client → Backend):**
1. Client (Browser/PWA) → HTTPS:443 → Cloudflare CDN
2. Cloudflare WAF validates request → forwards to ALB
3. ALB SSL termination → routes to API Gateway (least connections)
4. API Gateway authenticates JWT → validates input → queries Vault for secrets
5. API Gateway → PostgreSQL (read/write) or Redis (cache/session)
6. Response path reverses with caching at multiple layers

**Background Job Flow:**
1. API Gateway enqueues job → Redis Queue
2. Background Worker polls queue → processes job
3. Worker fetches secrets from Vault → queries DB
4. Worker uploads results to S3 → updates DB status
5. Client polls API for job completion

---

## Infrastructure Components

### Component Breakdown

#### **1. Client (Browser / PWA)**

**Component ID:** `n1`  
**Type:** `web-browser`  
**Zone:** Client Tier (Untrusted)

**Technology:**
- React 19 + TypeScript 5.7
- Vite 6 (build tool, HMR)
- Tailwind CSS (styling)
- Service Worker (offline mode, PWA)

**Implementation Details:**

```javascript
// Service Worker Configuration
{
  "workbox": {
    "runtimeCaching": [
      {
        "urlPattern": "/api/v1/designs",
        "handler": "NetworkFirst",
        "options": {
          "cacheName": "api-cache",
          "expiration": { "maxEntries": 50, "maxAgeSeconds": 300 }
        }
      }
    ]
  }
}
```

**Security Headers (Implemented in HTML):**
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'strict-dynamic' 'nonce-{random}'; 
               style-src 'self' 'unsafe-inline'; 
               connect-src 'self' wss://api.kohatlas.com; 
               frame-ancestors 'none'">
```

**Features:**
- Code splitting per route (lazy loading)
- WebSocket client (TLS 1.3, auto-reconnect)
- Client-side validation (Zod)
- Session timeout: 15min idle, 8h absolute
- XSS protection: DOMPurify for sanitization
- CSRF: Double submit cookie pattern

**Deployment:**
- Static hosting on Cloudflare Pages or S3 + CloudFront
- Build: `npm run build` → outputs to `/dist`
- Deployment: Automated via GitHub Actions on push to `main`

**Cost:** $0-$20/month (static hosting)

---

#### **2. Cloudflare CDN + WAF**

**Component ID:** `n2`  
**Type:** `edge-cdn`  
**Zone:** Edge Security Layer

**Technology:**
- Cloudflare Enterprise Plan
- Global CDN (300+ PoPs, 134 Tbps capacity)
- Integrated WAF with OWASP ModSecurity CRS 3.3

**DDoS Protection:**
- **Layer 3/4:** Automatic mitigation for SYN flood, UDP amplification, ACK flood
- **Layer 7:** HTTP flood protection with JavaScript challenge
- **Mitigation Time:** <3 seconds from attack detection
- **Capacity:** 134 Tbps (handles largest DDoS attacks)

**WAF Rules (OWASP CRS):**
```yaml
# Critical Rules Enabled
- 941xxx: XSS Detection (Cross-Site Scripting)
- 942xxx: SQL Injection Detection
- 930xxx: Path Traversal Prevention
- 932xxx: Remote Code Execution (RCE) Blocking
- 933xxx: PHP Injection Protection
- 913xxx: Scanner Detection (Nikto, SQLMap)
- 920xxx: Protocol Enforcement (HTTP compliance)
```

**Rate Limiting Configuration:**
```javascript
{
  "global": {
    "threshold": "10000 requests per minute",
    "window": "sliding",
    "action": "challenge", // JS challenge or CAPTCHA
    "duration": "1 hour"
  },
  "login_endpoint": {
    "threshold": "5 requests per 15 minutes",
    "action": "block"
  }
}
```

**Bot Management:**
- ML-based bot detection (Cloudflare AI)
- Challenges: JavaScript, CAPTCHA, Managed Challenge
- Allowlist: Googlebot, Bingbot, legitimate crawlers

**TLS Configuration:**
```yaml
min_version: TLS 1.3
cipher_suites:
  - TLS_AES_256_GCM_SHA384
  - TLS_CHACHA20_POLY1305_SHA256
http3: enabled  # QUIC protocol for faster connections
zero_rtt: enabled  # 0-RTT resumption for performance
```

**Caching Strategy:**
```javascript
{
  "static_assets": "max-age=31536000, immutable",
  "api_responses": "no-cache, no-store, must-revalidate",
  "html": "max-age=3600, s-maxage=3600",
  "compression": "brotli level 11"
}
```

**Setup Steps:**
1. Add domain to Cloudflare account
2. Update DNS nameservers to Cloudflare's
3. Enable "Full (Strict)" SSL/TLS mode
4. Configure WAF rules via Firewall dashboard
5. Set up rate limiting rules
6. Enable Bot Management (Enterprise feature)
7. Configure caching rules for static assets

**Cost:** $200-$500/month (Cloudflare Enterprise plan)

---

#### **3. Application Load Balancer**

**Component ID:** `n3`  
**Type:** `load-balancer-global`  
**Zone:** Public Subnet (DMZ)

**Technology Options:**
- **Option A:** HAProxy 2.8 Enterprise (self-hosted)
- **Option B:** AWS Application Load Balancer (managed)
- **Option C:** Azure Application Gateway (managed)

**Recommended:** AWS ALB for simplicity and cost

**AWS ALB Configuration:**

```yaml
# Terraform Configuration
resource "aws_lb" "main" {
  name               = "koh-atlas-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = [
    aws_subnet.public_1a.id,
    aws_subnet.public_1b.id,
    aws_subnet.public_1c.id
  ]

  enable_deletion_protection = true
  enable_http2              = true
  enable_cross_zone_load_balancing = true

  access_logs {
    bucket  = aws_s3_bucket.alb_logs.id
    enabled = true
  }
}

# HTTPS Listener (443)
resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.main.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = aws_acm_certificate.main.arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api_gateway.arn
  }
}

# Target Group (API Gateway)
resource "aws_lb_target_group" "api_gateway" {
  name     = "api-gateway-tg"
  port     = 3000
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id

  health_check {
    enabled             = true
    path                = "/health"
    interval            = 5
    timeout             = 2
    healthy_threshold   = 2
    unhealthy_threshold = 3
    matcher             = "200"
  }

  stickiness {
    type            = "lb_cookie"
    cookie_duration = 3600
    enabled         = true
  }
}
```

**SSL/TLS Configuration:**
- **Certificate:** Let's Encrypt (auto-renewed via cert-manager)
- **Protocol:** TLS 1.3 only
- **Cipher Suites:** 
  - `TLS_AES_256_GCM_SHA384`
  - `TLS_CHACHA20_POLY1305_SHA256`
- **HSTS:** `max-age=31536000; includeSubDomains; preload`
- **OCSP Stapling:** Enabled

**Health Checks:**
```yaml
endpoint: /health
interval: 5 seconds
timeout: 2 seconds
healthy_threshold: 2
unhealthy_threshold: 3
expected_status: 200
```

**Features:**
- **Algorithm:** Least Connections (routes to least busy backend)
- **Session Persistence:** Cookie-based sticky sessions (`__lb_affinity`)
- **Multi-AZ:** Deployed across 3 availability zones
- **Auto-scaling:** Elastic scaling based on request rate

**Security Groups:**
```yaml
# ALB Security Group
ingress:
  - port: 443
    protocol: TCP
    source: 0.0.0.0/0  # Allow HTTPS from anywhere
    description: "HTTPS from internet"

egress:
  - port: 3000
    protocol: TCP
    destination: [api-gateway-sg]
    description: "Forward to API Gateway"
```

**Cost:** $25-$50/month (AWS ALB)

---

