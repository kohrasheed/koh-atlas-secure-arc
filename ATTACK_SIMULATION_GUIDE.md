# Attack Simulation & Threat Modeling Feature

## Overview

The Attack Simulation feature provides AI-powered security threat analysis for cloud architecture designs. It automatically discovers potential attack paths, performs STRIDE threat modeling, and generates actionable security recommendations using Claude AI.

## Features

### 🎯 Attack Path Discovery
Automatically discovers all possible attack routes from internet-facing entry points to critical assets:
- **Entry Points**: Edge components (CDN, Load Balancer, WAF, Firewall)
- **Critical Assets**: Databases, Object Storage, Secrets Vaults, Cache systems
- **Path Analysis**: Checks each hop for encryption, authentication, and security controls
- **Risk Scoring**: Calculates likelihood × impact (1-100 scale)

### 🛡️ STRIDE Threat Analysis
Comprehensive threat modeling following Microsoft STRIDE methodology:
- **Spoofing**: Weak or missing authentication (IAM, MFA)
- **Tampering**: Unencrypted data, unvalidated containers
- **Repudiation**: Missing audit logging
- **Information Disclosure**: Public IPs, unencrypted transmissions
- **Denial of Service**: No DDoS protection, missing rate limiting
- **Elevation of Privilege**: Weak access controls, service account keys

### 🤖 Claude AI Integration
Advanced vulnerability analysis powered by Claude Sonnet 4:
- **Enhanced Detection**: Discovers vulnerabilities missed by pattern matching
- **Prioritization**: Re-ranks threats by actual exploitability
- **Chained Attacks**: Identifies multi-stage attack scenarios
- **Executive Reports**: Generates professional security assessments

### 🔒 Confidentiality Protection
Three-tier abstraction system protects sensitive data:
- **Confidential**: Only node types and zones sent to Claude
- **Abstracted**: Service names masked, architecture structure preserved
- **Full**: Complete details including labels and features

## Usage

### 1. Running a Simulation

1. **Load an Architecture**
   - Import a JSON file or create architecture manually
   - Minimum 2 components required

2. **Select Abstraction Level**
   - Click dropdown in Attack Simulation panel
   - Choose: Confidential (🔒), Abstracted (🔒), or Full (🔓)

3. **Run Simulation**
   - Click "Run Simulation" button
   - Wait 5-10 seconds for analysis
   - Claude API key required (set `VITE_ANTHROPIC_API_KEY`)

### 2. Understanding Results

#### Overview Tab
- **Overall Risk Score**: 0-100 gauge showing security posture
- **Risk Distribution**: Breakdown by Critical/High/Medium/Low
- **AI Analysis**: Claude's security assessment summary
- **Recommendations**: Top 10 actionable fixes
- **Download Report**: Export Markdown security assessment

#### Attack Paths Tab
- **Path List**: All discovered attack routes sorted by risk
- **Risk Badges**: Color-coded severity (red/orange/yellow/green)
- **Attack Types**: DDoS, Injection, Exfiltration, Lateral Movement, etc.
- **Click to Highlight**: Visual path display on diagram
- **Expand for Details**: View vulnerabilities, mitigations, likelihood/impact

#### STRIDE Analysis Tab
- **Component Threats**: STRIDE categories per component
- **Threat Count**: Total threats identified
- **Expand Details**: View specific threat descriptions
- **Remediation**: Suggested fixes for each threat

### 3. Visual Path Highlighting

**To highlight an attack path:**
1. Go to "Attack Paths" tab
2. Click any attack path card
3. Diagram shows:
   - Affected nodes: Red border, full opacity
   - Affected edges: Red stroke, increased width
   - Other components: Faded (30% opacity)
4. Click "Clear Highlight" to reset

### 4. Downloading Reports

1. Complete a simulation
2. Click "Download Report" button (Overview tab)
3. Saves as: `security-assessment-YYYY-MM-DD.md`
4. Report includes:
   - Executive Summary
   - Risk Overview
   - Top 5 Critical Findings
   - Recommended Actions
   - Compliance Considerations (GDPR, SOC 2, ISO 27001)

## Risk Calculation

### Likelihood Score (1-10)
```
base_score = vulnerabilities_count × 2 (capped at 10)
mitigation_penalty = mitigations_count × 0.5 (capped at 5)
length_penalty = (path_length - 2) × 0.3 (capped at 3)
likelihood = max(1, base_score - mitigation_penalty - length_penalty)
```

**Factors:**
- More vulnerabilities → Higher likelihood
- More mitigations → Lower likelihood
- Longer paths → Lower likelihood (harder to exploit)

### Impact Score (1-10)
| Asset Type | Impact Score |
|------------|--------------|
| Database | 10 |
| Secrets Vault | 10 |
| Object Storage | 8 |
| Kubernetes Cluster | 7 |
| Cache | 6 |
| Other | 5 |

### Risk Score (1-100)
```
risk_score = likelihood × impact
```

**Risk Categories:**
- **Critical**: 70-100 (Red) - Immediate action required
- **High**: 50-69 (Orange) - Priority remediation
- **Medium**: 30-49 (Yellow) - Schedule fixes
- **Low**: 1-29 (Green) - Monitor

## Attack Types

### 1. DDoS (Distributed Denial of Service)
- **Target**: Load balancers, CDN, edge services
- **Impact**: Service unavailability
- **Mitigation**: Cloud Armor, rate limiting, auto-scaling

### 2. Injection Attacks
- **Target**: Web servers, API gateways, databases
- **Impact**: Code execution, data manipulation
- **Mitigation**: Input validation, prepared statements, WAF rules

### 3. Data Exfiltration
- **Target**: Databases, object storage, secrets
- **Impact**: Data breach, compliance violation
- **Mitigation**: Encryption (CMEK), DLP, private networking

### 4. Lateral Movement
- **Target**: Compute resources → Data stores
- **Impact**: Privilege escalation, data access
- **Mitigation**: Service mesh (mTLS), network segmentation, least privilege IAM

### 5. Privilege Escalation
- **Target**: Kubernetes clusters, IAM roles
- **Impact**: Admin access, full compromise
- **Mitigation**: Pod Security Standards, Workload Identity, MFA

### 6. Credential Theft
- **Target**: Secrets vaults, service accounts
- **Impact**: Impersonation, unauthorized access
- **Mitigation**: Secret Manager, Workload Identity, rotation policies

### 7. Misconfiguration Exploitation
- **Target**: All components
- **Impact**: Varies by component
- **Mitigation**: Security Command Center, Config Validator, policy enforcement

## STRIDE Threat Categories

### Spoofing
**Definition**: Impersonating users, services, or systems

**Common Threats:**
- Missing IAM authentication
- No MFA enforcement
- Weak password policies
- Unverified service identities

**Mitigations:**
- Workload Identity (GKE)
- Cloud Identity with MFA
- IAM conditions and constraints
- Certificate-based authentication (CAS)

### Tampering
**Definition**: Unauthorized modification of data or code

**Common Threats:**
- Data not encrypted with CMEK
- Container images not validated
- No integrity checks
- Unprotected configuration

**Mitigations:**
- CMEK encryption everywhere
- Binary Authorization
- Signed container images
- Configuration as Code (locked)

### Repudiation
**Definition**: Denying actions without proof

**Common Threats:**
- No audit logging
- Missing access logs
- Incomplete activity tracking
- No tamper-proof logs

**Mitigations:**
- Cloud Logging (WORM storage)
- Access Transparency
- Audit Logs API
- Log retention policies

### Information Disclosure
**Definition**: Exposing confidential data

**Common Threats:**
- Database on public IP
- Unencrypted data transmission
- Missing DLP
- Overly permissive access

**Mitigations:**
- Private IP only
- TLS 1.3 everywhere
- Cloud DLP scanning
- VPC Service Controls

### Denial of Service
**Definition**: Making services unavailable

**Common Threats:**
- No DDoS protection
- Missing rate limiting
- No auto-scaling
- Single points of failure

**Mitigations:**
- Cloud Armor WAF
- Cloud CDN caching
- Regional load balancing
- Multi-AZ deployment

### Elevation of Privilege
**Definition**: Gaining higher access than authorized

**Common Threats:**
- No Pod Security Standards
- Service account keys in use
- Overpermissive IAM roles
- Container running as root

**Mitigations:**
- Pod Security Standards (Restricted)
- Workload Identity (no keys)
- Least privilege IAM
- Non-root containers

## Claude API Integration

### Configuration
Set environment variable:
```bash
VITE_ANTHROPIC_API_KEY=sk-ant-api03-...
```

### API Calls Made

1. **analyzeAttackPathsWithClaude()**
   - Input: Top 10 attack paths, sanitized node data
   - Output: Enhanced vulnerability list, re-prioritized paths, recommendations
   - Model: claude-sonnet-4-20250514
   - Tokens: ~4,096 max
   - Latency: 2-4 seconds

2. **analyzeSTRIDEWithClaude()**
   - Input: Top 20 components with STRIDE threats
   - Output: Severity assignments, prioritized threats, mitigations
   - Model: claude-sonnet-4-20250514
   - Tokens: ~4,096 max
   - Latency: 2-4 seconds

3. **generateSecurityReport()**
   - Input: All simulation results, architecture summary
   - Output: Professional Markdown security assessment
   - Model: claude-sonnet-4-20250514
   - Tokens: ~8,192 max
   - Latency: 3-6 seconds

### Abstraction Levels

#### Confidential Mode
**Data Sent:**
```json
{
  "nodes": [
    {"id": "n1", "type": "cdn", "zone": "Edge"},
    {"id": "n2", "type": "database", "zone": "Data"}
  ]
}
```
**Excluded:** Labels, service names, features, specs

#### Abstracted Mode
**Data Sent:**
```json
{
  "nodes": [
    {"id": "n1", "type": "cdn", "zone": "Edge", "gcpService": "Xxxxx XXX", "features": [...]},
    {"id": "n2", "type": "database", "zone": "Data", "gcpService": "Xxxxx XXX", "features": [...]}
  ]
}
```
**Masking:** Service names replaced with X's

#### Full Mode
**Data Sent:**
```json
{
  "nodes": [
    {"id": "n1", "type": "cdn", "zone": "Edge", "label": "Global CDN", "gcpService": "Cloud CDN", "features": [...]},
    {"id": "n2", "type": "database", "zone": "Data", "label": "Primary Database", "gcpService": "Cloud SQL", "features": [...]}
  ]
}
```
**No masking:** Complete architecture details

### Error Handling

If Claude API fails:
1. Fallback to basic pattern-matching analysis
2. Generic recommendations displayed
3. User notified: "AI analysis unavailable"
4. Core functionality still works

## Testing

### Test Case 1: Tier 1.5 GCP Production Architecture
**File:** `tier1.5-atlas-import.json`
**Components:** 26
**Edges:** 36

**Expected Results:**
- Attack paths: 15-25 paths discovered
- Critical risks: 2-5 paths (score ≥70)
- High risks: 5-10 paths (score 50-69)
- STRIDE threats: 10-15 components flagged
- Most common threat: Information Disclosure or Tampering

**Test Steps:**
1. Import `tier1.5-atlas-import.json`
2. Go to "Threats" tab
3. Select "Abstracted" mode
4. Click "Run Simulation"
5. Verify:
   - Overall risk score 40-60
   - Attack paths sorted by risk
   - Cloud SQL flagged for encryption
   - Edge components flagged for DDoS protection
   - Download report works

### Test Case 2: Simple 3-Tier App
**Components:**
- Browser → Load Balancer → Web Server → Database

**Expected Results:**
- 1 main attack path (Browser → LB → Web → DB)
- Risk score depends on security controls
- STRIDE: All components should have some threats
- Recommendations: Add WAF, enable encryption, implement IAM

### Test Case 3: Zero Architecture
**Components:** 0

**Expected Results:**
- Alert: "No architecture loaded. Please create or import..."
- "Run Simulation" button disabled
- No errors or crashes

## Performance Benchmarks

| Architecture Size | Discovery Time | STRIDE Analysis | Claude API | Total |
|-------------------|----------------|-----------------|------------|-------|
| Small (5 nodes) | <100ms | <50ms | 2-3s | ~3s |
| Medium (26 nodes) | 200-500ms | 100-200ms | 3-5s | ~6s |
| Large (100 nodes) | 1-2s | 500ms-1s | 4-6s | ~8s |

**Optimization Notes:**
- Graph traversal: O(V + E) complexity
- STRIDE analysis: O(N) for N components
- Claude API: Network latency dominant factor
- UI rendering: React virtualization for large lists

## Troubleshooting

### "AI analysis unavailable"
**Cause:** Claude API key missing or invalid
**Fix:** Set `VITE_ANTHROPIC_API_KEY` environment variable

### No attack paths discovered
**Causes:**
1. No edge components (CDN, LB, WAF)
2. No critical assets (Database, Secrets, Storage)
3. Components not connected

**Fix:** Add entry points and data stores, connect with edges

### Risk scores seem wrong
**Check:**
- Edge labels contain encryption info (TLS, mTLS, HTTPS)
- Edge labels contain auth info (IAM, AUTH, JWT)
- Node features array populated correctly
- Node types match expected values

### Diagram highlighting not working
**Causes:**
1. Nodes/edges state not synchronized
2. ReactFlow not initialized

**Fix:** Refresh page, ensure ReactFlow loaded before simulation

## Architecture

### Data Flow
```
User clicks "Run Simulation"
  ↓
discoverAttackPaths(nodes, edges)
  ↓ (parallel)
performSTRIDEAnalysis(nodes)
  ↓
generateRecommendations(paths, stride)
  ↓ (async)
analyzeAttackPathsWithClaude(paths, nodes, level)
analyzeSTRIDEWithClaude(stride, nodes, level)
  ↓
generateSecurityReport(paths, stride, nodes, level)
  ↓
Display results in UI
```

### File Structure
```
src/
├── lib/
│   ├── attack-simulation.ts          # Core algorithms
│   └── threat-analysis-claude.ts     # Claude API integration
└── components/
    └── AttackSimulation.tsx          # React UI component
```

## Future Enhancements

### Planned Features
- [ ] CVE database integration (NIST NVD)
- [ ] Custom attack path definitions
- [ ] Risk heatmap visualization
- [ ] Automated remediation scripts
- [ ] Multi-cloud support (AWS, Azure)
- [ ] Attack simulation playback (animated)
- [ ] Export to SARIF format
- [ ] Integration with JIRA/GitHub Issues
- [ ] Historical risk tracking
- [ ] Penetration testing simulation

### API Improvements
- [ ] Streaming Claude responses
- [ ] Batch API calls for large architectures
- [ ] Caching analyzed components
- [ ] Offline mode with local LLM
- [ ] Custom prompt templates

## License

MIT License - See LICENSE file

## Credits

- **STRIDE Methodology**: Microsoft Security Development Lifecycle
- **AI Analysis**: Anthropic Claude Sonnet 4
- **Graph Algorithms**: Standard DFS/BFS traversal
- **UI Framework**: React 19 + shadcn/ui

---

**Version:** 1.0.0  
**Last Updated:** 2025-01-18  
**Author:** Koh Atlas Team
