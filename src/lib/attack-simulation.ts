import { Node, Edge } from '@xyflow/react';

export type AttackType = 
  | 'ddos'
  | 'injection'
  | 'exfiltration'
  | 'lateral-movement'
  | 'privilege-escalation'
  | 'misconfiguration'
  | 'credential-theft';

export type ThreatCategory = 
  | 'spoofing'
  | 'tampering'
  | 'repudiation'
  | 'information-disclosure'
  | 'denial-of-service'
  | 'elevation-of-privilege';

export interface AttackPath {
  id: string;
  name: string;
  path: string[]; // Node IDs
  pathLabels: string[]; // Node labels for display
  attackType: AttackType;
  threatCategory: ThreatCategory;
  likelihood: number; // 1-10
  impact: number; // 1-10
  riskScore: number; // likelihood × impact
  mitigations: string[];
  vulnerabilities: string[];
  description: string;
}

export interface STRIDEAnalysis {
  nodeId: string;
  nodeLabel: string;
  threats: {
    spoofing: string[];
    tampering: string[];
    repudiation: string[];
    informationDisclosure: string[];
    denialOfService: string[];
    elevationOfPrivilege: string[];
  };
  totalThreats: number;
}

export interface AttackSimulationResult {
  totalPaths: number;
  criticalRisks: AttackPath[];
  highRisks: AttackPath[];
  mediumRisks: AttackPath[];
  lowRisks: AttackPath[];
  overallRiskScore: number;
  strideAnalysis: STRIDEAnalysis[];
  recommendations: string[];
  timestamp: string;
}

/**
 * Discovers all possible attack paths from entry points to critical assets
 */
export function discoverAttackPaths(
  nodes: Node[],
  edges: Edge[]
): AttackPath[] {
  const paths: AttackPath[] = [];
  
  // 1. Find entry points (internet-facing components)
  const entryPoints = nodes.filter(n => 
    n.data.zone === 'Edge' || 
    n.data.zone === 'Edge Security' ||
    n.data.type === 'cdn' || 
    n.data.type === 'load-balancer-global' ||
    n.data.type === 'firewall'
  );
  
  // 2. Find critical assets (data stores and sensitive services)
  const criticalAssets = nodes.filter(n =>
    n.data.type === 'database' || 
    n.data.type === 'object-storage' ||
    n.data.type === 'secrets-vault' ||
    n.data.type === 'cache' ||
    n.data.zone === 'Data'
  );
  
  // 3. Find all paths from entry points to critical assets
  entryPoints.forEach(entry => {
    criticalAssets.forEach(asset => {
      const allPaths = findAllPaths(entry.id, asset.id, edges, nodes);
      allPaths.forEach(path => {
        const attackPath = analyzeAttackPath(path, nodes, edges);
        if (attackPath) {
          paths.push(attackPath);
        }
      });
    });
  });
  
  // 4. Also check for lateral movement paths (between compute resources)
  const computeNodes = nodes.filter(n => 
    n.data.type === 'kubernetes-cluster' || 
    n.data.type === 'container-service'
  );
  
  computeNodes.forEach(source => {
    criticalAssets.forEach(asset => {
      const lateralPaths = findAllPaths(source.id, asset.id, edges, nodes);
      lateralPaths.forEach(path => {
        const attackPath = analyzeAttackPath(path, nodes, edges);
        if (attackPath && attackPath.attackType === 'lateral-movement') {
          paths.push(attackPath);
        }
      });
    });
  });
  
  return paths.sort((a, b) => b.riskScore - a.riskScore);
}

/**
 * Find all paths between two nodes using BFS
 */
function findAllPaths(
  startId: string,
  endId: string,
  edges: Edge[],
  nodes: Node[],
  maxDepth: number = 10
): string[][] {
  const paths: string[][] = [];
  const visited = new Set<string>();
  
  function dfs(currentId: string, path: string[], depth: number) {
    if (depth > maxDepth) return;
    if (currentId === endId) {
      paths.push([...path, currentId]);
      return;
    }
    
    if (visited.has(currentId)) return;
    visited.add(currentId);
    
    // Find all outgoing edges from current node
    const outgoing = edges.filter(e => e.source === currentId);
    outgoing.forEach(edge => {
      dfs(edge.target, [...path, currentId], depth + 1);
    });
    
    visited.delete(currentId);
  }
  
  dfs(startId, [], 0);
  return paths.filter(p => p.length > 1); // Only return paths with at least 2 nodes
}

/**
 * Analyzes a path for vulnerabilities and calculates risk
 */
function analyzeAttackPath(
  path: string[],
  nodes: Node[],
  edges: Edge[]
): AttackPath | null {
  if (path.length < 2) return null;
  
  const vulnerabilities: string[] = [];
  const mitigations: string[] = [];
  const pathLabels: string[] = [];
  
  // Get path labels
  path.forEach(nodeId => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      pathLabels.push(String(node.data.label || nodeId));
    }
  });
  
  // Check each hop for security controls
  for (let i = 0; i < path.length - 1; i++) {
    const sourceId = path[i];
    const targetId = path[i + 1];
    const edge = edges.find(e => e.source === sourceId && e.target === targetId);
    const sourceNode = nodes.find(n => n.id === sourceId);
    const targetNode = nodes.find(n => n.id === targetId);
    
    if (!edge || !sourceNode || !targetNode) continue;
    
    // Check encryption
    const edgeLabel = typeof edge.label === 'string' ? edge.label : '';
    const hasEncryption = edgeLabel.includes('TLS') || 
                          edgeLabel.includes('mTLS') || 
                          edgeLabel.includes('HTTPS');
    
    if (!hasEncryption) {
      vulnerabilities.push(`No encryption between ${String(sourceNode.data.label)} and ${String(targetNode.data.label)}`);
    } else {
      mitigations.push(`Encrypted connection: ${edgeLabel}`);
    }
    
    // Check authentication
    const hasAuth = edgeLabel.includes('IAM') || 
                    edgeLabel.includes('AUTH') || 
                    edgeLabel.includes('JWT');
    
    if (!hasAuth) {
      vulnerabilities.push(`Weak authentication between ${String(sourceNode.data.label)} and ${String(targetNode.data.label)}`);
    } else {
      mitigations.push(`Strong authentication: ${edgeLabel}`);
    }
    
    // Check for security components
    if (targetNode.data.type === 'firewall') {
      mitigations.push(`WAF protection: ${String(targetNode.data.label)}`);
    }
    
    if (targetNode.data.type === 'service-mesh') {
      mitigations.push(`Service mesh mTLS: ${String(targetNode.data.label)}`);
    }
    
    if (targetNode.data.type === 'security-service') {
      mitigations.push(`Security control: ${String(targetNode.data.label)}`);
    }
  }
  
  // Determine attack type and threat category
  const attackType = determineAttackType(path, nodes, edges);
  const threatCategory = determineThreatCategory(attackType, vulnerabilities);
  
  // Calculate risk scores
  const likelihood = calculateLikelihood(vulnerabilities.length, mitigations.length, path.length);
  const impact = calculateImpact(path[path.length - 1], nodes);
  const riskScore = likelihood * impact;
  
  // Generate description
  const description = generateAttackDescription(pathLabels, attackType, vulnerabilities);
  
  return {
    id: `attack-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: `${attackTypeToString(attackType)}: ${pathLabels[0]} → ${pathLabels[pathLabels.length - 1]}`,
    path,
    pathLabels,
    attackType,
    threatCategory,
    likelihood,
    impact,
    riskScore,
    mitigations,
    vulnerabilities,
    description
  };
}

/**
 * Determines the attack type based on the path
 */
function determineAttackType(
  path: string[],
  nodes: Node[],
  edges: Edge[]
): AttackType {
  const startNode = nodes.find(n => n.id === path[0]);
  const endNode = nodes.find(n => n.id === path[path.length - 1]);
  
  if (!startNode || !endNode) return 'misconfiguration';
  
  // Check if starting from edge (external attack)
  const isExternalAttack = startNode.data.zone === 'Edge' || 
                           startNode.data.zone === 'Edge Security';
  
  // Check if targeting data
  const isDataTarget = endNode.data.type === 'database' || 
                       endNode.data.type === 'object-storage' ||
                       endNode.data.type === 'secrets-vault';
  
  // Check if lateral movement (compute to compute)
  const isLateralMovement = (startNode.data.type === 'kubernetes-cluster' || 
                             startNode.data.type === 'container-service') &&
                            (endNode.data.type === 'database' || 
                             endNode.data.type === 'object-storage');
  
  if (isExternalAttack && isDataTarget) {
    return 'exfiltration';
  }
  
  if (isLateralMovement) {
    return 'lateral-movement';
  }
  
  if (startNode.data.type === 'load-balancer-global' || startNode.data.type === 'cdn') {
    return 'ddos';
  }
  
  if (endNode.data.type === 'secrets-vault') {
    return 'credential-theft';
  }
  
  return 'injection';
}

/**
 * Maps attack type to STRIDE threat category
 */
function determineThreatCategory(
  attackType: AttackType,
  vulnerabilities: string[]
): ThreatCategory {
  const vulnText = vulnerabilities.join(' ').toLowerCase();
  
  if (attackType === 'credential-theft' || vulnText.includes('authentication')) {
    return 'spoofing';
  }
  
  if (attackType === 'injection' || vulnText.includes('encryption')) {
    return 'tampering';
  }
  
  if (attackType === 'exfiltration') {
    return 'information-disclosure';
  }
  
  if (attackType === 'ddos') {
    return 'denial-of-service';
  }
  
  if (attackType === 'privilege-escalation' || attackType === 'lateral-movement') {
    return 'elevation-of-privilege';
  }
  
  return 'tampering';
}

/**
 * Calculate likelihood score (1-10)
 */
function calculateLikelihood(
  vulnCount: number,
  mitigationCount: number,
  pathLength: number
): number {
  // More vulnerabilities = higher likelihood
  // More mitigations = lower likelihood
  // Longer path = lower likelihood (harder to exploit)
  
  const baseScore = Math.min(10, vulnCount * 2);
  const mitigationPenalty = Math.min(5, mitigationCount * 0.5);
  const lengthPenalty = Math.min(3, (pathLength - 2) * 0.3);
  
  const score = Math.max(1, baseScore - mitigationPenalty - lengthPenalty);
  return Math.round(score * 10) / 10;
}

/**
 * Calculate impact score (1-10)
 */
function calculateImpact(targetId: string, nodes: Node[]): number {
  const target = nodes.find(n => n.id === targetId);
  if (!target) return 5;
  
  // Critical assets have high impact
  if (target.data.type === 'database') return 10;
  if (target.data.type === 'secrets-vault') return 10;
  if (target.data.type === 'object-storage') return 8;
  if (target.data.type === 'cache') return 6;
  if (target.data.type === 'kubernetes-cluster') return 7;
  
  return 5;
}

/**
 * Generate human-readable attack description
 */
function generateAttackDescription(
  pathLabels: string[],
  attackType: AttackType,
  vulnerabilities: string[]
): string {
  const typeDescriptions: Record<AttackType, string> = {
    'ddos': 'Distributed Denial of Service attack overwhelming the system',
    'injection': 'Code injection attack exploiting input validation weaknesses',
    'exfiltration': 'Data exfiltration attack stealing sensitive information',
    'lateral-movement': 'Lateral movement after initial compromise',
    'privilege-escalation': 'Privilege escalation to gain higher access',
    'misconfiguration': 'Exploiting security misconfigurations',
    'credential-theft': 'Credential theft to steal authentication tokens'
  };
  
  let desc = `${typeDescriptions[attackType]} through path: ${pathLabels.join(' → ')}. `;
  
  if (vulnerabilities.length > 0) {
    desc += `Exploits: ${vulnerabilities.slice(0, 2).join(', ')}`;
    if (vulnerabilities.length > 2) {
      desc += ` and ${vulnerabilities.length - 2} more`;
    }
  }
  
  return desc;
}

/**
 * Convert attack type to display string
 */
function attackTypeToString(type: AttackType): string {
  return type.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

/**
 * Perform STRIDE analysis on all nodes
 */
export function performSTRIDEAnalysis(nodes: Node[]): STRIDEAnalysis[] {
  return nodes.map(node => {
    const threats = analyzeNodeThreats(node);
    const totalThreats = Object.values(threats).reduce((sum, arr) => sum + arr.length, 0);
    
    return {
      nodeId: node.id,
      nodeLabel: String(node.data.label || node.id),
      threats,
      totalThreats
    };
  }).filter(analysis => analysis.totalThreats > 0)
    .sort((a, b) => b.totalThreats - a.totalThreats);
}

/**
 * Analyze individual node for STRIDE threats
 */
function analyzeNodeThreats(node: Node) {
  const threats = {
    spoofing: [] as string[],
    tampering: [] as string[],
    repudiation: [] as string[],
    informationDisclosure: [] as string[],
    denialOfService: [] as string[],
    elevationOfPrivilege: [] as string[]
  };
  
  const features = Array.isArray(node.data.features) ? node.data.features : [];
  const featureSet = new Set(features.map((f: any) => String(f).toLowerCase()));
  
  // Spoofing threats
  if (!featureSet.has('iam auth') && !featureSet.has('iam authentication') && !featureSet.has('workload identity')) {
    threats.spoofing.push('Missing IAM-based authentication');
  }
  if (!featureSet.has('mfa') && node.data.type === 'identity-service') {
    threats.spoofing.push('MFA not enforced');
  }
  
  // Tampering threats
  if (!featureSet.has('cmek') && !featureSet.has('encryption')) {
    if (node.data.type === 'database' || node.data.type === 'object-storage' || node.data.type === 'cache') {
      threats.tampering.push('Data not encrypted with CMEK');
    }
  }
  if (node.data.type === 'kubernetes-cluster' && !featureSet.has('binary auth')) {
    threats.tampering.push('Container images not validated');
  }
  
  // Repudiation threats
  if (!featureSet.has('audit logging') && !featureSet.has('logging')) {
    if (node.data.type === 'database' || node.data.type === 'secrets-vault') {
      threats.repudiation.push('No audit logging for access tracking');
    }
  }
  
  // Information Disclosure threats
  if (node.data.type === 'database' && !featureSet.has('private ip')) {
    threats.informationDisclosure.push('Database accessible via public IP');
  }
  if (!featureSet.has('tls') && !featureSet.has('encryption')) {
    threats.informationDisclosure.push('Data transmitted without encryption');
  }
  
  // Denial of Service threats
  if (node.data.zone === 'Edge' && !featureSet.has('ddos protection')) {
    threats.denialOfService.push('No DDoS protection configured');
  }
  if (!featureSet.has('rate limiting') && node.data.type === 'api-gateway') {
    threats.denialOfService.push('No rate limiting to prevent abuse');
  }
  
  // Elevation of Privilege threats
  if (node.data.type === 'kubernetes-cluster' && !featureSet.has('pod security standards')) {
    threats.elevationOfPrivilege.push('No Pod Security Standards enforcement');
  }
  if (!featureSet.has('workload identity') && 
      (node.data.type === 'kubernetes-cluster' || node.data.type === 'container-service')) {
    threats.elevationOfPrivilege.push('Using service account keys instead of Workload Identity');
  }
  
  return threats;
}

/**
 * Generate security recommendations based on attack simulation
 */
export function generateRecommendations(
  attackPaths: AttackPath[],
  strideAnalysis: STRIDEAnalysis[]
): string[] {
  const recommendations = new Set<string>();
  
  // Analyze critical and high-risk paths
  const criticalPaths = attackPaths.filter(p => p.riskScore >= 70);
  const highPaths = attackPaths.filter(p => p.riskScore >= 50 && p.riskScore < 70);
  
  // Common vulnerabilities
  const allVulns = attackPaths.flatMap(p => p.vulnerabilities);
  const encryptionIssues = allVulns.filter(v => v.toLowerCase().includes('encryption'));
  const authIssues = allVulns.filter(v => v.toLowerCase().includes('authentication'));
  
  if (encryptionIssues.length > 0) {
    recommendations.add('🔐 Enable TLS 1.3 encryption for all inter-service communication');
  }
  
  if (authIssues.length > 0) {
    recommendations.add('🔑 Implement IAM-based authentication with Workload Identity');
  }
  
  if (criticalPaths.length > 0) {
    recommendations.add(`⚠️ URGENT: ${criticalPaths.length} critical-risk attack paths identified - prioritize remediation`);
  }
  
  // STRIDE-specific recommendations
  const commonThreats = strideAnalysis
    .flatMap(s => Object.entries(s.threats))
    .reduce((acc, [category, threats]) => {
      threats.forEach(threat => {
        if (!acc.has(threat)) {
          acc.set(threat, { category, count: 1 });
        } else {
          acc.get(threat)!.count++;
        }
      });
      return acc;
    }, new Map<string, { category: string, count: number }>());
  
  // Add top 5 most common threats
  Array.from(commonThreats.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5)
    .forEach(([threat, _]) => {
      recommendations.add(`🛡️ ${threat}`);
    });
  
  // Generic best practices
  if (recommendations.size < 8) {
    recommendations.add('📊 Enable comprehensive logging and monitoring');
    recommendations.add('🔄 Implement automated security scanning in CI/CD');
    recommendations.add('👥 Enforce MFA for all administrative access');
  }
  
  return Array.from(recommendations).slice(0, 10);
}
