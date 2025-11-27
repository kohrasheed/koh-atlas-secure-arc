import { Node, Edge } from '@xyflow/react';

/**
 * Architectural Validation Types
 */

export type ValidationSeverity = 'error' | 'warning' | 'info';
export type ValidationCategory = 
  | 'connectivity' 
  | 'security-zone' 
  | 'redundancy' 
  | 'performance' 
  | 'compliance'
  | 'anti-pattern';

export interface ValidationIssue {
  id: string;
  severity: ValidationSeverity;
  category: ValidationCategory;
  title: string;
  description: string;
  affectedComponents: string[]; // node/edge IDs
  recommendation: string;
  autoFixable: boolean;
  autoFix?: () => void;
}

export interface ValidationResult {
  valid: boolean;
  score: number; // 0-100
  issues: ValidationIssue[];
  summary: {
    errors: number;
    warnings: number;
    infos: number;
  };
}

/**
 * Component Type Classifications
 */

const COMPONENT_TYPES = {
  // Network & Security
  FIREWALL: ['firewall', 'waf', 'network-firewall'],
  LOAD_BALANCER: ['load-balancer', 'alb', 'nlb', 'app-gateway'],
  VPN: ['vpn', 'vpn-gateway'],
  
  // Compute
  SERVER: ['web-server', 'app-server', 'service', 'ec2', 'vm', 'compute-engine'],
  CONTAINER: ['docker', 'kubernetes', 'k8s-pod', 'ecs', 'aks', 'gke'],
  SERVERLESS: ['lambda', 'function', 'cloud-function', 'azure-function'],
  
  // Data
  DATABASE: ['database', 'postgresql', 'mysql', 'sql', 'rds', 'cosmos-db', 'cloud-sql'],
  CACHE: ['cache', 'redis', 'memcached', 'elasticache'],
  STORAGE: ['storage', 's3', 'blob', 'cloud-storage'],
  QUEUE: ['queue', 'sqs', 'service-bus', 'pub-sub'],
  
  // Identity & Access
  AUTH: ['auth-service', 'identity', 'oauth', 'active-directory'],
  
  // Monitoring
  MONITORING: ['monitoring', 'logging', 'metrics'],
  
  // External
  EXTERNAL: ['external', 'internet', 'public', 'cloud'],
  CDN: ['cdn', 'cloudfront', 'cloud-cdn'],
};

/**
 * Architectural Validation Rules
 */

export class ArchitecturalValidator {
  private nodes: Node[];
  private edges: Edge[];
  private issues: ValidationIssue[] = [];

  constructor(nodes: Node[], edges: Edge[]) {
    this.nodes = nodes;
    this.edges = edges;
  }

  /**
   * Run all validation checks
   */
  validate(): ValidationResult {
    this.issues = [];

    // Run all validation rules
    this.validateConnectivity();
    this.validateSecurityZones();
    this.validateRedundancy();
    this.validateAntiPatterns();
    this.validateCompliance();

    // Calculate score
    const score = this.calculateScore();

    // Generate summary
    const summary = {
      errors: this.issues.filter(i => i.severity === 'error').length,
      warnings: this.issues.filter(i => i.severity === 'warning').length,
      infos: this.issues.filter(i => i.severity === 'info').length,
    };

    return {
      valid: summary.errors === 0,
      score,
      issues: this.issues,
      summary,
    };
  }

  /**
   * RULE 1: Connectivity Validation
   * Check if connections make logical sense
   */
  private validateConnectivity(): void {
    this.edges.forEach(edge => {
      const sourceNode = this.nodes.find(n => n.id === edge.source);
      const targetNode = this.nodes.find(n => n.id === edge.target);

      if (!sourceNode || !targetNode) return;

      const sourceType = (sourceNode.data as any).component || sourceNode.type;
      const targetType = (targetNode.data as any).component || targetNode.type;

      // Rule: Firewall → Firewall is invalid (redundant/misconfigured)
      if (this.isComponentType(sourceType, COMPONENT_TYPES.FIREWALL) && 
          this.isComponentType(targetType, COMPONENT_TYPES.FIREWALL)) {
        this.addIssue({
          id: `conn-fw-fw-${edge.id}`,
          severity: 'error',
          category: 'connectivity',
          title: 'Firewall-to-Firewall Connection',
          description: `Direct connection between two firewalls (${(sourceNode.data as any).label} → ${(targetNode.data as any).label}) is typically a misconfiguration. Firewalls should protect zones, not connect to each other.`,
          affectedComponents: [edge.id, sourceNode.id, targetNode.id],
          recommendation: 'Remove the direct connection. Place a protected resource (server, database) between the firewalls, or consolidate into a single firewall.',
          autoFixable: false,
        });
      }

      // Rule: Database should not be directly exposed to Internet
      if (this.isComponentType(sourceType, COMPONENT_TYPES.EXTERNAL) && 
          this.isComponentType(targetType, COMPONENT_TYPES.DATABASE)) {
        this.addIssue({
          id: `conn-internet-db-${edge.id}`,
          severity: 'error',
          category: 'security-zone',
          title: 'Database Exposed to Internet',
          description: `Database "${(targetNode.data as any).label}" is directly accessible from the Internet. This is a critical security vulnerability.`,
          affectedComponents: [edge.id, targetNode.id],
          recommendation: 'Add a firewall, API gateway, or application server between the Internet and the database. Never expose databases directly.',
          autoFixable: false,
        });
      }

      // Rule: Load Balancer → Database is unusual (should go through app tier)
      if (this.isComponentType(sourceType, COMPONENT_TYPES.LOAD_BALANCER) && 
          this.isComponentType(targetType, COMPONENT_TYPES.DATABASE)) {
        this.addIssue({
          id: `conn-lb-db-${edge.id}`,
          severity: 'warning',
          category: 'anti-pattern',
          title: 'Load Balancer Directly to Database',
          description: `Load balancer "${(sourceNode.data as any).label}" connects directly to database "${(targetNode.data as any).label}". This bypasses the application tier.`,
          affectedComponents: [edge.id, sourceNode.id, targetNode.id],
          recommendation: 'Route traffic through an application server that handles business logic and database access.',
          autoFixable: false,
        });
      }

      // Rule: Cache should be accessed by app servers, not load balancers
      if (this.isComponentType(sourceType, COMPONENT_TYPES.LOAD_BALANCER) && 
          this.isComponentType(targetType, COMPONENT_TYPES.CACHE)) {
        this.addIssue({
          id: `conn-lb-cache-${edge.id}`,
          severity: 'warning',
          category: 'anti-pattern',
          title: 'Load Balancer to Cache',
          description: `Load balancer connecting directly to cache is unusual. Caches are typically accessed by application logic.`,
          affectedComponents: [edge.id, sourceNode.id, targetNode.id],
          recommendation: 'Have application servers access the cache, not the load balancer.',
          autoFixable: false,
        });
      }

      // Rule: Monitoring should not have outbound connections (only inbound)
      if (this.isComponentType(sourceType, COMPONENT_TYPES.MONITORING)) {
        this.addIssue({
          id: `conn-monitoring-outbound-${edge.id}`,
          severity: 'info',
          category: 'connectivity',
          title: 'Monitoring Service with Outbound Connection',
          description: `Monitoring service "${(sourceNode.data as any).label}" has an outbound connection. Typically, services send metrics TO monitoring, not the reverse.`,
          affectedComponents: [edge.id, sourceNode.id],
          recommendation: 'Verify this connection is intentional. Consider reversing the direction.',
          autoFixable: false,
        });
      }
    });
  }

  /**
   * RULE 2: Security Zone Validation
   * Check trust boundary violations
   */
  private validateSecurityZones(): void {
    // Check for missing firewalls between zones
    const externalNodes = this.nodes.filter(n => 
      this.isComponentType((n.data as any).component || n.type, COMPONENT_TYPES.EXTERNAL)
    );

    const internalNodes = this.nodes.filter(n => 
      this.isComponentType((n.data as any).component || n.type, [...COMPONENT_TYPES.SERVER, ...COMPONENT_TYPES.DATABASE])
    );

    externalNodes.forEach(extNode => {
      internalNodes.forEach(intNode => {
        const directPath = this.hasDirectPath(extNode.id, intNode.id);
        const hasFirewallInPath = this.hasFirewallInPath(extNode.id, intNode.id);

        if (directPath && !hasFirewallInPath) {
          this.addIssue({
            id: `zone-no-firewall-${extNode.id}-${intNode.id}`,
            severity: 'error',
            category: 'security-zone',
            title: 'Missing Firewall Between Zones',
            description: `Direct path from external network "${(extNode.data as any).label}" to internal resource "${(intNode.data as any).label}" without a firewall.`,
            affectedComponents: [extNode.id, intNode.id],
            recommendation: 'Add a firewall or security group between external and internal networks.',
            autoFixable: false,
          });
        }
      });
    });

    // Check for proper zone segregation
    const databaseNodes = this.nodes.filter(n => 
      this.isComponentType((n.data as any).component || n.type, COMPONENT_TYPES.DATABASE)
    );

    databaseNodes.forEach(dbNode => {
      const inboundEdges = this.edges.filter(e => e.target === dbNode.id);
      
      inboundEdges.forEach(edge => {
        const sourceNode = this.nodes.find(n => n.id === edge.source);
        if (!sourceNode) return;

        // Database should only accept connections from app tier or internal services
        if (this.isComponentType((sourceNode.data as any).component || sourceNode.type, COMPONENT_TYPES.EXTERNAL) ||
            this.isComponentType((sourceNode.data as any).component || sourceNode.type, COMPONENT_TYPES.LOAD_BALANCER)) {
          this.addIssue({
            id: `zone-db-exposed-${edge.id}`,
            severity: 'error',
            category: 'security-zone',
            title: 'Database in Wrong Zone',
            description: `Database "${(dbNode.data as any).label}" accepts connections from "${(sourceNode.data as any).label}" which is not an application server.`,
            affectedComponents: [edge.id, dbNode.id, sourceNode.id],
            recommendation: 'Databases should only accept connections from application servers in a trusted zone.',
            autoFixable: false,
          });
        }
      });
    });
  }

  /**
   * RULE 3: Redundancy & High Availability
   * Check for single points of failure
   */
  private validateRedundancy(): void {
    // Check for single load balancers
    const loadBalancers = this.nodes.filter(n => 
      this.isComponentType((n.data as any).component || n.type, COMPONENT_TYPES.LOAD_BALANCER)
    );

    if (loadBalancers.length === 1) {
      const lb = loadBalancers[0];
      const dependentComponents = this.getDownstreamComponents(lb.id);

      if (dependentComponents.length > 2) {
        this.addIssue({
          id: `redundancy-single-lb-${lb.id}`,
          severity: 'warning',
          category: 'redundancy',
          title: 'Single Load Balancer (SPOF)',
          description: `Single load balancer "${(lb.data as any).label}" is a single point of failure for ${dependentComponents.length} components.`,
          affectedComponents: [lb.id],
          recommendation: 'Deploy a redundant load balancer with failover capability for high availability.',
          autoFixable: false,
        });
      }
    }

    // Check for single database instances
    const databases = this.nodes.filter(n => 
      this.isComponentType((n.data as any).component || n.type, COMPONENT_TYPES.DATABASE)
    );

    databases.forEach(db => {
      const dbLabel = ((db.data as any).label || '').toLowerCase();
      const hasReplica = databases.some(otherDb => {
        if (otherDb.id === db.id) return false;
        const otherLabel = ((otherDb.data as any).label || '').toLowerCase();
        return otherLabel.includes('replica') ||
               otherLabel.includes('standby') ||
               otherLabel.includes('secondary');
      });

      const environment = (db.data as any).environment;
      if (!hasReplica && environment === 'production') {
        this.addIssue({
          id: `redundancy-single-db-${db.id}`,
          severity: 'warning',
          category: 'redundancy',
          title: 'No Database Redundancy',
          description: `Production database "${(db.data as any).label}" has no replica or standby instance.`,
          affectedComponents: [db.id],
          recommendation: 'Configure database replication (read replicas, multi-AZ, or clustering) for high availability.',
          autoFixable: false,
        });
      }
    });

    // Check for orphaned nodes (no connections)
    this.nodes.forEach(node => {
      const hasConnections = this.edges.some(e => 
        e.source === node.id || e.target === node.id
      );

      if (!hasConnections && !this.isComponentType((node.data as any).component || node.type, COMPONENT_TYPES.EXTERNAL)) {
        this.addIssue({
          id: `orphan-${node.id}`,
          severity: 'info',
          category: 'connectivity',
          title: 'Orphaned Component',
          description: `Component "${(node.data as any).label}" has no connections to other components.`,
          affectedComponents: [node.id],
          recommendation: 'Connect this component to the architecture or remove it if unused.',
          autoFixable: false,
        });
      }
    });
  }

  /**
   * RULE 4: Anti-Pattern Detection
   * Identify common architectural mistakes
   */
  private validateAntiPatterns(): void {
    // Anti-pattern: God Component (too many connections)
    this.nodes.forEach(node => {
      const connectionCount = this.edges.filter(e => 
        e.source === node.id || e.target === node.id
      ).length;

      if (connectionCount > 10) {
        this.addIssue({
          id: `antipattern-god-${node.id}`,
          severity: 'warning',
          category: 'anti-pattern',
          title: 'God Component (Too Many Connections)',
          description: `Component "${(node.data as any).label}" has ${connectionCount} connections, indicating tight coupling.`,
          affectedComponents: [node.id],
          recommendation: 'Consider breaking this component into smaller, more focused services. Use message queues or event buses to decouple.',
          autoFixable: false,
        });
      }
    });

    // Anti-pattern: Circular dependencies
    const cycles = this.detectCycles();
    cycles.forEach((cycle, idx) => {
      this.addIssue({
        id: `antipattern-cycle-${idx}`,
        severity: 'warning',
        category: 'anti-pattern',
        title: 'Circular Dependency',
        description: `Circular dependency detected: ${cycle.map(id => {
          const node = this.nodes.find(n => n.id === id);
          return (node?.data as any)?.label || id;
        }).join(' → ')}`,
        affectedComponents: cycle,
        recommendation: 'Break the circular dependency by introducing an intermediary service or redesigning the data flow.',
        autoFixable: false,
      });
    });

    // Anti-pattern: Missing encryption in transit
    this.edges.forEach(edge => {
      const edgeLabel = (edge.label?.toString().toLowerCase() || '');
      const edgeData = (edge.data as any) || {};
      const protocol = (edgeData.protocol || '').toLowerCase();
      const encryption = (edgeData.encryption || '').toLowerCase();
      
      const hasEncryption = edgeLabel.includes('tls') || 
                           edgeLabel.includes('https') || 
                           edgeLabel.includes('ssl') ||
                           edgeLabel.includes('encrypted') ||
                           protocol.includes('https') ||
                           protocol.includes('tls') ||
                           encryption.includes('tls') ||
                           encryption.includes('ssl');

      if (!hasEncryption) {
        const sourceNode = this.nodes.find(n => n.id === edge.source);
        const targetNode = this.nodes.find(n => n.id === edge.target);

        // Check if either endpoint is sensitive
        const targetType = (targetNode?.data as any)?.component || targetNode?.type;
        const targetLabel = ((targetNode?.data as any)?.label || '').toLowerCase();
        
        const isSensitive = 
          this.isComponentType(targetType, COMPONENT_TYPES.DATABASE) ||
          targetLabel.includes('database') ||
          targetLabel.includes('auth');

        if (isSensitive) {
          this.addIssue({
            id: `antipattern-no-encryption-${edge.id}`,
            severity: 'warning',
            category: 'compliance',
            title: 'Unencrypted Connection to Sensitive Resource',
            description: `Connection from "${(sourceNode?.data as any)?.label}" to "${(targetNode?.data as any)?.label}" may not be encrypted.`,
            affectedComponents: [edge.id],
            recommendation: 'Enable TLS/SSL encryption for connections to sensitive resources.',
            autoFixable: false,
          });
        }
      }
    });
  }

  /**
   * RULE 5: Compliance Validation
   * Check against security standards
   */
  private validateCompliance(): void {
    // Check for monitoring/logging components
    const hasMonitoring = this.nodes.some(n => 
      this.isComponentType((n.data as any).component || n.type, COMPONENT_TYPES.MONITORING)
    );

    if (!hasMonitoring && this.nodes.length > 5) {
      this.addIssue({
        id: 'compliance-no-monitoring',
        severity: 'warning',
        category: 'compliance',
        title: 'No Monitoring/Logging Component',
        description: 'Architecture lacks a dedicated monitoring or logging component.',
        affectedComponents: [],
        recommendation: 'Add a monitoring solution (CloudWatch, Prometheus, ELK stack) to track system health and security events.',
        autoFixable: false,
      });
    }

    // Check for authentication/authorization
    const hasAuth = this.nodes.some(n => {
      const componentType = (n.data as any).component || n.type;
      const label = ((n.data as any).label || '').toLowerCase();
      return this.isComponentType(componentType, COMPONENT_TYPES.AUTH) ||
             label.includes('auth') ||
             label.includes('identity');
    });

    const hasPublicEndpoints = this.nodes.some(n => {
      const componentType = (n.data as any).component || n.type;
      return this.isComponentType(componentType, COMPONENT_TYPES.LOAD_BALANCER) ||
             this.isComponentType(componentType, COMPONENT_TYPES.SERVER);
    });

    if (hasPublicEndpoints && !hasAuth && this.nodes.length > 3) {
      this.addIssue({
        id: 'compliance-no-auth',
        severity: 'warning',
        category: 'compliance',
        title: 'No Authentication Service',
        description: 'Architecture has public endpoints but no visible authentication/authorization service.',
        affectedComponents: [],
        recommendation: 'Add an authentication service (OAuth, SAML, JWT) to secure public endpoints.',
        autoFixable: false,
      });
    }

    // Check for backup/disaster recovery
    const hasBackup = this.nodes.some(n => {
      const label = ((n.data as any).label || '').toLowerCase();
      return label.includes('backup') ||
             label.includes('replica') ||
             label.includes('standby');
    });

    const hasCriticalData = this.nodes.some(n => 
      this.isComponentType((n.data as any).component || n.type, COMPONENT_TYPES.DATABASE)
    );

    if (hasCriticalData && !hasBackup) {
      this.addIssue({
        id: 'compliance-no-backup',
        severity: 'info',
        category: 'compliance',
        title: 'No Backup Strategy Visible',
        description: 'Architecture contains databases but no visible backup or disaster recovery components.',
        affectedComponents: [],
        recommendation: 'Document or add backup solutions (automated snapshots, cross-region replication).',
        autoFixable: false,
      });
    }
  }

  /**
   * Helper: Check if component matches type
   */
  private isComponentType(componentType: string | undefined, types: string[]): boolean {
    if (!componentType) return false;
    const lowerType = componentType.toLowerCase();
    return types.some(type => lowerType.includes(type.toLowerCase()));
  }

  /**
   * Helper: Check if direct path exists
   */
  private hasDirectPath(sourceId: string, targetId: string): boolean {
    return this.edges.some(e => e.source === sourceId && e.target === targetId);
  }

  /**
   * Helper: Check if firewall exists in path
   */
  private hasFirewallInPath(sourceId: string, targetId: string): boolean {
    const visited = new Set<string>();
    const queue = [sourceId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);

      if (current === targetId) return false; // Reached target without firewall

      const node = this.nodes.find(n => n.id === current);
      if (node && this.isComponentType((node.data as any).component || node.type, COMPONENT_TYPES.FIREWALL)) {
        return true; // Found firewall in path
      }

      // Add connected nodes to queue
      this.edges
        .filter(e => e.source === current)
        .forEach(e => queue.push(e.target));
    }

    return false;
  }

  /**
   * Helper: Get downstream components
   */
  private getDownstreamComponents(nodeId: string): string[] {
    const downstream = new Set<string>();
    const queue = [nodeId];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);

      this.edges
        .filter(e => e.source === current)
        .forEach(e => {
          downstream.add(e.target);
          queue.push(e.target);
        });
    }

    return Array.from(downstream);
  }

  /**
   * Helper: Detect circular dependencies
   */
  private detectCycles(): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (nodeId: string, path: string[]): void => {
      visited.add(nodeId);
      recursionStack.add(nodeId);
      path.push(nodeId);

      const outgoingEdges = this.edges.filter(e => e.source === nodeId);

      for (const edge of outgoingEdges) {
        const targetId = edge.target;

        if (!visited.has(targetId)) {
          dfs(targetId, [...path]);
        } else if (recursionStack.has(targetId)) {
          // Cycle detected
          const cycleStart = path.indexOf(targetId);
          if (cycleStart !== -1) {
            const cycle = path.slice(cycleStart);
            cycle.push(targetId); // Complete the cycle
            cycles.push(cycle);
          }
        }
      }

      recursionStack.delete(nodeId);
    };

    this.nodes.forEach(node => {
      if (!visited.has(node.id)) {
        dfs(node.id, []);
      }
    });

    return cycles;
  }

  /**
   * Helper: Add validation issue
   */
  private addIssue(issue: ValidationIssue): void {
    this.issues.push(issue);
  }

  /**
   * Helper: Calculate overall architecture score
   */
  private calculateScore(): number {
    const errorWeight = 10;
    const warningWeight = 3;
    const infoWeight = 1;

    const errors = this.issues.filter(i => i.severity === 'error').length;
    const warnings = this.issues.filter(i => i.severity === 'warning').length;
    const infos = this.issues.filter(i => i.severity === 'info').length;

    const penalty = (errors * errorWeight) + (warnings * warningWeight) + (infos * infoWeight);
    const maxScore = 100;

    return Math.max(0, maxScore - penalty);
  }
}

/**
 * Convenience function to validate architecture
 */
export function validateArchitecture(nodes: Node[], edges: Edge[]): ValidationResult {
  const validator = new ArchitecturalValidator(nodes, edges);
  return validator.validate();
}
