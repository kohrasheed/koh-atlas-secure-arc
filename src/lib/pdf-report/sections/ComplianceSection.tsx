import React from 'react';
import { Page, Text, View } from '@react-pdf/renderer';
import { styles } from '../styles';
import type { ReportData, ComplianceScore } from '../types';

interface ComplianceSectionProps {
  data: ReportData;
  pageNumber: number;
}

export const ComplianceSection: React.FC<ComplianceSectionProps> = ({ data, pageNumber }) => {
  // Calculate overall compliance percentage
  const totalFrameworks = Object.keys(data.complianceScore).length;
  const totalPercentage = Object.values(data.complianceScore).reduce(
    (sum, score) => sum + score.percentage, 
    0
  );
  const overallScore = totalFrameworks > 0 ? Math.round(totalPercentage / totalFrameworks) : 0;
  
  // Get compliance status
  const getComplianceStatus = (percentage: number): string => {
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 75) return 'Good';
    if (percentage >= 60) return 'Fair';
    if (percentage >= 40) return 'Poor';
    return 'Critical';
  };
  
  const getStatusColor = (percentage: number): string => {
    if (percentage >= 90) return '#10b981';
    if (percentage >= 75) return '#3b82f6';
    if (percentage >= 60) return '#f59e0b';
    if (percentage >= 40) return '#ea580c';
    return '#dc2626';
  };
  
  // Group compliance results by framework
  const resultsByFramework = data.complianceResults.reduce((acc, result) => {
    if (!acc[result.framework]) {
      acc[result.framework] = [];
    }
    acc[result.framework].push(result);
    return acc;
  }, {} as Record<string, typeof data.complianceResults>);
  
  // Count violations
  const violationsByFramework = Object.entries(resultsByFramework).map(([framework, results]) => ({
    framework,
    violations: results.filter(r => r.status === 'fail').length,
    total: results.length
  }));

  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.sectionTitle}>Architecture Compliance Score</Text>
      
      <View style={styles.paragraph}>
        <Text>
          The architecture has been evaluated against {totalFrameworks} major security and compliance frameworks. 
          The overall compliance score reflects adherence to industry standards and regulatory requirements.
        </Text>
      </View>
      
      {/* Overall Score */}
      <View style={[styles.infoBox, { alignItems: 'center', padding: 16 }]}>
        <Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>Overall Compliance Score</Text>
        <Text style={{ 
          fontSize: 36, 
          fontWeight: 'bold', 
          color: getStatusColor(overallScore),
          marginBottom: 4
        }}>
          {overallScore}%
        </Text>
        <Text style={{ fontSize: 10, color: '#6b7280' }}>
          {getComplianceStatus(overallScore)}
        </Text>
      </View>
      
      {/* Framework Breakdown */}
      <Text style={styles.subsectionTitle}>Compliance by Framework</Text>
      
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableCell, { flex: 2 }]}>Framework</Text>
          <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>Score</Text>
          <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>Status</Text>
          <Text style={[styles.tableCell, { flex: 2 }]}>Key Gaps</Text>
        </View>
        {Object.entries(data.complianceScore).map(([framework, score]) => {
          const violations = violationsByFramework.find(v => v.framework === framework);
          return (
            <View key={framework} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2, fontWeight: 'bold' }]}>
                {framework.toUpperCase()}
              </Text>
              <View style={[styles.tableCell, { flex: 1, alignItems: 'center' }]}>
                <Text style={{ 
                  fontSize: 10, 
                  fontWeight: 'bold',
                  color: getStatusColor(score.percentage)
                }}>
                  {score.percentage}%
                </Text>
              </View>
              <View style={[styles.tableCell, { flex: 1, alignItems: 'center' }]}>
                <View style={[styles.badge, { 
                  backgroundColor: getStatusColor(score.percentage),
                  color: '#ffffff'
                }]}>
                  <Text>{score.status}</Text>
                </View>
              </View>
              <Text style={[styles.tableCell, { flex: 2, fontSize: 8 }]}>
                {violations ? `${violations.violations} violation${violations.violations !== 1 ? 's' : ''}` : 'No data'}
              </Text>
            </View>
          );
        })}
      </View>
      
      {/* Gap Analysis */}
      <Text style={styles.subsectionTitle}>Compliance Gap Analysis</Text>
      
      {overallScore < 75 && (
        <View style={styles.warningBox}>
          <Text style={styles.bold}>⚠ Compliance Gaps Detected</Text>
          <Text>
            The current architecture does not meet minimum compliance requirements for several frameworks. 
            Immediate remediation is recommended to reduce regulatory and audit risks.
          </Text>
        </View>
      )}
      
      {/* Most Violated Controls */}
      <Text style={styles.heading3}>Most Common Violations</Text>
      
      {violationsByFramework
        .filter(v => v.violations > 0)
        .sort((a, b) => b.violations - a.violations)
        .slice(0, 5)
        .map((item) => {
          const frameworkResults = resultsByFramework[item.framework] || [];
          const failedControls = frameworkResults
            .filter(r => r.status === 'fail')
            .slice(0, 3);
          
          return (
            <View key={item.framework} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Text style={[styles.badge, styles.badgeDanger, { marginRight: 6 }]}>
                  {item.violations}
                </Text>
                <Text style={styles.bold}>{item.framework.toUpperCase()}</Text>
              </View>
              {failedControls.map((control, idx) => (
                <View key={idx} style={{ flexDirection: 'row', marginLeft: 12, marginBottom: 2 }}>
                  <Text style={{ fontSize: 9, marginRight: 6 }}>✗</Text>
                  <Text style={{ fontSize: 9, flex: 1 }}>
                    {control.control}: {control.requirement}
                  </Text>
                </View>
              ))}
              {item.violations > 3 && (
                <Text style={{ fontSize: 8, color: '#6b7280', marginLeft: 12 }}>
                  ...and {item.violations - 3} more violation{item.violations - 3 !== 1 ? 's' : ''}
                </Text>
              )}
            </View>
          );
        })}
      
      {/* Recommendations */}
      <View style={styles.infoBox}>
        <Text style={styles.bold}>Recommended Actions</Text>
        <View style={{ marginTop: 6 }}>
          <View style={styles.listItem}>
            <Text style={styles.listBullet}>1.</Text>
            <Text style={styles.listContent}>
              Prioritize remediation of critical compliance gaps identified in NIST and ISO frameworks
            </Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.listBullet}>2.</Text>
            <Text style={styles.listContent}>
              Implement automated compliance monitoring and continuous validation
            </Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.listBullet}>3.</Text>
            <Text style={styles.listContent}>
              Schedule regular compliance audits and penetration testing
            </Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.listBullet}>4.</Text>
            <Text style={styles.listContent}>
              Establish compliance-as-code practices for infrastructure deployments
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text>Koh Atlas - Secure Architecture Analyzer</Text>
        <Text>Page {pageNumber}</Text>
      </View>
    </Page>
  );
};
