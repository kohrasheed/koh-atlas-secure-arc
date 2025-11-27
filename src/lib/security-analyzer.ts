import { SecurityRule, SecurityFinding, Connection, ArchComponent } from '../types';
import { SECURITY_RULES } from '../data/catalog';

export interface ComplianceFramework {
  id: string;
  name: string;
  description: string;
  requirements: ComplianceRequirement[];
}

export interface ComplianceRequirement {
  id: string;
  control: string;
  description: string;
  category: string;
}

export interface CVEVulnerability {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  component: string;
  description: string;
  published: string;
  affectedVersions: string[];
  fixedVersion?: string;
  cvssScore?: number;
}

export const COMPLIANCE_FRAMEWORKS: ComplianceFramework[] = [
  {
    id: 'soc2',
    name: 'SOC 2 Type II',
    description: 'Service Organization Control 2',
    requirements: [
      { id: 'cc6.1', control: 'Logical Access Controls', description: 'Implement authentication and authorization', category: 'Access Control' },
      { id: 'cc6.6', control: 'Encryption in Transit', description: 'Encrypt data in transit using TLS 1.2+', category: 'Encryption' },
      { id: 'cc6.7', control: 'Encryption at Rest', description: 'Encrypt sensitive data at rest', category: 'Encryption' },
      { id: 'cc7.1', control: 'Security Monitoring', description: 'Implement continuous monitoring and logging', category: 'Monitoring' },
      { id: 'cc7.2', control: 'Intrusion Detection', description: 'Deploy IDS/IPS systems', category: 'Detection' },
    ]
  },
  {
    id: 'hipaa',
    name: 'HIPAA',
    description: 'Health Insurance Portability and Accountability Act',
    requirements: [
      { id: '164.312(a)(1)', control: 'Access Control', description: 'Implement technical policies for access control', category: 'Access Control' },
      { id: '164.312(e)(1)', control: 'Transmission Security', description: 'Implement technical security measures for electronic PHI', category: 'Encryption' },
      { id: '164.312(e)(2)(i)', control: 'Integrity Controls', description: 'Implement mechanisms to authenticate ePHI', category: 'Integrity' },
      { id: '164.308(a)(1)(ii)(D)', control: 'Risk Assessment', description: 'Conduct accurate risk assessments', category: 'Risk Management' },
    ]
  },
  {
    id: 'pci-dss',
    name: 'PCI-DSS v4.0',
    description: 'Payment Card Industry Data Security Standard',
    requirements: [
      { id: '1.2.1', control: 'Firewall Configuration', description: 'Restrict connections between untrusted networks', category: 'Network Security' },
      { id: '2.2.2', control: 'Secure Configuration', description: 'Enable only necessary services and protocols', category: 'Configuration' },
      { id: '4.1', control: 'Strong Cryptography', description: 'Use strong cryptography for transmission of cardholder data', category: 'Encryption' },
      { id: '8.1', control: 'User Identification', description: 'Assign unique ID to each user', category: 'Access Control' },
      { id: '10.1', control: 'Audit Trails', description: 'Implement audit trails for all access', category: 'Logging' },
    ]
  },
  {
    id: 'gdpr',
    name: 'GDPR',
    description: 'General Data Protection Regulation',
    requirements: [
      { id: 'art32', control: 'Security of Processing', description: 'Implement appropriate technical measures', category: 'Security' },
      { id: 'art32(1)(a)', control: 'Pseudonymisation and Encryption', description: 'Encrypt personal data', category: 'Encryption' },
      { id: 'art32(1)(b)', control: 'Confidentiality', description: 'Ensure ongoing confidentiality of systems', category: 'Confidentiality' },
      { id: 'art33', control: 'Breach Notification', description: 'Notify breaches within 72 hours', category: 'Incident Response' },
    ]
  }
];

export const KNOWN_CVES: CVEVulnerability[] = [
  { id: 'CVE-2024-3094', severity: 'critical', component: 'xz-utils', description: 'Backdoor in xz compression library', published: '2024-03-29', affectedVersions: ['5.6.0', '5.6.1'], fixedVersion: '5.4.6', cvssScore: 10.0 },
  { id: 'CVE-2021-44228', severity: 'critical', component: 'log4j', description: 'Log4Shell RCE vulnerability', published: '2021-12-10', affectedVersions: ['2.0-2.14.1'], fixedVersion: '2.17.1', cvssScore: 10.0 },
  { id: 'CVE-2023-44487', severity: 'high', component: 'http2', description: 'HTTP/2 Rapid Reset DDoS', published: '2023-10-10', affectedVersions: ['various'], cvssScore: 7.5 },
  { id: 'CVE-2023-38545', severity: 'high', component: 'curl', description: 'SOCKS5 heap buffer overflow', published: '2023-10-11', affectedVersions: ['7.69.0-8.3.0'], fixedVersion: '8.4.0', cvssScore: 7.5 },
  { id: 'CVE-2024-21626', severity: 'high', component: 'runc', description: 'Container escape vulnerability', published: '2024-01-31', affectedVersions: ['<1.1.12'], fixedVersion: '1.1.12', cvssScore: 8.6 },
];

export class SecurityAnalyzer {
  private rules: SecurityRule[] = SECURITY_RULES;

  analyzeArchitecture(components: ArchComponent[], connections: Connection[]): SecurityFinding[] {
    const findings: SecurityFinding[] = [];

    // Check each connection against security rules
    connections.forEach(connection => {
      this.rules.forEach(rule => {
        const finding = this.evaluateRule(rule, connection, components);
        if (finding) {
          findings.push(finding);
        }
      });
    });

    // Check for architectural patterns
    const architecturalFindings = this.checkArchitecturalPatterns(components, connections);
    findings.push(...architecturalFindings);

    // Check for missing security controls
    const missingControlFindings = this.checkMissingControls(components, connections);
    findings.push(...missingControlFindings);

    return findings;
  }

  checkCompliance(framework: ComplianceFramework, components: ArchComponent[], connections: Connection[]): {
    passed: ComplianceRequirement[];
    failed: ComplianceRequirement[];
    notApplicable: ComplianceRequirement[];
    score: number;
  } {
    const passed: ComplianceRequirement[] = [];
    const failed: ComplianceRequirement[] = [];
    const notApplicable: ComplianceRequirement[] = [];

    framework.requirements.forEach(req => {
      const result = this.checkComplianceRequirement(req, components, connections);
      if (result === 'pass') passed.push(req);
      else if (result === 'fail') failed.push(req);
      else notApplicable.push(req);
    });

    const score = passed.length / (passed.length + failed.length) * 100;
    return { passed, failed, notApplicable, score };
  }

  private checkComplianceRequirement(req: ComplianceRequirement, components: ArchComponent[], connections: Connection[]): 'pass' | 'fail' | 'n/a' {
    // Check encryption requirements
    if (req.category === 'Encryption') {
      const unencryptedConnections = connections.filter(c => 
        !c.encryption || c.encryption === 'None' || c.protocol === 'HTTP'
      );
      return unencryptedConnections.length === 0 ? 'pass' : 'fail';
    }

    // Check access control
    if (req.category === 'Access Control') {
      const unauthenticatedConnections = connections.filter(c => 
        !c.auth || c.auth === 'None'
      );
      return unauthenticatedConnections.length === 0 ? 'pass' : 'fail';
    }

    // Check security controls
    if (req.category === 'Detection' || req.category === 'Security') {
      const hasIDS = components.some(c => c.name.includes('IDS') || c.name.includes('IPS'));
      const hasWAF = components.some(c => c.name === 'WAF');
      return (hasIDS || hasWAF) ? 'pass' : 'fail';
    }

    // Check monitoring and logging
    if (req.category === 'Monitoring' || req.category === 'Logging') {
      const hasMonitoring = components.some(c => 
        c.name.includes('Monitor') || c.name.includes('SIEM') || c.name.includes('Log')
      );
      return hasMonitoring ? 'pass' : 'fail';
    }

    return 'n/a';
  }

  checkCVEs(components: ArchComponent[]): { component: ArchComponent; cves: CVEVulnerability[] }[] {
    const results: { component: ArchComponent; cves: CVEVulnerability[] }[] = [];

    components.forEach(comp => {
      const matchingCVEs = KNOWN_CVES.filter(cve => 
        comp.name.toLowerCase().includes(cve.component.toLowerCase()) ||
        comp.category.toLowerCase().includes(cve.component.toLowerCase())
      );

      if (matchingCVEs.length > 0) {
        results.push({ component: comp, cves: matchingCVEs });
      }
    });

    return results;
  }

  private evaluateRule(rule: SecurityRule, connection: Connection, components: ArchComponent[]): SecurityFinding | null {
    let triggered = false;

    switch (rule.id) {
      case 'enforce-https':
        triggered = connection.protocol === 'HTTP' || connection.ports.includes(80);
        break;
      case 'unencrypted-db':
        const toComponent = components.find(c => c.id === connection.to);
        triggered = toComponent?.type === 'data' && !connection.encryption.includes('TLS');
        break;
    }

    if (triggered) {
      return {
        id: `${rule.id}-${connection.id}`,
        title: rule.name,
        severity: rule.severity,
        category: rule.category,
        description: rule.description,
        affectedAssets: [connection.from, connection.to],
        evidence: `Connection: ${connection.from} → ${connection.to} (${connection.protocol}:${connection.ports.join(',')})`,
        standards: rule.standards,
        suggestedFix: rule.fix,
        autoFixAvailable: true,
        residualRisk: this.calculateResidualRisk(rule.severity),
      };
    }

    return null;
  }

  private checkArchitecturalPatterns(components: ArchComponent[], connections: Connection[]): SecurityFinding[] {
    const findings: SecurityFinding[] = [];

    // Check for direct web-to-database connections
    const webComponents = components.filter(c => c.type === 'web');
    const dataComponents = components.filter(c => c.type === 'data');
    const appComponents = components.filter(c => c.type === 'app');

    webComponents.forEach(webComp => {
      const directDbConnections = connections.filter(conn => 
        conn.from === webComp.id && dataComponents.some(db => db.id === conn.to)
      );

      if (directDbConnections.length > 0 && appComponents.length === 0) {
        findings.push({
          id: `direct-db-${webComp.id}`,
          title: 'Direct Web-to-Database Connection',
          severity: 'high',
          category: 'Architecture',
          description: 'Web tier connects directly to database without application tier',
          affectedAssets: [webComp.id, ...directDbConnections.map(c => c.to)],
          evidence: `Direct connections: ${directDbConnections.map(c => `${c.from} → ${c.to}`).join(', ')}`,
          standards: ['OWASP ASVS V1.4', 'NIST 800-53 SC-7'],
          suggestedFix: 'Insert application/API tier between web and database layers',
          autoFixAvailable: true,
          residualRisk: 'Medium',
        });
      }
    });

    return findings;
  }

  private checkMissingControls(components: ArchComponent[], connections: Connection[]): SecurityFinding[] {
    const findings: SecurityFinding[] = [];

    // Check for public web servers without WAF
    const webServers = components.filter(c => c.type === 'web');
    const wafComponents = components.filter(c => c.name === 'WAF');

    webServers.forEach(webServer => {
      const hasWafProtection = connections.some(conn => 
        wafComponents.some(waf => waf.id === conn.from) && conn.to === webServer.id
      );

      if (!hasWafProtection) {
        findings.push({
          id: `missing-waf-${webServer.id}`,
          title: 'Missing WAF Protection',
          severity: 'medium',
          category: 'Security Controls',
          description: 'Public web server lacks Web Application Firewall protection',
          affectedAssets: [webServer.id],
          evidence: `Web server ${webServer.name} is not protected by WAF`,
          standards: ['OWASP Top 10', 'NIST CSF PR.PT-4'],
          suggestedFix: 'Deploy Web Application Firewall in front of web servers',
          autoFixAvailable: true,
          residualRisk: 'Low',
        });
      }
    });

    return findings;
  }

  private calculateResidualRisk(severity: string): string {
    const riskMap = {
      critical: 'High',
      high: 'Medium',
      medium: 'Low',
      low: 'Very Low',
    };
    return riskMap[severity as keyof typeof riskMap] || 'Unknown';
  }

  applyAutoFix(finding: SecurityFinding, components: ArchComponent[], connections: Connection[]): {
    components: ArchComponent[];
    connections: Connection[];
  } {
    let updatedComponents = [...components];
    let updatedConnections = [...connections];

    switch (finding.category) {
      case 'Encryption':
        if (finding.title === 'Enforce HTTPS') {
          updatedConnections = updatedConnections.map(conn => {
            if (finding.affectedAssets.includes(conn.from) || finding.affectedAssets.includes(conn.to)) {
              return {
                ...conn,
                protocol: 'HTTPS',
                ports: [443],
                encryption: 'TLS 1.2+',
              };
            }
            return conn;
          });
        }
        break;

      case 'Security Controls':
        if (finding.title === 'Missing WAF Protection') {
          const wafId = `waf-${Date.now()}`;
          const wafComponent: ArchComponent = {
            id: wafId,
            type: 'security',
            name: 'WAF',
            category: 'Security',
            icon: 'ShieldCheck',
          };
          updatedComponents.push(wafComponent);

          // Update connections to route through WAF
          const affectedConnections = updatedConnections.filter(conn => 
            finding.affectedAssets.includes(conn.to)
          );
          
          affectedConnections.forEach(conn => {
            updatedConnections.push({
              ...conn,
              id: `waf-${conn.id}`,
              to: wafId,
            });
            
            updatedConnections.push({
              id: `${wafId}-${conn.to}`,
              from: wafId,
              to: conn.to,
              purpose: 'Filtered web traffic',
              ports: conn.ports,
              protocol: conn.protocol,
              encryption: conn.encryption,
              auth: conn.auth,
              dataClass: conn.dataClass,
              egress: false,
              controls: ['WAF filtering'],
            });
          });

          updatedConnections = updatedConnections.filter(conn => 
            !affectedConnections.some(ac => ac.id === conn.id)
          );
        }
        break;
    }

    return { components: updatedComponents, connections: updatedConnections };
  }

  generateSTRIDEThreats(components: ArchComponent[], connections: Connection[]): any[] {
    const threats: any[] = [];

    components.forEach(comp => {
      const compType = comp.type.toLowerCase();
      const compName = comp.name.toLowerCase();
      
      // Spoofing threats - for services that handle authentication/user identity
      if (compType.includes('web') || compType.includes('app') || compType.includes('server') || 
          compType.includes('api') || compType.includes('service') || compType.includes('load-balancer')) {
        threats.push({
          id: `spoofing-${comp.id}`,
          category: 'Spoofing',
          componentId: comp.id,
          componentType: comp.type,
          componentName: comp.name,
          threat: 'Attacker could impersonate this service or its users',
          impact: 'High',
          likelihood: 'Medium',
          mitigations: [
            'Implement strong authentication (MFA, certificates)',
            'Use mutual TLS for service-to-service communication',
            'Implement API key validation',
            'Deploy identity and access management (IAM)'
          ],
          status: connections.some(c => (c.from === comp.id || c.to === comp.id) && c.auth !== 'None') ? 'Partially Mitigated' : 'Unmitigated'
        });
      }

      // Tampering threats - for data storage and processing
      if (compType.includes('database') || compType.includes('storage') || compType.includes('cache') || 
          compType.includes('s3') || compType.includes('blob') || compType.includes('data') ||
          compName.includes('database') || compName.includes('db') || compName.includes('storage')) {
        threats.push({
          id: `tampering-${comp.id}`,
          category: 'Tampering',
          componentId: comp.id,
          componentType: comp.type,
          componentName: comp.name,
          threat: 'Unauthorized modification of data at rest or in transit',
          impact: 'Critical',
          likelihood: 'Medium',
          mitigations: [
            'Implement encryption at rest (AES-256)',
            'Use integrity checks (HMAC, digital signatures)',
            'Enable audit logging for all data modifications',
            'Implement role-based access control (RBAC)',
            'Use versioning and backup controls'
          ],
          status: connections.some(c => (c.from === comp.id || c.to === comp.id) && c.encryption !== 'None') ? 'Partially Mitigated' : 'Unmitigated'
        });
      }

      // Repudiation threats - for components that process transactions
      if (compType.includes('web') || compType.includes('app') || compType.includes('server') || 
          compType.includes('database') || compType.includes('api') || compType.includes('service')) {
        threats.push({
          id: `repudiation-${comp.id}`,
          category: 'Repudiation',
          componentId: comp.id,
          componentType: comp.type,
          componentName: comp.name,
          threat: 'Users could deny performing actions without proof',
          impact: 'Medium',
          likelihood: 'Low',
          mitigations: [
            'Implement comprehensive audit logging',
            'Use digital signatures for critical transactions',
            'Enable centralized log aggregation (SIEM)',
            'Implement log integrity protection',
            'Enable non-repudiation controls'
          ],
          status: components.some(c => c.name.toLowerCase().includes('siem') || c.name.toLowerCase().includes('monitor') || c.name.toLowerCase().includes('log')) ? 'Partially Mitigated' : 'Unmitigated'
        });
      }

      // Information Disclosure threats - for all components that handle data
      if (compType.includes('database') || compType.includes('storage') || compType.includes('cache') ||
          compType.includes('web') || compType.includes('app') || compType.includes('server') || 
          compType.includes('api') || compType.includes('service') || compType.includes('queue')) {
        const isDataStore = compType.includes('database') || compType.includes('storage');
        threats.push({
          id: `disclosure-${comp.id}`,
          category: 'Information Disclosure',
          componentId: comp.id,
          componentType: comp.type,
          componentName: comp.name,
          threat: 'Sensitive information could be exposed to unauthorized parties',
          impact: isDataStore ? 'Critical' : 'High',
          likelihood: 'High',
          mitigations: [
            'Implement encryption in transit (TLS 1.3+)',
            'Apply principle of least privilege',
            'Use data classification and DLP controls',
            'Implement secure key management (KMS)',
            'Enable data masking for sensitive fields',
            'Implement network segmentation'
          ],
          status: connections.some(c => (c.from === comp.id || c.to === comp.id) && (c.encryption?.includes('TLS') || c.encryption?.includes('SSL'))) ? 'Partially Mitigated' : 'Unmitigated'
        });
      }

      // Denial of Service threats - for publicly accessible services
      if (compType.includes('web') || compType.includes('api') || compType.includes('load-balancer') ||
          compType.includes('gateway') || compType.includes('server') || compType.includes('service')) {
        threats.push({
          id: `dos-${comp.id}`,
          category: 'Denial of Service',
          componentId: comp.id,
          componentType: comp.type,
          componentName: comp.name,
          threat: 'Service availability could be disrupted by resource exhaustion attacks',
          impact: 'High',
          likelihood: 'Medium',
          mitigations: [
            'Implement rate limiting and throttling',
            'Deploy DDoS protection (WAF, CDN)',
            'Use auto-scaling and load balancing',
            'Implement circuit breakers and timeouts',
            'Set resource quotas and limits',
            'Deploy health monitoring and alerting'
          ],
          status: components.some(c => {
            const name = c.name.toLowerCase();
            return name.includes('waf') || name.includes('load') || name.includes('cdn') || name.includes('firewall');
          }) ? 'Partially Mitigated' : 'Unmitigated'
        });
      }

      // Elevation of Privilege threats - for components with privilege controls
      if (compType.includes('app') || compType.includes('server') || compType.includes('api') || 
          compType.includes('service') || compType.includes('kubernetes') || compType.includes('container') ||
          compType.includes('vm') || compType.includes('ec2') || compType.includes('compute')) {
        threats.push({
          id: `elevation-${comp.id}`,
          category: 'Elevation of Privilege',
          componentId: comp.id,
          componentType: comp.type,
          componentName: comp.name,
          threat: 'Attacker could gain unauthorized elevated access or permissions',
          impact: 'Critical',
          likelihood: 'Low',
          mitigations: [
            'Implement principle of least privilege (PoLP)',
            'Use role-based access control (RBAC)',
            'Enable security monitoring and anomaly detection',
            'Implement privilege escalation controls',
            'Regular security patching and updates',
            'Deploy endpoint detection and response (EDR)',
            'Use secure container configurations'
          ],
          status: components.some(c => {
            const name = c.name.toLowerCase();
            return name.includes('ids') || name.includes('edr') || name.includes('siem') || name.includes('iam');
          }) ? 'Partially Mitigated' : 'Unmitigated'
        });
      }
    });

    return threats;
  }
}