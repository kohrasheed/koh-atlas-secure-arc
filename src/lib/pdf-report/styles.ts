import { StyleSheet } from '@react-pdf/renderer';

export const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  
  // Cover page
  coverPage: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  coverTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 20,
    textAlign: 'center',
  },
  coverSubtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 40,
    textAlign: 'center',
  },
  coverMetadata: {
    marginTop: 60,
    padding: 20,
    border: '2pt solid #e5e7eb',
    borderRadius: 8,
    width: '80%',
  },
  coverMetadataRow: {
    marginBottom: 8,
  },
  coverStatsBox: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#eff6ff',
    borderRadius: 6,
  },
  coverStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  coverStatItem: {
    alignItems: 'center',
  },
  coverStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  coverStatLabel: {
    fontSize: 8,
    color: '#6b7280',
    marginTop: 4,
  },
  
  // Headers & sections
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 20,
    marginBottom: 10,
    borderBottom: '2pt solid #3b82f6',
    paddingBottom: 5,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 15,
    marginBottom: 8,
  },
  heading3: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4b5563',
    marginTop: 10,
    marginBottom: 6,
  },
  
  // Text
  paragraph: {
    fontSize: 10,
    lineHeight: 1.5,
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'justify',
  },
  bold: {
    fontWeight: 'bold',
  },
  italic: {
    fontStyle: 'italic',
  },
  small: {
    fontSize: 8,
  },
  
  // Lists
  listItem: {
    flexDirection: 'row',
    marginBottom: 4,
    marginLeft: 15,
  },
  listBullet: {
    width: 15,
    fontSize: 10,
  },
  listContent: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.4,
  },
  
  // Tables
  table: {
    display: 'flex',
    width: '100%',
    marginVertical: 10,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    minHeight: 25,
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#f3f4f6',
    fontWeight: 'bold',
  },
  tableCell: {
    padding: 5,
    fontSize: 9,
    flex: 1,
  },
  
  // Badges & status
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    fontSize: 8,
    fontWeight: 'bold',
  },
  badgeCritical: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
  badgeHigh: {
    backgroundColor: '#fed7aa',
    color: '#9a3412',
  },
  badgeMedium: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  badgeLow: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
  },
  badgeInfo: {
    backgroundColor: '#e0e7ff',
    color: '#3730a3',
  },
  badgeSuccess: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
  },
  badgeWarning: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  badgeDanger: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
  
  // Finding card
  findingCard: {
    border: '1pt solid #e5e7eb',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#f9fafb',
  },
  findingCardCritical: {
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
  },
  findingCardHigh: {
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  findingCardMedium: {
    borderLeftWidth: 4,
    borderLeftColor: '#eab308',
  },
  findingCardLow: {
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  findingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  findingTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  findingMeta: {
    fontSize: 8,
    color: '#6b7280',
    marginBottom: 4,
  },
  findingSection: {
    marginTop: 8,
  },
  findingSectionTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  findingText: {
    fontSize: 9,
    lineHeight: 1.4,
    color: '#4b5563',
  },
  
  // Boxes & containers
  infoBox: {
    padding: 12,
    backgroundColor: '#eff6ff',
    borderLeft: '3pt solid #3b82f6',
    marginVertical: 10,
  },
  warningBox: {
    padding: 12,
    backgroundColor: '#fef3c7',
    borderLeft: '3pt solid #f59e0b',
    marginVertical: 10,
  },
  dangerBox: {
    padding: 12,
    backgroundColor: '#fee2e2',
    borderLeft: '3pt solid #dc2626',
    marginVertical: 10,
  },
  successBox: {
    padding: 12,
    backgroundColor: '#d1fae5',
    borderLeft: '3pt solid #10b981',
    marginVertical: 10,
  },
  
  // Images
  diagramImage: {
    width: '100%',
    maxHeight: 400,
    objectFit: 'contain',
    marginVertical: 15,
  },
  diagramImageSmall: {
    width: '100%',
    maxHeight: 250,
    objectFit: 'contain',
    marginVertical: 10,
  },
  
  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: '#9ca3af',
    borderTop: '1pt solid #e5e7eb',
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  // Spacing utilities
  mt10: { marginTop: 10 },
  mt20: { marginTop: 20 },
  mb10: { marginBottom: 10 },
  mb20: { marginBottom: 20 },
  p10: { padding: 10 },
  p20: { padding: 20 },
});
