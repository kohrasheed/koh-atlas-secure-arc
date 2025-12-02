import React from 'react';
import { Page, Text, View, Image } from '@react-pdf/renderer';
import { styles } from '../styles';
import type { ReportData } from '../types';

interface ArchitectureOverviewProps {
  data: ReportData;
  pageNumber: number;
}

export const ArchitectureOverview: React.FC<ArchitectureOverviewProps> = ({ data, pageNumber }) => {
  // Aggregate component types with issue counts
  const componentsByType = data.nodes.reduce((acc, node) => {
    const type = node.data?.type || 'Unknown';
    if (!acc[type]) {
      acc[type] = { count: 0, issues: 0 };
    }
    acc[type].count++;
    
    // Count issues affecting this component
    const affectedIssues = data.findings.filter(f => 
      f.affected.includes(node.id) || 
      f.affected.includes(type.toLowerCase()) ||
      f.affected.includes('architecture')
    );
    acc[type].issues += affectedIssues.length;
    
    return acc;
  }, {} as Record<string, { count: number; issues: number }>);
  
  const sortedComponents = Object.entries(componentsByType).sort((a, b) => b[1].count - a[1].count);
  
  // Aggregate zones
  const zoneStats = data.nodes.reduce((acc, node) => {
    const zone = node.data?.zone || 'Unspecified';
    if (!acc[zone]) {
      acc[zone] = { components: 0, types: new Set<string>() };
    }
    acc[zone].components++;
    acc[zone].types.add(node.data?.type || 'Unknown');
    return acc;
  }, {} as Record<string, { components: number; types: Set<string> }>);
  
  // Count encrypted vs unencrypted connections
  const connectionStats = data.edges.reduce((acc, edge) => {
    const encrypted = edge.data?.encrypted === true;
    if (encrypted) {
      acc.encrypted++;
    } else {
      acc.unencrypted++;
    }
    return acc;
  }, { encrypted: 0, unencrypted: 0 });
  
  // Calculate encryption percentage
  const totalConnections = connectionStats.encrypted + connectionStats.unencrypted;
  const encryptionPercentage = totalConnections > 0 
    ? Math.round((connectionStats.encrypted / totalConnections) * 100)
    : 0;
  
  // Aggregate technologies
  const technologies = data.nodes.reduce((acc, node) => {
    const tech = node.data?.technology;
    if (tech && !acc.includes(tech)) {
      acc.push(tech);
    }
    return acc;
  }, [] as string[]).sort();

  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.sectionTitle}>Architecture Overview</Text>
      
      <Text style={styles.subsectionTitle}>Current Architecture Diagram</Text>
      
      {data.diagramImage ? (
        <Image src={data.diagramImage} style={styles.fullDiagram} />
      ) : (
        <View style={styles.infoBox}>
          <Text>Architecture diagram not available</Text>
        </View>
      )}
      
      <Text style={styles.subsectionTitle}>Component Inventory</Text>
      
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableCell, { flex: 2 }]}>Component Type</Text>
          <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>Count</Text>
          <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>Issues</Text>
          <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>Status</Text>
        </View>
        {sortedComponents.map(([type, stats]) => (
          <View key={type} style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 2 }]}>{type}</Text>
            <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>{stats.count}</Text>
            <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>{stats.issues}</Text>
            <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>
              {stats.issues === 0 ? '✓' : stats.issues > 5 ? '⚠' : '△'}
            </Text>
          </View>
        ))}
        <View style={[styles.tableRow, { backgroundColor: '#f3f4f6' }]}>
          <Text style={[styles.tableCell, { flex: 2, fontWeight: 'bold' }]}>Total</Text>
          <Text style={[styles.tableCell, { flex: 1, textAlign: 'center', fontWeight: 'bold' }]}>
            {data.nodes.length}
          </Text>
          <Text style={[styles.tableCell, { flex: 1, textAlign: 'center', fontWeight: 'bold' }]}>
            {data.findings.length}
          </Text>
          <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>-</Text>
        </View>
      </View>
      
      <Text style={styles.subsectionTitle}>Network Zones</Text>
      
      <View style={styles.listItem}>
        {Object.entries(zoneStats).map(([zone, stats]) => (
          <View key={zone} style={{ marginBottom: 6 }}>
            <Text style={styles.bold}>{zone}</Text>
            <Text style={{ fontSize: 9, color: '#6b7280', marginLeft: 12 }}>
              {stats.components} component{stats.components !== 1 ? 's' : ''} 
              ({Array.from(stats.types).join(', ')})
            </Text>
          </View>
        ))}
      </View>
      
      <Text style={styles.subsectionTitle}>Data Flow Summary</Text>
      
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableCell, { flex: 2 }]}>Connection Type</Text>
          <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>Count</Text>
          <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>Percentage</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, { flex: 2 }]}>
            <Text style={[styles.badge, styles.badgeSuccess]}>🔒</Text>
            <Text> Encrypted Connections</Text>
          </Text>
          <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>
            {connectionStats.encrypted}
          </Text>
          <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>
            {encryptionPercentage}%
          </Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, { flex: 2 }]}>
            <Text style={[styles.badge, styles.badgeDanger]}>⚠</Text>
            <Text> Unencrypted Connections</Text>
          </Text>
          <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>
            {connectionStats.unencrypted}
          </Text>
          <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>
            {100 - encryptionPercentage}%
          </Text>
        </View>
        <View style={[styles.tableRow, { backgroundColor: '#f3f4f6' }]}>
          <Text style={[styles.tableCell, { flex: 2, fontWeight: 'bold' }]}>Total</Text>
          <Text style={[styles.tableCell, { flex: 1, textAlign: 'center', fontWeight: 'bold' }]}>
            {totalConnections}
          </Text>
          <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>100%</Text>
        </View>
      </View>
      
      {encryptionPercentage < 80 && (
        <View style={styles.warningBox}>
          <Text style={styles.bold}>⚠ Encryption Gap Detected</Text>
          <Text>
            Only {encryptionPercentage}% of connections are encrypted. All data in transit should use TLS 1.2+ 
            or IPSec to prevent eavesdropping and man-in-the-middle attacks.
          </Text>
        </View>
      )}
      
      {technologies.length > 0 && (
        <>
          <Text style={styles.subsectionTitle}>Technology Stack</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
            {technologies.map((tech) => (
              <View key={tech} style={[styles.badge, styles.badgeInfo, { margin: 4 }]}>
                <Text>{tech}</Text>
              </View>
            ))}
          </View>
        </>
      )}
      
      <View style={styles.footer}>
        <Text>Koh Atlas - Secure Architecture Analyzer</Text>
        <Text>Page {pageNumber}</Text>
      </View>
    </Page>
  );
};
