import { AttackPath, STRIDEAnalysis } from './attack-simulation';
import { Node } from '@xyflow/react';

// Use render proxy endpoint for Claude API calls
const PROXY_ENDPOINT = 'https://koh-atlas-secure-arc.onrender.com/api/anthropic';

// Use the same model as AI recommendations for consistency
const CLAUDE_MODEL = 'claude-sonnet-4-5-20250929';

/**
 * Call Claude API via proxy
 */
async function callClaudeAPI(messages: any[], maxTokens: number = 4096, temperature: number = 0.3) {
  try {
    console.log('[Claude API] Making request to:', PROXY_ENDPOINT);
    console.log('[Claude API] Using model:', CLAUDE_MODEL);
    
    const response = await fetch(PROXY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: maxTokens,
        temperature,
        messages
      })
    });

    console.log('[Claude API] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Claude API] Error response:', errorText);
      throw new Error(`Claude API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    console.log('[Claude API] Response received successfully');
    return data;
  } catch (error) {
    console.error('[Claude API] Request failed:', error);
    throw error;
  }
}

/**
 * Clean and parse JSON response from Claude
 */
function parseClaudeJSON(text: string): any {
  try {
    console.log('[Claude Parse] Original length:', text.length);
    
    // Remove markdown code blocks if present
    let cleaned = text.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.substring(7);
    }
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.substring(3);
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.substring(0, cleaned.length - 3);
    }
    cleaned = cleaned.trim();
    
    console.log('[Claude Parse] Cleaned length:', cleaned.length);
    const parsed = JSON.parse(cleaned);
    console.log('[Claude Parse] Successfully parsed JSON');
    return parsed;
  } catch (error) {
    console.error('[Claude Parse] Failed to parse:', error);
    console.error('[Claude Parse] Text was:', text.substring(0, 500));
    throw new Error('Failed to parse Claude response as JSON');
  }
}

/**
 * Abstraction level for Claude API calls
 */
export type AbstractionLevel = 'full' | 'abstracted' | 'confidential';

/**
 * Sanitize architecture data based on abstraction level
 */
function sanitizeArchitecture(
  nodes: Node[],
  level: AbstractionLevel
): { nodes: any[], preserveLabels: boolean } {
  if (level === 'full') {
    return { 
      nodes: nodes.map(n => ({
        id: n.id,
        type: n.data.type,
        zone: n.data.zone,
        label: n.data.label,
        gcpService: n.data.gcpService,
        features: n.data.features
      })),
      preserveLabels: true
    };
  }
  
  if (level === 'abstracted') {
    return {
      nodes: nodes.map(n => ({
        id: n.id,
        type: n.data.type,
        zone: n.data.zone,
        gcpService: typeof n.data.gcpService === 'string' ? n.data.gcpService.replace(/[A-Z]/g, 'X') : undefined, // Mask service names
        features: n.data.features
      })),
      preserveLabels: false
    };
  }
  
  // Confidential - only send types and zones
  return {
    nodes: nodes.map(n => ({
      id: n.id,
      type: n.data.type,
      zone: n.data.zone
    })),
    preserveLabels: false
  };
}

/**
 * Analyze attack paths using Claude API
 */
export async function analyzeAttackPathsWithClaude(
  attackPaths: AttackPath[],
  nodes: Node[],
  abstractionLevel: AbstractionLevel = 'abstracted'
): Promise<{
  analysis: string;
  prioritizedPaths: AttackPath[];
  additionalVulnerabilities: string[];
  recommendations: string[];
}> {
  try {
    const sanitized = sanitizeArchitecture(nodes, abstractionLevel);
    
    // Build prompt with abstracted data
    const pathDescriptions = attackPaths.slice(0, 10).map(p => ({
      id: p.id,
      type: p.attackType,
      threat: p.threatCategory,
      riskScore: p.riskScore,
      path: sanitized.preserveLabels ? p.pathLabels : p.path,
      vulnerabilities: p.vulnerabilities,
      mitigations: p.mitigations
    }));
    
    const prompt = `You are a cybersecurity expert analyzing cloud architecture security.

ARCHITECTURE OVERVIEW:
${JSON.stringify(sanitized.nodes, null, 2)}

IDENTIFIED ATTACK PATHS (${attackPaths.length} total, showing top 10):
${JSON.stringify(pathDescriptions, null, 2)}

TASK:
1. Analyze these attack paths for additional vulnerabilities not already identified
2. Prioritize the paths by actual exploitability (not just risk score)
3. Identify any chained attacks that combine multiple paths
4. Provide specific, actionable mitigation recommendations

Format your response as JSON:
{
  "analysis": "Brief executive summary of the security posture",
  "additionalVulnerabilities": ["vulnerability 1", "vulnerability 2", ...],
  "prioritizedPathIds": ["path-id-1", "path-id-2", ...],
  "recommendations": ["recommendation 1", "recommendation 2", ...]
}`;

    const response = await callClaudeAPI([{
      role: 'user',
      content: prompt
    }], 4096, 0.3);

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude API');
    }

    // Parse Claude's response
    const result = parseClaudeJSON(content.text);
    
    // Reorder attack paths based on Claude's prioritization
    const prioritizedPaths = result.prioritizedPathIds
      .map((id: string) => attackPaths.find(p => p.id === id))
      .filter(Boolean) as AttackPath[];
    
    // Add any non-prioritized paths at the end
    const remainingPaths = attackPaths.filter(
      p => !result.prioritizedPathIds.includes(p.id)
    );
    
    return {
      analysis: result.analysis,
      prioritizedPaths: [...prioritizedPaths, ...remainingPaths],
      additionalVulnerabilities: result.additionalVulnerabilities || [],
      recommendations: result.recommendations || []
    };
  } catch (error) {
    console.error('Claude API analysis failed:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // Fallback to basic analysis
    return {
      analysis: `AI analysis unavailable. Showing basic attack path analysis.\n\nError: ${error instanceof Error ? error.message : String(error)}`,
      prioritizedPaths: attackPaths,
      additionalVulnerabilities: [],
      recommendations: [
        'Review all critical and high-risk attack paths',
        'Enable comprehensive logging and monitoring',
        'Implement zero-trust security model'
      ]
    };
  }
}

/**
 * Analyze STRIDE threats using Claude API
 */
export async function analyzeSTRIDEWithClaude(
  strideAnalysis: STRIDEAnalysis[],
  nodes: Node[],
  abstractionLevel: AbstractionLevel = 'abstracted'
): Promise<{
  analysis: string;
  prioritizedThreats: { nodeId: string; threat: string; severity: 'critical' | 'high' | 'medium' | 'low' }[];
  recommendations: string[];
}> {
  try {
    const sanitized = sanitizeArchitecture(nodes, abstractionLevel);
    
    // Top 20 nodes by threat count
    const topThreats = strideAnalysis.slice(0, 20).map(s => ({
      nodeId: s.nodeId,
      nodeType: nodes.find(n => n.id === s.nodeId)?.data.type,
      nodeZone: nodes.find(n => n.id === s.nodeId)?.data.zone,
      threats: s.threats,
      totalThreats: s.totalThreats
    }));
    
    const prompt = `You are a cybersecurity expert performing STRIDE threat modeling.

ARCHITECTURE COMPONENTS:
${JSON.stringify(sanitized.nodes, null, 2)}

STRIDE ANALYSIS (${strideAnalysis.length} components, showing top 20):
${JSON.stringify(topThreats, null, 2)}

TASK:
1. Identify the most critical threats that should be addressed first
2. Assign severity levels (critical/high/medium/low) to each threat
3. Provide specific mitigation strategies for top threats
4. Identify any systemic issues affecting multiple components

Format response as JSON:
{
  "analysis": "Executive summary of STRIDE findings",
  "prioritizedThreats": [
    {"nodeId": "n1", "threat": "threat description", "severity": "critical"},
    ...
  ],
  "recommendations": ["recommendation 1", ...]
}`;

    const response = await callClaudeAPI([{
      role: 'user',
      content: prompt
    }], 4096, 0.3);

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude API');
    }

    const result = parseClaudeJSON(content.text);
    
    return {
      analysis: result.analysis,
      prioritizedThreats: result.prioritizedThreats || [],
      recommendations: result.recommendations || []
    };
  } catch (error) {
    console.error('Claude STRIDE analysis failed:', error);
    
    return {
      analysis: 'AI analysis unavailable. Showing basic STRIDE analysis.',
      prioritizedThreats: [],
      recommendations: [
        'Address all identified STRIDE threats systematically',
        'Prioritize fixing spoofing and elevation of privilege issues',
        'Implement defense in depth strategy'
      ]
    };
  }
}

/**
 * Generate comprehensive security report using Claude
 */
export async function generateSecurityReport(
  attackPaths: AttackPath[],
  strideAnalysis: STRIDEAnalysis[],
  nodes: Node[],
  abstractionLevel: AbstractionLevel = 'abstracted'
): Promise<string> {
  try {
    const sanitized = sanitizeArchitecture(nodes, abstractionLevel);
    
    const prompt = `You are a senior security architect creating an executive security assessment report.

ARCHITECTURE:
- Total components: ${nodes.length}
- Edge components: ${nodes.filter(n => n.data.zone === 'Edge').length}
- Data stores: ${nodes.filter(n => n.data.type === 'database' || n.data.type === 'object-storage').length}
- Compute resources: ${nodes.filter(n => n.data.type === 'kubernetes-cluster' || n.data.type === 'container-service').length}

ATTACK SIMULATION RESULTS:
- Total attack paths identified: ${attackPaths.length}
- Critical risk paths: ${attackPaths.filter(p => p.riskScore >= 70).length}
- High risk paths: ${attackPaths.filter(p => p.riskScore >= 50 && p.riskScore < 70).length}
- Medium risk paths: ${attackPaths.filter(p => p.riskScore >= 30 && p.riskScore < 50).length}

STRIDE ANALYSIS:
- Components with threats: ${strideAnalysis.length}
- Most common threat category: ${getMostCommonThreatCategory(strideAnalysis)}

Create a professional security assessment report in Markdown format with:
1. Executive Summary (2-3 sentences)
2. Risk Overview (overall posture assessment)
3. Top 5 Critical Findings
4. Recommended Actions (prioritized)
5. Compliance Considerations (GDPR, SOC 2, ISO 27001)

Keep it concise and actionable.`;

    const response = await callClaudeAPI([{
      role: 'user',
      content: prompt
    }], 8192, 0.5);

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude API');
    }

    return content.text;
  } catch (error) {
    console.error('Claude report generation failed:', error);
    
    // Fallback report
    return generateFallbackReport(attackPaths, strideAnalysis, nodes);
  }
}

function getMostCommonThreatCategory(strideAnalysis: STRIDEAnalysis[]): string {
  const counts: Record<string, number> = {};
  
  strideAnalysis.forEach(s => {
    Object.entries(s.threats).forEach(([category, threats]) => {
      if (threats.length > 0) {
        counts[category] = (counts[category] || 0) + threats.length;
      }
    });
  });
  
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] || 'None';
}

function generateFallbackReport(
  attackPaths: AttackPath[],
  strideAnalysis: STRIDEAnalysis[],
  nodes: Node[]
): string {
  const criticalCount = attackPaths.filter(p => p.riskScore >= 70).length;
  const highCount = attackPaths.filter(p => p.riskScore >= 50 && p.riskScore < 70).length;
  
  return `# Security Assessment Report

## Executive Summary

This architecture contains ${nodes.length} components with ${attackPaths.length} potential attack paths identified. ${criticalCount} critical-risk and ${highCount} high-risk paths require immediate attention.

## Risk Overview

- **Overall Risk Level**: ${criticalCount > 0 ? 'HIGH' : highCount > 5 ? 'MEDIUM' : 'LOW'}
- **Attack Surface**: ${nodes.filter(n => n.data.zone === 'Edge').length} internet-facing components
- **Critical Assets**: ${nodes.filter(n => n.data.type === 'database' || n.data.type === 'secrets-vault').length} data stores

## Top Critical Findings

${attackPaths.slice(0, 5).map((p, i) => `${i + 1}. **${p.name}** (Risk: ${p.riskScore}/100)
   - ${p.description}
   - Vulnerabilities: ${p.vulnerabilities.slice(0, 2).join(', ')}`).join('\n\n')}

## Recommended Actions

1. Address all critical-risk attack paths immediately
2. Implement comprehensive encryption (TLS 1.3+)
3. Enforce IAM-based authentication everywhere
4. Enable audit logging for all data access
5. Deploy DDoS protection at edge

## Compliance Considerations

- **GDPR**: Ensure data encryption and access logging for EU data
- **SOC 2**: Enable comprehensive audit trails
- **ISO 27001**: Implement security monitoring and incident response

---
*Report generated: ${new Date().toISOString()}*
`;
}
