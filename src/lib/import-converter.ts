// Import format converter for legacy architecture JSON formats

interface LegacyComponent {
  id: string;
  type: string;
  label: string;
  zone?: string;
  description?: string;
}

interface LegacyConnection {
  from: string;
  to: string;
  protocol: string;
  port: string | number;
  description?: string;
}

interface LegacyArchitecture {
  components: LegacyComponent[];
  connections: LegacyConnection[];
  global_risks?: Array<{
    risk_id: string;
    category: string;
    severity: string;
    description: string;
  }>;
}

interface ReactFlowDiagram {
  nodes: Array<{
    id: string;
    type: string;
    position: { x: number; y: number };
    data: any;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    label?: string;
    data?: any;
    style?: any;
  }>;
  version?: string;
  metadata?: any;
}

// Map legacy component types to Koh Atlas types
const COMPONENT_TYPE_MAP: Record<string, string> = {
  'network-zone': 'vpc-vnet',
  'appliance': 'firewall',
  'firewall': 'firewall',
  'service': 'api-gateway',
  'server': 'app-server',
  'application': 'web-server',
  'frontend': 'web-server',
  'backend': 'app-server',
  'database': 'database',
  'storage': 'object-storage',
  'vpn': 'vpn-gateway',
  'balancer': 'load-balancer',
  'cdn': 'cdn',
  'api': 'api-gateway',
  'lambda': 'lambda-function',
  'container': 'container-service',
  'kubernetes': 'kubernetes-cluster',
  'ci-cd': 'ci-cd-pipeline',
  'monitoring': 'monitoring-service',
  'logging': 'logging-service',
  'ics': 'app-server',
  'scada': 'app-server',
  'plc': 'app-server'
};

// Zone-based auto-layout configuration
const ZONE_LAYOUTS: Record<string, { x: number; y: number }> = {
  'External': { x: 100, y: 100 },
  'Perimeter': { x: 400, y: 100 },
  'DMZ': { x: 700, y: 100 },
  'Internal': { x: 100, y: 400 },
  'Database': { x: 400, y: 400 },
  'Application': { x: 700, y: 400 },
  'Management': { x: 100, y: 700 },
  'OT': { x: 400, y: 700 },
  'ICS': { x: 700, y: 700 }
};

/**
 * Converts legacy architecture JSON format to React Flow format
 * Supports formats with {components, connections} structure
 */
export function convertLegacyArchitecture(data: any): ReactFlowDiagram | null {
  try {
    // Check if this is legacy format
    if (!data.components && !data.connections) {
      return null; // Not legacy format, return null to try standard parsing
    }

    const legacy = data as LegacyArchitecture;
    const zoneCounts: Record<string, number> = {};

    // Convert components to nodes with auto-layout
    const nodes = legacy.components.map((comp) => {
      const zone = comp.zone || 'Internal';
      const zoneLayout = ZONE_LAYOUTS[zone] || { x: 100, y: 100 };
      
      // Track component count per zone for grid layout
      zoneCounts[zone] = (zoneCounts[zone] || 0) + 1;
      const indexInZone = zoneCounts[zone] - 1;
      
      // Calculate position: zone base + grid offset
      const position = {
        x: zoneLayout.x + (indexInZone % 4) * 250,
        y: zoneLayout.y + Math.floor(indexInZone / 4) * 150
      };

      // Map component type to Koh Atlas type
      const mappedType = COMPONENT_TYPE_MAP[comp.type.toLowerCase()] || 'web-server';

      return {
        id: comp.id,
        type: 'custom',
        position,
        data: {
          type: mappedType,
          label: comp.label,
          zone: zone,
          description: comp.description || '',
          // Infer security properties from type
          encryption: ['database', 'storage'].includes(mappedType) ? 'AES-256' : 'None',
          authentication: ['api-gateway', 'vpn-gateway'].includes(mappedType) ? 'OAuth 2.0' : 'None'
        }
      };
    });

    // Identify insecure protocols for visual warning
    const insecureProtocols = ['HTTP', 'FTP', 'Telnet', 'SMTP', 'ANY'];
    const insecurePorts = ['ANY', '23', '21', '80'];

    // Convert connections to edges with security highlighting
    const edges = legacy.connections.map((conn, index) => {
      const isInsecure = 
        insecureProtocols.includes(conn.protocol.toUpperCase()) ||
        insecurePorts.includes(String(conn.port));

      const hasEncryption = ['HTTPS', 'SSH', 'SFTP', 'TLS'].includes(conn.protocol.toUpperCase());

      return {
        id: `edge-${conn.from}-${conn.to}-${index}`,
        source: conn.from,
        target: conn.to,
        label: `${conn.protocol}:${conn.port}`,
        data: {
          protocol: conn.protocol,
          port: String(conn.port),
          encryption: hasEncryption ? 'TLS 1.3' : 'None',
          description: conn.description || '',
          securityIssue: isInsecure ? 'Unencrypted or unrestricted connection' : undefined
        },
        style: {
          stroke: isInsecure ? '#ef4444' : '#10b981',
          strokeWidth: 2,
          strokeDasharray: isInsecure ? '5 5' : undefined
        },
        animated: isInsecure
      };
    });

    // Compile metadata including global risks
    const metadata: any = {
      importedAt: new Date().toISOString(),
      sourceFormat: 'legacy-architecture',
      componentCount: nodes.length,
      connectionCount: edges.length
    };

    if (legacy.global_risks && legacy.global_risks.length > 0) {
      metadata.globalRisks = legacy.global_risks;
      metadata.riskCount = legacy.global_risks.length;
      metadata.criticalRiskCount = legacy.global_risks.filter(r => r.severity === 'Critical').length;
    }

    return {
      nodes,
      edges,
      version: '1.0',
      metadata
    };
  } catch (error) {
    console.error('Error converting legacy architecture:', error);
    return null;
  }
}

/**
 * Auto-detect and convert various JSON formats to React Flow format
 */
export function autoConvertImportedJSON(data: any): ReactFlowDiagram | null {
  // Try legacy architecture format first
  if (data.components || data.connections) {
    return convertLegacyArchitecture(data);
  }

  // Already in React Flow format
  if (data.nodes && data.edges) {
    return data as ReactFlowDiagram;
  }

  // Unknown format
  return null;
}
