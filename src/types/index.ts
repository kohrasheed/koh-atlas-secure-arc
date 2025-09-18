export type ComponentType = 'web' | 'app' | 'data' | 'network' | 'platform' | 'security';

export type SecuritySeverity = 'critical' | 'high' | 'medium' | 'low';

export interface ArchComponent {
  id: string;
  type: ComponentType;
  name: string;
  category: string;
  icon: string;
  zone?: string;
  criticality?: 'critical' | 'high' | 'medium' | 'low';
  metadata?: {
    os?: string;
    version?: string;
    vendor?: string;
  };
}

// Alias for backward compatibility
export type Component = ArchComponent;

export interface Connection {
  id: string;
  from: string;
  to: string;
  purpose: string;
  ports: number[];
  protocol: string;
  encryption: string;
  auth: string;
  dataClass: string;
  zoneFrom?: string;
  zoneTo?: string;
  egress: boolean;
  controls: string[];
}

export interface SecurityFinding {
  id: string;
  title: string;
  severity: SecuritySeverity;
  category: string;
  description: string;
  affectedAssets: string[];
  evidence: string;
  standards: string[];
  suggestedFix: string;
  autoFixAvailable: boolean;
  residualRisk: string;
}

export interface Zone {
  id: string;
  name: string;
  type: 'external' | 'dmz' | 'internal' | 'data' | 'management';
  description: string;
  color: string;
}

export interface SecurityRule {
  id: string;
  name: string;
  category: string;
  severity: SecuritySeverity;
  description: string;
  condition: string;
  fix: string;
  standards: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  components: ArchComponent[];
  connections: Connection[];
  zones: Zone[];
  findings: SecurityFinding[];
  lastAnalysis?: Date;
}