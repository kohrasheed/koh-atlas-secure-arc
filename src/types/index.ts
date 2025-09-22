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

export interface CustomComponent {
  type: string;
  label: string;
  category: 'application' | 'security' | 'network' | 'data' | 'container' | 'custom';
  color: string;
  isContainer?: boolean;
  description?: string;
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
}

export interface SecurityEdgeControl {
  type: string;
  label: string;
  icon: React.ReactElement;
  color: string;
}