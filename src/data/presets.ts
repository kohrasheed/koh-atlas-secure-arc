import { ArchComponent, Connection, Project } from '../types';

/**
 * Preset architecture designs for quick start
 * Includes both secure and vulnerable examples for educational purposes
 */

// Secure 3-tier web application with proper controls
export const SECURE_DESIGN: Project = {
  id: 'secure-web-app',
  name: 'Secure 3-Tier Web Application',
  description: 'A properly secured 3-tier web application with WAF, proper encryption, monitoring, and defense in depth',
  components: [
    // External/DMZ Components
    { 
      id: 'waf-1', 
      type: 'security', 
      name: 'Web Application Firewall', 
      category: 'Security', 
      icon: 'Shield',
      zone: 'dmz',
      criticality: 'high'
    },
    { 
      id: 'lb-1', 
      type: 'network', 
      name: 'Load Balancer', 
      category: 'Network', 
      icon: 'Scales',
      zone: 'dmz',
      criticality: 'high'
    },
    
    // Web Tier
    { 
      id: 'web-1', 
      type: 'web', 
      name: 'Web Server 1', 
      category: 'Web/App', 
      icon: 'Globe',
      zone: 'internal',
      criticality: 'high'
    },
    
    // App Tier
    { 
      id: 'api-gw-1', 
      type: 'web', 
      name: 'API Gateway', 
      category: 'Web/App', 
      icon: 'Router',
      zone: 'internal',
      criticality: 'critical'
    },
    { 
      id: 'app-1', 
      type: 'app', 
      name: 'Application Server', 
      category: 'Web/App', 
      icon: 'Server',
      zone: 'internal',
      criticality: 'critical'
    },
    
    // Data Tier
    { 
      id: 'db-1', 
      type: 'data', 
      name: 'PostgreSQL Database', 
      category: 'Database', 
      icon: 'Database',
      zone: 'data',
      criticality: 'critical',
      metadata: { version: '15.0', vendor: 'PostgreSQL' }
    },
    
    // Security & Management
    { 
      id: 'siem-1', 
      type: 'platform', 
      name: 'SIEM/Security Monitoring', 
      category: 'Platform', 
      icon: 'Eye',
      zone: 'management',
      criticality: 'high'
    }
  ],
  connections: [
    // WAF to Load Balancer
    {
      id: 'waf-lb',
      from: 'waf-1',
      to: 'lb-1',
      purpose: 'Filtered traffic to load balancer',
      ports: [443],
      protocol: 'HTTPS',
      encryption: 'TLS 1.3',
      auth: 'SSL Certificate',
      dataClass: 'Public',
      zoneFrom: 'dmz',
      zoneTo: 'dmz',
      egress: false,
      controls: ['WAF Rules', 'SSL Termination']
    },
    
    // Load balancer to web server
    {
      id: 'lb-web',
      from: 'lb-1',
      to: 'web-1',
      purpose: 'Load balanced web traffic',
      ports: [443],
      protocol: 'HTTPS',
      encryption: 'TLS 1.2+',
      auth: 'SSL Certificate',
      dataClass: 'Internal',
      zoneFrom: 'dmz',
      zoneTo: 'internal',
      egress: false,
      controls: ['Health Checks', 'Session Affinity']
    },
    
    // Web to API Gateway
    {
      id: 'web-api',
      from: 'web-1',
      to: 'api-gw-1',
      purpose: 'API requests from web layer',
      ports: [443],
      protocol: 'HTTPS',
      encryption: 'mTLS',
      auth: 'JWT + API Key',
      dataClass: 'Internal',
      zoneFrom: 'internal',
      zoneTo: 'internal',
      egress: false,
      controls: ['API Rate Limiting', 'Authentication']
    },
    
    // API Gateway to App Server
    {
      id: 'api-app',
      from: 'api-gw-1',
      to: 'app-1',
      purpose: 'Business logic processing',
      ports: [8443],
      protocol: 'HTTPS',
      encryption: 'mTLS',
      auth: 'Service Account + RBAC',
      dataClass: 'Confidential',
      zoneFrom: 'internal',
      zoneTo: 'internal',
      egress: false,
      controls: ['Circuit Breaker', 'Load Balancing']
    },
    
    // App server to database
    {
      id: 'app-db',
      from: 'app-1',
      to: 'db-1',
      purpose: 'Database operations',
      ports: [5432],
      protocol: 'PostgreSQL',
      encryption: 'TLS 1.2+',
      auth: 'Database User + SSL',
      dataClass: 'Confidential',
      zoneFrom: 'internal',
      zoneTo: 'data',
      egress: false,
      controls: ['Connection Pooling', 'Query Monitoring']
    }
  ],
  zones: [
    { id: 'dmz', name: 'DMZ', type: 'dmz', description: 'Demilitarized zone for public services', color: '#f97316' },
    { id: 'internal', name: 'Internal', type: 'internal', description: 'Internal corporate network', color: '#10b981' },
    { id: 'data', name: 'Data', type: 'data', description: 'Sensitive data storage', color: '#3b82f6' },
    { id: 'management', name: 'Management', type: 'management', description: 'Administrative and management', color: '#8b5cf6' }
  ],
  findings: []
};

// Vulnerable design with multiple security issues for educational purposes
export const VULNERABLE_DESIGN: Project = {
  id: 'vulnerable-web-app',
  name: 'Vulnerable Web Application (Educational)',
  description: 'A deliberately vulnerable architecture with multiple security flaws for education and testing',
  components: [
    // Direct internet exposure
    { 
      id: 'web-exposed', 
      type: 'web', 
      name: 'Exposed Web Server', 
      category: 'Web/App', 
      icon: 'Globe',
      zone: 'external',
      criticality: 'high'
    },
    
    // Database directly accessible
    { 
      id: 'db-exposed', 
      type: 'data', 
      name: 'Public Database', 
      category: 'Database', 
      icon: 'Database',
      zone: 'external',
      criticality: 'critical',
      metadata: { version: '12.0', vendor: 'MySQL' }
    },
    
    // Admin panel unprotected
    { 
      id: 'admin-panel', 
      type: 'web', 
      name: 'Admin Panel', 
      category: 'Web/App', 
      icon: 'User',
      zone: 'internal',
      criticality: 'critical'
    },
    
    // Legacy FTP
    { 
      id: 'ftp-server', 
      type: 'platform', 
      name: 'Legacy FTP Server', 
      category: 'Platform', 
      icon: 'Archive',
      zone: 'internal',
      criticality: 'medium'
    }
  ],
  connections: [
    // Direct web to database - no app tier
    {
      id: 'web-db-direct',
      from: 'web-exposed',
      to: 'db-exposed',
      purpose: 'Direct web to database',
      ports: [3306],
      protocol: 'MySQL',
      encryption: 'None',
      auth: 'Shared Credentials',
      dataClass: 'Confidential',
      zoneFrom: 'external',
      zoneTo: 'external',
      egress: false,
      controls: []
    },
    
    // Admin panel with weak security
    {
      id: 'web-admin',
      from: 'web-exposed',
      to: 'admin-panel',
      purpose: 'Admin access',
      ports: [80],
      protocol: 'HTTP',
      encryption: 'None',
      auth: 'Cookie Session',
      dataClass: 'Critical',
      zoneFrom: 'external',
      zoneTo: 'internal',
      egress: false,
      controls: []
    },
    
    // FTP server with plain text
    {
      id: 'web-ftp',
      from: 'web-exposed',
      to: 'ftp-server',
      purpose: 'File uploads',
      ports: [21],
      protocol: 'FTP',
      encryption: 'None',
      auth: 'Anonymous',
      dataClass: 'Internal',
      zoneFrom: 'external',
      zoneTo: 'internal',
      egress: false,
      controls: []
    }
  ],
  zones: [
    { id: 'external', name: 'External', type: 'external', description: 'Internet and external networks', color: '#ef4444' },
    { id: 'internal', name: 'Internal', type: 'internal', description: 'Internal corporate network', color: '#10b981' }
  ],
  findings: []
};

export const PRESET_DESIGNS = [
  SECURE_DESIGN,
  VULNERABLE_DESIGN
];