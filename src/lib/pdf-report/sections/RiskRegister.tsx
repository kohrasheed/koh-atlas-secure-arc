import React from 'react';
import { Page, Text, View } from '@react-pdf/renderer';
import { styles } from '../styles';
import type { ReportData } from '../types';

interface RiskRegisterProps {
  data: ReportData;
  pageNumber: number;
}

export const RiskRegister: React.FC<RiskRegisterProps> = ({ data, pageNumber }) => {
  // Calculate risk scores for findings
  const riskMapping = {
    'critical': { likelihood: 'High', impact: 'High', score: 9 },
    'high': { likelihood: 'High', impact: 'Medium', score: 6 },
    'medium': { likelihood: 'Medium', impact: 'Medium', score: 4 },
    'low': { likelihood: 'Low', impact: 'Low', score: 2 }
  };
  
  const riskRegister = data.findings.map((finding, idx) => {
    const severity = finding.severity.toLowerCase();
    const risk = riskMapping[severity as keyof typeof riskMapping] || riskMapping.low;
    
    return {
      id: `R-${String(idx + 1).padStart(3, '0')}`,
      description: finding.title,
      category: finding.category,
      likelihood: risk.likelihood,
      impact: risk.impact,
      score: risk.score,
      owner: 'Security Team',
      status: 'Open',
      affected: finding.affected.length > 0 ? finding.affected.join(', ') : 'Architecture-wide'
    };
  });
  
  // Sort by risk score descending
  const sortedRisks = riskRegister.sort((a, b) => b.score - a.score);
  
  // Split into pages (max 15 per page)
  const risksPerPage = 15;
  const totalPages = Math.ceil(sortedRisks.length / risksPerPage);
  
  const pages: JSX.Element[] = [];
  
  for (let i = 0; i < totalPages; i++) {
    const startIdx = i * risksPerPage;
    const endIdx = Math.min(startIdx + risksPerPage, sortedRisks.length);
    const pageRisks = sortedRisks.slice(startIdx, endIdx);
    
    pages.push(
      <Page key={`risk-${i}`} size="A4" style={styles.page}>
        {i === 0 && (
          <>
            <Text style={styles.sectionTitle}>Risk Register</Text>
            
            <View style={styles.paragraph}>
              <Text>
                The risk register catalogs all identified security risks with their likelihood, impact, 
                and calculated risk scores. Risks are prioritized based on their potential business impact 
                and likelihood of occurrence.
              </Text>
            </View>
            
            <View style={styles.infoBox}>
              <Text style={[styles.bold, { marginBottom: 4 }]}>Risk Scoring Matrix</Text>
              <Text style={{ fontSize: 9 }}>
                Risk Score = Likelihood × Impact (Scale: 1-9){'\n'}
                • Critical (9): High likelihood, High impact{'\n'}
                • High (6): High likelihood, Medium impact{'\n'}
                • Medium (4): Medium likelihood, Medium impact{'\n'}
                • Low (1-2): Low likelihood, Low impact
              </Text>
            </View>
          </>
        )}
        
        {i > 0 && (
          <Text style={styles.subsectionTitle}>
            Risk Register (Continued) - {startIdx + 1} to {endIdx} of {sortedRisks.length}
          </Text>
        )}
        
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, { flex: 0.7 }]}>ID</Text>
            <Text style={[styles.tableCell, { flex: 2.5 }]}>Risk Description</Text>
            <Text style={[styles.tableCell, { flex: 0.8, textAlign: 'center' }]}>L</Text>
            <Text style={[styles.tableCell, { flex: 0.8, textAlign: 'center' }]}>I</Text>
            <Text style={[styles.tableCell, { flex: 0.6, textAlign: 'center' }]}>Score</Text>
            <Text style={[styles.tableCell, { flex: 1.2 }]}>Owner</Text>
            <Text style={[styles.tableCell, { flex: 0.8 }]}>Status</Text>
          </View>
          {pageRisks.map((risk) => (
            <View key={risk.id} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 0.7, fontSize: 8, fontWeight: 'bold' }]}>
                {risk.id}
              </Text>
              <Text style={[styles.tableCell, { flex: 2.5, fontSize: 8 }]}>
                {risk.description}
              </Text>
              <Text style={[styles.tableCell, { flex: 0.8, textAlign: 'center', fontSize: 8 }]}>
                {risk.likelihood.charAt(0)}
              </Text>
              <Text style={[styles.tableCell, { flex: 0.8, textAlign: 'center', fontSize: 8 }]}>
                {risk.impact.charAt(0)}
              </Text>
              <View style={[styles.tableCell, { flex: 0.6, alignItems: 'center' }]}>
                <View style={[
                  styles.badge,
                  risk.score >= 9 ? styles.badgeCritical :
                  risk.score >= 6 ? styles.badgeHigh :
                  risk.score >= 4 ? styles.badgeMedium :
                  styles.badgeLow
                ]}>
                  <Text style={{ fontSize: 7 }}>{risk.score}</Text>
                </View>
              </View>
              <Text style={[styles.tableCell, { flex: 1.2, fontSize: 8 }]}>
                {risk.owner}
              </Text>
              <Text style={[styles.tableCell, { flex: 0.8, fontSize: 8 }]}>
                {risk.status}
              </Text>
            </View>
          ))}
        </View>
        
        <View style={styles.footer}>
          <Text>Koh Atlas - Secure Architecture Analyzer</Text>
          <Text>Page {pageNumber + i}</Text>
        </View>
      </Page>
    );
  }
  
  return <>{pages}</>;
};
