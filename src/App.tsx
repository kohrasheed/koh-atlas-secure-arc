import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Connection,
  ReactFlowProvider,
  ReactFlowInstance,
  Handle,
  Position,
} from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { useKV } from '@github/spark/hooks';
import {
  Shield,
  Database,
  Globe,
  Cloud,
  Eye,
  CheckCircle,
  Plus,
  Trash,
  Moon,
  Sun,
  Play,
  Bug,
  Target,
  Desktop,
  DeviceMobile,
  HardDrives,
} from '@phosphor-icons/react';

// Component types and configurations
interface ComponentConfig {
  type: string;
  label: string;
  icon: React.ReactNode;
  category: 'application' | 'security' | 'network' | 'data';
  color: string;
}

const componentTypes: ComponentConfig[] = [
  // Application Components
  { type: 'web-server', label: 'Web Server', icon: <Desktop />, category: 'application', color: '#3b82f6' },
  { type: 'app-server', label: 'App Server', icon: <Desktop />, category: 'application', color: '#6366f1' },
  { type: 'api-gateway', label: 'API Gateway', icon: <Globe />, category: 'application', color: '#8b5cf6' },
  { type: 'microservice', label: 'Microservice', icon: <Cloud />, category: 'application', color: '#06b6d4' },
  { type: 'mobile-app', label: 'Mobile App', icon: <DeviceMobile />, category: 'application', color: '#10b981' },
  
  // Data Components
  { type: 'database', label: 'Database', icon: <Database />, category: 'data', color: '#f59e0b' },
  { type: 'cache', label: 'Cache', icon: <HardDrives />, category: 'data', color: '#f97316' },
  { type: 'message-queue', label: 'Message Queue', icon: <HardDrives />, category: 'data', color: '#ef4444' },
  
  // Security Components
  { type: 'firewall', label: 'Firewall', icon: <Shield />, category: 'security', color: '#dc2626' },
  { type: 'waf', label: 'WAF', icon: <Shield />, category: 'security', color: '#b91c1c' },
  { type: 'ids-ips', label: 'IDS/IPS', icon: <Eye />, category: 'security', color: '#991b1b' },
  { type: 'load-balancer', label: 'Load Balancer', icon: <Globe />, category: 'network', color: '#059669' },
];

// Security findings types
interface SecurityFinding {
  id: string;
  title: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  description: string;
  affected: string[];
  recommendation: string;
  standards: string[];
}

// Attack path types
interface AttackPath {
  id: string;
  name: string;
  steps: string[];
  impact: string;
  likelihood: string;
  mitigations: string[];
}

// Custom node component
const CustomNode = ({ data, selected }: { data: any; selected: boolean }) => {
  const config = componentTypes.find(c => c.type === data.type);
  
  return (
    <div 
      className={`
        px-4 py-2 shadow-lg rounded-lg bg-card border-2 min-w-[120px] relative
        ${selected ? 'border-primary' : 'border-border'}
        transition-all duration-200 hover:shadow-xl
      `}
      style={{ borderLeftColor: config?.color || '#666' }}
    >
      {/* Connection handles */}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: config?.color || '#666',
          border: '2px solid white',
          width: 8,
          height: 8,
        }}
      />
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: config?.color || '#666',
          border: '2px solid white',
          width: 8,
          height: 8,
        }}
      />
      
      <div className="flex items-center gap-2">
        <div style={{ color: config?.color || '#666' }}>
          {config?.icon}
        </div>
        <div>
          <div className="font-medium text-sm">{data.label}</div>
          <div className="text-xs text-muted-foreground">{config?.label}</div>
        </div>
      </div>
      {data.zone && (
        <Badge variant="secondary" className="mt-1 text-xs">
          {data.zone}
        </Badge>
      )}
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

// Custom designs
const customDesigns = {
  secure: {
    name: "Secure Web Application",
    nodes: [
      { id: '1', type: 'custom', position: { x: 100, y: 100 }, data: { type: 'mobile-app', label: 'Mobile Client', zone: 'External' } },
      { id: '2', type: 'custom', position: { x: 300, y: 100 }, data: { type: 'waf', label: 'WAF', zone: 'DMZ' } },
      { id: '3', type: 'custom', position: { x: 500, y: 100 }, data: { type: 'load-balancer', label: 'Load Balancer', zone: 'DMZ' } },
      { id: '4', type: 'custom', position: { x: 700, y: 50 }, data: { type: 'web-server', label: 'Web Server 1', zone: 'Web Tier' } },
      { id: '5', type: 'custom', position: { x: 700, y: 150 }, data: { type: 'web-server', label: 'Web Server 2', zone: 'Web Tier' } },
      { id: '6', type: 'custom', position: { x: 900, y: 100 }, data: { type: 'api-gateway', label: 'API Gateway', zone: 'App Tier' } },
      { id: '7', type: 'custom', position: { x: 1100, y: 50 }, data: { type: 'app-server', label: 'App Server 1', zone: 'App Tier' } },
      { id: '8', type: 'custom', position: { x: 1100, y: 150 }, data: { type: 'app-server', label: 'App Server 2', zone: 'App Tier' } },
      { id: '9', type: 'custom', position: { x: 1300, y: 100 }, data: { type: 'database', label: 'Primary DB', zone: 'Data Tier' } },
      { id: '10', type: 'custom', position: { x: 500, y: 250 }, data: { type: 'firewall', label: 'Internal Firewall', zone: 'Security' } },
      { id: '11', type: 'custom', position: { x: 900, y: 250 }, data: { type: 'ids-ips', label: 'IDS/IPS', zone: 'Security' } },
    ] as Node[],
    edges: [
      { id: 'e1-2', source: '1', target: '2', label: 'HTTPS:443', data: { protocol: 'HTTPS', port: 443, encryption: 'TLS 1.3' } },
      { id: 'e2-3', source: '2', target: '3', label: 'HTTPS:443', data: { protocol: 'HTTPS', port: 443, encryption: 'TLS 1.3' } },
      { id: 'e3-4', source: '3', target: '4', label: 'HTTPS:443', data: { protocol: 'HTTPS', port: 443, encryption: 'TLS 1.3' } },
      { id: 'e3-5', source: '3', target: '5', label: 'HTTPS:443', data: { protocol: 'HTTPS', port: 443, encryption: 'TLS 1.3' } },
      { id: 'e4-6', source: '4', target: '6', label: 'HTTPS:443', data: { protocol: 'HTTPS', port: 443, encryption: 'TLS 1.3' } },
      { id: 'e5-6', source: '5', target: '6', label: 'HTTPS:443', data: { protocol: 'HTTPS', port: 443, encryption: 'TLS 1.3' } },
      { id: 'e6-7', source: '6', target: '7', label: 'gRPC:443', data: { protocol: 'gRPC', port: 443, encryption: 'mTLS' } },
      { id: 'e6-8', source: '6', target: '8', label: 'gRPC:443', data: { protocol: 'gRPC', port: 443, encryption: 'mTLS' } },
      { id: 'e7-9', source: '7', target: '9', label: 'PostgreSQL:5432', data: { protocol: 'PostgreSQL', port: 5432, encryption: 'TLS' } },
      { id: 'e8-9', source: '8', target: '9', label: 'PostgreSQL:5432', data: { protocol: 'PostgreSQL', port: 5432, encryption: 'TLS' } },
    ] as Edge[]
  },
  vulnerable: {
    name: "Vulnerable Architecture",
    nodes: [
      { id: '1', type: 'custom', position: { x: 100, y: 100 }, data: { type: 'mobile-app', label: 'Mobile Client', zone: 'External' } },
      { id: '2', type: 'custom', position: { x: 400, y: 100 }, data: { type: 'web-server', label: 'Web Server', zone: 'Public' } },
      { id: '3', type: 'custom', position: { x: 700, y: 100 }, data: { type: 'database', label: 'Database', zone: 'Internal' } },
      { id: '4', type: 'custom', position: { x: 400, y: 250 }, data: { type: 'app-server', label: 'Admin Panel', zone: 'Public' } },
    ] as Node[],
    edges: [
      { id: 'e1-2', source: '1', target: '2', label: 'HTTP:80', data: { protocol: 'HTTP', port: 80, encryption: 'None' } },
      { id: 'e2-3', source: '2', target: '3', label: 'MySQL:3306', data: { protocol: 'MySQL', port: 3306, encryption: 'None' } },
      { id: 'e1-4', source: '1', target: '4', label: 'HTTP:80', data: { protocol: 'HTTP', port: 80, encryption: 'None' } },
      { id: 'e4-3', source: '4', target: '3', label: 'MySQL:3306', data: { protocol: 'MySQL', port: 3306, encryption: 'None' } },
    ] as Edge[]
  }
};

function App() {
  const [isDarkTheme, setIsDarkTheme] = useKV('dark-theme', 'false');
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [selectedComponent, setSelectedComponent] = useState<ComponentConfig | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [showAttackPaths, setShowAttackPaths] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Security findings
  const [findings, setFindings] = useState<SecurityFinding[]>([]);
  const [attackPaths, setAttackPaths] = useState<AttackPath[]>([]);

  // Update theme
  useEffect(() => {
    if (isDarkTheme === 'true') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [isDarkTheme]);

  // Load custom design
  const loadCustomDesign = (designKey: 'secure' | 'vulnerable') => {
    const design = customDesigns[designKey];
    setNodes(design.nodes);
    setEdges(design.edges);
    console.log('Loaded design:', designKey, 'with', design.nodes.length, 'nodes and', design.edges.length, 'edges');
    toast.success(`Loaded ${design.name}`);
  };

  // Add new component to canvas
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowInstance || !selectedComponent) return;

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!reactFlowBounds) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode: Node = {
        id: `${Date.now()}`,
        type: 'custom',
        position,
        data: {
          type: selectedComponent.type,
          label: selectedComponent.label,
          zone: selectedComponent.category === 'security' ? 'Security' : 'Internal',
        },
      };

      setNodes(nds => nds.concat(newNode));
      setSelectedComponent(null);
    },
    [reactFlowInstance, selectedComponent, setNodes]
  );

  // Handle connections
  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        id: `e${params.source}-${params.target}`,
        label: 'HTTPS:443',
        data: { protocol: 'HTTPS', port: 443, encryption: 'TLS 1.2' },
      };
      setEdges(eds => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  // Delete selected elements
  const onDeleteSelected = useCallback(() => {
    if (selectedNode) {
      setNodes(nds => nds.filter((n: Node) => n.id !== selectedNode.id));
      // Remove connected edges
      setEdges(eds => eds.filter((e: Edge) => e.source !== selectedNode.id && e.target !== selectedNode.id));
      setSelectedNode(null);
      toast.success('Node deleted');
    }
    if (selectedEdge) {
      setEdges(eds => eds.filter((e: Edge) => e.id !== selectedEdge.id));
      setSelectedEdge(null);
      toast.success('Connection deleted');
    }
  }, [selectedNode, selectedEdge, setNodes, setEdges]);

  // Security analysis
  const runSecurityAnalysis = async () => {
    const newFindings: SecurityFinding[] = [];
    const newAttackPaths: AttackPath[] = [];

    // Analyze for common security issues
    edges.forEach((edge: Edge) => {
      const edgeData = edge.data || {};
      
      // Check for unencrypted connections
      if (edgeData.protocol === 'HTTP' || edgeData.encryption === 'None') {
        newFindings.push({
          id: `unencrypted-${edge.id}`,
          title: 'Unencrypted Communication',
          severity: 'High',
          description: `Connection ${edge.label} uses unencrypted communication`,
          affected: [edge.source!, edge.target!],
          recommendation: 'Implement TLS encryption for all communications',
          standards: ['NIST 800-53 SC-8', 'ISO 27001 A.13.1.1']
        });
      }

      // Check for direct database connections
      const targetNode = nodes.find((n: Node) => n.id === edge.target);
      const sourceNode = nodes.find((n: Node) => n.id === edge.source);
      
      if (targetNode?.data.type === 'database' && sourceNode?.data.type !== 'app-server') {
        newFindings.push({
          id: `direct-db-${edge.id}`,
          title: 'Direct Database Access',
          severity: 'Medium',
          description: 'Direct database access bypasses application tier',
          affected: [edge.source!, edge.target!],
          recommendation: 'Route database access through application tier',
          standards: ['OWASP Top 10', 'NIST 800-53 AC-3']
        });
      }
    });

    // Check for missing security controls
    const hasFirewall = nodes.some((n: Node) => n.data.type === 'firewall');
    const hasWAF = nodes.some((n: Node) => n.data.type === 'waf');
    
    if (!hasFirewall) {
      newFindings.push({
        id: 'missing-firewall',
        title: 'Missing Firewall Protection',
        severity: 'High',
        description: 'No firewall protection detected in architecture',
        affected: ['architecture'],
        recommendation: 'Add firewall protection at network perimeters',
        standards: ['NIST 800-53 SC-7', 'CIS Controls 12']
      });
    }

    if (!hasWAF && nodes.some((n: Node) => n.data.type === 'web-server')) {
      newFindings.push({
        id: 'missing-waf',
        title: 'Missing Web Application Firewall',
        severity: 'Medium',
        description: 'Web servers without WAF protection',
        affected: nodes.filter((n: Node) => n.data.type === 'web-server').map((n: Node) => n.id),
        recommendation: 'Deploy WAF to protect web applications',
        standards: ['OWASP ASVS', 'PCI DSS 6.5.1']
      });
    }

    // Generate attack paths
    if (newFindings.length > 0) {
      newAttackPaths.push({
        id: 'web-attack',
        name: 'Web Application Attack Path',
        steps: [
          'Attacker identifies unencrypted HTTP endpoints',
          'Man-in-the-middle attack intercepts credentials',
          'Direct database access bypasses application controls',
          'Data exfiltration from database'
        ],
        impact: 'Data breach, compliance violations',
        likelihood: 'High',
        mitigations: ['Implement HTTPS', 'Add WAF', 'Database access controls', 'Network segmentation']
      });
    }

    setFindings(newFindings);
    setAttackPaths(newAttackPaths);
    
    if (newFindings.length === 0) {
      toast.success('No security issues found!');
    } else {
      toast.warning(`Found ${newFindings.length} security issues`);
    }
  };

  // Node selection handler
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setSelectedEdge(null);
  }, []);

  // Edge selection handler
  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
  }, []);

  // Update node data
  const updateNodeData = (nodeId: string, newData: any) => {
    setNodes((nds: Node[]) => nds.map((node: Node) => 
      node.id === nodeId 
        ? { ...node, data: { ...node.data, ...newData } }
        : node
    ));
  };

  // Update edge data
  const updateEdgeData = (edgeId: string, newData: any) => {
    setEdges((eds: Edge[]) => eds.map((edge: Edge) => 
      edge.id === edgeId 
        ? { ...edge, data: { ...edge.data, ...newData }, label: `${newData.protocol}:${newData.port}` }
        : edge
    ));
  };

  return (
    <div className="h-screen flex bg-background text-foreground">
      {/* Sidebar */}
      <div className="w-80 border-r border-border bg-card overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold">Koh Atlas</h1>
              <p className="text-sm text-muted-foreground">Secure Architecture Designer</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDarkTheme(isDarkTheme === 'true' ? 'false' : 'true')}
            >
              {isDarkTheme === 'true' ? <Sun /> : <Moon />}
            </Button>
          </div>
          
          {/* Quick Actions */}
          <div className="flex gap-2 mb-4">
            <Button 
              size="sm" 
              onClick={() => loadCustomDesign('secure')}
              className="flex-1"
            >
              <Shield className="w-4 h-4 mr-1" />
              Secure
            </Button>
            <Button 
              size="sm" 
              variant="destructive"
              onClick={() => loadCustomDesign('vulnerable')}
              className="flex-1"
            >
              <Bug className="w-4 h-4 mr-1" />
              Vulnerable
            </Button>
          </div>

          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={runSecurityAnalysis}
              className="flex-1"
            >
              <Play className="w-4 h-4 mr-1" />
              Analyze
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setShowAttackPaths(!showAttackPaths)}
              className="flex-1"
            >
              <Target className="w-4 h-4 mr-1" />
              Attacks
            </Button>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="components" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3 mx-4 mt-2">
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="components" className="flex-1 px-4 pb-4">
            <ScrollArea className="h-full">
              <div className="space-y-4">
                {(['application', 'security', 'network', 'data'] as const).map(category => (
                  <div key={category}>
                    <h3 className="font-medium mb-2 capitalize">{category}</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {componentTypes.filter(c => c.category === category).map(component => (
                        <Button
                          key={component.type}
                          variant="outline"
                          className="h-auto p-2 justify-start"
                          draggable
                          onDragStart={() => setSelectedComponent(component)}
                        >
                          <div className="flex items-center gap-2">
                            <div style={{ color: component.color }}>
                              {component.icon}
                            </div>
                            <span className="text-xs">{component.label}</span>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="properties" className="flex-1 px-4 pb-4">
            <ScrollArea className="h-full">
              {selectedNode && (
                <div className="space-y-4">
                  <h3 className="font-medium">Node Properties</h3>
                  <div className="space-y-2">
                    <Label htmlFor="node-label">Label</Label>
                    <Input
                      id="node-label"
                      value={(selectedNode.data as any)?.label || ''}
                      onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="node-zone">Zone</Label>
                    <Select
                      value={(selectedNode.data as any)?.zone || ''}
                      onValueChange={(value) => updateNodeData(selectedNode.id, { zone: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="External">External</SelectItem>
                        <SelectItem value="DMZ">DMZ</SelectItem>
                        <SelectItem value="Web Tier">Web Tier</SelectItem>
                        <SelectItem value="App Tier">App Tier</SelectItem>
                        <SelectItem value="Data Tier">Data Tier</SelectItem>
                        <SelectItem value="Security">Security</SelectItem>
                        <SelectItem value="Management">Management</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={onDeleteSelected}
                    className="w-full"
                  >
                    <Trash className="w-4 h-4 mr-2" />
                    Delete Node
                  </Button>
                </div>
              )}
              
              {selectedEdge && (
                <div className="space-y-4">
                  <h3 className="font-medium">Connection Properties</h3>
                  <div className="space-y-2">
                    <Label htmlFor="edge-protocol">Protocol</Label>
                    <Select
                      value={(selectedEdge.data as any)?.protocol || 'HTTPS'}
                      onValueChange={(value) => updateEdgeData(selectedEdge.id, { 
                        ...(selectedEdge.data || {}), 
                        protocol: value,
                        port: value === 'HTTPS' ? 443 : value === 'HTTP' ? 80 : (selectedEdge.data as any)?.port || 443
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HTTPS">HTTPS</SelectItem>
                        <SelectItem value="HTTP">HTTP</SelectItem>
                        <SelectItem value="gRPC">gRPC</SelectItem>
                        <SelectItem value="PostgreSQL">PostgreSQL</SelectItem>
                        <SelectItem value="MySQL">MySQL</SelectItem>
                        <SelectItem value="Redis">Redis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edge-port">Port</Label>
                    <Input
                      id="edge-port"
                      type="number"
                      value={((selectedEdge.data as any)?.port || 443).toString()}
                      onChange={(e) => updateEdgeData(selectedEdge.id, { 
                        ...(selectedEdge.data || {}), 
                        port: parseInt(e.target.value) 
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edge-encryption">Encryption</Label>
                    <Select
                      value={(selectedEdge.data as any)?.encryption || 'TLS 1.2'}
                      onValueChange={(value) => updateEdgeData(selectedEdge.id, { 
                        ...(selectedEdge.data || {}), 
                        encryption: value 
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TLS 1.3">TLS 1.3</SelectItem>
                        <SelectItem value="TLS 1.2">TLS 1.2</SelectItem>
                        <SelectItem value="mTLS">mTLS</SelectItem>
                        <SelectItem value="None">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={onDeleteSelected}
                    className="w-full"
                  >
                    <Trash className="w-4 h-4 mr-2" />
                    Delete Connection
                  </Button>
                </div>
              )}
              
              {!selectedNode && !selectedEdge && (
                <div className="text-center text-muted-foreground py-8">
                  <p>Select a node or connection to edit properties</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="analysis" className="flex-1 px-4 pb-4">
            <ScrollArea className="h-full">
              {showAttackPaths ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Attack Path Analysis</h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowAttackPaths(false)}
                    >
                      Back to Findings
                    </Button>
                  </div>
                  {attackPaths.map(path => (
                    <Card key={path.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">{path.name}</CardTitle>
                        <div className="flex gap-2">
                          <Badge variant="destructive">Impact: {path.impact}</Badge>
                          <Badge variant="outline">Likelihood: {path.likelihood}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <h4 className="text-xs font-medium mb-1">Attack Steps:</h4>
                          <ol className="text-xs space-y-1">
                            {path.steps.map((step, idx) => (
                              <li key={idx} className="flex">
                                <span className="mr-2 text-muted-foreground">{idx + 1}.</span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                        <div>
                          <h4 className="text-xs font-medium mb-1">Mitigations:</h4>
                          <ul className="text-xs space-y-1">
                            {path.mitigations.map((mitigation, idx) => (
                              <li key={idx} className="flex items-start">
                                <CheckCircle className="w-3 h-3 mr-1 mt-0.5 text-green-500" />
                                <span>{mitigation}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {attackPaths.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No attack paths identified</p>
                      <p className="text-xs">Run security analysis first</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Security Findings</h3>
                    {attackPaths.length > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowAttackPaths(true)}
                      >
                        View Attack Paths
                      </Button>
                    )}
                  </div>
                  {findings.map(finding => (
                    <Card key={finding.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">{finding.title}</CardTitle>
                          <Badge 
                            variant={
                              finding.severity === 'Critical' ? 'destructive' : 
                              finding.severity === 'High' ? 'destructive' :
                              finding.severity === 'Medium' ? 'default' : 'secondary'
                            }
                          >
                            {finding.severity}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-xs text-muted-foreground">{finding.description}</p>
                        <div>
                          <h4 className="text-xs font-medium">Recommendation:</h4>
                          <p className="text-xs">{finding.recommendation}</p>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {finding.standards.map(standard => (
                            <Badge key={standard} variant="outline" className="text-xs">
                              {standard}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {findings.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No security findings</p>
                      <p className="text-xs">Run analysis to identify issues</p>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 relative" ref={reactFlowWrapper}>
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={(reactFlowInstance) => setReactFlowInstance(reactFlowInstance)}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            nodeTypes={nodeTypes}
            connectionLineStyle={{
              stroke: 'hsl(var(--primary))',
              strokeWidth: 2,
              strokeDasharray: '5,5'
            }}
            defaultEdgeOptions={{
              type: 'smoothstep',
              animated: false,
              style: { 
                stroke: 'hsl(var(--muted-foreground))', 
                strokeWidth: 2 
              },
              labelStyle: { 
                fill: 'hsl(var(--foreground))', 
                fontSize: 10, 
                fontWeight: 500 
              },
              labelBgStyle: { 
                fill: 'hsl(var(--background))', 
                stroke: 'hsl(var(--border))', 
                strokeWidth: 1 
              }
            }}
            fitView
            className="bg-background"
          >
            <Background />
            <MiniMap />
            <Controls />
          </ReactFlow>
        </ReactFlowProvider>
        
        {/* Instructions overlay */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center p-8 bg-card/80 backdrop-blur rounded-lg border border-border">
              <h2 className="text-xl font-medium mb-2">Welcome to Koh Atlas</h2>
              <p className="text-muted-foreground mb-4">
                Drag components from the sidebar to start designing your architecture
              </p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Load a secure or vulnerable template to get started</p>
                <p>• Connect components by dragging between connection points</p>
                <p>• Run security analysis to identify vulnerabilities</p>
                <p>• View attack paths to understand threat scenarios</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;