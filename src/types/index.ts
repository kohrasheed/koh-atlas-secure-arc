// Type definitions for Koh Atlas

export interface ComponentConfig {
  type: string;
  label: string;
  icon: React.ReactElement;
  category: 'application' | 'security' | 'network' | 'data' | 'container' | 'custom';
  color: string;
  isContainer?: boolean;
}

export interface SecurityFinding {
  id: string;
  title: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  description: string;
  affected: string[];
  recommendation: string;
  standards: string[];
}

export interface AttackPath {
  id: string;
  name: string;
  steps: string[];
  impact: string;
  likelihood: string;
  mitigations: string[];
}

export interface STRIDEThreat {
  id: string;
  category: 'Spoofing' | 'Tampering' | 'Repudiation' | 'Information Disclosure' | 'Denial of Service' | 'Elevation of Privilege';
  componentId: string;
  componentType: string;
  threat: string;
  impact: 'Critical' | 'High' | 'Medium' | 'Low';
  likelihood: 'High' | 'Medium' | 'Low';
  mitigations: string[];
  status: 'Unmitigated' | 'Partially Mitigated' | 'Mitigated';
}

export interface CustomComponent {
  id: string;
  type: string;
  label: string;
  icon: string; // Icon name as string
  category: 'application' | 'security' | 'network' | 'data' | 'container' | 'custom';
  color: string;
  description?: string;
  isContainer?: boolean;
  ports?: number[];
  protocols?: string[];
  vendor?: string;
  version?: string;
  tags?: string[];
  created: string;
  author?: string;
}

export interface ProtocolConfig {
  port: number;
  description: string;
}

export interface ConnectionData {
  protocol: string;
  port: number;
  encryption: string;
  sourceLabel?: string;
  targetLabel?: string;
  description?: string;
}

export interface PerformanceMetrics {
  latency?: {
    p50: number;
    p95: number;
    p99: number;
  };
  throughput?: {
    current: number;
    max: number;
    unit: 'rps' | 'mbps' | 'tps';
  };
  cost?: {
    monthly: number;
    currency: string;
    breakdown?: {
      compute: number;
      storage: number;
      network: number;
    };
  };
  resources?: {
    cpu: number;
    memory: number;
    disk: number;
  };
  sla?: {
    uptime: number;
    target: number;
    incidents: number;
  };
}

export interface ConnectionMetrics {
  latency: number;
  bandwidth: number;
  errorRate: number;
  isBottleneck: boolean;
  packetLoss?: number;
}

export interface NodeData {
  type: string;
  label: string;
  zone?: string;
  isHighlighted?: boolean;
  cidr?: string;
  description?: string;
  associatedVpc?: string;
  width?: number;
  height?: number;
  // Performance metrics
  metrics?: PerformanceMetrics;
  // Advanced styling
  gradient?: { from: string; to: string; direction?: string };
  shadow?: string;
  statusBadge?: { text: string; color: 'green' | 'yellow' | 'red' | 'blue' | 'gray' };
  environment?: 'dev' | 'staging' | 'prod';
}

export interface SecurityEdgeControl {
  type: string;
  label: string;
  icon: React.ReactElement;
  color: string;
}