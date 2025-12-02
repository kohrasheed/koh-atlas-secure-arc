import React from 'react';
import { Page, Text, View } from '@react-pdf/renderer';
import { styles } from '../styles';
import type { ReportData } from '../types';

interface ScopeSectionProps {
  data: ReportData;
  pageNumber: number;
}

export const ScopeSection: React.FC<ScopeSectionProps> = ({ data, pageNumber }) => {
  // Aggregate component types
  const componentTypes = data.nodes.reduce((acc: Record<string, number>, node) => {
    const type = node.data?.type || 'unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
  
  // Aggregate by zone
  const zones = data.nodes.reduce((acc: Record<string, number>, node) => {
    const zone = node.data?.zone || 'Unassigned';
    acc[zone] = (acc[zone] || 0) + 1;
    return acc;
  }, {});
  
  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.sectionTitle}>Scope of Review</Text>
      
      <Text style={styles.subsectionTitle}>Architecture Components Analyzed</Text>
      
      <View style={styles.paragraph}>
        <Text>
          This security analysis covers <Text style={styles.bold}>{data.totalComponents} components</Text>{' '}
          and <Text style={styles.bold}>{data.totalConnections} connections</Text> within the architecture diagram.
          The analysis includes both automated security scanning and AI-powered threat modeling.
        </Text>
      </View>
      
      <Text style={styles.heading3}>Components by Type</Text>
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableCell, { flex: 2 }]}>Component Type</Text>
          <Text style={[styles.tableCell, { flex: 1 }]}>Count</Text>
        </View>
        {Object.entries(componentTypes)
          .sort(([, a], [, b]) => b - a)
          .map(([type, count], i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2 }]}>
                {type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{count}</Text>
            </View>
          ))}
      </View>
      
      <Text style={styles.heading3}>Components by Network Zone</Text>
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableCell, { flex: 2 }]}>Network Zone</Text>
          <Text style={[styles.tableCell, { flex: 1 }]}>Components</Text>
        </View>
        {Object.entries(zones)
          .sort(([, a], [, b]) => b - a)
          .map(([zone, count], i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2 }]}>{zone}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{count}</Text>
            </View>
          ))}
      </View>
      
      <Text style={styles.subsectionTitle}>Analysis Types Performed</Text>
      
      <View style={styles.listItem}>
        <Text style={styles.listBullet}>✓</Text>
        <Text style={styles.listContent}>
          <Text style={styles.bold}>Security Analysis</Text> - Automated scanning for common vulnerabilities 
          and misconfigurations across 50+ security rules
        </Text>
      </View>
      
      <View style={styles.listItem}>
        <Text style={styles.listBullet}>✓</Text>
        <Text style={styles.listContent}>
          <Text style={styles.bold}>STRIDE Threat Modeling</Text> - Comprehensive threat assessment covering 
          Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, and Elevation of Privilege
        </Text>
      </View>
      
      <View style={styles.listItem}>
        <Text style={styles.listBullet}>✓</Text>
        <Text style={styles.listContent}>
          <Text style={styles.bold}>Compliance Checking</Text> - Validation against NIST 800-53, ISO 27001, 
          PCI DSS, OWASP Top 10, and CIS Controls
        </Text>
      </View>
      
      <View style={styles.listItem}>
        <Text style={styles.listBullet}>✓</Text>
        <Text style={styles.listContent}>
          <Text style={styles.bold}>Architecture Validation</Text> - Best practices assessment for connectivity, 
          security zones, redundancy, and anti-patterns
        </Text>
      </View>
      
      <View style={styles.listItem}>
        <Text style={styles.listBullet}>✓</Text>
        <Text style={styles.listContent}>
          <Text style={styles.bold}>Attack Path Analysis</Text> - Identification of potential attack vectors 
          from entry points to high-value targets
        </Text>
      </View>
      
      {data.aiAnalysis && !data.aiAnalysis.cacheHit && (
        <View style={styles.listItem}>
          <Text style={styles.listBullet}>✓</Text>
          <Text style={styles.listContent}>
            <Text style={styles.bold}>AI-Powered Analysis</Text> - Enhanced recommendations using Claude Sonnet 4.5 
            with AWS Well-Architected Framework integration
          </Text>
        </View>
      )}
      
      <Text style={styles.subsectionTitle}>Standards Referenced</Text>
      
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
        {[
          'OWASP Top 10',
          'NIST 800-53',
          'ISO 27001',
          'PCI DSS',
          'CIS Controls',
          'AWS Well-Architected',
          'Azure Security Benchmark',
          'GCP Security Best Practices',
        ].map((standard, i) => (
          <View key={i} style={[styles.badge, styles.badgeInfo]}>
            <Text>{standard}</Text>
          </View>
        ))}
      </View>
      
      <Text style={styles.subsectionTitle}>Analysis Timestamp</Text>
      
      <View style={styles.paragraph}>
        <Text>
          <Text style={styles.bold}>Analysis Date:</Text> {data.reportDate.toLocaleString('en-US', {
            dateStyle: 'full',
            timeStyle: 'short'
          })}
        </Text>
      </View>
      
      <Text style={styles.subsectionTitle}>Limitations</Text>
      
      <View style={styles.warningBox}>
        <View style={styles.listItem}>
          <Text style={styles.listBullet}>•</Text>
          <Text style={styles.listContent}>
            This analysis is based on the logical architecture diagram and does not include runtime security testing
          </Text>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.listBullet}>•</Text>
          <Text style={styles.listContent}>
            Findings assume standard configurations; custom configurations may affect actual security posture
          </Text>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.listBullet}>•</Text>
          <Text style={styles.listContent}>
            No penetration testing, vulnerability scanning, or code review was performed
          </Text>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.listBullet}>•</Text>
          <Text style={styles.listContent}>
            Recommendations should be validated against specific organizational requirements and constraints
          </Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text>Koh Atlas - Secure Architecture Analyzer</Text>
        <Text>Page {pageNumber}</Text>
      </View>
    </Page>
  );
};
