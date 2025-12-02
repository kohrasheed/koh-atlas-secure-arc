import React from 'react';
import { Page, Text, View, Image } from '@react-pdf/renderer';
import { styles } from '../styles';
import type { ReportData } from '../types';

interface CoverPageProps {
  data: ReportData;
}

export const CoverPage: React.FC<CoverPageProps> = ({ data }) => {
  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.coverPage}>
        <Text style={styles.coverTitle}>
          Security Architecture{'\n'}Analysis Report
        </Text>
        
        <Text style={styles.coverSubtitle}>
          {data.projectName}
        </Text>
        
        {data.currentArchitectureDiagram && (
          <Image
            src={data.currentArchitectureDiagram}
            style={{ width: 400, height: 250, marginVertical: 30, objectFit: 'contain' }}
          />
        )}
        
        <View style={styles.coverMetadata}>
          <View style={styles.coverMetadataRow}>
            <Text style={styles.bold}>Report Date: </Text>
            <Text>{new Date(data.reportDate).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric'
            })} {new Date(data.reportDate).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            })}</Text>
          </View>
          
          <View style={styles.coverMetadataRow}>
            <Text style={styles.bold}>Report ID: </Text>
            <Text>{data.reportId}</Text>
          </View>
          
          {data.preparedBy && (
            <View style={styles.coverMetadataRow}>
              <Text style={styles.bold}>Prepared By: </Text>
              <Text>{data.preparedBy}</Text>
            </View>
          )}
          
          <View style={styles.coverMetadataRow}>
            <Text style={styles.bold}>Classification: </Text>
            <Text style={[
              styles.badge,
              data.classification === 'Confidential' ? styles.badgeDanger :
              data.classification === 'Internal' ? styles.badgeWarning :
              styles.badgeInfo
            ]}>
              {data.classification}
            </Text>
          </View>
          
          <View style={styles.coverStatsBox}>
            <View style={styles.coverStatsRow}>
              <View style={styles.coverStatItem}>
                <Text style={[styles.coverStatValue, { color: '#3b82f6' }]}>
                  {data.totalComponents}
                </Text>
                <Text style={styles.coverStatLabel}>Components</Text>
              </View>
              
              <View style={styles.coverStatItem}>
                <Text style={[styles.coverStatValue, { color: '#ef4444' }]}>
                  {data.criticalIssues}
                </Text>
                <Text style={styles.coverStatLabel}>Critical</Text>
              </View>
              
              <View style={styles.coverStatItem}>
                <Text style={[styles.coverStatValue, { color: '#f59e0b' }]}>
                  {data.highIssues}
                </Text>
                <Text style={styles.coverStatLabel}>High</Text>
              </View>
              
              <View style={styles.coverStatItem}>
                <Text style={[styles.coverStatValue, { color: '#10b981' }]}>
                  {data.overallScore}
                </Text>
                <Text style={styles.coverStatLabel}>Score /100</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text>Koh Atlas - Secure Architecture Analyzer</Text>
        <Text>Page 1</Text>
      </View>
    </Page>
  );
};
