import { SecurityRule, SecurityFinding, Connection, ArchComponent } from '../types';
import { SECURITY_RULES } from '../data/catalog';

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
}