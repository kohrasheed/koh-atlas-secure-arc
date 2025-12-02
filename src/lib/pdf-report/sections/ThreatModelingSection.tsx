import React from 'react';
import { Page, Text, View } from '@react-pdf/renderer';
import { styles } from '../styles';
import type { ReportData } from '../types';

interface ThreatModelingSectionProps {
  data: ReportData;
  pageNumber: number;
}

export const ThreatModelingSection: React.FC<ThreatModelingSectionProps> = ({ data, pageNumber }) => {
  // Group threats by category
  const threatsByCategory = data.strideThreats.reduce((acc, threat) => {
    if (!acc[threat.category]) {
      acc[threat.category] = [];
    }
    acc[threat.category].push(threat);
    return acc;
  }, {} as Record<string, typeof data.strideThreats>);
  
  // STRIDE category descriptions
  const strideDescriptions = {
    'Spoofing': 'Impersonating users, systems, or data sources to gain unauthorized access',
    'Tampering': 'Malicious modification of data, code, or system configurations',
    'Repudiation': 'Denying actions or transactions without proper audit trails',
    'Information Disclosure': 'Unauthorized access to sensitive data or system information',
    'Denial of Service': 'Disrupting availability of systems or services',
    'Elevation of Privilege': 'Gaining higher access rights than intended'
  };
  
  // Calculate threat statistics
  const totalThreats = data.strideThreats.length;
  const highSeverityThreats = data.strideThreats.filter(t => 
    t.likelihood === 'high' || t.impact === 'high'
  ).length;
  
  // Get top threats (high likelihood AND high impact)
  const topThreats = data.strideThreats
    .filter(t => t.likelihood === 'high' && t.impact === 'high')
    .slice(0, 10);
  
  // Count attack paths
  const totalAttackPaths = data.attackPaths.length;
  const criticalPaths = data.attackPaths.filter(p => p.riskLevel === 'critical').length;

  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.sectionTitle}>Threat Modeling Summary (STRIDE)</Text>
      
      <View style={styles.paragraph}>
        <Text>
          The STRIDE threat modeling methodology systematically identifies potential security threats 
          across six categories. This section summarizes the {totalThreats} threat{totalThreats !== 1 ? 's' : ''} identified 
          and their distribution across the architecture.
        </Text>
      </View>
      
      {/* STRIDE Overview */}
      <Text style={styles.subsectionTitle}>STRIDE Categories Overview</Text>
      
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableCell, { flex: 2 }]}>Category</Text>
          <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>Threats</Text>
          <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>High Risk</Text>
          <Text style={[styles.tableCell, { flex: 3 }]}>Description</Text>
        </View>
        {Object.entries(strideDescriptions).map(([category, description]) => {
          const threats = threatsByCategory[category] || [];
          const highRisk = threats.filter(t => 
            t.likelihood === 'high' || t.impact === 'high'
          ).length;
          
          return (
            <View key={category} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2, fontWeight: 'bold' }]}>
                {category}
              </Text>
              <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>
                {threats.length}
              </Text>
              <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>
                {highRisk > 0 ? (
                  <Text style={{ color: '#dc2626', fontWeight: 'bold' }}>{highRisk}</Text>
                ) : (
                  <Text>0</Text>
                )}
              </Text>
              <Text style={[styles.tableCell, { flex: 3, fontSize: 8 }]}>
                {description}
              </Text>
            </View>
          );
        })}
        <View style={[styles.tableRow, { backgroundColor: '#f3f4f6' }]}>
          <Text style={[styles.tableCell, { flex: 2, fontWeight: 'bold' }]}>Total</Text>
          <Text style={[styles.tableCell, { flex: 1, textAlign: 'center', fontWeight: 'bold' }]}>
            {totalThreats}
          </Text>
          <Text style={[styles.tableCell, { flex: 1, textAlign: 'center', fontWeight: 'bold' }]}>
            {highSeverityThreats}
          </Text>
          <Text style={[styles.tableCell, { flex: 3 }]}>-</Text>
        </View>
      </View>
      
      {/* Top Threats */}
      {topThreats.length > 0 && (
        <>
          <Text style={styles.subsectionTitle}>Top 10 Critical Threats</Text>
          
          <View style={styles.warningBox}>
            <Text style={styles.bold}>⚠ High Priority Threats Detected</Text>
            <Text>
              {topThreats.length} threat{topThreats.length !== 1 ? 's' : ''} with high likelihood 
              AND high impact require immediate attention. These represent the greatest risk to the system.
            </Text>
          </View>
          
          {topThreats.map((threat, idx) => (
            <View key={idx} style={[styles.findingCard, { borderLeftColor: '#dc2626', marginBottom: 8 }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={[styles.bold, { fontSize: 10 }]}>
                  T-{String(idx + 1).padStart(2, '0')}. {threat.component}
                </Text>
                <View style={[styles.badge, styles.badgeDanger]}>
                  <Text>{threat.category}</Text>
                </View>
              </View>
              <Text style={{ fontSize: 9, marginBottom: 6 }}>{threat.description}</Text>
              <View style={{ flexDirection: 'row', marginBottom: 4 }}>
                <Text style={{ fontSize: 8, color: '#6b7280', marginRight: 12 }}>
                  Likelihood: <Text style={styles.bold}>{threat.likelihood.toUpperCase()}</Text>
                </Text>
                <Text style={{ fontSize: 8, color: '#6b7280' }}>
                  Impact: <Text style={styles.bold}>{threat.impact.toUpperCase()}</Text>
                </Text>
              </View>
              {threat.mitigation && (
                <View style={{ marginTop: 4, paddingTop: 4, borderTopWidth: 1, borderTopColor: '#e5e7eb' }}>
                  <Text style={{ fontSize: 8, color: '#6b7280', marginBottom: 2 }}>Mitigation:</Text>
                  <Text style={{ fontSize: 8 }}>{threat.mitigation}</Text>
                </View>
              )}
            </View>
          ))}
        </>
      )}
      
      {/* Attack Paths */}
      {totalAttackPaths > 0 && (
        <>
          <Text style={styles.subsectionTitle}>Attack Path Analysis</Text>
          
          <View style={styles.paragraph}>
            <Text>
              Identified {totalAttackPaths} potential attack path{totalAttackPaths !== 1 ? 's' : ''} from 
              external entry points to critical assets. {criticalPaths > 0 && (
                <Text style={{ color: '#dc2626', fontWeight: 'bold' }}>
                  {' '}{criticalPaths} of these are classified as critical risk.
                </Text>
              )}
            </Text>
          </View>
          
          {criticalPaths > 0 && (
            <View style={styles.dangerBox}>
              <Text style={styles.bold}>🚨 Critical Attack Paths</Text>
              <Text>
                Multiple high-risk paths exist from external sources to sensitive data or critical systems. 
                Implement defense-in-depth controls and network segmentation to break these attack chains.
              </Text>
            </View>
          )}
        </>
      )}
      
      {/* Threat Model Matrix Preview */}
      <Text style={styles.subsectionTitle}>Component Threat Matrix</Text>
      
      <View style={styles.infoBox}>
        <Text style={{ fontSize: 9, fontStyle: 'italic' }}>
          The detailed threat model matrix showing which STRIDE categories affect each component 
          is available in the STRIDE Report (Detailed) section.
        </Text>
      </View>
      
      <View style={styles.footer}>
        <Text>Koh Atlas - Secure Architecture Analyzer</Text>
        <Text>Page {pageNumber}</Text>
      </View>
    </Page>
  );
};
