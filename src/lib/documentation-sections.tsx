import React from 'react';
import { Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Use the same styles as in documentation-generator
const docStyles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
    lineHeight: 1.6,
  },
  h1: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 15,
    color: '#1a202c',
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6',
    paddingBottom: 5,
  },
  h2: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#2d3748',
  },
  h3: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 8,
    color: '#4a5568',
  },
  paragraph: {
    marginBottom: 10,
    textAlign: 'justify',
  },
  list: {
    marginLeft: 20,
    marginBottom: 10,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  bullet: {
    width: 15,
    marginRight: 5,
  },
  code: {
    fontFamily: 'Courier',
    backgroundColor: '#f7fafc',
    padding: 10,
    marginVertical: 10,
    fontSize: 9,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  table: {
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    minHeight: 30,
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#f7fafc',
    fontWeight: 'bold',
  },
  tableCell: {
    flex: 1,
    padding: 8,
    fontSize: 10,
  },
  note: {
    backgroundColor: '#ebf8ff',
    padding: 10,
    marginVertical: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  warning: {
    backgroundColor: '#fffbeb',
    padding: 10,
    marginVertical: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#718096',
  },
});

// Security Analysis Panel Section
export const SecurityAnalysisPanel = () => (
  <>
    <Page size="A4" style={docStyles.page}>
      <Text style={docStyles.h1}>3.3 Security Analysis Panel</Text>
      
      <Text style={docStyles.paragraph}>
        The Security Analysis Panel appears on the right side after clicking "Analyze". It provides 
        comprehensive security findings organized by severity and category, with AI-enhanced 
        recommendations for remediation.
      </Text>
      
      <Text style={docStyles.h2}>Analysis Results Structure</Text>
      
      <Text style={docStyles.h3}>Security Score</Text>
      <Text style={docStyles.paragraph}>
        A numerical score from 0-100 representing overall architecture security. The score is calculated 
        based on:
      </Text>
      
      <View style={docStyles.list}>
        {[
          'Number and severity of security findings (50% weight)',
          'Compliance violations across frameworks (20% weight)',
          'Critical architectural patterns and best practices (15% weight)',
          'Attack surface and potential attack paths (15% weight)',
        ].map((item, i) => (
          <View key={i} style={docStyles.listItem}>
            <Text style={docStyles.bullet}>•</Text>
            <Text style={{ flex: 1 }}>{item}</Text>
          </View>
        ))}
      </View>
      
      <Text style={docStyles.h3}>Severity Levels</Text>
      
      <View style={docStyles.table}>
        <View style={[docStyles.tableRow, docStyles.tableHeader]}>
          <Text style={[docStyles.tableCell, { flex: 1 }]}>Severity</Text>
          <Text style={[docStyles.tableCell, { flex: 2 }]}>Description</Text>
          <Text style={[docStyles.tableCell, { flex: 1 }]}>Action</Text>
        </View>
        {[
          ['Critical', 'Immediate security risk requiring urgent remediation', 'Fix Now'],
          ['High', 'Significant vulnerability that should be addressed soon', '< 7 days'],
          ['Medium', 'Security concern that should be planned for remediation', '< 30 days'],
          ['Low', 'Minor issue or best practice recommendation', 'Backlog'],
        ].map(([sev, desc, action], i) => (
          <View key={i} style={docStyles.tableRow}>
            <Text style={[docStyles.tableCell, { flex: 1, fontWeight: 'bold' }]}>{sev}</Text>
            <Text style={[docStyles.tableCell, { flex: 2 }]}>{desc}</Text>
            <Text style={[docStyles.tableCell, { flex: 1 }]}>{action}</Text>
          </View>
        ))}
      </View>
      
      <Text style={docStyles.h3}>Finding Categories</Text>
      
      <View style={docStyles.list}>
        {[
          'Encryption - Missing or weak encryption at rest and in transit',
          'Access Control - IAM misconfigurations, overly permissive policies',
          'Network Security - Open ports, missing firewalls, insecure connections',
          'Data Protection - Lack of backups, retention policies, data residency',
          'Monitoring - Missing logging, alerting, or audit trails',
          'Configuration - Service misconfigurations and security settings',
        ].map((item, i) => (
          <View key={i} style={docStyles.listItem}>
            <Text style={docStyles.bullet}>→</Text>
            <Text style={{ flex: 1 }}>{item}</Text>
          </View>
        ))}
      </View>
      
      <Text style={docStyles.footer}>Page 11</Text>
    </Page>
    
    <Page size="A4" style={docStyles.page}>
      <Text style={docStyles.h3}>Finding Details</Text>
      
      <Text style={docStyles.paragraph}>
        Each security finding includes:
      </Text>
      
      <View style={docStyles.note}>
        <Text style={{ fontWeight: 'bold' }}>Title:</Text>
        <Text>Clear description of the security issue</Text>
        <Text style={{ fontWeight: 'bold', marginTop: 5 }}>Severity:</Text>
        <Text>Risk level (Critical, High, Medium, Low)</Text>
        <Text style={{ fontWeight: 'bold', marginTop: 5 }}>Affected Components:</Text>
        <Text>List of components impacted by this issue</Text>
        <Text style={{ fontWeight: 'bold', marginTop: 5 }}>Description:</Text>
        <Text>Detailed explanation of why this is a security concern</Text>
        <Text style={{ fontWeight: 'bold', marginTop: 5 }}>Risk:</Text>
        <Text>Potential impact if exploited</Text>
        <Text style={{ fontWeight: 'bold', marginTop: 5 }}>Remediation:</Text>
        <Text>Step-by-step instructions to fix the issue</Text>
        <Text style={{ fontWeight: 'bold', marginTop: 5 }}>Standards:</Text>
        <Text>Relevant compliance frameworks (GDPR, HIPAA, etc.)</Text>
      </View>
      
      <Text style={docStyles.h3}>AI-Enhanced Recommendations</Text>
      
      <Text style={docStyles.paragraph}>
        When AI analysis is enabled, findings include additional context:
      </Text>
      
      <View style={docStyles.list}>
        {[
          'Plain-language explanation of the vulnerability',
          'Real-world attack scenarios and examples',
          'Prioritized remediation steps based on your architecture',
          'Alternative solutions and trade-offs',
          'Implementation effort estimation (Low/Medium/High)',
          'Links to AWS documentation and best practices',
        ].map((item, i) => (
          <View key={i} style={docStyles.listItem}>
            <Text style={docStyles.bullet}>✓</Text>
            <Text style={{ flex: 1 }}>{item}</Text>
          </View>
        ))}
      </View>
      
      <Text style={docStyles.h3}>Interactive Features</Text>
      
      <View style={docStyles.list}>
        {[
          'Click finding to highlight affected components on canvas',
          'Filter findings by severity or category',
          'Search findings by keyword',
          'Export findings to CSV for tracking',
          'Mark findings as acknowledged or resolved',
        ].map((item, i) => (
          <View key={i} style={docStyles.listItem}>
            <Text style={docStyles.bullet}>→</Text>
            <Text style={{ flex: 1 }}>{item}</Text>
          </View>
        ))}
      </View>
      
      <Text style={docStyles.footer}>Page 12</Text>
    </Page>
  </>
);

// STRIDE Threat Modeling Section
export const STRIDEThreatModeling = () => (
  <>
    <Page size="A4" style={docStyles.page}>
      <Text style={docStyles.h1}>3.4 STRIDE Threat Modeling</Text>
      
      <Text style={docStyles.paragraph}>
        STRIDE is a systematic threat modeling framework developed by Microsoft. Koh Atlas automatically 
        generates STRIDE threats based on your architecture components and their relationships.
      </Text>
      
      <Text style={docStyles.h2}>STRIDE Categories</Text>
      
      <View style={docStyles.table}>
        <View style={[docStyles.tableRow, docStyles.tableHeader]}>
          <Text style={[docStyles.tableCell, { flex: 1 }]}>Category</Text>
          <Text style={[docStyles.tableCell, { flex: 2 }]}>Description</Text>
          <Text style={[docStyles.tableCell, { flex: 1.5 }]}>Example</Text>
        </View>
        {[
          ['Spoofing', 'Pretending to be someone/something else', 'Stolen credentials'],
          ['Tampering', 'Modifying data or code', 'Database injection'],
          ['Repudiation', 'Claiming not to have done something', 'Missing audit logs'],
          ['Info Disclosure', 'Exposing information to unauthorized users', 'Unencrypted data'],
          ['Denial of Service', 'Denying service to legitimate users', 'Resource exhaustion'],
          ['Elevation of Privilege', 'Gaining unauthorized capabilities', 'IAM misconfiguration'],
        ].map(([cat, desc, ex], i) => (
          <View key={i} style={docStyles.tableRow}>
            <Text style={[docStyles.tableCell, { flex: 1, fontWeight: 'bold' }]}>{cat}</Text>
            <Text style={[docStyles.tableCell, { flex: 2 }]}>{desc}</Text>
            <Text style={[docStyles.tableCell, { flex: 1.5 }]}>{ex}</Text>
          </View>
        ))}
      </View>
      
      <Text style={docStyles.h2}>Threat Generation Logic</Text>
      
      <Text style={docStyles.paragraph}>
        The system analyzes your architecture and generates relevant threats based on:
      </Text>
      
      <View style={docStyles.list}>
        {[
          'Component Type - Each service has known threat vectors',
          'Trust Boundaries - Connections crossing security zones',
          'Data Flow - Sensitive data transmission paths',
          'Authentication Methods - Identity verification mechanisms',
          'Authorization Models - Access control implementations',
          'External Interfaces - Public-facing endpoints',
        ].map((item, i) => (
          <View key={i} style={docStyles.listItem}>
            <Text style={docStyles.bullet}>•</Text>
            <Text style={{ flex: 1 }}>{item}</Text>
          </View>
        ))}
      </View>
      
      <Text style={docStyles.footer}>Page 13</Text>
    </Page>
    
    <Page size="A4" style={docStyles.page}>
      <Text style={docStyles.h3}>Threat Properties</Text>
      
      <Text style={docStyles.paragraph}>
        Each identified threat includes:
      </Text>
      
      <View style={docStyles.note}>
        <Text style={{ fontWeight: 'bold' }}>Component:</Text>
        <Text>The affected service or resource</Text>
        <Text style={{ fontWeight: 'bold', marginTop: 5 }}>STRIDE Category:</Text>
        <Text>Which threat type this represents</Text>
        <Text style={{ fontWeight: 'bold', marginTop: 5 }}>Description:</Text>
        <Text>How the threat could be exploited</Text>
        <Text style={{ fontWeight: 'bold', marginTop: 5 }}>Likelihood:</Text>
        <Text>Probability of exploitation (Low/Medium/High)</Text>
        <Text style={{ fontWeight: 'bold', marginTop: 5 }}>Impact:</Text>
        <Text>Potential damage if successful (Low/Medium/High)</Text>
        <Text style={{ fontWeight: 'bold', marginTop: 5 }}>Mitigation:</Text>
        <Text>Controls to prevent or reduce the threat</Text>
        <Text style={{ fontWeight: 'bold', marginTop: 5 }}>Status:</Text>
        <Text>Current state (Open/Mitigated/Accepted)</Text>
      </View>
      
      <Text style={docStyles.h3}>Risk Matrix</Text>
      
      <Text style={docStyles.paragraph}>
        Threats are prioritized using a risk matrix combining likelihood and impact:
      </Text>
      
      <View style={docStyles.table}>
        <View style={[docStyles.tableRow, docStyles.tableHeader]}>
          <Text style={docStyles.tableCell}>Likelihood</Text>
          <Text style={docStyles.tableCell}>Low Impact</Text>
          <Text style={docStyles.tableCell}>Med Impact</Text>
          <Text style={docStyles.tableCell}>High Impact</Text>
        </View>
        {[
          ['High', 'Medium', 'High', 'Critical'],
          ['Medium', 'Low', 'Medium', 'High'],
          ['Low', 'Low', 'Low', 'Medium'],
        ].map(([likelihood, ...impacts], i) => (
          <View key={i} style={docStyles.tableRow}>
            <Text style={[docStyles.tableCell, { fontWeight: 'bold' }]}>{likelihood}</Text>
            {impacts.map((impact, j) => (
              <Text key={j} style={docStyles.tableCell}>{impact}</Text>
            ))}
          </View>
        ))}
      </View>
      
      <Text style={docStyles.h3}>Using STRIDE Results</Text>
      
      <View style={docStyles.list}>
        {[
          'Review each threat and assess its applicability to your context',
          'Implement suggested mitigations for high-risk threats',
          'Document accepted risks with business justification',
          'Track mitigation status through the threat lifecycle',
          'Re-analyze after making architecture changes',
          'Include STRIDE results in security documentation',
        ].map((item, i) => (
          <View key={i} style={docStyles.listItem}>
            <Text style={docStyles.bullet}>{i + 1}.</Text>
            <Text style={{ flex: 1 }}>{item}</Text>
          </View>
        ))}
      </View>
      
      <Text style={docStyles.footer}>Page 14</Text>
    </Page>
  </>
);

// Technical Architecture Section
export const TechnicalArchitecture = () => (
  <>
    <Page size="A4" style={docStyles.page}>
      <Text style={docStyles.h1}>5. Technical Architecture</Text>
      
      <Text style={docStyles.paragraph}>
        Koh Atlas is built as a modern single-page application using React and TypeScript, with a 
        sophisticated security analysis engine and AI integration.
      </Text>
      
      <Text style={docStyles.h2}>5.1 Frontend Stack</Text>
      
      <View style={docStyles.table}>
        <View style={[docStyles.tableRow, docStyles.tableHeader]}>
          <Text style={[docStyles.tableCell, { flex: 1 }]}>Technology</Text>
          <Text style={[docStyles.tableCell, { flex: 1 }]}>Version</Text>
          <Text style={[docStyles.tableCell, { flex: 2 }]}>Purpose</Text>
        </View>
        {[
          ['React', '18.3.1', 'UI framework for component-based architecture'],
          ['TypeScript', '5.6.3', 'Type-safe development and better IDE support'],
          ['React Flow', '11.11.4', 'Canvas and node-based architecture designer'],
          ['Tailwind CSS', '3.4.1', 'Utility-first styling and responsive design'],
          ['Vite', '6.4.1', 'Fast build tool and development server'],
          ['Zustand', 'Latest', 'Lightweight state management'],
        ].map(([tech, ver, purpose], i) => (
          <View key={i} style={docStyles.tableRow}>
            <Text style={[docStyles.tableCell, { flex: 1, fontWeight: 'bold' }]}>{tech}</Text>
            <Text style={[docStyles.tableCell, { flex: 1 }]}>{ver}</Text>
            <Text style={[docStyles.tableCell, { flex: 2 }]}>{purpose}</Text>
          </View>
        ))}
      </View>
      
      <Text style={docStyles.h3}>Key Libraries</Text>
      
      <View style={docStyles.list}>
        {[
          '@react-pdf/renderer - PDF report generation',
          '@phosphor-icons/react - Icon library for UI components',
          'clsx - Conditional className composition',
          'react-error-boundary - Error handling and recovery',
          'html2canvas - Canvas export functionality',
        ].map((item, i) => (
          <View key={i} style={docStyles.listItem}>
            <Text style={docStyles.bullet}>•</Text>
            <Text style={{ flex: 1 }}>{item}</Text>
          </View>
        ))}
      </View>
      
      <Text style={docStyles.h3}>Build Configuration</Text>
      
      <View style={docStyles.code}>
        <Text>{`// vite.config.ts
export default defineConfig({
  plugins: [react()],
  base: '/koh-atlas-secure-arc/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});`}</Text>
      </View>
      
      <Text style={docStyles.footer}>Page 36</Text>
    </Page>
    
    <Page size="A4" style={docStyles.page}>
      <Text style={docStyles.h2}>5.2 State Management</Text>
      
      <Text style={docStyles.paragraph}>
        The application uses a custom hook-based state management approach with React Flow's built-in 
        state handling for canvas operations.
      </Text>
      
      <Text style={docStyles.h3}>Architecture Designer State</Text>
      
      <View style={docStyles.code}>
        <Text>{`// useArchitectureDesigner Hook
const useArchitectureDesigner = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [analysisResults, setAnalysisResults] = useState(null);
  
  // Component management
  const addComponent = (type: string, position: XYPosition) => {
    // Create new node with unique ID
  };
  
  const removeComponent = (id: string) => {
    // Remove node and connected edges
  };
  
  // Analysis operations
  const analyzeArchitecture = async () => {
    // Run security analysis
  };
  
  return {
    nodes, edges, analysisResults,
    addComponent, removeComponent, analyzeArchitecture,
    // ... other operations
  };
};`}</Text>
      </View>
      
      <Text style={docStyles.h3}>Local Storage Persistence</Text>
      
      <Text style={docStyles.paragraph}>
        Architecture state is automatically saved to browser local storage every 30 seconds using a 
        debounced save mechanism:
      </Text>
      
      <View style={docStyles.code}>
        <Text>{`// Auto-save hook
useEffect(() => {
  const timer = setTimeout(() => {
    localStorage.setItem('architecture', JSON.stringify({
      nodes, edges, timestamp: Date.now()
    }));
  }, 30000);
  return () => clearTimeout(timer);
}, [nodes, edges]);`}</Text>
      </View>
      
      <Text style={docStyles.h3}>Theme Management</Text>
      
      <View style={docStyles.code}>
        <Text>{`// useTheme Hook
const useTheme = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(
    () => localStorage.getItem('theme') || 'light'
  );
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark');
  };
  
  return { theme, toggleTheme };
};`}</Text>
      </View>
      
      <Text style={docStyles.footer}>Page 38</Text>
    </Page>
    
    <Page size="A4" style={docStyles.page}>
      <Text style={docStyles.h2}>5.3 Security Engine</Text>
      
      <Text style={docStyles.paragraph}>
        The security analysis engine is the core of Koh Atlas, implementing multiple analysis 
        algorithms and rule-based detection systems.
      </Text>
      
      <Text style={docStyles.h3}>Analysis Pipeline</Text>
      
      <View style={docStyles.list}>
        {[
          '1. Architecture Parsing - Extract components, connections, and metadata',
          '2. Vulnerability Detection - Apply rule-based security checks',
          '3. STRIDE Analysis - Generate threat model based on STRIDE framework',
          '4. Compliance Validation - Check against regulatory requirements',
          '5. Attack Path Analysis - Identify potential lateral movement paths',
          '6. Best Practice Validation - Verify architectural patterns',
          '7. AI Enhancement - Enrich findings with AI-powered insights',
          '8. Scoring & Prioritization - Calculate security score and rank issues',
        ].map((item, i) => (
          <View key={i} style={docStyles.listItem}>
            <Text style={docStyles.bullet}></Text>
            <Text style={{ flex: 1 }}>{item}</Text>
          </View>
        ))}
      </View>
      
      <Text style={docStyles.h3}>Security Analyzer Module</Text>
      
      <View style={docStyles.code}>
        <Text>{`// security-analyzer.ts
export class SecurityAnalyzer {
  analyzeArchitecture(nodes: Node[], edges: Edge[]): AnalysisResult {
    const findings = [
      ...this.checkEncryption(nodes, edges),
      ...this.checkAccessControl(nodes),
      ...this.checkNetworkSecurity(edges),
      ...this.checkDataProtection(nodes),
      ...this.checkMonitoring(nodes),
      ...this.checkConfiguration(nodes),
    ];
    
    const strideThreats = this.generateSTRIDEThreats(nodes, edges);
    const complianceResults = this.validateCompliance(nodes, edges);
    const attackPaths = this.identifyAttackPaths(nodes, edges);
    const score = this.calculateSecurityScore(findings);
    
    return {
      findings, strideThreats, complianceResults,
      attackPaths, score, timestamp: Date.now()
    };
  }
}`}</Text>
      </View>
      
      <Text style={docStyles.h3}>Rule Engine</Text>
      
      <Text style={docStyles.paragraph}>
        Security rules are defined declaratively with severity, category, and detection logic:
      </Text>
      
      <View style={docStyles.code}>
        <Text>{`const rules: SecurityRule[] = [
  {
    id: 'S3-001',
    title: 'S3 Bucket Missing Encryption',
    severity: 'high',
    category: 'encryption',
    check: (node) => node.type === 's3' && !node.encrypted,
    remediation: 'Enable default encryption using AWS KMS',
    standards: ['GDPR', 'HIPAA', 'PCI-DSS']
  },
  // ... more rules
];`}</Text>
      </View>
      
      <Text style={docStyles.footer}>Page 40</Text>
    </Page>
  </>
);

// Export all sections
export const allDocumentationSections = {
  SecurityAnalysisPanel,
  STRIDEThreatModeling,
  TechnicalArchitecture,
};
