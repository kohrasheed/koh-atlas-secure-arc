import React from 'react';
import { Page, Text, View, Image } from '@react-pdf/renderer';
import { styles } from '../styles';
import type { ReportData } from '../types';

interface MethodologySectionProps {
  data: ReportData;
  pageNumber: number;
}

export const MethodologySection: React.FC<MethodologySectionProps> = ({ data, pageNumber }) => {
  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.sectionTitle}>Methodology</Text>
      
      <Text style={styles.subsectionTitle}>Analysis Framework</Text>
      
      <View style={styles.paragraph}>
        <Text>
          The security analysis follows a systematic approach that combines automated pattern recognition, 
          threat modeling, and best practices validation. The framework consists of six key stages:
        </Text>
      </View>
      
      <View style={styles.listItem}>
        <Text style={styles.listBullet}>1.</Text>
        <Text style={styles.listContent}>
          <Text style={styles.bold}>Component Discovery & Inventory</Text> - Cataloging all architecture 
          components, their types, zones, and relationships
        </Text>
      </View>
      
      <View style={styles.listItem}>
        <Text style={styles.listBullet}>2.</Text>
        <Text style={styles.listContent}>
          <Text style={styles.bold}>Connection & Data Flow Mapping</Text> - Analyzing communication paths, 
          protocols, encryption status, and data classification
        </Text>
      </View>
      
      <View style={styles.listItem}>
        <Text style={styles.listBullet}>3.</Text>
        <Text style={styles.listContent}>
          <Text style={styles.bold}>Security Control Identification</Text> - Detecting implemented security 
          controls and identifying gaps
        </Text>
      </View>
      
      <View style={styles.listItem}>
        <Text style={styles.listBullet}>4.</Text>
        <Text style={styles.listContent}>
          <Text style={styles.bold}>Threat Modeling (STRIDE)</Text> - Systematic identification of threats 
          across all six STRIDE categories
        </Text>
      </View>
      
      <View style={styles.listItem}>
        <Text style={styles.listBullet}>5.</Text>
        <Text style={styles.listContent}>
          <Text style={styles.bold}>Compliance Mapping</Text> - Validation against industry standards and 
          regulatory requirements
        </Text>
      </View>
      
      <View style={styles.listItem}>
        <Text style={styles.listBullet}>6.</Text>
        <Text style={styles.listContent}>
          <Text style={styles.bold}>Risk Scoring & Prioritization</Text> - Assessment of likelihood and 
          impact to prioritize remediation efforts
        </Text>
      </View>
      
      <Text style={styles.subsectionTitle}>Scoring Methodology</Text>
      
      <View style={styles.paragraph}>
        <Text>
          The overall Architecture Score (0-100) is calculated based on the number and severity of identified issues:
        </Text>
      </View>
      
      <View style={styles.infoBox}>
        <Text style={{ fontSize: 9, fontFamily: 'Courier', marginBottom: 6 }}>
          Score = 100 - (Critical × 10 + High × 5 + Medium × 2 + Low × 1)
        </Text>
        <Text style={{ fontSize: 9 }}>
          Where Critical, High, Medium, and Low represent the count of findings at each severity level.
          The score is capped at 0 (minimum) and 100 (maximum).
        </Text>
      </View>
      
      <Text style={styles.heading3}>Severity Definitions</Text>
      
      <View style={styles.listItem}>
        <Text style={styles.listBullet}>•</Text>
        <Text style={styles.listContent}>
          <Text style={[styles.badge, styles.badgeCritical]}>CRITICAL</Text>
          <Text> - Immediate risk of data breach or system compromise (Weight: 10)</Text>
        </Text>
      </View>
      
      <View style={styles.listItem}>
        <Text style={styles.listBullet}>•</Text>
        <Text style={styles.listContent}>
          <Text style={[styles.badge, styles.badgeHigh]}>HIGH</Text>
          <Text> - Significant security weakness requiring urgent attention (Weight: 5)</Text>
        </Text>
      </View>
      
      <View style={styles.listItem}>
        <Text style={styles.listBullet}>•</Text>
        <Text style={styles.listContent}>
          <Text style={[styles.badge, styles.badgeMedium]}>MEDIUM</Text>
          <Text> - Security gap that should be addressed in near term (Weight: 2)</Text>
        </Text>
      </View>
      
      <View style={styles.listItem}>
        <Text style={styles.listBullet}>•</Text>
        <Text style={styles.listContent}>
          <Text style={[styles.badge, styles.badgeLow]}>LOW</Text>
          <Text> - Minor improvement opportunity or best practice (Weight: 1)</Text>
        </Text>
      </View>
      
      <Text style={styles.subsectionTitle}>Tools & Techniques</Text>
      
      <View style={styles.listItem}>
        <Text style={styles.listBullet}>•</Text>
        <Text style={styles.listContent}>
          <Text style={styles.bold}>Automated Static Analysis</Text> - Pattern matching against 50+ 
          predefined security rules covering OWASP Top 10 and common misconfigurations
        </Text>
      </View>
      
      {data.aiAnalysis && (
        <View style={styles.listItem}>
          <Text style={styles.listBullet}>•</Text>
          <Text style={styles.listContent}>
            <Text style={styles.bold}>AI-Powered Security Recommendations</Text> - Advanced analysis using 
            Claude Sonnet 4.5 with context from AWS Well-Architected Framework, Azure CAF, and GCP best practices
          </Text>
        </View>
      )}
      
      <View style={styles.listItem}>
        <Text style={styles.listBullet}>•</Text>
        <Text style={styles.listContent}>
          <Text style={styles.bold}>Graph-Based Attack Path Analysis</Text> - Shortest path algorithms to 
          identify potential attack vectors from external entry points to critical assets
        </Text>
      </View>
      
      <View style={styles.listItem}>
        <Text style={styles.listBullet}>•</Text>
        <Text style={styles.listContent}>
          <Text style={styles.bold}>Best Practices Validation</Text> - Comparison against cloud provider 
          reference architectures and security frameworks
        </Text>
      </View>
      
      <Text style={styles.subsectionTitle}>Risk Assessment Matrix</Text>
      
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableCell, { flex: 1 }]}>Likelihood → Impact ↓</Text>
          <Text style={[styles.tableCell, { flex: 1 }]}>Low</Text>
          <Text style={[styles.tableCell, { flex: 1 }]}>Medium</Text>
          <Text style={[styles.tableCell, { flex: 1 }]}>High</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, { flex: 1, fontWeight: 'bold' }]}>High</Text>
          <Text style={[styles.tableCell, { flex: 1, backgroundColor: '#fef3c7' }]}>Medium</Text>
          <Text style={[styles.tableCell, { flex: 1, backgroundColor: '#fed7aa' }]}>High</Text>
          <Text style={[styles.tableCell, { flex: 1, backgroundColor: '#fee2e2' }]}>Critical</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, { flex: 1, fontWeight: 'bold' }]}>Medium</Text>
          <Text style={[styles.tableCell, { flex: 1, backgroundColor: '#dbeafe' }]}>Low</Text>
          <Text style={[styles.tableCell, { flex: 1, backgroundColor: '#fef3c7' }]}>Medium</Text>
          <Text style={[styles.tableCell, { flex: 1, backgroundColor: '#fed7aa' }]}>High</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, { flex: 1, fontWeight: 'bold' }]}>Low</Text>
          <Text style={[styles.tableCell, { flex: 1, backgroundColor: '#dbeafe' }]}>Low</Text>
          <Text style={[styles.tableCell, { flex: 1, backgroundColor: '#dbeafe' }]}>Low</Text>
          <Text style={[styles.tableCell, { flex: 1, backgroundColor: '#fef3c7' }]}>Medium</Text>
        </View>
      </View>
      
      <View style={styles.paragraph}>
        <Text style={{ fontSize: 9, color: '#6b7280' }}>
          Risk level is determined by combining the likelihood of exploitation with the potential business 
          impact. Critical risks require immediate action regardless of likelihood.
        </Text>
      </View>
      
      <View style={styles.footer}>
        <Text>Koh Atlas - Secure Architecture Analyzer</Text>
        <Text>Page {pageNumber}</Text>
      </View>
    </Page>
  );
};
