import React from 'react';
import { Page, Text, View } from '@react-pdf/renderer';
import { styles } from '../styles';
import type { ReportData, ReportSecurityFinding } from '../types';

interface DetailedFindingsProps {
  data: ReportData;
  startPageNumber: number;
}

// Helper to get severity badge style
const getSeverityBadgeStyle = (severity: string) => {
  switch (severity.toLowerCase()) {
    case 'critical': return styles.badgeCritical;
    case 'high': return styles.badgeHigh;
    case 'medium': return styles.badgeMedium;
    case 'low': return styles.badgeLow;
    default: return styles.badgeInfo;
  }
};

// Helper to get border color for finding cards
const getSeverityBorderStyle = (severity: string) => {
  switch (severity.toLowerCase()) {
    case 'critical': return { borderLeftColor: '#dc2626', borderLeftWidth: 4 };
    case 'high': return { borderLeftColor: '#ea580c', borderLeftWidth: 4 };
    case 'medium': return { borderLeftColor: '#f59e0b', borderLeftWidth: 4 };
    case 'low': return { borderLeftColor: '#3b82f6', borderLeftWidth: 4 };
    default: return { borderLeftColor: '#6b7280', borderLeftWidth: 4 };
  }
};

// Single finding card component
const FindingCard: React.FC<{ finding: ReportSecurityFinding; index: number }> = ({ finding, index }) => {
  const severityStyle = getSeverityBadgeStyle(finding.severity);
  const borderStyle = getSeverityBorderStyle(finding.severity);
  
  return (
    <View style={[styles.findingCard, borderStyle]} wrap={false}>
      {/* Header */}
      <View style={styles.findingHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <Text style={{ fontSize: 11, fontWeight: 'bold', marginRight: 8 }}>
            F-{String(index + 1).padStart(3, '0')}
          </Text>
          <Text style={styles.findingTitle}>{finding.title}</Text>
        </View>
      </View>
      
      {/* Metadata row */}
      <View style={styles.findingMetadata}>
        <View style={[styles.badge, severityStyle]}>
          <Text>{finding.severity.toUpperCase()}</Text>
        </View>
        <View style={[styles.badge, styles.badgeInfo]}>
          <Text>{finding.category}</Text>
        </View>
        {finding.isAIEnhanced && (
          <View style={[styles.badge, { backgroundColor: '#f3e8ff', color: '#7c3aed' }]}>
            <Text>✨ AI-Enhanced</Text>
          </View>
        )}
      </View>
      
      {/* Affected Components */}
      {finding.affected.length > 0 && !finding.affected.includes('architecture') && (
        <View style={styles.findingSection}>
          <Text style={styles.findingSectionTitle}>📍 Affected Components</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 }}>
            {finding.affected.map((comp, idx) => (
              <View key={idx} style={[styles.badge, { backgroundColor: '#f3f4f6', margin: 2 }]}>
                <Text style={{ fontSize: 8 }}>{comp}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
      
      {/* Description */}
      <View style={styles.findingSection}>
        <Text style={styles.findingSectionTitle}>📋 Description</Text>
        <Text style={styles.paragraph}>{finding.description}</Text>
      </View>
      
      {/* Risk & Impact */}
      {finding.risk && (
        <View style={styles.findingSection}>
          <Text style={styles.findingSectionTitle}>⚠️ Risk & Impact</Text>
          <Text style={styles.paragraph}>{finding.risk}</Text>
        </View>
      )}
      
      {/* Standards Violated */}
      {finding.standards && finding.standards.length > 0 && (
        <View style={styles.findingSection}>
          <Text style={styles.findingSectionTitle}>📜 Standards & Compliance</Text>
          <View style={{ marginTop: 4 }}>
            {finding.standards.map((std, idx) => (
              <View key={idx} style={{ flexDirection: 'row', marginBottom: 3 }}>
                <Text style={{ fontSize: 9, marginRight: 6 }}>✗</Text>
                <Text style={{ fontSize: 9 }}>{std}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
      
      {/* Remediation Steps */}
      {finding.remediation && (
        <View style={styles.findingSection}>
          <Text style={styles.findingSectionTitle}>🔧 Remediation Steps</Text>
          <View style={{ marginTop: 4 }}>
            {finding.remediation.split('\n').filter(line => line.trim()).map((step, idx) => {
              // Check if step is numbered or bulleted
              const cleanStep = step.trim().replace(/^[\d\-\*\.]+\s*/, '');
              return (
                <View key={idx} style={{ flexDirection: 'row', marginBottom: 4 }}>
                  <Text style={{ fontSize: 9, marginRight: 6, minWidth: 15 }}>{idx + 1}.</Text>
                  <Text style={{ fontSize: 9, flex: 1 }}>{cleanStep}</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}
      
      {/* Target State */}
      {finding.targetState && (
        <View style={styles.findingSection}>
          <Text style={styles.findingSectionTitle}>🎯 Target State</Text>
          <Text style={[styles.paragraph, { fontSize: 9, fontStyle: 'italic' }]}>
            {finding.targetState}
          </Text>
        </View>
      )}
      
      {/* Effort Estimate */}
      {finding.effort && (
        <View style={{ 
          flexDirection: 'row', 
          marginTop: 8, 
          paddingTop: 8, 
          borderTopWidth: 1, 
          borderTopColor: '#e5e7eb' 
        }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 8, color: '#6b7280' }}>Estimated Effort</Text>
            <Text style={{ fontSize: 9, fontWeight: 'bold', marginTop: 2 }}>{finding.effort}</Text>
          </View>
          {finding.priority && (
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 8, color: '#6b7280' }}>Priority</Text>
              <Text style={{ fontSize: 9, fontWeight: 'bold', marginTop: 2 }}>{finding.priority}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export const DetailedFindings: React.FC<DetailedFindingsProps> = ({ data, startPageNumber }) => {
  // Sort findings by severity
  const severityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
  const sortedFindings = [...data.findings].sort((a, b) => {
    const orderA = severityOrder[a.severity.toLowerCase() as keyof typeof severityOrder] ?? 4;
    const orderB = severityOrder[b.severity.toLowerCase() as keyof typeof severityOrder] ?? 4;
    return orderA - orderB;
  });
  
  // Group findings by severity for summary
  const findingsBySeverity = sortedFindings.reduce((acc, finding) => {
    const sev = finding.severity.toLowerCase();
    if (!acc[sev]) acc[sev] = [];
    acc[sev].push(finding);
    return acc;
  }, {} as Record<string, ReportSecurityFinding[]>);
  
  // Split findings into pages (max 3-4 per page to avoid overflow)
  const findingsPerPage = 4;
  const totalPages = Math.ceil(sortedFindings.length / findingsPerPage);
  
  const pages: JSX.Element[] = [];
  
  // First page with summary
  pages.push(
    <Page key="findings-summary" size="A4" style={styles.page}>
      <Text style={styles.sectionTitle}>Detailed Security Findings</Text>
      
      <View style={styles.paragraph}>
        <Text>
          This section provides comprehensive details for all {data.findings.length} security finding
          {data.findings.length !== 1 ? 's' : ''} identified during the analysis. Each finding includes 
          severity classification, affected components, risk assessment, remediation steps, and effort estimates.
        </Text>
      </View>
      
      {/* Summary by severity */}
      <View style={styles.infoBox}>
        <Text style={[styles.bold, { marginBottom: 8 }]}>Findings Summary</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, { flex: 2 }]}>Severity</Text>
            <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>Count</Text>
            <Text style={[styles.tableCell, { flex: 3 }]}>Status</Text>
          </View>
          {['critical', 'high', 'medium', 'low'].map((sev) => {
            const count = findingsBySeverity[sev]?.length || 0;
            if (count === 0) return null;
            return (
              <View key={sev} style={styles.tableRow}>
                <View style={[styles.tableCell, { flex: 2, flexDirection: 'row', alignItems: 'center' }]}>
                  <View style={[styles.badge, getSeverityBadgeStyle(sev), { marginRight: 4 }]}>
                    <Text>{sev.toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>{count}</Text>
                <Text style={[styles.tableCell, { flex: 3, fontSize: 8 }]}>
                  {sev === 'critical' ? 'Immediate action required' : 
                   sev === 'high' ? 'Address within 1-2 weeks' :
                   sev === 'medium' ? 'Plan for next sprint' :
                   'Schedule in maintenance cycle'}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
      
      {data.aiAnalysis && (
        <View style={[styles.infoBox, { backgroundColor: '#f3e8ff', borderLeftColor: '#7c3aed' }]}>
          <Text style={styles.bold}>✨ AI-Enhanced Analysis</Text>
          <Text>
            {data.findings.filter(f => f.isAIEnhanced).length} of {data.findings.length} findings 
            were enhanced with AI-powered recommendations using advanced cloud security best practices 
            and threat intelligence.
          </Text>
        </View>
      )}
      
      {sortedFindings.length === 0 && (
        <View style={styles.successBox}>
          <Text style={styles.bold}>✓ No Security Findings</Text>
          <Text>
            The architecture analysis did not identify any security issues. This indicates strong 
            adherence to security best practices and proper implementation of security controls.
          </Text>
        </View>
      )}
      
      <View style={styles.footer}>
        <Text>Koh Atlas - Secure Architecture Analyzer</Text>
        <Text>Page {startPageNumber}</Text>
      </View>
    </Page>
  );
  
  // Generate pages with findings
  for (let i = 0; i < totalPages; i++) {
    const startIdx = i * findingsPerPage;
    const endIdx = Math.min(startIdx + findingsPerPage, sortedFindings.length);
    const pageFindings = sortedFindings.slice(startIdx, endIdx);
    
    pages.push(
      <Page key={`findings-page-${i}`} size="A4" style={styles.page}>
        <Text style={styles.subsectionTitle}>
          Detailed Findings (Continued) - {startIdx + 1} to {endIdx} of {sortedFindings.length}
        </Text>
        
        {pageFindings.map((finding, idx) => (
          <FindingCard 
            key={startIdx + idx} 
            finding={finding} 
            index={startIdx + idx}
          />
        ))}
        
        <View style={styles.footer}>
          <Text>Koh Atlas - Secure Architecture Analyzer</Text>
          <Text>Page {startPageNumber + i + 1}</Text>
        </View>
      </Page>
    );
  }
  
  return <>{pages}</>;
};
