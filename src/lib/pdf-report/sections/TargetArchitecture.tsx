import React from 'react';
import { Page, Text, View, Image } from '@react-pdf/renderer';
import { styles } from '../styles';
import type { ReportData } from '../types';

interface TargetArchitectureProps {
  data: ReportData;
  pageNumber: number;
}

export const TargetArchitecture: React.FC<TargetArchitectureProps> = ({ data, pageNumber }) => {
  // Calculate improvements
  const criticalIssues = data.findings.filter(f => f.severity.toLowerCase() === 'critical').length;
  const highIssues = data.findings.filter(f => f.severity.toLowerCase() === 'high').length;
  const totalIssues = data.findings.length;
  
  // Estimate target score (assuming 80% of issues resolved)
  const currentScore = data.score;
  const issuesResolved = Math.round(totalIssues * 0.8);
  const estimatedImprovement = Math.min(30, issuesResolved * 2);
  const targetScore = Math.min(100, currentScore + estimatedImprovement);
  
  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.sectionTitle}>Recommended Target Security Architecture</Text>
      
      <View style={styles.paragraph}>
        <Text>
          Based on the identified findings, this section outlines the target security architecture 
          that addresses all critical and high-severity issues. Implementation of these recommendations 
          will significantly improve the security posture and compliance status.
        </Text>
      </View>
      
      {/* Vision Statement */}
      <View style={[styles.infoBox, { backgroundColor: '#eff6ff', borderLeftColor: '#3b82f6' }]}>
        <Text style={[styles.bold, { fontSize: 12, marginBottom: 8 }]}>Security Architecture Vision</Text>
        <Text>
          Transform the current architecture into a defense-in-depth security model with zero-trust 
          principles, comprehensive encryption, robust identity and access management, continuous 
          monitoring, and automated compliance validation.
        </Text>
      </View>
      
      {/* Score Projection */}
      <Text style={styles.subsectionTitle}>Security Score Projection</Text>
      
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableCell, { flex: 2 }]}>Metric</Text>
          <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>Current</Text>
          <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>Target</Text>
          <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>Improvement</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, { flex: 2 }]}>Architecture Score</Text>
          <Text style={[styles.tableCell, { flex: 1, textAlign: 'center', color: '#dc2626' }]}>
            {currentScore}%
          </Text>
          <Text style={[styles.tableCell, { flex: 1, textAlign: 'center', color: '#10b981' }]}>
            {targetScore}%
          </Text>
          <Text style={[styles.tableCell, { flex: 1, textAlign: 'center', fontWeight: 'bold' }]}>
            +{estimatedImprovement}%
          </Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, { flex: 2 }]}>Critical Issues</Text>
          <Text style={[styles.tableCell, { flex: 1, textAlign: 'center', color: '#dc2626' }]}>
            {criticalIssues}
          </Text>
          <Text style={[styles.tableCell, { flex: 1, textAlign: 'center', color: '#10b981' }]}>
            0
          </Text>
          <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>
            -{criticalIssues}
          </Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, { flex: 2 }]}>High Issues</Text>
          <Text style={[styles.tableCell, { flex: 1, textAlign: 'center', color: '#ea580c' }]}>
            {highIssues}
          </Text>
          <Text style={[styles.tableCell, { flex: 1, textAlign: 'center', color: '#10b981' }]}>
            0
          </Text>
          <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>
            -{highIssues}
          </Text>
        </View>
      </View>
      
      {/* Implementation Roadmap */}
      <Text style={styles.subsectionTitle}>Implementation Roadmap</Text>
      
      <View style={[styles.findingCard, { borderLeftColor: '#dc2626', marginBottom: 12 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
          <View style={[styles.badge, styles.badgeDanger, { marginRight: 8 }]}>
            <Text>Phase 1</Text>
          </View>
          <Text style={[styles.bold, { fontSize: 11 }]}>Immediate (Weeks 1-2)</Text>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.listBullet}>•</Text>
          <Text style={styles.listContent}>Remediate all critical security findings</Text>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.listBullet}>•</Text>
          <Text style={styles.listContent}>Enable encryption for all data in transit (TLS 1.3)</Text>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.listBullet}>•</Text>
          <Text style={styles.listContent}>Implement MFA for all privileged accounts</Text>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.listBullet}>•</Text>
          <Text style={styles.listContent}>Patch known vulnerabilities in all components</Text>
        </View>
      </View>
      
      <View style={[styles.findingCard, { borderLeftColor: '#ea580c', marginBottom: 12 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
          <View style={[styles.badge, styles.badgeHigh, { marginRight: 8 }]}>
            <Text>Phase 2</Text>
          </View>
          <Text style={[styles.bold, { fontSize: 11 }]}>Short-term (Weeks 3-6)</Text>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.listBullet}>•</Text>
          <Text style={styles.listContent}>Deploy WAF and DDoS protection</Text>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.listBullet}>•</Text>
          <Text style={styles.listContent}>Implement network segmentation and microsegmentation</Text>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.listBullet}>•</Text>
          <Text style={styles.listContent}>Enable comprehensive logging and SIEM integration</Text>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.listBullet}>•</Text>
          <Text style={styles.listContent}>Establish automated backup and disaster recovery</Text>
        </View>
      </View>
      
      <View style={[styles.findingCard, { borderLeftColor: '#f59e0b', marginBottom: 12 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
          <View style={[styles.badge, styles.badgeMedium, { marginRight: 8 }]}>
            <Text>Phase 3</Text>
          </View>
          <Text style={[styles.bold, { fontSize: 11 }]}>Medium-term (Weeks 7-12)</Text>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.listBullet}>•</Text>
          <Text style={styles.listContent}>Implement zero-trust architecture principles</Text>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.listBullet}>•</Text>
          <Text style={styles.listContent}>Deploy runtime application self-protection (RASP)</Text>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.listBullet}>•</Text>
          <Text style={styles.listContent}>Establish security testing pipeline (SAST/DAST/SCA)</Text>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.listBullet}>•</Text>
          <Text style={styles.listContent}>Conduct penetration testing and red team exercises</Text>
        </View>
      </View>
      
      <View style={[styles.findingCard, { borderLeftColor: '#3b82f6', marginBottom: 12 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
          <View style={[styles.badge, styles.badgeLow, { marginRight: 8 }]}>
            <Text>Phase 4</Text>
          </View>
          <Text style={[styles.bold, { fontSize: 11 }]}>Long-term (Months 4-6)</Text>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.listBullet}>•</Text>
          <Text style={styles.listContent}>Achieve full compliance with target frameworks</Text>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.listBullet}>•</Text>
          <Text style={styles.listContent}>Implement security chaos engineering practices</Text>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.listBullet}>•</Text>
          <Text style={styles.listContent}>Establish security metrics and KPI dashboards</Text>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.listBullet}>•</Text>
          <Text style={styles.listContent}>Continuous security posture improvement program</Text>
        </View>
      </View>
      
      {/* Architecture Principles */}
      <Text style={styles.subsectionTitle}>Target Architecture Principles</Text>
      
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableCell, { flex: 1 }]}>Principle</Text>
          <Text style={[styles.tableCell, { flex: 3 }]}>Implementation</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, { flex: 1, fontWeight: 'bold' }]}>Defense in Depth</Text>
          <Text style={[styles.tableCell, { flex: 3, fontSize: 9 }]}>
            Multiple layers of security controls (network, application, data, identity)
          </Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, { flex: 1, fontWeight: 'bold' }]}>Zero Trust</Text>
          <Text style={[styles.tableCell, { flex: 3, fontSize: 9 }]}>
            Never trust, always verify - authenticate and authorize every request
          </Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, { flex: 1, fontWeight: 'bold' }]}>Least Privilege</Text>
          <Text style={[styles.tableCell, { flex: 3, fontSize: 9 }]}>
            Minimum necessary permissions for users, services, and systems
          </Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, { flex: 1, fontWeight: 'bold' }]}>Secure by Default</Text>
          <Text style={[styles.tableCell, { flex: 3, fontSize: 9 }]}>
            Security controls enabled by default, not opt-in
          </Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, { flex: 1, fontWeight: 'bold' }]}>Fail Secure</Text>
          <Text style={[styles.tableCell, { flex: 3, fontSize: 9 }]}>
            System failures default to secure state, not open access
          </Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, { flex: 1, fontWeight: 'bold' }]}>Continuous Monitoring</Text>
          <Text style={[styles.tableCell, { flex: 3, fontSize: 9 }]}>
            Real-time threat detection, logging, and incident response
          </Text>
        </View>
      </View>
      
      <View style={styles.successBox}>
        <Text style={styles.bold}>✓ Expected Outcomes</Text>
        <Text>
          Full implementation of the target architecture will result in {targetScore}% security score, 
          zero critical vulnerabilities, full compliance with major frameworks, and robust protection 
          against STRIDE threat categories.
        </Text>
      </View>
      
      <View style={styles.footer}>
        <Text>Koh Atlas - Secure Architecture Analyzer</Text>
        <Text>Page {pageNumber}</Text>
      </View>
    </Page>
  );
};
