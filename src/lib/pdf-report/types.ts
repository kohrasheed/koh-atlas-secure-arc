/**
 * PDF Report Type Definitions
 */

export interface ReportData {
  // Metadata
  projectName: string;
  reportDate: string;
  reportId: string;
  classification: 'Confidential' | 'Internal' | 'Public';
  preparedBy: string;
  
  // Architecture data
  nodes: any[];
  edges: any[];
  diagramImage?: string;
  
  // Analysis results
  findings: ReportSecurityFinding[];
  strideThreats: ReportSTRIDEThreat[];
  complianceResults: ReportComplianceResult[];
  attackPaths: any[];
  validationResult: any;
  
  // Scores
  score: number;
  complianceScore: Record<string, ComplianceScore>;
  overallScore: number;
  
  // Statistics
  totalComponents: number;
  totalConnections: number;
  criticalIssues: number;
  highIssues: number;
  mediumIssues: number;
  lowIssues: number;
  
  // AI analysis flag
  aiAnalysis: boolean;
}

export interface ReportSecurityFinding {
  title: string;
  severity: string;
  category: string;
  description: string;
  affected: string[];
  standards?: string[];
  risk?: string;
  remediation?: string;
  targetState?: string;
  effort?: string;
  priority?: string;
  isAIEnhanced?: boolean;
}

export interface ReportSTRIDEThreat {
  component: string;
  category: string;
  description: string;
  likelihood: string;
  impact: string;
  mitigation?: string;
  status: string;
}

export interface ReportComplianceResult {
  framework: string;
  control: string;
  requirement: string;
  status: 'pass' | 'fail' | 'not-applicable';
  findings: string[];
}

export interface ReportAttackPath {
  id: string;
  name: string;
  steps: string[];
  impact: string;
  likelihood: string;
  mitigations: string[];
}

export interface ReportValidationResult {
  valid: boolean;
  score: number;
  issues: ValidationIssue[];
  summary: {
    errors: number;
    warnings: number;
    infos: number;
  };
}

export interface ValidationIssue {
  id: string;
  severity: 'error' | 'warning' | 'info';
  title: string;
  description: string;
  category: string;
  recommendation: string;
}
export interface ComplianceScore {
  percentage: number;
  status: 'pass' | 'fail' | 'partial';
  passed: number;
  total: number;
} status: 'Compliant' | 'Needs Work' | 'Non-Compliant';
}

export interface ZoneStats {
  zone: string;
  componentCount: number;
  issues: number;
}

export interface TechnologyStack {
  category: string;
  items: string[];
}
