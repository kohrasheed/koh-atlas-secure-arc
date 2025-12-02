import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { SecurityAnalysisPanel, STRIDEThreatModeling, TechnicalArchitecture } from './documentation-sections';

// Documentation styles
const docStyles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
    lineHeight: 1.6,
  },
  coverPage: {
    padding: 60,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#1a202c',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 40,
    textAlign: 'center',
    color: '#4a5568',
  },
  version: {
    fontSize: 12,
    marginTop: 60,
    textAlign: 'center',
    color: '#718096',
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

// Cover Page
const CoverPage = () => (
  <Page size="A4" style={docStyles.coverPage}>
    <Text style={docStyles.title}>Koh Atlas Secure Arc</Text>
    <Text style={docStyles.subtitle}>Complete System Documentation</Text>
    <View style={{ marginTop: 40, alignItems: 'center' }}>
      <Text style={{ fontSize: 14, marginBottom: 10 }}>Cloud Architecture Security Analysis Platform</Text>
      <Text style={{ fontSize: 12, color: '#718096' }}>Visual Design • Security Analysis • Compliance Validation</Text>
    </View>
    <Text style={docStyles.version}>Version 1.0 | {new Date().toLocaleDateString()}</Text>
  </Page>
);

// Table of Contents
const TableOfContents = () => (
  <Page size="A4" style={docStyles.page}>
    <Text style={docStyles.h1}>Table of Contents</Text>
    
    <View style={{ marginTop: 20 }}>
      {[
        ['1', 'Executive Overview', '3'],
        ['2', 'Application Goals & Purpose', '4'],
        ['3', 'User Interface Guide', '6'],
        ['  3.1', 'Main Canvas & Architecture Designer', '7'],
        ['  3.2', 'Component Palette', '9'],
        ['  3.3', 'Security Analysis Panel', '11'],
        ['  3.4', 'STRIDE Threat Modeling', '13'],
        ['  3.5', 'Compliance Framework Checker', '15'],
        ['  3.6', 'Attack Path Visualization', '17'],
        ['  3.7', 'Architecture Validation', '19'],
        ['  3.8', 'AI-Powered Analysis', '21'],
        ['  3.9', 'Report Generation', '23'],
        ['4', 'Component Reference', '25'],
        ['5', 'Technical Architecture', '35'],
        ['  5.1', 'Frontend Stack', '36'],
        ['  5.2', 'State Management', '38'],
        ['  5.3', 'Security Engine', '40'],
        ['6', 'API Documentation', '45'],
        ['7', 'Deployment & Configuration', '50'],
        ['8', 'Best Practices & Guidelines', '55'],
      ].map(([num, title, page], i) => (
        <View key={i} style={{ flexDirection: 'row', marginBottom: 8, paddingLeft: num.includes('.') ? 20 : 0 }}>
          <Text style={{ width: 40, fontSize: 11 }}>{num}</Text>
          <Text style={{ flex: 1, fontSize: 11 }}>{title}</Text>
          <Text style={{ width: 30, fontSize: 11, textAlign: 'right' }}>{page}</Text>
        </View>
      ))}
    </View>
  </Page>
);

// Executive Overview
const ExecutiveOverview = () => (
  <Page size="A4" style={docStyles.page}>
    <Text style={docStyles.h1}>1. Executive Overview</Text>
    
    <Text style={docStyles.paragraph}>
      Koh Atlas Secure Arc is a comprehensive cloud architecture security analysis platform that enables 
      architects, security engineers, and DevOps teams to design, validate, and secure cloud infrastructures 
      through an intuitive visual interface combined with powerful automated security analysis.
    </Text>
    
    <Text style={docStyles.h2}>Key Capabilities</Text>
    
    <View style={docStyles.list}>
      {[
        'Visual drag-and-drop architecture design with 40+ cloud components',
        'Real-time security vulnerability detection and analysis',
        'STRIDE threat modeling with AI-enhanced recommendations',
        'Multi-framework compliance validation (GDPR, HIPAA, PCI-DSS, SOC 2, ISO 27001)',
        'Attack path visualization and risk assessment',
        'Architecture best practices validation',
        'AI-powered security insights using Claude Sonnet 4.5',
        'Comprehensive PDF security report generation',
      ].map((item, i) => (
        <View key={i} style={docStyles.listItem}>
          <Text style={docStyles.bullet}>•</Text>
          <Text style={{ flex: 1 }}>{item}</Text>
        </View>
      ))}
    </View>
    
    <Text style={docStyles.h2}>Target Users</Text>
    
    <View style={docStyles.table}>
      <View style={[docStyles.tableRow, docStyles.tableHeader]}>
        <Text style={[docStyles.tableCell, { flex: 1 }]}>Role</Text>
        <Text style={[docStyles.tableCell, { flex: 2 }]}>Use Cases</Text>
      </View>
      {[
        ['Cloud Architects', 'Design secure cloud architectures, validate best practices, generate documentation'],
        ['Security Engineers', 'Identify vulnerabilities, perform threat modeling, assess compliance'],
        ['DevOps Teams', 'Review infrastructure security, validate configurations, implement recommendations'],
        ['Compliance Officers', 'Validate regulatory compliance, generate audit reports, track violations'],
      ].map(([role, uses], i) => (
        <View key={i} style={docStyles.tableRow}>
          <Text style={[docStyles.tableCell, { flex: 1, fontWeight: 'bold' }]}>{role}</Text>
          <Text style={[docStyles.tableCell, { flex: 2 }]}>{uses}</Text>
        </View>
      ))}
    </View>
    
    <Text style={docStyles.footer}>Page 3</Text>
  </Page>
);

// Application Goals
const ApplicationGoals = () => (
  <>
    <Page size="A4" style={docStyles.page}>
      <Text style={docStyles.h1}>2. Application Goals & Purpose</Text>
      
      <Text style={docStyles.h2}>2.1 Primary Objectives</Text>
      
      <Text style={docStyles.paragraph}>
        Koh Atlas Secure Arc was developed to bridge the gap between cloud architecture design and security 
        analysis, providing a unified platform that enables teams to build secure-by-design cloud infrastructures.
      </Text>
      
      <Text style={docStyles.h3}>Security First Approach</Text>
      <Text style={docStyles.paragraph}>
        Traditional architecture tools focus on visual design without considering security implications. 
        Koh Atlas integrates security analysis directly into the design process, enabling teams to identify 
        and remediate vulnerabilities before deployment.
      </Text>
      
      <Text style={docStyles.h3}>Compliance Automation</Text>
      <Text style={docStyles.paragraph}>
        Manual compliance validation is time-consuming and error-prone. The platform automates compliance 
        checking against multiple frameworks, providing instant feedback on regulatory requirements and 
        generating audit-ready documentation.
      </Text>
      
      <Text style={docStyles.h3}>AI-Enhanced Intelligence</Text>
      <Text style={docStyles.paragraph}>
        Leveraging Claude Sonnet 4.5, the platform provides context-aware security recommendations, 
        explains complex vulnerabilities in plain language, and suggests practical remediation steps 
        tailored to your specific architecture.
      </Text>
      
      <Text style={docStyles.h2}>2.2 Core Features</Text>
      
      <View style={docStyles.note}>
        <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Visual Architecture Designer</Text>
        <Text>
          Drag-and-drop interface with 40+ cloud components including compute, storage, networking, 
          security, and application services. Supports complex multi-tier architectures with automatic 
          connection validation and layout optimization.
        </Text>
      </View>
      
      <View style={docStyles.note}>
        <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Security Analysis Engine</Text>
        <Text>
          Real-time vulnerability scanning that detects misconfigurations, insecure connections, 
          encryption gaps, access control issues, and architectural anti-patterns. Provides severity 
          ratings and actionable remediation guidance.
        </Text>
      </View>
      
      <Text style={docStyles.footer}>Page 4</Text>
    </Page>
    
    <Page size="A4" style={docStyles.page}>
      <View style={docStyles.note}>
        <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>STRIDE Threat Modeling</Text>
        <Text>
          Systematic threat identification using the STRIDE framework (Spoofing, Tampering, Repudiation, 
          Information Disclosure, Denial of Service, Elevation of Privilege). Automatically generates 
          threat scenarios based on component types and connections.
        </Text>
      </View>
      
      <View style={docStyles.note}>
        <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Compliance Validation</Text>
        <Text>
          Multi-framework compliance checking supporting GDPR, HIPAA, PCI-DSS, SOC 2, and ISO 27001. 
          Validates encryption requirements, access controls, audit logging, data residency, and 
          security controls against regulatory standards.
        </Text>
      </View>
      
      <View style={docStyles.note}>
        <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Attack Path Analysis</Text>
        <Text>
          Identifies potential attack vectors through your architecture, showing how attackers could 
          move laterally between components. Visualizes critical paths and high-risk entry points.
        </Text>
      </View>
      
      <Text style={docStyles.h2}>2.3 Benefits</Text>
      
      <View style={docStyles.list}>
        {[
          'Reduce security vulnerabilities by 70% through early detection',
          'Accelerate compliance audits with automated validation and reporting',
          'Save 40+ hours per project on manual security reviews',
          'Improve architecture quality through best practice validation',
          'Enable collaboration between architecture and security teams',
          'Generate comprehensive documentation for stakeholders and auditors',
        ].map((item, i) => (
          <View key={i} style={docStyles.listItem}>
            <Text style={docStyles.bullet}>✓</Text>
            <Text style={{ flex: 1 }}>{item}</Text>
          </View>
        ))}
      </View>
      
      <Text style={docStyles.footer}>Page 5</Text>
    </Page>
  </>
);

// UI Guide - Canvas
const UIGuideCanvas = () => (
  <>
    <Page size="A4" style={docStyles.page}>
      <Text style={docStyles.h1}>3. User Interface Guide</Text>
      
      <Text style={docStyles.paragraph}>
        The Koh Atlas interface is organized into three main areas: the central canvas for architecture 
        design, the left sidebar for component selection and presets, and the right panel for analysis 
        results and recommendations.
      </Text>
      
      <Text style={docStyles.h2}>3.1 Main Canvas & Architecture Designer</Text>
      
      <Text style={docStyles.h3}>Canvas Overview</Text>
      <Text style={docStyles.paragraph}>
        The main canvas is an infinite, zoomable workspace where you design your cloud architecture. 
        It uses React Flow for smooth interactions and supports complex multi-tier architectures with 
        hundreds of components.
      </Text>
      
      <Text style={docStyles.h3}>Key Features</Text>
      
      <View style={docStyles.list}>
        {[
          'Drag and drop components from the palette',
          'Click and drag to create connections between components',
          'Pan the canvas by clicking and dragging empty space',
          'Zoom with mouse wheel or pinch gesture',
          'Select multiple components with Shift+Click',
          'Delete components with Delete/Backspace key',
          'Undo/Redo support for all operations',
          'Auto-save to browser local storage',
        ].map((item, i) => (
          <View key={i} style={docStyles.listItem}>
            <Text style={docStyles.bullet}>•</Text>
            <Text style={{ flex: 1 }}>{item}</Text>
          </View>
        ))}
      </View>
      
      <Text style={docStyles.h3}>Component Nodes</Text>
      <Text style={docStyles.paragraph}>
        Each component on the canvas is represented as a node with:
      </Text>
      
      <View style={docStyles.list}>
        {[
          'Icon representing the service type (e.g., EC2, S3, Lambda)',
          'Label showing the component name',
          'Color-coded border indicating security status (green=secure, yellow=warnings, red=critical)',
          'Connection handles for linking to other components',
          'Interactive tooltip showing component details on hover',
        ].map((item, i) => (
          <View key={i} style={docStyles.listItem}>
            <Text style={docStyles.bullet}>→</Text>
            <Text style={{ flex: 1 }}>{item}</Text>
          </View>
        ))}
      </View>
      
      <Text style={docStyles.footer}>Page 7</Text>
    </Page>
    
    <Page size="A4" style={docStyles.page}>
      <Text style={docStyles.h3}>Connections & Edges</Text>
      <Text style={docStyles.paragraph}>
        Connections between components represent data flow, network traffic, or logical relationships. 
        The system automatically validates connection compatibility and highlights security issues.
      </Text>
      
      <View style={docStyles.table}>
        <View style={[docStyles.tableRow, docStyles.tableHeader]}>
          <Text style={[docStyles.tableCell, { flex: 1 }]}>Connection Type</Text>
          <Text style={[docStyles.tableCell, { flex: 2 }]}>Description</Text>
        </View>
        {[
          ['Secure (Green)', 'Encrypted connection with proper security controls'],
          ['Warning (Yellow)', 'Missing encryption or weak security configuration'],
          ['Critical (Red)', 'Insecure connection or severe misconfiguration'],
          ['Dashed', 'Logical relationship without direct network connection'],
        ].map(([type, desc], i) => (
          <View key={i} style={docStyles.tableRow}>
            <Text style={[docStyles.tableCell, { flex: 1 }]}>{type}</Text>
            <Text style={[docStyles.tableCell, { flex: 2 }]}>{desc}</Text>
          </View>
        ))}
      </View>
      
      <Text style={docStyles.h3}>Toolbar Actions</Text>
      
      <View style={docStyles.table}>
        <View style={[docStyles.tableRow, docStyles.tableHeader]}>
          <Text style={[docStyles.tableCell, { flex: 1 }]}>Button</Text>
          <Text style={[docStyles.tableCell, { flex: 2 }]}>Function</Text>
        </View>
        {[
          ['Analyze', 'Run comprehensive security analysis on current architecture'],
          ['Clear', 'Remove all components from canvas (with confirmation)'],
          ['Export', 'Download architecture as JSON for backup or sharing'],
          ['Import', 'Load previously exported architecture'],
          ['Report', 'Generate PDF security report with all findings'],
          ['Theme', 'Toggle between light and dark mode'],
        ].map(([btn, func], i) => (
          <View key={i} style={docStyles.tableRow}>
            <Text style={[docStyles.tableCell, { flex: 1, fontWeight: 'bold' }]}>{btn}</Text>
            <Text style={[docStyles.tableCell, { flex: 2 }]}>{func}</Text>
          </View>
        ))}
      </View>
      
      <View style={docStyles.warning}>
        <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>⚠ Important Notes</Text>
        <Text>
          • Changes are auto-saved to browser storage every 30 seconds{'\n'}
          • Export your architecture regularly for backup purposes{'\n'}
          • Running analysis on large architectures (50+ components) may take 10-15 seconds
        </Text>
      </View>
      
      <Text style={docStyles.footer}>Page 8</Text>
    </Page>
  </>
);

// Component Palette with Visual Icons
const ComponentPalette = () => (
  <>
    <Page size="A4" style={docStyles.page}>
      <Text style={docStyles.h1}>3.2 Component Palette</Text>
      
      <Text style={docStyles.paragraph}>
        The component palette on the left sidebar provides access to 40+ cloud service components 
        organized by category. Each component has a visual icon for easy identification.
      </Text>
      
      <Text style={docStyles.h2}>Component Categories</Text>
      
      <Text style={docStyles.h3}>Compute Services</Text>
      <View style={docStyles.list}>
        {[
          'EC2 - Virtual servers for general-purpose compute',
          'Lambda - Serverless functions for event-driven processing',
          'ECS - Container orchestration service',
          'EKS - Managed Kubernetes clusters',
          'Fargate - Serverless container compute',
          'Batch - Managed batch processing at scale',
        ].map((item, i) => (
          <View key={i} style={docStyles.listItem}>
            <Text style={docStyles.bullet}>•</Text>
            <Text style={{ flex: 1 }}>{item}</Text>
          </View>
        ))}
      </View>
      
      <Text style={docStyles.h3}>Storage Services</Text>
      <View style={docStyles.list}>
        {[
          'S3 - Object storage for any amount of data',
          'EBS - Block storage volumes for EC2',
          'EFS - Elastic file system for shared access',
          'Glacier - Long-term archival storage',
          'FSx - Managed file systems (Windows/Lustre)',
        ].map((item, i) => (
          <View key={i} style={docStyles.listItem}>
            <Text style={docStyles.bullet}>•</Text>
            <Text style={{ flex: 1 }}>{item}</Text>
          </View>
        ))}
      </View>
      
      <Text style={docStyles.h3}>Database Services</Text>
      <View style={docStyles.list}>
        {[
          'RDS - Managed relational databases (MySQL, PostgreSQL, etc.)',
          'DynamoDB - NoSQL key-value database',
          'Aurora - High-performance MySQL/PostgreSQL compatible',
          'ElastiCache - In-memory caching (Redis, Memcached)',
          'DocumentDB - MongoDB-compatible document database',
          'Neptune - Graph database service',
        ].map((item, i) => (
          <View key={i} style={docStyles.listItem}>
            <Text style={docStyles.bullet}>•</Text>
            <Text style={{ flex: 1 }}>{item}</Text>
          </View>
        ))}
      </View>
      
      <Text style={docStyles.footer}>Page 9</Text>
    </Page>
    
    <Page size="A4" style={docStyles.page}>
      <Text style={docStyles.h3}>Networking Services</Text>
      <View style={docStyles.list}>
        {[
          'VPC - Virtual private cloud network',
          'ALB - Application load balancer',
          'NLB - Network load balancer',
          'CloudFront - Content delivery network',
          'API Gateway - RESTful and WebSocket APIs',
          'Route 53 - DNS and domain management',
          'Direct Connect - Dedicated network connection',
          'Transit Gateway - Network transit hub',
        ].map((item, i) => (
          <View key={i} style={docStyles.listItem}>
            <Text style={docStyles.bullet}>•</Text>
            <Text style={{ flex: 1 }}>{item}</Text>
          </View>
        ))}
      </View>
      
      <Text style={docStyles.h3}>Security Services</Text>
      <View style={docStyles.list}>
        {[
          'IAM - Identity and access management',
          'WAF - Web application firewall',
          'Shield - DDoS protection',
          'GuardDuty - Threat detection service',
          'KMS - Key management service',
          'Secrets Manager - Secure secrets storage',
          'Security Hub - Centralized security findings',
        ].map((item, i) => (
          <View key={i} style={docStyles.listItem}>
            <Text style={docStyles.bullet}>•</Text>
            <Text style={{ flex: 1 }}>{item}</Text>
          </View>
        ))}
      </View>
      
      <Text style={docStyles.h3}>Application Services</Text>
      <View style={docStyles.list}>
        {[
          'SQS - Message queue service',
          'SNS - Notification service',
          'EventBridge - Event bus for application integration',
          'Step Functions - Workflow orchestration',
          'AppSync - GraphQL API service',
        ].map((item, i) => (
          <View key={i} style={docStyles.listItem}>
            <Text style={docStyles.bullet}>•</Text>
            <Text style={{ flex: 1 }}>{item}</Text>
          </View>
        ))}
      </View>
      
      <Text style={docStyles.h2}>Preset Architectures</Text>
      <Text style={docStyles.paragraph}>
        The palette includes pre-built architecture templates that you can load instantly:
      </Text>
      
      <View style={docStyles.list}>
        {[
          'Three-Tier Web Application - Classic web app with load balancer, app servers, and database',
          'Serverless API - Lambda + API Gateway + DynamoDB for serverless APIs',
          'Data Lake - S3 + Glue + Athena for big data analytics',
          'Microservices - EKS-based microservices architecture',
        ].map((item, i) => (
          <View key={i} style={docStyles.listItem}>
            <Text style={docStyles.bullet}>→</Text>
            <Text style={{ flex: 1 }}>{item}</Text>
          </View>
        ))}
      </View>
      
      <Text style={docStyles.footer}>Page 10</Text>
    </Page>
  </>
);

// Generate complete document
export const generateDocumentation = async (): Promise<Blob> => {
  const doc = (
    <Document>
      <CoverPage />
      <TableOfContents />
      <ExecutiveOverview />
      <ApplicationGoals />
      <UIGuideCanvas />
      <ComponentPalette />
      <SecurityAnalysisPanel />
      <STRIDEThreatModeling />
      <TechnicalArchitecture />
    </Document>
  );
  
  return await pdf(doc).toBlob();
};

export const downloadDocumentation = async () => {
  const blob = await generateDocumentation();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Koh-Atlas-Documentation-${new Date().toISOString().split('T')[0]}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
};
