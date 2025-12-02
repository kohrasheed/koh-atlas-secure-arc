import React from 'react';
import { Page, Text, View } from '@react-pdf/renderer';
import { styles } from '../styles';
import type { ReportData } from '../types';

interface ExecutiveSummaryProps {
  data: ReportData;
  pageNumber: number;
}

export const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({ data, pageNumber }) => {
  const topFindings = data.findings
    .filter(f => f.severity === 'High')
    .slice(0, 5);
  
  const riskLevel = data.criticalIssues > 0 ? 'Critical' :
                   data.highIssues > 5 ? 'High' :
                   data.highIssues > 0 ? 'Medium' : 'Low';
  
  const totalFindings = data.findings.length;
  const aiEnhancedCount = data.findings.filter(f => f.isAIPowered).length;
  
  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.sectionTitle}>Executive Summary</Text>
      
      <View style={styles.paragraph}>
        <Text>
          This report presents a comprehensive security analysis of the <Text style={styles.bold}>{data.projectName}</Text> architecture. 
          The analysis identified <Text style={styles.bold}>{totalFindings} security findings</Text> across{' '}
          <Text style={styles.bold}>{data.totalComponents} components</Text> and{' '}
          <Text style={styles.bold}>{data.totalConnections} connections</Text>. The overall architecture security score is{' '}
          <Text style={styles.bold}>{data.overallScore}/100</Text>, indicating{' '}
          <Text style={styles.bold}>{riskLevel.toLowerCase()} risk level</Text>.
        </Text>
      </View>
      
      {aiEnhancedCount > 0 && (
        <View style={styles.infoBox}>
          <Text style={{ fontSize: 9, fontWeight: 'bold', marginBottom: 4 }}>
            AI-Enhanced Analysis
          </Text>
          <Text style={{ fontSize: 9 }}>
            {aiEnhancedCount} findings were enhanced with AI-powered recommendations using advanced 
            security pattern recognition and best practices from the AWS Well-Architected Framework.
          </Text>
        </View>
      )}
      
      <Text style={styles.subsectionTitle}>Key Findings</Text>
      
      {topFindings.length === 0 ? (
        <View style={styles.successBox}>
          <Text style={{ fontSize: 10, fontWeight: 'bold' }}>
            ✓ No critical or high-severity issues found
          </Text>
          <Text style={{ fontSize: 9, marginTop: 4 }}>
            The architecture follows security best practices and demonstrates strong security controls.
          </Text>
        </View>
      ) : (
        topFindings.map((finding, index) => (
          <View key={finding.id} style={{ marginBottom: 8 }}>
            <Text style={styles.paragraph}>
              <Text style={styles.bold}>{index + 1}. {finding.title}</Text>
              {' '}
              <Text style={[styles.badge, styles.badgeHigh]}>
                {finding.severity.toUpperCase()}
              </Text>
              {finding.isAIPowered && (
                <Text style={[styles.badge, styles.badgeInfo]}> AI-Enhanced</Text>
              )}
            </Text>
            <Text style={[styles.paragraph, { fontSize: 9, marginLeft: 15, color: '#6b7280' }]}>
              {finding.description.length > 200 
                ? finding.description.slice(0, 200) + '...' 
                : finding.description}
            </Text>
          </View>
        ))
      )}
      
      <Text style={styles.subsectionTitle}>Quick Statistics</Text>
      
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableCell, { flex: 2 }]}>Metric</Text>
          <Text style={[styles.tableCell, { flex: 1 }]}>Value</Text>
        </View>
        {[
          ['Total Components', data.totalComponents.toString()],
          ['Total Connections', data.totalConnections.toString()],
          ['Security Findings', totalFindings.toString()],
          ['  • Critical', data.criticalIssues.toString()],
          ['  • High', data.highIssues.toString()],
          ['  • Medium', data.mediumIssues.toString()],
          ['  • Low', data.lowIssues.toString()],
          ['Architecture Score', `${data.overallScore}/100`],
          ['STRIDE Threats Identified', data.strideThreats.length.toString()],
          ['Compliance Violations', data.complianceResults.filter(c => !c.passed).length.toString()],
        ].map(([metric, value], i) => (
          <View key={i} style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 2 }]}>{metric}</Text>
            <Text style={[styles.tableCell, { flex: 1, fontWeight: metric.startsWith('  •') ? 'normal' : 'bold' }]}>
              {value}
            </Text>
          </View>
        ))}
      </View>
      
      <Text style={styles.subsectionTitle}>Recommendation Priority</Text>
      
      {data.criticalIssues > 0 && (
        <View style={[styles.paragraph, styles.dangerBox]}>
          <Text style={styles.bold}>🔴 Immediate Action Required:</Text>
          <Text> Fix {data.criticalIssues} critical issue{data.criticalIssues > 1 ? 's' : ''} within 24-48 hours.</Text>
        </View>
      )}
      
      {data.highIssues > 0 && (
        <View style={styles.paragraph}>
          <Text style={styles.bold}>🟠 High Priority:</Text>
          <Text> Address {data.highIssues} high-severity finding{data.highIssues > 1 ? 's' : ''} within 1-2 weeks.</Text>
        </View>
      )}
      
      {data.mediumIssues > 0 && (
        <View style={styles.paragraph}>
          <Text style={styles.bold}>🟡 Medium Priority:</Text>
          <Text> Remediate {data.mediumIssues} medium-severity issue{data.mediumIssues > 1 ? 's' : ''} within 1 month.</Text>
        </View>
      )}
      
      {data.lowIssues > 0 && (
        <View style={styles.paragraph}>
          <Text style={styles.bold}>🔵 Low Priority:</Text>
          <Text> Address {data.lowIssues} low-severity item{data.lowIssues > 1 ? 's' : ''} as part of regular maintenance.</Text>
        </View>
      )}
      
      <Text style={styles.subsectionTitle}>Estimated Remediation Effort</Text>
      <View style={styles.paragraph}>
        <Text>
          Based on the severity and complexity of findings, the estimated total remediation effort is approximately{' '}
          <Text style={styles.bold}>
            {data.criticalIssues * 8 + data.highIssues * 4 + data.mediumIssues * 2 + data.lowIssues * 1} hours
          </Text>.
          Critical and high-priority issues should be addressed by experienced security engineers.
        </Text>
      </View>
      
      <View style={styles.footer}>
        <Text>Koh Atlas - Secure Architecture Analyzer</Text>
        <Text>Page {pageNumber}</Text>
      </View>
    </Page>
  );
};
