import { ArchComponent, SecurityRule } from '../types';

export const COMPONENT_CATALOG: ArchComponent[] = [
  // Web/App Components
  { id: 'web-server', type: 'web', name: 'Web Server', category: 'Web/App', icon: 'Globe' },
  { id: 'api-gateway', type: 'web', name: 'API Gateway', category: 'Web/App', icon: 'Router' },
  { id: 'app-server', type: 'app', name: 'App Server', category: 'Web/App', icon: 'Server' },
  { id: 'microservice', type: 'app', name: 'Microservice', category: 'Web/App', icon: 'Cube' },
  { id: 'function', type: 'app', name: 'Function/Lambda', category: 'Web/App', icon: 'Lightning' },
  { id: 'container', type: 'app', name: 'Container/Pod', category: 'Web/App', icon: 'Package' },
  
  // Data Components  
  { id: 'postgresql', type: 'data', name: 'PostgreSQL', category: 'Database', icon: 'Database' },
  { id: 'mysql', type: 'data', name: 'MySQL', category: 'Database', icon: 'Database' },
  { id: 'mongodb', type: 'data', name: 'MongoDB', category: 'Database', icon: 'Database' },
  { id: 'redis', type: 'data', name: 'Redis Cache', category: 'Database', icon: 'Clock' },
  { id: 'elasticsearch', type: 'data', name: 'Elasticsearch', category: 'Database', icon: 'MagnifyingGlass' },
  { id: 's3', type: 'data', name: 'Object Store (S3)', category: 'Storage', icon: 'Archive' },
  { id: 'kafka', type: 'data', name: 'Message Queue (Kafka)', category: 'Messaging', icon: 'Queue' },
  
  // Network Components
  { id: 'load-balancer', type: 'network', name: 'Load Balancer', category: 'Network', icon: 'Scales' },
  { id: 'cdn', type: 'network', name: 'CDN/Edge', category: 'Network', icon: 'CloudArrowUp' },
  { id: 'dns', type: 'network', name: 'DNS Resolver', category: 'Network', icon: 'AddressBook' },
  { id: 'vpn', type: 'network', name: 'VPN Gateway', category: 'Network', icon: 'Shield' },
  { id: 'nat', type: 'network', name: 'NAT Gateway', category: 'Network', icon: 'ArrowsLeftRight' },
  
  // Platform Components
  { id: 'idp', type: 'platform', name: 'Identity Provider', category: 'Platform', icon: 'User' },
  { id: 'kms', type: 'platform', name: 'Key Management', category: 'Platform', icon: 'Key' },
  { id: 'secrets', type: 'platform', name: 'Secrets Manager', category: 'Platform', icon: 'Lock' },
  { id: 'siem', type: 'platform', name: 'SIEM/SOAR', category: 'Platform', icon: 'Eye' },
  { id: 'monitoring', type: 'platform', name: 'Monitoring', category: 'Platform', icon: 'ChartBar' },
  
  // Security Controls
  { id: 'firewall', type: 'security', name: 'NGFW', category: 'Security', icon: 'Shield' },
  { id: 'waf', type: 'security', name: 'WAF', category: 'Security', icon: 'ShieldCheck' },
  { id: 'ids', type: 'security', name: 'IDS/IPS', category: 'Security', icon: 'Eye' },
  { id: 'ddos', type: 'security', name: 'DDoS Protection', category: 'Security', icon: 'ShieldWarning' },
  { id: 'edr', type: 'security', name: 'EDR/XDR', category: 'Security', icon: 'Bug' },
  { id: 'dam', type: 'security', name: 'DAM', category: 'Security', icon: 'Database' },
  { id: 'dlp', type: 'security', name: 'DLP', category: 'Security', icon: 'LockKey' },
];

export const PROTOCOL_CATALOG = {
  secure: [
    { name: 'HTTPS', port: 443, description: 'HTTP over TLS' },
    { name: 'SFTP', port: 22, description: 'SSH File Transfer' },
    { name: 'FTPS', port: 990, description: 'FTP over TLS' },
    { name: 'SMTPS', port: 465, description: 'SMTP over TLS' },
    { name: 'LDAPS', port: 636, description: 'LDAP over TLS' },
  ],
  databases: [
    { name: 'PostgreSQL', port: 5432, description: 'PostgreSQL Database' },
    { name: 'MySQL', port: 3306, description: 'MySQL Database' },
    { name: 'MongoDB', port: 27017, description: 'MongoDB Database' },
    { name: 'Redis', port: 6379, description: 'Redis Cache' },
    { name: 'Elasticsearch', port: 9200, description: 'Elasticsearch API' },
  ],
  legacy: [
    { name: 'HTTP', port: 80, description: 'Unencrypted HTTP (avoid)' },
    { name: 'FTP', port: 21, description: 'File Transfer (use SFTP)' },
    { name: 'Telnet', port: 23, description: 'Remote terminal (use SSH)' },
    { name: 'SMB', port: 445, description: 'File sharing (restrict)' },
  ],
};

export const SECURITY_RULES: SecurityRule[] = [
  {
    id: 'enforce-https',
    name: 'Enforce HTTPS',
    category: 'Encryption',
    severity: 'high',
    description: 'All web traffic should use HTTPS instead of HTTP',
    condition: 'protocol === "HTTP" || port === 80',
    fix: 'Change protocol to HTTPS (port 443) with TLS 1.2+',
    standards: ['NIST 800-53 SC-8', 'ISO 27001 A.13.1.1'],
  },
  {
    id: 'direct-db-access',
    name: 'Prevent Direct Database Access',
    category: 'Architecture',
    severity: 'high',
    description: 'Web tier should not connect directly to database',
    condition: 'web component connects to database without app tier',
    fix: 'Insert API/App tier between web and database layers',
    standards: ['OWASP ASVS V1.4', 'NIST 800-53 SC-7'],
  },
  {
    id: 'missing-waf',
    name: 'Missing WAF Protection',
    category: 'Security Controls',
    severity: 'medium',
    description: 'Public web services should be protected by WAF',
    condition: 'public web server without WAF',
    fix: 'Deploy Web Application Firewall in front of web servers',
    standards: ['OWASP Top 10', 'NIST CSF PR.PT-4'],
  },
  {
    id: 'unencrypted-db',
    name: 'Unencrypted Database Connection',
    category: 'Encryption',
    severity: 'high',
    description: 'Database connections should use TLS encryption',
    condition: 'database connection without TLS/SSL',
    fix: 'Enable TLS encryption for database connections',
    standards: ['NIST 800-53 SC-8', 'PCI DSS 4.1'],
  },
  {
    id: 'missing-monitoring',
    name: 'Missing Security Monitoring',
    category: 'Detection',
    severity: 'medium',
    description: 'Critical assets should have security monitoring',
    condition: 'critical component without SIEM/monitoring',
    fix: 'Deploy security monitoring and logging for critical assets',
    standards: ['NIST CSF DE.CM-1', 'ISO 27001 A.12.4.1'],
  },
];

export const ZONES = [
  { id: 'external', name: 'External', type: 'external' as const, description: 'Internet and external networks', color: '#ef4444' },
  { id: 'dmz', name: 'DMZ', type: 'dmz' as const, description: 'Demilitarized zone for public services', color: '#f97316' },
  { id: 'internal', name: 'Internal', type: 'internal' as const, description: 'Internal corporate network', color: '#10b981' },
  { id: 'data', name: 'Data', type: 'data' as const, description: 'Sensitive data storage', color: '#3b82f6' },
  { id: 'management', name: 'Management', type: 'management' as const, description: 'Administrative and management', color: '#8b5cf6' },
];