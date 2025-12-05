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
  MarkerType,
  ConnectionMode,
  XYPosition,
  NodeProps,
  NodeResizer,
  getNodesBounds,
  getViewportForBounds,
} from '@xyflow/react';
import html2canvas from 'html2canvas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useKV } from '@github/spark/hooks';
import ComponentLibrary, { CustomComponent } from '@/components/ComponentLibrary';
import BackupManager, { ProjectBackup } from '@/components/BackupManager';
import { collectReportData, downloadPDFReport } from '@/lib/pdf-report/generator.tsx';
// import { downloadDocumentation } from '@/lib/documentation-generator';
import { 
  SecurityAnalyzer, 
  COMPLIANCE_FRAMEWORKS, 
  ComplianceFramework,
  CVEVulnerability,
  KNOWN_CVES
} from '@/lib/security-analyzer';
import {
  ComponentConfig,
  SecurityFinding,
  AttackPath,
  ProtocolConfig,
  ConnectionData,
  NodeData,
  SecurityEdgeControl
} from '@/types';
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
  Pause,
  Stop,
  Palette,
  Bug,
  Target,
  Desktop,
  DeviceMobile,
  HardDrives,
  Browser,
  Scales,
  Network,
  Tree,
  Hexagon,
  TrashSimple,
  ArrowsClockwise,
  CaretRight,
  CaretLeft,
  ListBullets,
  ClipboardText,
  Info,
  X,
  Upload,
  ChartBar,
  CurrencyDollar,
  Gauge,
  Warning,
  TrendUp,
  Sparkle as Sparkles,
  FileText,
  BookOpen,
} from '@phosphor-icons/react';
import { AIRecommendationsPanel } from '@/components/analysis/AIRecommendationsPanel';
import { getAIRecommendations } from '@/lib/ai-recommendations';
import { 
  sanitizeInput, 
  sanitizeSvg, 
  safeParseJSON, 
  DiagramSchema,
  generateSecureId,
  sanitizeError,
  validateFileSize,
  MAX_FILE_SIZE
} from '@/lib/security-utils';
import { autoConvertImportedJSON } from '@/lib/import-converter';
import { 
  validateArchitecture, 
  ValidationResult, 
  ValidationIssue 
} from '@/lib/architectural-validator';

// Protocol configurations with common ports
const protocolConfigs: Record<string, ProtocolConfig> = {
  'HTTPS': { port: 443, description: 'Secure HTTP over TLS' },
  'HTTP': { port: 80, description: 'Unencrypted HTTP (not recommended)' },
  'gRPC': { port: 443, description: 'gRPC over TLS' },
  'PostgreSQL': { port: 5432, description: 'PostgreSQL database connection' },
  'MySQL': { port: 3306, description: 'MySQL database connection' },
  'Redis': { port: 6379, description: 'Redis cache connection' },
  'MongoDB': { port: 27017, description: 'MongoDB database connection' },
  'SSH': { port: 22, description: 'Secure Shell protocol' },
  'RDP': { port: 3389, description: 'Remote Desktop Protocol' },
  'SMTP': { port: 587, description: 'SMTP email with STARTTLS' },
  'SMTPS': { port: 465, description: 'SMTP over SSL/TLS' },
  'DNS': { port: 53, description: 'Domain Name System' },
  'LDAPS': { port: 636, description: 'LDAP over SSL/TLS' },
  'KAFKA': { port: 9092, description: 'Apache Kafka messaging' },
  'ELASTICSEARCH': { port: 9200, description: 'Elasticsearch REST API' }
};

const componentTypes: ComponentConfig[] = [
  // Container Components (can contain other components)
  { type: 'vpc-vnet', label: 'VPC / VNet', icon: <Network />, category: 'container', color: '#0ea5e9', isContainer: true },
  { type: 'subnet', label: 'Subnet', icon: <Network />, category: 'container', color: '#0284c7', isContainer: true },
  { type: 'network-segmentation', label: 'Network Segmentation', icon: <Tree />, category: 'container', color: '#0891b2', isContainer: true },
  
  // Application Components
  { type: 'web-browser', label: 'Web Browser', icon: <Browser />, category: 'application', color: '#3b82f6' },
  { type: 'web-server', label: 'Web Server', icon: <Desktop />, category: 'application', color: '#3b82f6' },
  { type: 'app-server', label: 'App Server', icon: <Desktop />, category: 'application', color: '#6366f1' },
  { type: 'api-gateway', label: 'API Gateway', icon: <Globe />, category: 'application', color: '#8b5cf6' },
  { type: 'microservice', label: 'Microservice', icon: <Cloud />, category: 'application', color: '#06b6d4' },
  { type: 'mobile-app', label: 'Mobile App', icon: <DeviceMobile />, category: 'application', color: '#10b981' },
  { type: 'kubernetes-cluster', label: 'Kubernetes Cluster', icon: <Hexagon />, category: 'application', color: '#326ce5' },
  { type: 'container', label: 'Container', icon: <Hexagon />, category: 'application', color: '#0db7ed' },
  
  // Network Components
  { type: 'load-balancer-global', label: 'Global Load Balancer', icon: <Scales />, category: 'network', color: '#059669' },
  { type: 'load-balancer-internal', label: 'Internal Load Balancer', icon: <Scales />, category: 'network', color: '#047857' },
  
  // Data Components
  { type: 'database', label: 'Database', icon: <Database />, category: 'data', color: '#f59e0b' },
  { type: 'cache', label: 'Cache', icon: <HardDrives />, category: 'data', color: '#f97316' },
  { type: 'message-queue', label: 'Message Queue', icon: <HardDrives />, category: 'data', color: '#ef4444' },
  
  // Security Components
  { type: 'firewall', label: 'Firewall', icon: <Shield />, category: 'security', color: '#dc2626' },
  { type: 'waf', label: 'WAF', icon: <Shield />, category: 'security', color: '#b91c1c' },
  { type: 'ids-ips', label: 'IDS/IPS', icon: <Eye />, category: 'security', color: '#991b1b' },
  { type: 'dam', label: 'DAM', icon: <Database />, category: 'security', color: '#7c2d12' },
  { type: 'edge-dns', label: 'Edge DNS', icon: <Globe />, category: 'security', color: '#166534' },
  { type: 'edge-cdn', label: 'Edge CDN', icon: <Cloud />, category: 'security', color: '#0f766e' },
  { type: 'bastion-host', label: 'Bastion Host', icon: <Desktop />, category: 'security', color: '#7c3aed' },
  { type: 'sd-wan', label: 'SD-WAN', icon: <Network />, category: 'security', color: '#059669' },
];

// Security edge controls for VPC/VNet
const securityEdgeControls: SecurityEdgeControl[] = [
  { type: 'firewall', label: 'Firewall', icon: <Shield />, color: '#dc2626' },
  { type: 'waf', label: 'WAF', icon: <Shield />, color: '#b91c1c' },
  { type: 'ids-ips', label: 'IDS/IPS', icon: <Eye />, color: '#991b1b' },
  { type: 'edge-dns', label: 'Edge DNS', icon: <Globe />, color: '#166534' },
  { type: 'edge-cdn', label: 'Edge CDN', icon: <Cloud />, color: '#0f766e' },
  { type: 'bastion-host', label: 'Bastion Host', icon: <Desktop />, color: '#7c3aed' },
  { type: 'sd-wan', label: 'SD-WAN', icon: <Network />, color: '#059669' },
];

// Custom node component with connection handles - this will be defined inside App component

// Custom designs
const customDesigns = {
  secure: {
    name: "Secure Web Application",
    nodes: [
      { id: 'vpc-1', type: 'custom', position: { x: 50, y: 50 }, data: { type: 'vpc-vnet', label: 'Production VPC', zone: 'Cloud' } },
      { id: 'subnet-dmz', type: 'custom', position: { x: 100, y: 120 }, data: { type: 'subnet', label: 'DMZ Subnet', zone: 'DMZ' } },
      { id: 'subnet-web', type: 'custom', position: { x: 400, y: 120 }, data: { type: 'subnet', label: 'Web Subnet', zone: 'Web Tier' } },
      { id: 'subnet-app', type: 'custom', position: { x: 700, y: 120 }, data: { type: 'subnet', label: 'App Subnet', zone: 'App Tier' } },
      { id: 'subnet-data', type: 'custom', position: { x: 1000, y: 120 }, data: { type: 'subnet', label: 'Data Subnet', zone: 'Data Tier' } },
      
      { id: '1', type: 'custom', position: { x: 100, y: 300 }, data: { type: 'web-browser', label: 'Web Browser', zone: 'External' } },
      { id: '2', type: 'custom', position: { x: 150, y: 180 }, data: { type: 'waf', label: 'WAF', zone: 'DMZ' } },
      { id: '3', type: 'custom', position: { x: 450, y: 180 }, data: { type: 'load-balancer-global', label: 'Global Load Balancer', zone: 'Web Tier' } },
      { id: '4', type: 'custom', position: { x: 420, y: 240 }, data: { type: 'web-server', label: 'Web Server 1', zone: 'Web Tier' } },
      { id: '5', type: 'custom', position: { x: 480, y: 240 }, data: { type: 'web-server', label: 'Web Server 2', zone: 'Web Tier' } },
      { id: '6', type: 'custom', position: { x: 750, y: 180 }, data: { type: 'api-gateway', label: 'API Gateway', zone: 'App Tier' } },
      { id: '7', type: 'custom', position: { x: 720, y: 240 }, data: { type: 'app-server', label: 'App Server 1', zone: 'App Tier' } },
      { id: '8', type: 'custom', position: { x: 780, y: 240 }, data: { type: 'app-server', label: 'App Server 2', zone: 'App Tier' } },
      { id: '9', type: 'custom', position: { x: 1050, y: 200 }, data: { type: 'database', label: 'Primary DB', zone: 'Data Tier' } },
      { id: '10', type: 'custom', position: { x: 300, y: 350 }, data: { type: 'firewall', label: 'Internal Firewall', zone: 'Security' } },
      { id: '11', type: 'custom', position: { x: 600, y: 350 }, data: { type: 'ids-ips', label: 'IDS/IPS', zone: 'Security' } },
    ] as Node[],
    edges: [
      { 
        id: 'e1-2', 
        source: '1', 
        target: '2', 
        label: 'HTTPS:443', 
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
        style: { stroke: '#10b981', strokeWidth: 2 },
        data: { protocol: 'HTTPS', port: 443, encryption: 'TLS 1.3', sourceLabel: 'Web Browser', targetLabel: 'WAF' } 
      },
      { 
        id: 'e2-3', 
        source: '2', 
        target: '3', 
        label: 'HTTPS:443', 
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
        style: { stroke: '#10b981', strokeWidth: 2 },
        data: { protocol: 'HTTPS', port: 443, encryption: 'TLS 1.3', sourceLabel: 'WAF', targetLabel: 'Global Load Balancer' } 
      },
      { 
        id: 'e3-4', 
        source: '3', 
        target: '4', 
        label: 'HTTPS:443', 
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
        style: { stroke: '#10b981', strokeWidth: 2 },
        data: { protocol: 'HTTPS', port: 443, encryption: 'TLS 1.3', sourceLabel: 'Global Load Balancer', targetLabel: 'Web Server 1' } 
      },
      { 
        id: 'e3-5', 
        source: '3', 
        target: '5', 
        label: 'HTTPS:443', 
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
        style: { stroke: '#10b981', strokeWidth: 2 },
        data: { protocol: 'HTTPS', port: 443, encryption: 'TLS 1.3', sourceLabel: 'Global Load Balancer', targetLabel: 'Web Server 2' } 
      },
      { 
        id: 'e4-6', 
        source: '4', 
        target: '6', 
        label: 'HTTPS:443', 
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
        style: { stroke: '#10b981', strokeWidth: 2 },
        data: { protocol: 'HTTPS', port: 443, encryption: 'TLS 1.3', sourceLabel: 'Web Server 1', targetLabel: 'API Gateway' } 
      },
      { 
        id: 'e5-6', 
        source: '5', 
        target: '6', 
        label: 'HTTPS:443', 
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
        style: { stroke: '#10b981', strokeWidth: 2 },
        data: { protocol: 'HTTPS', port: 443, encryption: 'TLS 1.3', sourceLabel: 'Web Server 2', targetLabel: 'API Gateway' } 
      },
      { 
        id: 'e6-7', 
        source: '6', 
        target: '7', 
        label: 'gRPC:443', 
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
        style: { stroke: '#10b981', strokeWidth: 2 },
        data: { protocol: 'gRPC', port: 443, encryption: 'mTLS', sourceLabel: 'API Gateway', targetLabel: 'App Server 1' } 
      },
      { 
        id: 'e6-8', 
        source: '6', 
        target: '8', 
        label: 'gRPC:443', 
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
        style: { stroke: '#10b981', strokeWidth: 2 },
        data: { protocol: 'gRPC', port: 443, encryption: 'mTLS', sourceLabel: 'API Gateway', targetLabel: 'App Server 2' } 
      },
      { 
        id: 'e7-9', 
        source: '7', 
        target: '9', 
        label: 'PostgreSQL:5432', 
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
        style: { stroke: '#10b981', strokeWidth: 2 },
        data: { protocol: 'PostgreSQL', port: 5432, encryption: 'TLS', sourceLabel: 'App Server 1', targetLabel: 'Primary DB' } 
      },
      { 
        id: 'e8-9', 
        source: '8', 
        target: '9', 
        label: 'PostgreSQL:5432', 
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
        style: { stroke: '#10b981', strokeWidth: 2 },
        data: { protocol: 'PostgreSQL', port: 5432, encryption: 'TLS', sourceLabel: 'App Server 2', targetLabel: 'Primary DB' } 
      },
    ] as Edge[]
  },
  vulnerable: {
    name: "Vulnerable Architecture",
    nodes: [
      { id: '1', type: 'custom', position: { x: 100, y: 100 }, data: { type: 'web-browser', label: 'Web Browser', zone: 'External' } },
      { id: '2', type: 'custom', position: { x: 400, y: 100 }, data: { type: 'web-server', label: 'Web Server', zone: 'Public' } },
      { id: '3', type: 'custom', position: { x: 700, y: 100 }, data: { type: 'database', label: 'Database', zone: 'Internal' } },
      { id: '4', type: 'custom', position: { x: 400, y: 250 }, data: { type: 'app-server', label: 'Admin Panel', zone: 'Public' } },
    ] as Node[],
    edges: [
      { 
        id: 'e1-2', 
        source: '1', 
        target: '2', 
        label: 'HTTP:80', 
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
        style: { stroke: '#ef4444', strokeWidth: 2 },
        data: { protocol: 'HTTP', port: 80, encryption: 'None', sourceLabel: 'Web Browser', targetLabel: 'Web Server' } 
      },
      { 
        id: 'e2-3', 
        source: '2', 
        target: '3', 
        label: 'MySQL:3306', 
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
        style: { stroke: '#ef4444', strokeWidth: 2 },
        data: { protocol: 'MySQL', port: 3306, encryption: 'None', sourceLabel: 'Web Server', targetLabel: 'Database' } 
      },
      { 
        id: 'e1-4', 
        source: '1', 
        target: '4', 
        label: 'HTTP:80', 
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
        style: { stroke: '#ef4444', strokeWidth: 2 },
        data: { protocol: 'HTTP', port: 80, encryption: 'None', sourceLabel: 'Web Browser', targetLabel: 'Admin Panel' } 
      },
      { 
        id: 'e4-3', 
        source: '4', 
        target: '3', 
        label: 'MySQL:3306', 
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
        style: { stroke: '#ef4444', strokeWidth: 2 },
        data: { protocol: 'MySQL', port: 3306, encryption: 'None', sourceLabel: 'Admin Panel', targetLabel: 'Database' } 
      },
    ] as Edge[]
  }
};

function App() {
  const [isDarkTheme, setIsDarkTheme] = useKV('dark-theme', 'true');
  const [isThemeLoading, setIsThemeLoading] = useState(true);
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [selectedComponent, setSelectedComponent] = useState<ComponentConfig | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [showAttackPaths, setShowAttackPaths] = useState(false);
  const [pendingConnection, setPendingConnection] = useState<Connection | null>(null);
  const [showConnectionDialog, setShowConnectionDialog] = useState(false);
  const [highlightedElements, setHighlightedElements] = useState<string[]>([]);
  const [customComponents, setCustomComponents] = useState<CustomComponent[]>([]);
  const [flowingEdges, setFlowingEdges] = useState<Set<string>>(new Set());
  const [flowingNodes, setFlowingNodes] = useState<Set<string>>(new Set());
  const [isFlowAnimating, setIsFlowAnimating] = useState(false);
  const [isFlowPaused, setIsFlowPaused] = useState(false);
  const [flowSpeed, setFlowSpeed] = useState(1500); // ms per step
  const [showFlowPanel, setShowFlowPanel] = useState(false);
  const [flowPanelWidth, setFlowPanelWidth] = useState(400);
  const [isResizingPanel, setIsResizingPanel] = useState(false);
  const [flowLogs, setFlowLogs] = useState<Array<{
    timestamp: string;
    type: 'start' | 'node' | 'connection' | 'complete';
    message: string;
    details?: any;
  }>>([]);
  
  // Component palette search and categories
  const [componentSearch, setComponentSearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['AWS', 'Azure', 'GCP', 'Generic']));
  
  // Undo/Redo history
  const [history, setHistory] = useState<Array<{ nodes: Node[]; edges: Edge[] }>>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [clipboard, setClipboard] = useState<{ nodes: Node[]; edges: Edge[] } | null>(null);
  
  // Layout & Grid
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [gridSize, setGridSize] = useState(20);
  const [showGrid, setShowGrid] = useState(true);
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  
  // Node Styling
  const [showStylingPanel, setShowStylingPanel] = useState(false);
  
  // AI Recommendations
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null);
  
  // Multi-select Connection Analysis
  const [selectedMultipleNodes, setSelectedMultipleNodes] = useState<Node[]>([]);
  const [showAnalyzeButton, setShowAnalyzeButton] = useState(false);
  const [analyzeButtonPosition, setAnalyzeButtonPosition] = useState({ x: 0, y: 0 });
  const [showAnalysisResult, setShowAnalysisResult] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzingConnection, setIsAnalyzingConnection] = useState(false);
  const [isAIAnalyzing, setIsAIAnalyzing] = useState(false);
  
  // Compliance & CVE
  const [selectedFramework, setSelectedFramework] = useState<ComplianceFramework | null>(COMPLIANCE_FRAMEWORKS[0]);
  const [complianceResults, setComplianceResults] = useState<{
    passed: any[];
    failed: any[];
    notApplicable: any[];
    score: number;
  } | null>(null);
  const [cveResults, setCveResults] = useState<{ component: any; cves: CVEVulnerability[] }[]>([]);
  const [strideThreats, setStrideThreats] = useState<any[]>([]);
  const [selectedThreatCategory, setSelectedThreatCategory] = useState<string>('All');
  
  // Performance Metrics
  const [showMetricsOverlay, setShowMetricsOverlay] = useState(false);
  const [metricsView, setMetricsView] = useState<'latency' | 'cost' | 'throughput' | 'utilization' | 'bottlenecks'>('cost');
  const [totalMonthlyCost, setTotalMonthlyCost] = useState(0);
  
  // Export
  const [isExporting, setIsExporting] = useState(false);
  
  // Paste JSON Import
  const [showPasteDialog, setShowPasteDialog] = useState(false);
  const [pasteJsonText, setPasteJsonText] = useState('');
  
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const flowPanelRef = useRef<HTMLDivElement>(null);

  // Add security control near a VPC/VNet
  const addSecurityControl = (control: any, vpcId: string) => {
    const vpcNode = nodes.find(n => n.id === vpcId);
    if (!vpcNode) return;

    // Position the security control near the VPC/VNet
    const controlPosition = {
      x: vpcNode.position.x - 150, // Position to the left of VPC
      y: vpcNode.position.y + 50,  // Slightly below the VPC top
    };

    const newNode: Node = {
      id: `${control.type}-${Date.now()}`,
      type: 'custom',
      position: controlPosition,
      data: {
        type: control.type,
        label: `${control.label} (Edge)`,
        zone: 'Security',
        associatedVpc: vpcId
      },
    };

    setNodes(nds => [...nds, newNode]);

    // Create a monitoring/protection connection to the VPC
    const newEdge: Edge = {
      id: `${newNode.id}-${vpcId}-protection`,
      source: newNode.id,
      target: vpcId,
      label: 'Protects',
      type: 'smoothstep',
      markerEnd: { type: MarkerType.ArrowClosed, width: 15, height: 15 },
      style: { 
        stroke: control.color, 
        strokeWidth: 2, 
        strokeDasharray: '5,5',
        opacity: 0.7
      },
      data: { 
        protocol: 'Protection', 
        port: 443, 
        encryption: 'TLS 1.3',
        sourceLabel: `${control.label} (Edge)`,
        targetLabel: (vpcNode.data as any)?.label,
        description: `Edge security protection for ${control.label.toLowerCase()}`
      }
    };

    setEdges(eds => [...eds, newEdge]);
    
    toast.success(`Added ${control.label} edge protection to VPC`);
  };

  // Component descriptions and connection guidance
  const getComponentInfo = (componentType: string) => {
    const descriptions: Record<string, { description: string; connections: string[] }> = {
      'web-browser': {
        description: 'Client-side application that initiates web requests',
        connections: ['Connect to WAF or Edge CDN for security', 'Direct HTTPS to web servers', 'Through load balancers for high availability']
      },
      'web-server': {
        description: 'Serves web content and handles HTTP/HTTPS requests',
        connections: ['Receive from WAF or load balancer', 'Connect to API Gateway or App Server', 'Should not connect directly to databases']
      },
      'app-server': {
        description: 'Processes business logic and application requests',
        connections: ['Receive from Web Server or API Gateway', 'Connect to databases with encrypted protocols', 'Access cache systems for performance']
      },
      'api-gateway': {
        description: 'Central entry point for API requests with routing and security',
        connections: ['Receive from Web Server or external clients', 'Route to appropriate App Servers', 'Implement authentication and rate limiting']
      },
      'database': {
        description: 'Stores and manages application data persistently',
        connections: ['Only connect from App Servers', 'Use encrypted protocols (PostgreSQL TLS)', 'Monitor with DAM for security']
      },
      'cache': {
        description: 'High-speed data storage for frequently accessed information',
        connections: ['Connect from App Servers', 'Use Redis with TLS encryption', 'Position between app and database tiers']
      },
      'load-balancer-global': {
        description: 'Distributes incoming requests across multiple servers',
        connections: ['Receive from WAF or directly from internet', 'Distribute to Web Servers', 'Enable health checks and failover']
      },
      'firewall': {
        description: 'Network security device that monitors and controls traffic',
        connections: ['Position at network boundaries', 'Monitor traffic between zones', 'Block unauthorized connections']
      },
      'waf': {
        description: 'Web Application Firewall protecting against web-based attacks',
        connections: ['First point of contact from internet', 'Forward clean traffic to load balancer', 'Filter malicious requests']
      },
      'ids-ips': {
        description: 'Intrusion Detection/Prevention System monitoring network traffic',
        connections: ['Monitor east-west traffic between tiers', 'Detect suspicious patterns', 'Block identified threats in real-time']
      },
      'dam': {
        description: 'Database Activity Monitoring for database security',
        connections: ['Monitor database access patterns', 'Detect anomalous queries', 'Alert on policy violations']
      },
      'vpc-vnet': {
        description: 'Virtual Private Cloud providing network isolation',
        connections: ['Contains all infrastructure components', 'Implement network segmentation', 'Control traffic with security groups']
      },
      'subnet': {
        description: 'Network subdivision within VPC for logical separation',
        connections: ['Group related components by function', 'Implement tier-based architecture', 'Control access between subnets']
      },
      'edge-dns': {
        description: 'DNS service with security filtering and DDoS protection',
        connections: ['First line of defense for DNS queries', 'Filter malicious domains', 'Provide fast DNS resolution']
      },
      'edge-cdn': {
        description: 'Content Delivery Network with edge security features',
        connections: ['Cache content closer to users', 'Provide DDoS protection', 'Terminate SSL at edge']
      },
      'bastion-host': {
        description: 'Secure gateway for administrative access to internal resources',
        connections: ['Single entry point for admin access', 'Log all administrative sessions', 'Use SSH keys and MFA']
      }
    };
    
    return descriptions[componentType] || {
      description: 'System component in the architecture',
      connections: ['Follow security best practices', 'Use encrypted connections', 'Implement proper access controls']
    };
  };

  // Custom node component with connection handles - defined inside App to access addSecurityControl
  const CustomNode = ({ data, selected, id }: NodeProps) => {
    const config = componentTypes.find(c => c.type === data.type);
    const isHighlighted = data.isHighlighted;
    const componentInfo = getComponentInfo(String(data.type));
    
    if (config?.isContainer) {
      // Container node (VPC, Subnet, Network Segmentation)
      return (
        <div 
          className={`
            relative min-w-[200px] min-h-[150px] rounded-lg border-2 border-dashed 
            ${selected ? 'border-primary ring-4 ring-primary/30 shadow-2xl shadow-primary/20' : 'border-border'}
            ${isHighlighted ? 'ring-4 ring-yellow-400/60 border-yellow-400' : ''}
            transition-all duration-300 ease-out
            hover:border-primary/70 hover:shadow-xl hover:scale-[1.01] hover:ring-2 hover:ring-primary/20
            bg-card/10 backdrop-blur-sm cursor-pointer
          `}
          style={{ 
            borderColor: isHighlighted ? '#facc15' : (selected ? config?.color : config?.color || '#666'),
            backgroundColor: `${config?.color}${selected ? '20' : '10'}` || '#66610',
            boxShadow: selected ? `0 0 30px ${config?.color}40` : 'none'
          }}
        >
          {/* Node Resizer - Enhanced for containers */}
          <NodeResizer 
            isVisible={selected}
            minWidth={200}
            minHeight={150}
            maxWidth={1200}
            maxHeight={800}
            keepAspectRatio={false}
            handleStyle={{
              backgroundColor: config?.color || '#666',
              borderColor: 'white',
              borderWidth: 2,
              width: 10,
              height: 10,
              borderRadius: '2px'
            }}
            lineStyle={{
              borderColor: config?.color || '#666',
              borderWidth: 2
            }}
          />
          
          {/* Container header */}
          <div 
            className={`absolute -top-6 left-2 px-2 py-1 bg-card border border-border rounded-md shadow-sm ${isHighlighted ? 'bg-yellow-100 border-yellow-400' : ''}`}
            style={{ borderLeftColor: isHighlighted ? '#facc15' : (config?.color || '#666'), borderLeftWidth: '3px' }}
          >
            <div className="flex items-center gap-2">
              <div style={{ color: isHighlighted ? '#facc15' : (config?.color || '#666') }}>
                {config?.icon as React.ReactElement}
              </div>
              <div>
                <div className="font-medium text-xs">{String((data as any).label || '')}</div>
                <div className="text-xs text-muted-foreground">{String(config?.label || '')}</div>
              </div>
            </div>
            {(data as any).zone && String((data as any).zone) && (
              <Badge variant="secondary" className="mt-1 text-xs">
                {String((data as any).zone)}
              </Badge>
            )}
          </div>

          {/* Security Edge Controls Panel - Only for VPC/VNet */}
          {data.type === 'vpc-vnet' && selected && (
            <div className="absolute -right-32 top-2 w-28 bg-card border border-border rounded-md shadow-lg p-2 z-10">
              <div className="text-xs font-medium mb-2 text-center">Edge Security</div>
              <div className="space-y-1">
                {securityEdgeControls.map(control => (
                  <Button
                    key={control.type}
                    variant="ghost"
                    size="sm"
                    className="w-full h-7 p-1 justify-start text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      addSecurityControl(control, id);
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <div style={{ color: control.color }} className="w-3 h-3">
                        {control.icon}
                      </div>
                      <span className="truncate">{control.label}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Component Info Panel - Shows when container is highlighted */}
          {isHighlighted && (
            <div className="absolute -bottom-32 left-0 w-72 bg-card border border-yellow-400 rounded-lg shadow-lg p-3 z-20 text-xs">
            <div className="flex items-center gap-2 mb-2">
              <div style={{ color: isHighlighted ? '#facc15' : (config?.color || '#666') }}>
                {config?.icon as React.ReactElement}
              </div>
              <div className="font-medium text-yellow-600">{String(config?.label || '')}</div>
            </div>              <div className="space-y-2">
                <div>
                  <div className="font-medium text-yellow-700 mb-1">Description:</div>
                  <div className="text-muted-foreground">{componentInfo.description}</div>
                </div>
                
                <div>
                  <div className="font-medium text-yellow-700 mb-1">Connection Best Practices:</div>
                  <ul className="space-y-1 text-muted-foreground">
                    {componentInfo.connections.map((connection, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="mr-1 text-yellow-600">•</span>
                        <span>{connection}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="mt-2 pt-2 border-t border-yellow-400/30 text-xs text-yellow-600">
                💡 This container is flagged in security analysis
              </div>
            </div>
          )}
          
          {/* Container content area */}
          <div className="w-full h-full p-4 flex items-center justify-center">
            <div className="text-xs text-muted-foreground opacity-50">
              Drop components here
            </div>
          </div>
          
          {/* Connection handles */}
          <Handle
            type="target"
            position={Position.Left}
            className="w-3 h-3 !bg-primary border-2 border-background"
            style={{ left: -6 }}
          />
          <Handle
            type="source"
            position={Position.Right}
            className="w-3 h-3 !bg-primary border-2 border-background"
            style={{ right: -6 }}
          />
          <Handle
            type="target"
            position={Position.Top}
            className="w-3 h-3 !bg-primary border-2 border-background"
            style={{ top: -6 }}
          />
          <Handle
            type="source"
            position={Position.Bottom}
            className="w-3 h-3 !bg-primary border-2 border-background"
            style={{ bottom: -6 }}
          />
        </div>
      );
    }

    // Regular component node
    const gradient = (data as any).gradient;
    const shadow = (data as any).shadow;
    const statusBadge = (data as any).statusBadge;
    const environment = (data as any).environment;
    
    // Build style object
    const nodeStyle: React.CSSProperties = {
      borderLeftColor: isHighlighted ? '#facc15' : (config?.color || '#666'),
    };
    
    if (gradient) {
      nodeStyle.background = `linear-gradient(${gradient.direction || 'to-br'}, ${gradient.from}, ${gradient.to})`;
    }
    
    // Build className with shadow and environment
    const shadowClass = shadow ? `shadow-${shadow}` : 'shadow-lg';
    const envColor = environment === 'prod' ? 'border-red-500' : 
                    environment === 'staging' ? 'border-yellow-500' : 
                    environment === 'dev' ? 'border-blue-500' : '';
    
    return (
      <div 
        className={`
          px-4 py-2 rounded-lg bg-card border-2 min-w-[120px] relative
          ${shadowClass}
          ${envColor || (selected ? 'border-primary' : 'border-border')}
          ${selected ? 'ring-4 ring-primary/30 shadow-2xl shadow-primary/20' : ''}
          ${isHighlighted ? 'ring-4 ring-yellow-400/60 border-yellow-400 bg-yellow-50' : ''}
          transition-all duration-300 ease-out
          hover:shadow-2xl hover:border-primary/70 hover:scale-105 hover:ring-2 hover:ring-primary/20 hover:-translate-y-0.5
          cursor-pointer
        `}
        style={{
          ...nodeStyle,
          boxShadow: selected ? `0 8px 30px ${config?.color}40, 0 0 20px ${config?.color}30` : undefined
        }}
      >
        {/* Node Resizer for regular components - Enhanced scaling */}
        <NodeResizer 
          isVisible={selected}
          minWidth={120}
          minHeight={60}
          maxWidth={600}
          maxHeight={400}
          keepAspectRatio={false}
          handleStyle={{
            backgroundColor: config?.color || '#666',
            borderColor: 'white',
            borderWidth: 2,
            width: 8,
            height: 8,
            borderRadius: '2px'
          }}
          lineStyle={{
            borderColor: config?.color || '#666',
            borderWidth: 1.5
          }}
        />
        
        {/* Connection handles */}
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 !bg-primary border-2 border-background"
          style={{ left: -6 }}
        />
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 !bg-primary border-2 border-background"
          style={{ right: -6 }}
        />
        <Handle
          type="target"
          position={Position.Top}
          className="w-3 h-3 !bg-primary border-2 border-background"
          style={{ top: -6 }}
        />
        <Handle
          type="source"
          position={Position.Bottom}
          className="w-3 h-3 !bg-primary border-2 border-background"
          style={{ bottom: -6 }}
        />
        
        {/* Component Info Panel - Shows when component is highlighted */}
        {isHighlighted && (
          <div className="absolute -bottom-32 left-0 w-72 bg-card border border-yellow-400 rounded-lg shadow-lg p-3 z-20 text-xs">
            <div className="flex items-center gap-2 mb-2">
              <div style={{ color: isHighlighted ? '#facc15' : (config?.color || '#666') }}>
                {config?.icon as React.ReactElement}
              </div>
              <div className="font-medium text-yellow-600">{config?.label}</div>
            </div>
            
            <div className="space-y-2">
              <div>
                <div className="font-medium text-yellow-700 mb-1">Description:</div>
                <div className="text-muted-foreground">{componentInfo.description}</div>
              </div>
              
              <div>
                <div className="font-medium text-yellow-700 mb-1">Connection Best Practices:</div>
                <ul className="space-y-1 text-muted-foreground">
                  {componentInfo.connections.map((connection, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="mr-1 text-yellow-600">•</span>
                      <span>{connection}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="mt-2 pt-2 border-t border-yellow-400/30 text-xs text-yellow-600">
              💡 This component is flagged in security analysis
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <div style={{ color: isHighlighted ? '#facc15' : (config?.color || '#666') }}>
            {config?.icon as React.ReactElement}
          </div>
          <div className="flex-1">
            <div className="font-medium text-sm">{String((data as any).label || '')}</div>
            <div className="text-xs text-muted-foreground">{config?.label || ''}</div>
          </div>
          {/* Status Badge */}
          {statusBadge && (
            <div className={`
              text-xs px-2 py-0.5 rounded-full font-medium
              ${statusBadge.color === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : ''}
              ${statusBadge.color === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' : ''}
              ${statusBadge.color === 'red' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : ''}
              ${statusBadge.color === 'blue' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : ''}
              ${statusBadge.color === 'gray' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300' : ''}
            `}>
              {statusBadge.text}
            </div>
          )}
        </div>
        
        {/* Environment & Zone Badges */}
        <div className="flex gap-1 mt-1 flex-wrap">
          {environment && (
            <Badge 
              variant="secondary" 
              className={`text-xs ${
                environment === 'prod' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                environment === 'staging' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
              }`}
            >
              {environment === 'prod' ? '🔴 Production' : environment === 'staging' ? '🟡 Staging' : '🔵 Development'}
            </Badge>
          )}
          {(data as any).zone && String((data as any).zone) && (
            <Badge variant="secondary" className="text-xs">
              {String((data as any).zone)}
            </Badge>
          )}
          
          {/* Performance Metrics Badges */}
          {showMetricsOverlay && (data as any).metrics && (
            <>
              {metricsView === 'cost' && (data as any).metrics.cost && (
                <Badge variant="default" className="text-xs bg-green-600">
                  💰 ${(data as any).metrics.cost.monthly}/mo
                </Badge>
              )}
              {metricsView === 'latency' && (data as any).metrics.latency && (
                <Badge variant="default" className="text-xs bg-blue-600">
                  ⚡ {(data as any).metrics.latency.p95}ms
                </Badge>
              )}
              {metricsView === 'throughput' && (data as any).metrics.throughput && (
                <Badge variant="default" className="text-xs bg-purple-600">
                  📊 {(data as any).metrics.throughput.current} {(data as any).metrics.throughput.unit}
                </Badge>
              )}
              {metricsView === 'utilization' && (data as any).metrics.resources && (
                <Badge 
                  variant="default" 
                  className={`text-xs ${
                    (data as any).metrics.resources.cpu > 80 ? 'bg-red-600' :
                    (data as any).metrics.resources.cpu > 60 ? 'bg-yellow-600' :
                    'bg-green-600'
                  }`}
                >
                  CPU: {(data as any).metrics.resources.cpu}%
                </Badge>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  const nodeTypes = {
    custom: CustomNode,
  };

  // Combine built-in and custom components
  const allComponentTypes = [
    ...componentTypes,
    ...customComponents.map(comp => ({
      type: comp.type,
      label: comp.label,
      icon: React.createElement(Shield), // Default icon for now
      category: comp.category,
      color: comp.color,
      isContainer: comp.isContainer
    }))
  ];

  // Handler for importing custom components
  const handleImportComponents = (importedComponents: CustomComponent[]) => {
    setCustomComponents(prev => {
      const newComponents = importedComponents.filter(
        imported => !prev.some(existing => existing.type === imported.type)
      );
      return [...prev, ...newComponents];
    });
    toast.success(`Imported ${importedComponents.length} components to application`);
  };

  // Handler for loading backup
  const handleLoadBackup = (backup: ProjectBackup) => {
    // Load all data from backup
    setNodes(backup.data.nodes);
    setEdges(backup.data.edges);
    setCustomComponents(backup.data.customComponents);
    setFindings(backup.data.findings);
    setAttackPaths(backup.data.attackPaths);
    
    // Apply settings
    if (backup.data.settings.darkTheme !== undefined) {
      setIsDarkTheme(backup.data.settings.darkTheme);
    }
    
    // Clear current selections
    setSelectedNode(null);
    setSelectedEdge(null);
    clearHighlights();
    
    toast.success(`Loaded backup "${backup.name}" with ${backup.statistics.nodeCount} components`);
  };

  // Security findings
  const [findings, setFindings] = useState<SecurityFinding[]>([]);
  const [attackPaths, setAttackPaths] = useState<AttackPath[]>([]);
  
  // Architectural validation
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [showValidation, setShowValidation] = useState(false);

  // Suppress ResizeObserver loop errors (benign browser warning)
  useEffect(() => {
    // Enhanced ResizeObserver error detection with more patterns
    const isResizeObserverError = (message: unknown): boolean => {
      const str = String(message || '').toLowerCase();
      return (
        str.includes('resizeobserver') || 
        (str.includes('loop') && str.includes('completed')) ||
        str.includes('undelivered notifications') ||
        str.includes('resize observer loop') ||
        str.includes('observation loop')
      );
    };

    // Store original console methods
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalLog = console.log;

    // Enhanced console filtering with complete suppression
    console.error = (...args: unknown[]) => {
      if (!args.some(arg => isResizeObserverError(arg))) {
        originalError.apply(console, args);
      }
    };
    
    console.warn = (...args: unknown[]) => {
      if (!args.some(arg => isResizeObserverError(arg))) {
        originalWarn.apply(console, args);
      }
    };

    console.log = (...args: unknown[]) => {
      if (!args.some(arg => isResizeObserverError(arg))) {
        originalLog.apply(console, args);
      }
    };
    
    // Comprehensive error event handling with immediate suppression
    const handleError = (event: ErrorEvent) => {
      const errorMessage = event.message || event.error?.message || event.error?.toString() || '';
      if (isResizeObserverError(errorMessage)) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return false;
      }
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason || event.reason?.message || event.reason?.toString() || '';
      if (isResizeObserverError(reason)) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
      }
    };

    // Register event listeners with highest priority
    window.addEventListener('error', handleError, { capture: true, passive: false });
    window.addEventListener('unhandledrejection', handleRejection, { capture: true, passive: false });
    
    // Enhanced ResizeObserver wrapper with complete error suppression
    const originalResizeObserver = window.ResizeObserver;
    if (originalResizeObserver) {
      window.ResizeObserver = class extends originalResizeObserver {
        constructor(callback: ResizeObserverCallback) {
          const wrappedCallback: ResizeObserverCallback = (entries, observer) => {
            try {
              // Debounce with requestAnimationFrame to prevent loops
              requestAnimationFrame(() => {
                try {
                  callback(entries, observer);
                } catch (error) {
                  // Completely suppress ResizeObserver errors
                  if (!isResizeObserverError(error)) {
                    console.error('Non-ResizeObserver error:', error);
                  }
                }
              });
            } catch (error) {
              // Suppress all potential ResizeObserver errors
              if (!isResizeObserverError(error)) {
                console.error('ResizeObserver wrapper error:', error);
              }
            }
          };
          super(wrappedCallback);
        }
      };
    }

    // Additional global error handler for any missed cases
    const globalErrorHandler = (event: any) => {
      if (event && typeof event === 'object') {
        const message = event.message || event.error?.message || event.toString();
        if (isResizeObserverError(message)) {
          event.preventDefault?.();
          event.stopPropagation?.();
          return false;
        }
      }
    };

    window.addEventListener('error', globalErrorHandler, true);
    window.addEventListener('unhandledrejection', globalErrorHandler, true);
    
    return () => {
      // Restore original methods
      console.error = originalError;
      console.warn = originalWarn;
      console.log = originalLog;
      window.removeEventListener('error', handleError, true);
      window.removeEventListener('unhandledrejection', handleRejection, true);
      window.removeEventListener('error', globalErrorHandler, true);
      window.removeEventListener('unhandledrejection', globalErrorHandler, true);
      if (originalResizeObserver) {
        window.ResizeObserver = originalResizeObserver;
      }
    };
  }, []);

  // Update theme with loading indicator
  useEffect(() => {
    setIsThemeLoading(true);
    
    const applyTheme = () => {
      if (isDarkTheme === 'true') {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
      
      setTimeout(() => {
        setIsThemeLoading(false);
      }, 300);
    };
    
    applyTheme();
  }, [isDarkTheme]);

  // Clear highlights
  const clearHighlights = () => {
    setHighlightedElements([]);
    
    // Reset node highlights
    setNodes((nds: Node[]) => nds.map((node: Node) => ({
      ...node,
      data: {
        ...node.data,
        isHighlighted: false
      }
    })));

    // Reset edge highlights
    setEdges((eds: Edge[]) => eds.map((edge: Edge) => ({
      ...edge,
      style: {
        ...edge.style,
        stroke: (edge.data as any)?.encryption === 'None' ? '#ef4444' : '#10b981',
        strokeWidth: 2,
        filter: undefined
      }
    })));
  };

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

  // Load custom design with randomized positions and variations
  const loadCustomDesign = (designKey: 'secure' | 'vulnerable') => {
    const design = customDesigns[designKey];
    
    // Add more randomization by shuffling component positions and creating variations
    const shuffledNodes = [...design.nodes];
    
    // Create completely randomized grid positions
    const gridColumns = 6;
    const gridRows = Math.ceil(shuffledNodes.length / gridColumns);
    const cellWidth = 200;
    const cellHeight = 150;
    const margin = 100;
    
    // Shuffle the nodes for different arrangement each time
    for (let i = shuffledNodes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledNodes[i], shuffledNodes[j]] = [shuffledNodes[j], shuffledNodes[i]];
    }
    
    // Create randomized positions while maintaining relative structure
    const randomizedNodes = shuffledNodes.map((node, index) => {
      const config = componentTypes.find(c => c.type === (node.data as any)?.type);
      const isContainer = config?.isContainer;
      
      if (isContainer) {
        // Container components get special positioning
        const containerIndex = shuffledNodes.filter((n, i) => i <= index && 
          componentTypes.find(c => c.type === (n.data as any)?.type)?.isContainer).length - 1;
        
        // More varied container positioning
        const arrangements = [
          { x: 50, y: 50 },
          { x: 800, y: 50 },
          { x: 50, y: 400 },
          { x: 800, y: 400 },
          { x: 400, y: 200 },
          { x: 1200, y: 100 },
        ];
        
        const basePosition = arrangements[containerIndex % arrangements.length];
        
        // Larger random variation for containers
        const randomOffsetX = (Math.random() - 0.5) * 200; // ±100px variation
        const randomOffsetY = (Math.random() - 0.5) * 150; // ±75px variation
        
        return {
          ...node,
          position: { 
            x: Math.max(50, basePosition.x + randomOffsetX), 
            y: Math.max(50, basePosition.y + randomOffsetY) 
          }
        };
      } else {
        // Regular components with more randomized grid positioning
        const regularIndex = shuffledNodes.filter((n, i) => i <= index && 
          !componentTypes.find(c => c.type === (n.data as any)?.type)?.isContainer).length - 1;
        
        // Calculate grid position with randomness
        const col = regularIndex % gridColumns;
        const row = Math.floor(regularIndex / gridColumns);
        
        // Base grid position
        const baseX = margin + col * cellWidth;
        const baseY = margin + row * cellHeight;
        
        // Add significant random variation
        const randomOffsetX = (Math.random() - 0.5) * 250; // ±125px variation
        const randomOffsetY = (Math.random() - 0.5) * 200; // ±100px variation
        
        // Sometimes create clusters or lines
        const layoutVariation = Math.random();
        let finalX = baseX + randomOffsetX;
        let finalY = baseY + randomOffsetY;
        
        if (layoutVariation < 0.3) {
          // Cluster layout - group some components
          const clusterCenterX = 300 + Math.random() * 600;
          const clusterCenterY = 200 + Math.random() * 300;
          const clusterRadius = 150;
          const angle = Math.random() * 2 * Math.PI;
          finalX = clusterCenterX + Math.cos(angle) * (Math.random() * clusterRadius);
          finalY = clusterCenterY + Math.sin(angle) * (Math.random() * clusterRadius);
        } else if (layoutVariation < 0.6) {
          // Linear layout - arrange in flowing lines
          const lineY = 150 + (regularIndex % 3) * 200 + Math.random() * 100;
          finalX = 100 + regularIndex * 180 + Math.random() * 100;
          finalY = lineY;
        }
        // Otherwise use the standard grid with variation
        
        return {
          ...node,
          position: { 
            x: Math.max(50, finalX), 
            y: Math.max(50, finalY) 
          }
        };
      }
    });
    
    // Also randomize edge colors and styles slightly
    const randomizedEdges = design.edges.map(edge => {
      const variations = [
        { strokeWidth: 2 },
        { strokeWidth: 3 },
        { strokeWidth: 1.5 },
      ];
      
      const variation = variations[Math.floor(Math.random() * variations.length)];
      
      return {
        ...edge,
        style: {
          ...edge.style,
          ...variation
        }
      };
    });
    
    setNodes(randomizedNodes);
    setEdges(randomizedEdges);
    toast.success(`Loaded ${design.name} with completely randomized layout`);
  };

  // Add new component to canvas with container detection
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

      // For container components, set larger size
      const isContainer = selectedComponent.isContainer;
      const nodeData: any = {
        type: selectedComponent.type,
        label: selectedComponent.label,
        zone: selectedComponent.category === 'security' ? 'Security' : 'Internal',
      };

      if (isContainer) {
        nodeData.width = 300;
        nodeData.height = 200;
      }

      const newNode: Node = {
        id: `${Date.now()}`,
        type: 'custom',
        position,
        data: nodeData,
        ...(isContainer && {
          style: {
            width: 300,
            height: 200,
          },
        }),
      };

      setNodes(nds => nds.concat(newNode));
      setSelectedComponent(null);
    },
    [reactFlowInstance, selectedComponent, setNodes]
  );

  // Handle connection validation and dialog
  const onConnect = useCallback(
    (params: Connection) => {
      // Store the pending connection and show dialog for protocol selection
      setPendingConnection(params);
      setShowConnectionDialog(true);
    },
    []
  );

  // Create connection with specified protocol
  const createConnection = (protocol: string, port: number, encryption: string) => {
    if (!pendingConnection) return;

    const sourceNode = nodes.find(n => n.id === pendingConnection.source);
    const targetNode = nodes.find(n => n.id === pendingConnection.target);
    
    const newEdge: Edge = {
      ...pendingConnection,
      id: `e${pendingConnection.source}-${pendingConnection.target}-${Date.now()}`,
      label: `${protocol}:${port}`,
      data: { 
        protocol, 
        port, 
        encryption,
        sourceLabel: sourceNode?.data?.label,
        targetLabel: targetNode?.data?.label,
      },
      style: {
        stroke: encryption === 'None' ? '#ef4444' : '#10b981',
        strokeWidth: 2,
      },
    };
    
    setEdges(eds => addEdge(newEdge, eds));
    setPendingConnection(null);
    setShowConnectionDialog(false);
    
    toast.success(`Connected ${sourceNode?.data?.label} → ${targetNode?.data?.label}`);
  };

  // Quick connection with smart defaults
  const createQuickConnection = () => {
    if (!pendingConnection) return;

    const sourceNode = nodes.find(n => n.id === pendingConnection.source);
    const targetNode = nodes.find(n => n.id === pendingConnection.target);
    
    // Smart protocol selection based on target component type
    let protocol = 'HTTPS';
    let port = 443;
    let encryption = 'TLS 1.3';
    
    if (targetNode?.data?.type === 'database') {
      protocol = 'PostgreSQL';
      port = 5432;
      encryption = 'TLS';
    } else if (targetNode?.data?.type === 'cache') {
      protocol = 'Redis';
      port = 6379;
      encryption = 'TLS';
    } else if (targetNode?.data?.type === 'message-queue') {
      protocol = 'KAFKA';
      port = 9092;
      encryption = 'SASL_SSL';
    }
    
    createConnection(protocol, port, encryption);
  };

  // Clear all elements from canvas
  const clearAll = useCallback(() => {
    saveToHistory();
    setNodes([]);
    setEdges([]);
    setHighlightedElements([]);
    clearHighlights();
    toast.success('Canvas cleared - all components and connections removed');
  }, [setNodes, setEdges]);

  // Save current state to history
  const saveToHistory = useCallback(() => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes: [...nodes], edges: [...edges] });
    // Keep history limited to 50 states
    if (newHistory.length > 50) {
      newHistory.shift();
    } else {
      setHistoryIndex(historyIndex + 1);
    }
    setHistory(newHistory);
  }, [nodes, edges, history, historyIndex]);

  // Undo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setNodes(prevState.nodes);
      setEdges(prevState.edges);
      setHistoryIndex(historyIndex - 1);
      toast.success('Undo');
    } else {
      toast.info('Nothing to undo');
    }
  }, [history, historyIndex, setNodes, setEdges]);

  // Redo
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setHistoryIndex(historyIndex + 1);
      toast.success('Redo');
    } else {
      toast.info('Nothing to redo');
    }
  }, [history, historyIndex, setNodes, setEdges]);

  // Copy selected nodes and edges
  const copySelected = useCallback(() => {
    if (!selectedNode && nodes.filter(n => n.selected).length === 0) {
      toast.info('No components selected to copy');
      return;
    }
    
    const selectedNodes = selectedNode ? [selectedNode] : nodes.filter(n => n.selected);
    const selectedNodeIds = new Set(selectedNodes.map(n => n.id));
    const selectedEdges = edges.filter(e => 
      selectedNodeIds.has(e.source) && selectedNodeIds.has(e.target)
    );
    
    setClipboard({ nodes: selectedNodes, edges: selectedEdges });
    toast.success(`Copied ${selectedNodes.length} component(s)`);
  }, [selectedNode, nodes, edges]);

  // Paste copied nodes
  const pasteSelected = useCallback(() => {
    if (!clipboard) {
      toast.info('Nothing to paste');
      return;
    }
    
    saveToHistory();
    const offset = 50;
    const idMap = new Map<string, string>();
    
    // Create new nodes with offset positions
    const newNodes = clipboard.nodes.map(node => {
      const newId = `${node.id}-copy-${Date.now()}-${Math.random()}`;
      idMap.set(node.id, newId);
      
      return {
        ...node,
        id: newId,
        position: {
          x: node.position.x + offset,
          y: node.position.y + offset,
        },
        selected: true,
      };
    });
    
    // Create new edges with updated source/target
    const newEdges = clipboard.edges.map(edge => {
      const newSource = idMap.get(edge.source);
      const newTarget = idMap.get(edge.target);
      
      if (!newSource || !newTarget) return null;
      
      return {
        ...edge,
        id: `${newSource}-${newTarget}`,
        source: newSource,
        target: newTarget,
      };
    }).filter(Boolean) as Edge[];
    
    // Deselect existing nodes
    setNodes(nds => nds.map(n => ({ ...n, selected: false })).concat(newNodes));
    setEdges(eds => eds.concat(newEdges));
    
    toast.success(`Pasted ${newNodes.length} component(s)`);
  }, [clipboard, setNodes, setEdges, saveToHistory]);

  // Duplicate selected nodes
  const duplicateSelected = useCallback(() => {
    copySelected();
    setTimeout(() => pasteSelected(), 100);
  }, [copySelected, pasteSelected]);

  // Select all nodes
  const selectAll = useCallback(() => {
    setNodes(nds => nds.map(n => ({ ...n, selected: true })));
    toast.info('All components selected');
  }, [setNodes]);

  // Quick save
  const quickSave = useCallback(() => {
    const backup: any = {
      id: `quicksave-${Date.now()}`,
      name: `Quick Save - ${new Date().toLocaleString()}`,
      timestamp: Date.now(),
      nodes,
      edges,
      customComponents,
      findings,
      attackPaths,
      statistics: {
        nodeCount: nodes.length,
        edgeCount: edges.length,
        securityFindings: findings.length,
        componentTypes: Array.from(new Set(nodes.map(n => n.data?.type || 'unknown'))),
      },
    };
    
    // Save to localStorage
    const existingBackups = JSON.parse(localStorage.getItem('project-backups') || '[]');
    existingBackups.unshift(backup);
    // Keep only last 10 quick saves
    if (existingBackups.length > 10) {
      existingBackups.pop();
    }
    localStorage.setItem('project-backups', JSON.stringify(existingBackups));
    
    toast.success('Quick save successful');
  }, [nodes, edges, customComponents, findings, attackPaths]);

  // Toggle snap to grid
  const toggleSnapToGrid = useCallback(() => {
    setSnapToGrid(!snapToGrid);
    toast.info(snapToGrid ? 'Snap to grid disabled' : 'Snap to grid enabled');
  }, [snapToGrid]);

  // Align selected nodes
  const alignNodes = useCallback((direction: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    const selectedNodes = nodes.filter(n => n.selected);
    if (selectedNodes.length < 2) {
      toast.info('Select at least 2 components to align');
      return;
    }
    
    saveToHistory();
    
    let newNodes = [...nodes];
    
    if (direction === 'left') {
      const minX = Math.min(...selectedNodes.map(n => n.position.x));
      newNodes = newNodes.map(n => 
        n.selected ? { ...n, position: { ...n.position, x: minX } } : n
      );
    } else if (direction === 'right') {
      const maxX = Math.max(...selectedNodes.map(n => n.position.x + (n.measured?.width || 100)));
      newNodes = newNodes.map(n => 
        n.selected ? { ...n, position: { ...n.position, x: maxX - (n.measured?.width || 100) } } : n
      );
    } else if (direction === 'center') {
      const avgX = selectedNodes.reduce((sum, n) => sum + n.position.x, 0) / selectedNodes.length;
      newNodes = newNodes.map(n => 
        n.selected ? { ...n, position: { ...n.position, x: avgX } } : n
      );
    } else if (direction === 'top') {
      const minY = Math.min(...selectedNodes.map(n => n.position.y));
      newNodes = newNodes.map(n => 
        n.selected ? { ...n, position: { ...n.position, y: minY } } : n
      );
    } else if (direction === 'bottom') {
      const maxY = Math.max(...selectedNodes.map(n => n.position.y + (n.measured?.height || 60)));
      newNodes = newNodes.map(n => 
        n.selected ? { ...n, position: { ...n.position, y: maxY - (n.measured?.height || 60) } } : n
      );
    } else if (direction === 'middle') {
      const avgY = selectedNodes.reduce((sum, n) => sum + n.position.y, 0) / selectedNodes.length;
      newNodes = newNodes.map(n => 
        n.selected ? { ...n, position: { ...n.position, y: avgY } } : n
      );
    }
    
    setNodes(newNodes);
    toast.success(`Aligned ${selectedNodes.length} components ${direction}`);
  }, [nodes, setNodes, saveToHistory]);

  // Distribute nodes evenly
  const distributeNodes = useCallback((direction: 'horizontal' | 'vertical') => {
    const selectedNodes = nodes.filter(n => n.selected);
    if (selectedNodes.length < 3) {
      toast.info('Select at least 3 components to distribute');
      return;
    }
    
    saveToHistory();
    
    const sorted = [...selectedNodes].sort((a, b) => 
      direction === 'horizontal' 
        ? a.position.x - b.position.x 
        : a.position.y - b.position.y
    );
    
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const totalSpace = direction === 'horizontal'
      ? last.position.x - first.position.x
      : last.position.y - first.position.y;
    const spacing = totalSpace / (sorted.length - 1);
    
    const newNodes = nodes.map(node => {
      const index = sorted.findIndex(n => n.id === node.id);
      if (index === -1 || index === 0 || index === sorted.length - 1) return node;
      
      const newPos = direction === 'horizontal'
        ? { ...node.position, x: first.position.x + spacing * index }
        : { ...node.position, y: first.position.y + spacing * index };
      
      return { ...node, position: newPos };
    });
    
    setNodes(newNodes);
    toast.success(`Distributed ${selectedNodes.length} components ${direction}ly`);
  }, [nodes, setNodes, saveToHistory]);

  // Update node styling
  const updateNodeStyling = useCallback((nodeId: string, styling: Partial<{
    gradient?: { from: string; to: string; direction?: string };
    shadow?: string;
    statusBadge?: { text: string; color: string };
    environment?: 'dev' | 'staging' | 'prod';
  }>) => {
    setNodes(nds => 
      nds.map(node => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              ...styling
            }
          };
        }
        return node;
      })
    );
    saveToHistory();
  }, [setNodes, saveToHistory]);

  // Remove node styling
  const removeNodeStyling = useCallback((nodeId: string, property: string) => {
    setNodes(nds => 
      nds.map(node => {
        if (node.id === nodeId) {
          const newData = { ...node.data };
          delete newData[property];
          return { ...node, data: newData };
        }
        return node;
      })
    );
    saveToHistory();
  }, [setNodes, saveToHistory]);

  // Update node metrics
  const updateNodeMetrics = useCallback((nodeId: string, metrics: any) => {
    setNodes(nds => 
      nds.map(node => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              metrics: {
                ...node.data.metrics,
                ...metrics
              }
            }
          };
        }
        return node;
      })
    );
    saveToHistory();
    
    // Recalculate total cost
    const newTotal = nodes.reduce((sum, n) => {
      if (n.id === nodeId && metrics.cost) {
        return sum + (metrics.cost.monthly || 0);
      }
      return sum + (n.data.metrics?.cost?.monthly || 0);
    }, 0);
    setTotalMonthlyCost(newTotal);
  }, [nodes, setNodes, saveToHistory]);

  // Calculate total metrics
  const calculateTotalMetrics = useCallback(() => {
    let totalCost = 0;
    let avgLatency = 0;
    let totalThroughput = 0;
    let bottleneckCount = 0;
    let nodesWithMetrics = 0;

    nodes.forEach(node => {
      const metrics = node.data.metrics;
      if (metrics) {
        nodesWithMetrics++;
        if (metrics.cost) totalCost += metrics.cost.monthly;
        if (metrics.latency) avgLatency += metrics.latency.p95;
        if (metrics.throughput) totalThroughput += metrics.throughput.current;
      }
    });

    edges.forEach(edge => {
      const edgeData = edge.data as any;
      if (edgeData?.metrics?.isBottleneck) {
        bottleneckCount++;
      }
    });

    if (nodesWithMetrics > 0) {
      avgLatency = avgLatency / nodesWithMetrics;
    }

    return {
      totalCost,
      avgLatency: Math.round(avgLatency),
      totalThroughput,
      bottleneckCount,
      nodesWithMetrics
    };
  }, [nodes, edges]);

  // Export diagram as PNG
  const exportToPNG = useCallback(async () => {
    console.log('exportToPNG called!');
    if (!reactFlowWrapper.current) {
      toast.error('Canvas not ready. Please try again.');
      console.error('reactFlowWrapper.current is null');
      return;
    }
    
    if (nodes.length === 0) {
      toast.error('No components to export. Add some components first.');
      return;
    }
    
    setIsExporting(true);
    toast.info('Exporting diagram to PNG...');
    
    try {
      // Find the viewport element
      const viewport = reactFlowWrapper.current.querySelector('.react-flow__viewport');
      if (!viewport) {
        throw new Error('Cannot find diagram viewport');
      }
      
      const canvas = await html2canvas(reactFlowWrapper.current, {
        backgroundColor: isDarkTheme === 'true' ? '#0a0a0a' : '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
      });
      
      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error('Failed to create image blob');
        }
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `koh-atlas-${Date.now()}.png`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast.success('Diagram exported as PNG');
      }, 'image/png');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  }, [reactFlowWrapper, isDarkTheme, nodes]);

  // Export diagram as SVG
  const exportToSVG = useCallback(() => {
    console.log('exportToSVG called!');
    if (!reactFlowInstance) {
      toast.error('Diagram not ready. Please try again.');
      return;
    }
    
    if (nodes.length === 0) {
      toast.error('No components to export. Add some components first.');
      return;
    }
    
    toast.info('Exporting diagram to SVG...');
    
    try {
      const svgElements = reactFlowWrapper.current?.querySelector('.react-flow__viewport');
      if (!svgElements) {
        toast.error('Cannot find diagram viewport');
        return;
      }
      
      // Create SVG wrapper
      const bounds = getNodesBounds(nodes);
      const width = Math.max(bounds.width + 200, 800);
      const height = Math.max(bounds.height + 200, 600);
      
      // SEC-004: Sanitize SVG content to prevent XSS
      const sanitizedSvgContent = sanitizeSvg(svgElements.innerHTML);
      
      const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${bounds.x - 100} ${bounds.y - 100} ${width} ${height}">
  <rect width="100%" height="100%" fill="${isDarkTheme === 'true' ? '#0a0a0a' : '#ffffff'}"/>
  <g>${sanitizedSvgContent}</g>
</svg>`;
      
      const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `koh-atlas-${Date.now()}.svg`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Diagram exported as SVG');
    } catch (error) {
      console.error('SVG export failed:', error);
      toast.error(`SVG export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [reactFlowInstance, reactFlowWrapper, nodes, isDarkTheme]);

  // Export diagram data as JSON
  const exportToJSON = useCallback(() => {
    console.log('exportToJSON called!');
    if (nodes.length === 0) {
      toast.error('No components to export. Add some components first.');
      return;
    }
    
    try {
      const data = {
        version: '0.2.0',
        timestamp: Date.now(),
        nodes,
        edges,
        customComponents,
        findings,
        attackPaths,
        metadata: {
          nodeCount: nodes.length,
          edgeCount: edges.length,
          theme: isDarkTheme,
        },
      };
      
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `koh-atlas-${Date.now()}.json`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Diagram exported as JSON');
    } catch (error) {
      console.error('JSON export failed:', error);
      toast.error(`JSON export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [nodes, edges, customComponents, findings, attackPaths, isDarkTheme]);

  // Generate Full Documentation
  const generateFullDocumentation = useCallback(async () => {
    console.log('Generating full system documentation...');
    setIsExporting(true);
    toast.info('Documentation feature temporarily disabled...');
    // try {
    //   await downloadDocumentation();
    //   toast.success('Documentation generated successfully!');
    // } catch (error) {
    //   console.error('Documentation generation failed:', error);
    //   toast.error(`Documentation generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    // } finally {
      setIsExporting(false);
    // }
  }, []);

  // Generate PDF Security Report
  const generatePDFSecurityReport = useCallback(async () => {
    console.log('generatePDFSecurityReport called!');
    
    if (nodes.length === 0) {
      toast.error('No architecture to analyze. Add some components first.');
      return;
    }
    
    setIsExporting(true);
    toast.info('Generating comprehensive security report...');
    
    try {
      // Get project name from user or use default
      const projectName = prompt('Enter project name for the report:', 'Security Architecture Analysis') || 'Security Architecture Analysis';
      
      // Collect all report data
      const reportData = await collectReportData(
        nodes,
        edges,
        findings,
        strideThreats,
        complianceResults,
        attackPaths,
        validationResult,
        aiAnalysisResult,
        reactFlowInstance,
        projectName
      );
      
      // Generate and download PDF
      await downloadPDFReport(reportData);
      
      toast.success('Security report generated successfully!');
    } catch (error) {
      console.error('PDF generation failed:', error);
      toast.error(`Failed to generate PDF report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  }, [nodes, edges, findings, strideThreats, complianceResults, attackPaths, validationResult, aiAnalysisResult, reactFlowInstance]);

  // Import diagram from JSON
  const importFromJSON = useCallback((event?: React.ChangeEvent<HTMLInputElement>) => {
    if (!event) {
      // Trigger file upload
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = (e) => importFromJSON(e as any);
      input.click();
      return;
    }
    
    const file = event.target.files?.[0];
    if (!file) return;
    
    // SEC-003: Validate file size
    try {
      validateFileSize(file, MAX_FILE_SIZE);
    } catch (error) {
      toast.error(sanitizeError(error, 'File validation'));
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        
        // Parse JSON first (basic validation)
        const rawData = JSON.parse(content);
        
        // Try auto-conversion for legacy formats (components/connections)
        const convertedData = autoConvertImportedJSON(rawData);
        
        if (!convertedData) {
          throw new Error('Unsupported JSON format. Expected either {nodes, edges} or {components, connections}');
        }
        
        // SEC-001: Validate converted data against schema
        const data = safeParseJSON(JSON.stringify(convertedData), DiagramSchema, MAX_FILE_SIZE);
        
        saveToHistory();
        setNodes(data.nodes || []);
        setEdges(data.edges || []);
        if (data.metadata?.customComponents) setCustomComponents(data.metadata.customComponents);
        if (data.metadata?.findings) setFindings(data.metadata.findings);
        if (data.metadata?.attackPaths) setAttackPaths(data.metadata.attackPaths);
        
        // Show success with helpful info about legacy format
        const wasConverted = rawData.components || rawData.connections;
        const message = wasConverted 
          ? `✓ Converted legacy format: ${data.nodes?.length || 0} components, ${data.edges?.length || 0} connections`
          : `Imported diagram with ${data.nodes?.length || 0} components`;
        
        toast.success(message, { duration: 5000 });
        
        // Show metadata if global risks were imported
        if (data.metadata?.globalRisks) {
          const riskCount = data.metadata.riskCount || data.metadata.globalRisks.length;
          toast.info(`📋 Imported ${riskCount} documented security risks`, { duration: 4000 });
        }
      } catch (error) {
        console.error('Import failed:', error);
        toast.error(sanitizeError(error, 'Import'));
      }
    };
    reader.readAsText(file);
  }, [setNodes, setEdges, setCustomComponents, saveToHistory]);

  // Convert security architecture format to diagram nodes/edges
  const convertSecurityArchitectureToNodes = useCallback((securityData: any) => {
    try {
      const convertedNodes: Node[] = [];
      const convertedEdges: Edge[] = [];
      const convertedFindings: SecurityFinding[] = [];
      
      // Map component types to our diagram types
      const typeMapping: Record<string, string> = {
        'external_network': 'web-browser',
        'firewall': 'firewall',
        'web_server': 'web-server',
        'application_server': 'app-server',
        'database': 'postgresql',
        'active_directory': 'idp',
        'logging': 'monitoring',
        'load_balancer': 'load-balancer',
        'api_gateway': 'api-gateway'
      };
      
      // Convert components to nodes
      if (securityData.components && Array.isArray(securityData.components)) {
        securityData.components.forEach((component: any, index: number) => {
          // Position nodes in a grid (4 columns)
          const col = index % 4;
          const row = Math.floor(index / 4);
          const nodeX = 150 + col * 350;
          const nodeY = 150 + row * 250;
          
          // Map component type
          const mappedType = typeMapping[component.type] || 'app-server';
          
          // Determine environment
          let environment: 'dev' | 'staging' | 'prod' | undefined;
          if (securityData.environment === 'production') environment = 'prod';
          else if (securityData.environment === 'staging') environment = 'staging';
          else if (securityData.environment === 'development') environment = 'dev';
          
          // Determine status based on vulnerabilities
          let statusBadge: { text: string; color: 'green' | 'yellow' | 'red' | 'blue' | 'gray' } | undefined;
          if (component.vulnerabilities && component.vulnerabilities.length > 0) {
            const highSev = component.vulnerabilities.some((v: any) => v.severity === 'high' || v.severity === 'critical');
            const mediumSev = component.vulnerabilities.some((v: any) => v.severity === 'medium');
            
            if (highSev) {
              statusBadge = { text: `${component.vulnerabilities.length} Critical`, color: 'red' };
            } else if (mediumSev) {
              statusBadge = { text: `${component.vulnerabilities.length} Warnings`, color: 'yellow' };
            }
          } else if (component.exposed_to_internet) {
            statusBadge = { text: 'Internet Facing', color: 'blue' };
          }
          
          const node: Node = {
            id: component.id,
            type: 'custom',
            position: { x: nodeX, y: nodeY },
            data: {
              type: mappedType,
              label: component.name,
              zone: component.zone || 'internal',
              environment,
              statusBadge,
              description: component.notes || component.technology || ''
            }
          };
          
          convertedNodes.push(node);
          
          // Convert vulnerabilities to findings
          if (component.vulnerabilities) {
            component.vulnerabilities.forEach((vuln: any) => {
              convertedFindings.push({
                id: vuln.id,
                title: vuln.title,
                severity: vuln.severity.charAt(0).toUpperCase() + vuln.severity.slice(1) as 'Critical' | 'High' | 'Medium' | 'Low',
                description: vuln.description,
                affected: [component.id],
                recommendation: vuln.impact || '',
                standards: []
              });
            });
          }
        });
      }
      
      // Convert connections to edges
      if (securityData.connections && Array.isArray(securityData.connections)) {
        securityData.connections.forEach((connection: any) => {
          // Check if both source and target nodes exist
          const sourceExists = convertedNodes.some(n => n.id === connection.from);
          const targetExists = convertedNodes.some(n => n.id === connection.to);
          
          if (sourceExists && targetExists) {
            const hasIssues = connection.issues && connection.issues.length > 0;
            const hasVulns = connection.vulnerabilities && connection.vulnerabilities.length > 0;
            
            const edge: Edge = {
              id: connection.id,
              source: connection.from,
              target: connection.to,
              label: connection.port !== 'any' ? `${connection.protocol}:${connection.port}` : connection.protocol,
              animated: hasIssues || hasVulns,
              style: {
                stroke: hasVulns ? '#ef4444' : hasIssues ? '#f59e0b' : '#64748b',
                strokeWidth: hasVulns ? 3 : 2
              },
              data: {
                protocol: connection.protocol,
                port: connection.port,
                encryption: connection.issues?.includes('unencrypted_http') ? 'None' : 'TLS',
                sourceLabel: convertedNodes.find(n => n.id === connection.from)?.data.label,
                targetLabel: convertedNodes.find(n => n.id === connection.to)?.data.label
              }
            };
            
            convertedEdges.push(edge);
            
            // Convert connection vulnerabilities to findings
            if (connection.vulnerabilities) {
              connection.vulnerabilities.forEach((vuln: any) => {
                convertedFindings.push({
                  id: vuln.id,
                  title: vuln.title,
                  severity: vuln.severity.charAt(0).toUpperCase() + vuln.severity.slice(1) as 'Critical' | 'High' | 'Medium' | 'Low',
                  description: vuln.description,
                  affected: [connection.from, connection.to],
                  recommendation: vuln.impact || '',
                  standards: []
                });
              });
            }
          }
        });
      }
      
      // Convert global risks to findings
      if (securityData.global_risks && Array.isArray(securityData.global_risks)) {
        securityData.global_risks.forEach((risk: any) => {
          convertedFindings.push({
            id: risk.id,
            title: risk.title,
            severity: risk.severity.charAt(0).toUpperCase() + risk.severity.slice(1) as 'Critical' | 'High' | 'Medium' | 'Low',
            description: risk.description,
            affected: ['architecture'],
            recommendation: risk.impact || '',
            standards: []
          });
        });
      }
      
      return { nodes: convertedNodes, edges: convertedEdges, findings: convertedFindings };
    } catch (error) {
      console.error('Conversion error:', error);
      return null;
    }
  }, []);

  // Handle paste import from JSON text
  const handlePasteImport = useCallback(() => {
    if (!pasteJsonText.trim()) {
      toast.error('Please paste valid JSON');
      return;
    }
    
    try {
      // Parse JSON first (basic validation)
      const rawData = JSON.parse(pasteJsonText);
      
      // Try auto-conversion for legacy formats (components/connections)
      const convertedData = autoConvertImportedJSON(rawData);
      
      if (!convertedData) {
        throw new Error('Unsupported JSON format. Expected either {nodes, edges} or {components, connections}');
      }
      
      // SEC-001: Validate converted data against schema
      const data = safeParseJSON(JSON.stringify(convertedData), DiagramSchema, MAX_FILE_SIZE);
      
      saveToHistory();
      setNodes(data.nodes || []);
      setEdges(data.edges || []);
      if (data.metadata?.customComponents) setCustomComponents(data.metadata.customComponents);
      if (data.metadata?.findings) setFindings(data.metadata.findings);
      if (data.metadata?.attackPaths) setAttackPaths(data.metadata.attackPaths);
      
      // Show success with helpful info about legacy format
      const wasConverted = rawData.components || rawData.connections;
      const message = wasConverted 
        ? `✓ Converted legacy format: ${data.nodes?.length || 0} components, ${data.edges?.length || 0} connections`
        : `Imported ${data.nodes?.length || 0} nodes and ${data.edges?.length || 0} edges`;
      
      toast.success(message, { duration: 5000 });
      
      // Show metadata if global risks were imported
      if (data.metadata?.globalRisks) {
        const riskCount = data.metadata.riskCount || data.metadata.globalRisks.length;
        toast.info(`📋 Imported ${riskCount} documented security risks`, { duration: 4000 });
      }
      
      setShowPasteDialog(false);
      setPasteJsonText('');
    } catch (error) {
      console.error('Import failed:', error);
      toast.error(sanitizeError(error, 'Paste Import'));
    }
  }, [pasteJsonText, setNodes, setEdges, setCustomComponents, setFindings, setAttackPaths, saveToHistory]);

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent actions when typing in input fields
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement || 
          (event.target as HTMLElement)?.contentEditable === 'true') {
        return;
      }

      // Delete key - Remove selected component/connection
      if (event.key === 'Delete') {
        if (selectedNode || selectedEdge) {
          event.preventDefault();
          onDeleteSelected();
        }
      }
      
      // Escape - Clear selection
      if (event.key === 'Escape') {
        setSelectedNode(null);
        setSelectedEdge(null);
        setShowSearch(false);
        clearHighlights();
      }
      
      // Keyboard shortcuts with Ctrl/Cmd
      const modifier = event.ctrlKey || event.metaKey;
      
      if (modifier) {
        // Ctrl+Z - Undo
        if (event.key === 'z' && !event.shiftKey) {
          event.preventDefault();
          undo();
        }
        
        // Ctrl+Y or Ctrl+Shift+Z - Redo
        if (event.key === 'y' || (event.key === 'z' && event.shiftKey)) {
          event.preventDefault();
          redo();
        }
        
        // Ctrl+C - Copy
        if (event.key === 'c') {
          event.preventDefault();
          copySelected();
        }
        
        // Ctrl+V - Paste
        if (event.key === 'v') {
          event.preventDefault();
          pasteSelected();
        }
        
        // Ctrl+D - Duplicate
        if (event.key === 'd') {
          event.preventDefault();
          duplicateSelected();
        }
        
        // Ctrl+A - Select All
        if (event.key === 'a') {
          event.preventDefault();
          selectAll();
        }
        
        // Ctrl+S - Quick Save
        if (event.key === 's') {
          event.preventDefault();
          quickSave();
        }
        
        // Ctrl+F - Search
        if (event.key === 'f') {
          event.preventDefault();
          setShowSearch(!showSearch);
        }
        
        // Ctrl+G - Toggle Grid
        if (event.key === 'g') {
          event.preventDefault();
          setShowGrid(!showGrid);
        }
        
        // Ctrl+Shift+G - Toggle Snap to Grid
        if (event.key === 'G' && event.shiftKey) {
          event.preventDefault();
          toggleSnapToGrid();
        }
        
        // Ctrl+Shift+I - Open paste JSON dialog
        if (event.key === 'I' && event.shiftKey) {
          event.preventDefault();
          setShowPasteDialog(true);
        }
      }
      
      // Arrow keys - Move selected nodes
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        const selectedNodes = nodes.filter(n => n.selected);
        if (selectedNodes.length > 0) {
          event.preventDefault();
          const step = event.shiftKey ? 10 : 1;
          const delta = {
            ArrowUp: { x: 0, y: -step },
            ArrowDown: { x: 0, y: step },
            ArrowLeft: { x: -step, y: 0 },
            ArrowRight: { x: step, y: 0 },
          }[event.key]!;
          
          setNodes(nds => nds.map(n => 
            n.selected 
              ? { ...n, position: { x: n.position.x + delta.x, y: n.position.y + delta.y } }
              : n
          ));
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode, selectedEdge, onDeleteSelected, undo, redo, copySelected, pasteSelected, 
      duplicateSelected, selectAll, quickSave, showSearch, showGrid, toggleSnapToGrid, nodes, setNodes, clearHighlights]);

  // Flow visualization function with detailed logging
  const visualizeFlow = useCallback((startNodeId: string, direction: 'forward' | 'backward' | 'both' = 'both') => {
    console.log('🚀 visualizeFlow called with:', { startNodeId, direction, isFlowAnimating });
    
    if (isFlowAnimating) {
      toast.info('Flow animation already in progress');
      return;
    }

    // Open flow panel and clear previous logs
    setShowFlowPanel(true);
    setFlowLogs([]);
    setIsFlowAnimating(true);
    
    console.log('✅ Flow panel opened, animation started');
    
    const visited = new Set<string>();
    const edgesToAnimate = new Set<string>();
    const nodesToHighlight = new Set<string>();
    const logs: typeof flowLogs = [];

    let maxDelay = 0;
    const ANIMATION_STEP_DELAY = flowSpeed; // Use configurable flow speed

    const getNodeLabel = (nodeId: string) => {
      const node = nodes.find(n => n.id === nodeId);
      return node?.data?.label || nodeId;
    };
    
    const addLog = (type: 'start' | 'node' | 'connection' | 'complete', message: string, details?: any) => {
      const log = {
        timestamp: new Date().toLocaleTimeString(),
        type,
        message,
        details
      };
      logs.push(log);
      setFlowLogs(prev => [...prev, log]);
    };

    const traverse = (nodeId: string, isForward: boolean, depth: number = 0, fromNodeId?: string) => {
      if (visited.has(`${nodeId}-${isForward}`)) return;
      visited.add(`${nodeId}-${isForward}`);
      
      const delay = depth * ANIMATION_STEP_DELAY;
      maxDelay = Math.max(maxDelay, delay);
      
      setTimeout(() => {
        nodesToHighlight.add(nodeId);
        setFlowingNodes(new Set(nodesToHighlight));
        
        const nodeLabel = getNodeLabel(nodeId);
        // Log node activation
        if (depth === 0) {
          console.log(`🎯 Flow Start: ${nodeLabel} (depth: ${depth})`);
          addLog('start', `Starting from: ${nodeLabel}`, { nodeId, depth });
        } else {
          console.log(`✓ Reached: ${nodeLabel} (depth: ${depth})`);
          addLog('node', `Reached: ${nodeLabel}`, { nodeId, depth });
        }
      }, delay);

      edges.forEach(edge => {
        if (isForward && edge.source === nodeId) {
          const edgeData = edge.data as ConnectionData;
          const protocol = edgeData?.protocol || 'Unknown';
          const port = edgeData?.port || 'N/A';
          
          setTimeout(() => {
            edgesToAnimate.add(edge.id);
            setFlowingEdges(new Set(edgesToAnimate));
            
            // Detailed connection log
            const fromLabel = getNodeLabel(edge.source);
            const toLabel = getNodeLabel(edge.target);
            console.log(`  → Connection: ${fromLabel} → ${toLabel}`);
            console.log(`    Protocol: ${protocol}, Port: ${port}, Encryption: ${edgeData?.encryption || 'N/A'}`);
            
            toast.info(`→ ${fromLabel} → ${toLabel} (${protocol}:${port})`, {
              duration: 2000,
            });
            
            addLog('connection', `${fromLabel} → ${toLabel}`, {
              protocol,
              port,
              encryption: edgeData?.encryption,
              direction: 'forward',
              depth
            });
          }, delay + 200); // Slight delay after node highlight
          
          traverse(edge.target, isForward, depth + 1, nodeId);
        } else if (!isForward && edge.target === nodeId) {
          const edgeData = edge.data as ConnectionData;
          const protocol = edgeData?.protocol || 'Unknown';
          const port = edgeData?.port || 'N/A';
          
          setTimeout(() => {
            edgesToAnimate.add(edge.id);
            setFlowingEdges(new Set(edgesToAnimate));
            
            // Detailed connection log
            const fromLabel = getNodeLabel(edge.source);
            const toLabel = getNodeLabel(edge.target);
            console.log(`  ← Connection: ${toLabel} ← ${fromLabel}`);
            console.log(`    Protocol: ${protocol}, Port: ${port}, Encryption: ${edgeData?.encryption || 'N/A'}`);
            
            toast.info(`← ${toLabel} ← ${fromLabel} (${protocol}:${port})`, {
              duration: 2000,
            });
            
            addLog('connection', `${toLabel} ← ${fromLabel}`, {
              protocol,
              port,
              encryption: edgeData?.encryption,
              direction: 'backward',
              depth
            });
          }, delay + 200);
          
          traverse(edge.source, isForward, depth + 1, nodeId);
        }
      });
    };

    // Start traversal
    const startNode = nodes.find(n => n.id === startNodeId);
    const startLabel = startNode?.data?.label || 'component';
    
    console.log('═══════════════════════════════════════');
    console.log(`🚀 Flow Visualization Started`);
    console.log(`   Start Node: ${startLabel}`);
    console.log(`   Direction: ${direction}`);
    console.log(`   Animation Speed: ${ANIMATION_STEP_DELAY}ms per level`);
    console.log(`   Total Nodes: ${nodes.length}`);
    console.log(`   Total Edges: ${edges.length}`);
    console.log('═══════════════════════════════════════');
    
    if (edges.length === 0) {
      toast.info('No connections found. Add connections between components first.');
    }
    
    addLog('start', '🚀 Flow Visualization Started', {
      startNode: startLabel,
      direction,
      animationSpeed: ANIMATION_STEP_DELAY
    });
    
    nodesToHighlight.add(startNodeId);
    setFlowingNodes(new Set([startNodeId]));

    if (direction === 'forward' || direction === 'both') {
      traverse(startNodeId, true, 0);
    }
    if (direction === 'backward' || direction === 'both') {
      traverse(startNodeId, false, 0);
    }

    // Clear animation after completion and show summary
    setTimeout(() => {
      setFlowingEdges(new Set());
      setFlowingNodes(new Set());
      setIsFlowAnimating(false);
      
      const totalConnections = logs.filter(l => l.type === 'connection').length;
      
      console.log('═══════════════════════════════════════');
      console.log(`✅ Flow Visualization Completed`);
      console.log(`   Total Connections Traced: ${totalConnections}`);
      console.log(`   Total Nodes Visited: ${nodesToHighlight.size}`);
      console.log(`   Max Depth: ${Math.floor(maxDelay / ANIMATION_STEP_DELAY)}`);
      console.log('═══════════════════════════════════════');
      
      addLog('complete', '✅ Flow Visualization Completed', {
        totalConnections,
        totalNodes: nodesToHighlight.size,
        maxDepth: Math.floor(maxDelay / ANIMATION_STEP_DELAY)
      });
      
      toast.success(`Flow completed: ${nodesToHighlight.size} nodes, ${totalConnections} connections`, {
        duration: 4000,
      });
    }, maxDelay + 4000);

    toast.success(`Visualizing flow from: ${startLabel}`);
  }, [edges, nodes, isFlowAnimating]);

  // AI Analysis
  const runAIAnalysis = useCallback(async () => {
    console.log('🔵 runAIAnalysis called!');
    console.log('🔵 Nodes count:', nodes.length);
    console.log('🔵 Edges count:', edges.length);
    
    if (nodes.length === 0) {
      toast.error('No components to analyze');
      return;
    }

    setIsAIAnalyzing(true);
    setShowAIPanel(true);
    console.log('🔵 State updated: isAIAnalyzing=true, showAIPanel=true');

    try {
      console.log('🔵 Calling getAIRecommendations...');
      const result = await getAIRecommendations(nodes, edges);
      console.log('🔵 getAIRecommendations returned:', result);
      setAiAnalysisResult(result);
      
      if (result.cacheHit) {
        toast.success('Analysis retrieved from cache (instant, $0.00)', {
          duration: 3000,
        });
      } else {
        toast.success(`AI analysis complete! Cost: $${result.tokenUsage?.cost.toFixed(4) || '0.00'}`, {
          duration: 5000,
        });
      }
    } catch (error: any) {
      console.error('AI analysis failed:', error);
      toast.error(error.message || 'Failed to get AI recommendations');
      setShowAIPanel(false);
    } finally {
      setIsAIAnalyzing(false);
    }
  }, [nodes, edges]);

  // Security analysis
  const runSecurityAnalysis = async () => {
    // Clear any existing highlights first
    clearHighlights();
    
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
    const hasDAM = nodes.some((n: Node) => n.data.type === 'dam');
    const hasEdgeDNS = nodes.some((n: Node) => n.data.type === 'edge-dns');
    const hasEdgeCDN = nodes.some((n: Node) => n.data.type === 'edge-cdn');
    const hasBastionHost = nodes.some((n: Node) => n.data.type === 'bastion-host');
    const hasSDWAN = nodes.some((n: Node) => n.data.type === 'sd-wan');
    
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

    if (!hasDAM && nodes.some((n: Node) => n.data.type === 'database')) {
      newFindings.push({
        id: 'missing-dam',
        title: 'Missing Database Activity Monitoring',
        severity: 'Medium',
        description: 'Databases without activity monitoring and threat detection',
        affected: nodes.filter((n: Node) => n.data.type === 'database').map((n: Node) => n.id),
        recommendation: 'Deploy DAM to monitor database access and detect anomalies',
        standards: ['NIST 800-53 AU-2', 'PCI DSS 10.2']
      });
    }

    if (!hasEdgeDNS && nodes.some((n: Node) => ['web-server', 'api-gateway'].includes((n.data as any).type))) {
      newFindings.push({
        id: 'missing-edge-dns',
        title: 'Missing Edge DNS Protection',
        severity: 'Low',
        description: 'No DNS security and performance optimization at edge',
        affected: ['architecture'],
        recommendation: 'Deploy Edge DNS for DDoS protection and DNS filtering',
        standards: ['NIST 800-53 SC-20', 'CIS Controls 9']
      });
    }

    if (!hasEdgeCDN && nodes.some((n: Node) => ['web-server', 'web-browser'].includes((n.data as any).type))) {
      newFindings.push({
        id: 'missing-edge-cdn',
        title: 'Missing Edge CDN Protection',
        severity: 'Low',
        description: 'No content delivery network for performance and DDoS protection',
        affected: nodes.filter((n: Node) => n.data.type === 'web-server').map((n: Node) => n.id),
        recommendation: 'Deploy Edge CDN for content caching and DDoS mitigation',
        standards: ['NIST 800-53 SC-5', 'OWASP Top 10']
      });
    }

    // Check for missing Bastion Host for secure remote access
    if (!hasBastionHost && nodes.some((n: Node) => ['database', 'app-server'].includes((n.data as any).type))) {
      newFindings.push({
        id: 'missing-bastion-host',
        title: 'Missing Bastion Host for Secure Access',
        severity: 'Medium',
        description: 'No bastion host detected for secure remote access to internal resources',
        affected: nodes.filter((n: Node) => ['database', 'app-server'].includes((n.data as any).type)).map((n: Node) => n.id),
        recommendation: 'Deploy bastion host for secure, audited administrative access',
        standards: ['NIST 800-53 AC-3', 'CIS Controls 4', 'NIST 800-53 AU-2']
      });
    }

    // Check for missing SD-WAN for network optimization and security
    if (!hasSDWAN && nodes.some((n: Node) => ['vpc-vnet', 'subnet'].includes((n.data as any).type))) {
      newFindings.push({
        id: 'missing-sd-wan',
        title: 'Missing SD-WAN for Network Security',
        severity: 'Low',
        description: 'No software-defined WAN for network optimization and security policies',
        affected: nodes.filter((n: Node) => ['vpc-vnet', 'subnet'].includes((n.data as any).type)).map((n: Node) => n.id),
        recommendation: 'Consider SD-WAN for enhanced network security, traffic optimization, and centralized policy management',
        standards: ['NIST 800-53 SC-7', 'CIS Controls 12']
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
        mitigations: ['Implement HTTPS', 'Add WAF', 'Database access controls', 'Network segmentation', 'Deploy DAM for database monitoring', 'Add Edge DNS for DNS protection', 'Use Edge CDN for DDoS mitigation', 'Deploy Bastion Host for secure access', 'Implement SD-WAN for network security']
      });
    }

    // Run AI analysis to enhance findings with intelligent recommendations
    if (nodes.length > 0) {
      setIsAIAnalyzing(true);
      getAIRecommendations(nodes, edges)
        .then(result => {
          setAiAnalysisResult(result);
          
          // Convert AI security recommendations to SecurityFinding format and merge
          const aiSecurityFindings: SecurityFinding[] = result.recommendations
            .filter(rec => rec.category === 'security')
            .map(rec => {
              // Map affected components from AI recommendation to actual node IDs
              let affectedIds: string[] = [];
              
              if (rec.affectedComponents && rec.affectedComponents.length > 0) {
                // For each affected component ID or type from AI
                rec.affectedComponents.forEach(componentRef => {
                  // Check if it's an exact node ID match
                  const exactMatch = nodes.find(n => n.id === componentRef);
                  if (exactMatch) {
                    affectedIds.push(componentRef);
                  } else {
                    // Otherwise, treat it as a component type and find all matching nodes
                    const typeMatches = nodes.filter(n => 
                      n.data?.type === componentRef || 
                      n.data?.type?.includes(componentRef) ||
                      n.data?.label?.toLowerCase().includes(componentRef.toLowerCase())
                    );
                    affectedIds.push(...typeMatches.map(n => n.id));
                  }
                });
              }
              
              // If no specific components identified, use 'architecture' as fallback
              if (affectedIds.length === 0) {
                affectedIds = ['architecture'];
              }
              
              return {
                id: `ai-${rec.id}`,
                title: rec.title,
                severity: rec.severity === 'critical' ? 'High' : rec.severity === 'high' ? 'High' : 'Medium',
                description: rec.description,
                affected: affectedIds,
                recommendation: rec.solution,
                standards: ['AI-Powered Analysis', 'AWS Well-Architected Framework']
              };
            });
          
          // Merge rule-based and AI findings
          const mergedFindings = [...newFindings, ...aiSecurityFindings];
          setFindings(mergedFindings);
          
          if (result.cacheHit) {
            toast.success(`Found ${mergedFindings.length} issues (${aiSecurityFindings.length} from AI analysis, cached, $0.00)`);
          } else {
            toast.success(`Found ${mergedFindings.length} issues (${aiSecurityFindings.length} from AI analysis, cost: $${result.tokenUsage?.cost.toFixed(4) || '0.00'})`);
          }
        })
        .catch(error => {
          console.error('AI analysis failed:', error);
          // Fall back to rule-based findings only
          setFindings(newFindings);
          if (newFindings.length === 0) {
            toast.success('No security issues found!');
          } else {
            toast.warning(`Found ${newFindings.length} security issues`);
          }
        })
        .finally(() => {
          setIsAIAnalyzing(false);
        });
    } else {
      setFindings(newFindings);
      if (newFindings.length === 0) {
        toast.success('No security issues found!');
      } else {
        toast.warning(`Found ${newFindings.length} security issues`);
      }
    }
    
    setAttackPaths(newAttackPaths);
  };

  // Architectural validation
  const runArchitecturalValidation = () => {
    if (nodes.length === 0) {
      toast.error('Add components to validate architecture');
      return;
    }

    const result = validateArchitecture(nodes, edges);
    setValidationResult(result);
    setShowValidation(true);

    // Run AI analysis for architecture-specific insights
    setIsAIAnalyzing(true);
    setShowAIPanel(true);
    getAIRecommendations(nodes, edges)
      .then(aiResult => {
        setAiAnalysisResult(aiResult);
        if (aiResult.cacheHit) {
          if (result.valid) {
            toast.success(`Architecture valid! Score: ${result.score}/100. Insights from cache (instant, $0.00)`);
          } else {
            toast.warning(`Found ${result.summary.errors} errors, ${result.summary.warnings} warnings. Insights from cache`);
          }
        } else {
          if (result.valid) {
            toast.success(`Architecture valid! Score: ${result.score}/100. Analysis cost: $${aiResult.tokenUsage?.cost.toFixed(4) || '0.00'}`);
          } else {
            toast.warning(`Found ${result.summary.errors} errors, ${result.summary.warnings} warnings. Analysis cost: $${aiResult.tokenUsage?.cost.toFixed(4) || '0.00'}`);
          }
        }
      })
      .catch(error => {
        console.error('AI analysis failed:', error);
        if (result.valid) {
          toast.success(`Architecture valid! Score: ${result.score}/100`);
        } else {
          toast.warning(`Found ${result.summary.errors} errors, ${result.summary.warnings} warnings`);
        }
      })
      .finally(() => {
        setIsAIAnalyzing(false);
      });
  };

  // Node selection handler
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    event.stopPropagation();
    setSelectedNode(node);
    setSelectedEdge(null);
  }, []);

  // Edge selection handler
  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.stopPropagation();
    setSelectedEdge(edge);
    setSelectedNode(null);
  }, []);

  // Wrapped nodes change handler with snap-to-grid support
  const handleNodesChange = useCallback((changes: any[]) => {
    if (snapToGrid) {
      const snappedChanges = changes.map((change) => {
        if (change.type === 'position' && change.position) {
          return {
            ...change,
            position: {
              x: Math.round(change.position.x / gridSize) * gridSize,
              y: Math.round(change.position.y / gridSize) * gridSize,
            },
          };
        }
        return change;
      });
      onNodesChange(snappedChanges);
    } else {
      onNodesChange(changes);
    }
  }, [snapToGrid, gridSize, onNodesChange]);

  // Selection change handler (for deselection when clicking on canvas)
  const onSelectionChange = useCallback(({ nodes, edges }: { nodes: Node[], edges: Edge[] }) => {
    if (nodes.length === 0 && edges.length === 0) {
      setSelectedNode(null);
      setSelectedEdge(null);
      setSelectedMultipleNodes([]);
      setShowAnalyzeButton(false);
    } else if (nodes.length > 1) {
      // Multiple nodes selected
      setSelectedMultipleNodes(nodes);
      setSelectedNode(null);
      setSelectedEdge(null);
      
      // Calculate center position for the analyze button
      const avgX = nodes.reduce((sum, n) => sum + (n.position.x + ((n.measured?.width || n.style?.width || 180) / 2)), 0) / nodes.length;
      const avgY = nodes.reduce((sum, n) => sum + (n.position.y + ((n.measured?.height || n.style?.height || 80) / 2)), 0) / nodes.length;
      
      setAnalyzeButtonPosition({ x: avgX, y: avgY });
      setShowAnalyzeButton(true);
    } else if (nodes.length === 1) {
      setSelectedNode(nodes[0]);
      setSelectedEdge(null);
      setSelectedMultipleNodes([]);
      setShowAnalyzeButton(false);
    } else if (edges.length > 0) {
      setSelectedEdge(edges[0]);
      setSelectedNode(null);
      setSelectedMultipleNodes([]);
      setShowAnalyzeButton(false);
    }
  }, []);

  // Canvas click handler (deselect when clicking on empty canvas)
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
  }, []);

  // Analyze connection between multiple selected nodes
  const analyzeConnection = useCallback(async () => {
    console.log('🔍 Starting connection analysis...');
    
    if (selectedMultipleNodes.length < 2) {
      toast.error('Select at least 2 nodes to analyze their connection');
      return;
    }

    setIsAnalyzingConnection(true);
    setShowAnalyzeButton(false);
    
    try {
      console.log('📊 Selected nodes:', selectedMultipleNodes.length);
      // Find edges between the selected nodes
      const selectedNodeIds = new Set(selectedMultipleNodes.map(n => n.id));
      const connectionEdges = edges.filter(e => 
        selectedNodeIds.has(e.source) && selectedNodeIds.has(e.target)
      );

      // Prepare node details for AI analysis
      const nodeDetails = selectedMultipleNodes.map(node => ({
        id: node.id,
        label: node.data?.label || 'Unnamed',
        type: node.data?.type || 'unknown',
        zone: node.data?.zone || 'Unspecified',
        description: node.data?.description || ''
      }));

      const connectionDetails = connectionEdges.map(edge => ({
        from: nodes.find(n => n.id === edge.source)?.data?.label || edge.source,
        to: nodes.find(n => n.id === edge.target)?.data?.label || edge.target,
        protocol: edge.data?.protocol || 'Unspecified',
        ports: edge.data?.ports || 'Any',
        encryption: edge.data?.encrypted ? 'Yes' : 'No'
      }));

      // Try to call AI API via proxy server, fall back to mock if unavailable
      const proxyUrl = 'https://koh-atlas-secure-arc.onrender.com/api/anthropic';
      let analysisText = '';
      
      try {
        const response = await fetch(proxyUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-5-20250929',
            max_tokens: 2048,
            messages: [{
              role: 'user',
              content: `Analyze the security implications of these connected components in an architecture diagram:

Selected Components:
${JSON.stringify(nodeDetails, null, 2)}

Connections Between Them:
${JSON.stringify(connectionDetails, null, 2)}

Please provide a comprehensive analysis covering:
1. **Purpose**: What is the intended purpose of these connections?
2. **Security Issues**: What are the potential security vulnerabilities and risks?
3. **Best Practices**: What are the industry best practices for these types of connections?
4. **How to Secure**: Specific recommendations to improve security

Format your response in a clear, structured way with markdown headers.`
            }]
          })
        });

        if (response.ok) {
          const result = await response.json();
          analysisText = result.content[0].text;
          toast.success('AI analysis complete!');
        } else {
          throw new Error('Proxy not available');
        }
      } catch (proxyError) {
        // Fallback to mock analysis if proxy server is not running
        console.log('Proxy server not available, using mock analysis');
        analysisText = `## Purpose
The connection between ${nodeDetails[0]?.label || 'Component 1'} and ${nodeDetails[1]?.label || 'Component 2'} serves to enable communication and data flow in the architecture.

## Security Issues
⚠️ **Potential Vulnerabilities:**
- Unencrypted traffic may expose sensitive data
- Missing authentication between components
- Lack of network segmentation
- No rate limiting or DDoS protection

## Best Practices
✅ **Recommended Practices:**
- Implement TLS 1.3 for all communications
- Use mutual TLS (mTLS) for service-to-service authentication
- Apply principle of least privilege
- Implement proper logging and monitoring
- Use network policies to restrict traffic

## How to Secure
🔒 **Security Recommendations:**
1. Enable encryption (TLS 1.3 minimum)
2. Implement authentication (API keys, OAuth, mTLS)
3. Add Web Application Firewall (WAF)
4. Enable comprehensive logging
5. Regular security audits and updates
6. Implement rate limiting
7. Use network segmentation

*Note: Running in demo mode. Start the proxy server for real AI analysis.*`;
        toast.success('Analysis complete! (Demo mode)');
      }

      console.log('✅ Setting analysis result...');
      setAnalysisResult({
        nodes: nodeDetails,
        connections: connectionDetails,
        analysis: analysisText
      });
      
      console.log('📖 Showing analysis dialog...');
      setShowAnalysisResult(true);
      console.log('🎉 Analysis complete!');
    } catch (error) {
      console.error('❌ Analysis error:', error);
      toast.error(`Failed to analyze connection: ${error.message || 'Unknown error'}`);
      
      // Reset states on error
      setIsAnalyzingConnection(false);
      setShowAnalyzeButton(true);
    } finally {
      console.log('🏁 Finalizing analysis...');
      setIsAnalyzingConnection(false);
    }
  }, [selectedMultipleNodes, nodes, edges]);

  // Generic AI analysis helper function
  const callAI = async (prompt: string): Promise<string> => {
    const proxyUrl = 'https://koh-atlas-secure-arc.onrender.com/api/anthropic';
    
    try {
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5-20250929',
          max_tokens: 2048,
          messages: [{
            role: 'user',
            content: prompt
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`AI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.content[0].text;
    } catch (error) {
      console.error('AI API error:', error);
      throw error;
    }
  };

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
        ? { 
            ...edge, 
            data: { ...edge.data, ...newData }, 
            label: `${newData.protocol}:${newData.port}`,
            style: {
              ...edge.style,
              stroke: newData.encryption === 'None' ? '#ef4444' : '#10b981',
            }
          }
        : edge
    ));
  };

  // Highlight findings on canvas
  const highlightFinding = (finding: SecurityFinding) => {
    // Clear previous highlights
    setHighlightedElements([]);
    
    // Check if this is an AI finding (affects entire architecture)
    const isAIFinding = finding.affected.includes('architecture');
    
    // Update nodes with highlight status
    setNodes((nds: Node[]) => nds.map((node: Node) => ({
      ...node,
      data: {
        ...node.data,
        // If AI finding, highlight all nodes; otherwise highlight specific affected nodes
        isHighlighted: isAIFinding || finding.affected.includes(node.id)
      }
    })));

    // Update edges with highlight status
    setEdges((eds: Edge[]) => eds.map((edge: Edge) => ({
      ...edge,
      style: {
        ...edge.style,
        // If AI finding, highlight all edges; otherwise highlight specific affected edges
        stroke: (isAIFinding || finding.affected.includes(edge.id!)) ? '#a855f7' : (
          (edge.data as any)?.encryption === 'None' ? '#ef4444' : '#10b981'
        ),
        strokeWidth: (isAIFinding || finding.affected.includes(edge.id!)) ? 3 : 2,
        filter: (isAIFinding || finding.affected.includes(edge.id!)) ? 'drop-shadow(0 0 8px #a855f7)' : undefined
      }
    })));

    toast.success(`Highlighted components for: ${finding.title}`);
  };

  // Reorganize components using intelligent layout
  const reorganizeComponents = () => {
    if (nodes.length === 0) {
      toast.info('No components to reorganize');
      return;
    }

    // Separate container and regular components
    const containers = nodes.filter((n: Node) => {
      const config = componentTypes.find(c => c.type === (n.data as any)?.type);
      return config?.isContainer;
    });
    
    const regularComponents = nodes.filter((n: Node) => {
      const config = componentTypes.find(c => c.type === (n.data as any)?.type);
      return !config?.isContainer;
    });

    // Group components by category/type for intelligent placement
    const componentsByCategory = regularComponents.reduce((acc: any, node: Node) => {
      const config = componentTypes.find(c => c.type === (node.data as any)?.type);
      const category = config?.category || 'other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(node);
      return acc;
    }, {});

    const updatedNodes: Node[] = [];
    
    // Layout configuration
    const layoutConfig = {
      containerWidth: 350,
      containerHeight: 250,
      containerSpacing: 100,
      componentSpacing: 20,
      margin: 80,
      tiersY: {
        'security': 50,
        'network': 200,
        'application': 350,
        'data': 500,
        'other': 650
      }
    };

    // Position containers in a grid
    containers.forEach((container: Node, index: number) => {
      const cols = Math.ceil(Math.sqrt(containers.length));
      const col = index % cols;
      const row = Math.floor(index / cols);
      
      const x = layoutConfig.margin + col * (layoutConfig.containerWidth + layoutConfig.containerSpacing);
      const y = layoutConfig.margin + row * (layoutConfig.containerHeight + layoutConfig.containerSpacing);
      
      updatedNodes.push({
        ...container,
        position: { x, y },
        style: {
          width: layoutConfig.containerWidth,
          height: layoutConfig.containerHeight,
        },
      });
    });

    // Position regular components in tiers based on category
    Object.entries(componentsByCategory).forEach(([category, components]: [string, any[]]) => {
      const tierY = layoutConfig.tiersY[category as keyof typeof layoutConfig.tiersY] || layoutConfig.tiersY.other;
      
      // Calculate optimal positioning within tier
      const componentsPerRow = Math.ceil(Math.sqrt(components.length));
      const tierWidth = Math.max(1200, componentsPerRow * 200);
      const startX = Math.max(layoutConfig.margin, (1400 - tierWidth) / 2);
      
      components.forEach((component: Node, index: number) => {
        const col = index % componentsPerRow;
        const row = Math.floor(index / componentsPerRow);
        
        const x = startX + col * (180 + layoutConfig.componentSpacing);
        const y = tierY + row * (80 + layoutConfig.componentSpacing);
        
        // Add some intelligent offset based on component type
        let offsetX = 0;
        let offsetY = 0;
        
        switch ((component.data as any)?.type) {
          case 'web-browser':
            offsetX = -50; // Move browsers to the left
            break;
          case 'database':
            offsetX = 100; // Move databases to the right
            break;
          case 'api-gateway':
            offsetY = -20; // Move gateways slightly up
            break;
          case 'load-balancer-global':
          case 'load-balancer-internal':
            offsetY = -40; // Move load balancers up
            break;
        }
        
        updatedNodes.push({
          ...component,
          position: { 
            x: x + offsetX, 
            y: y + offsetY 
          },
        });
      });
    });

    // Update node positions with smooth animation-like effect
    setNodes(updatedNodes);
    
    // Optional: Reorganize connections to be cleaner (straighten curves)
    setTimeout(() => {
      setEdges((eds: Edge[]) => eds.map((edge: Edge) => ({
        ...edge,
        type: 'smoothstep', // Ensure consistent edge type
        style: {
          ...edge.style,
          // Optionally adjust stroke width based on importance
          strokeWidth: (edge.data as any)?.encryption === 'None' ? 3 : 2,
        }
      })));
    }, 100);
    
    toast.success(`Reorganized ${nodes.length} components into logical tiers and zones`);
  };

  // Auto-fix vulnerabilities
  const autoFixVulnerabilities = () => {
    let fixesApplied = 0;
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    
    // Fix unencrypted connections
    setEdges((eds: Edge[]) => eds.map((edge: Edge) => {
      const edgeData = edge.data || {};
      
      if (edgeData.protocol === 'HTTP' || edgeData.encryption === 'None') {
        fixesApplied++;
        
        // Smart protocol upgrade based on target
        const targetNode = nodes.find(n => n.id === edge.target);
        let newProtocol = 'HTTPS';
        let newPort = 443;
        let newEncryption = 'TLS 1.3';
        
        if (targetNode?.data?.type === 'database') {
          newProtocol = 'PostgreSQL';
          newPort = 5432;
          newEncryption = 'TLS';
        } else if (targetNode?.data?.type === 'cache') {
          newProtocol = 'Redis';
          newPort = 6379;
          newEncryption = 'TLS';
        } else if (targetNode?.data?.type === 'message-queue') {
          newProtocol = 'KAFKA';
          newPort = 9092;
          newEncryption = 'SASL_SSL';
        }
        
        return {
          ...edge,
          label: `${newProtocol}:${newPort}`,
          data: {
            ...edgeData,
            protocol: newProtocol,
            port: newPort,
            encryption: newEncryption
          },
          style: {
            ...edge.style,
            stroke: '#10b981',
            strokeWidth: 2
          }
        };
      }
      
      return edge;
    }));

    // Add missing security controls with proper connections
    const existingNodeTypes = nodes.map(n => (n.data as any)?.type);
    const existingNodes = [...nodes];
    
    // Add DAM if databases exist but no DAM
    if (existingNodes.some(n => (n.data as any)?.type === 'database') && !existingNodeTypes.includes('dam')) {
      const databases = existingNodes.filter(n => (n.data as any)?.type === 'database');
      
      if (databases.length > 0) {
        const avgX = databases.reduce((sum, n) => sum + n.position.x, 0) / databases.length;
        const avgY = databases.reduce((sum, n) => sum + n.position.y, 0) / databases.length;
        
        const damId = `dam-autofix-${Date.now()}`;
        const damNode = {
          id: damId,
          type: 'custom',
          position: { x: avgX + 150, y: avgY + 50 },
          data: { type: 'dam', label: 'DAM (Auto-added)', zone: 'Security' }
        };
        
        newNodes.push(damNode);
        
        // Connect DAM to databases for monitoring
        databases.forEach(database => {
          newEdges.push({
            id: `${damId}-monitor-${database.id}`,
            source: damId,
            target: database.id,
            label: 'Monitor',
            type: 'smoothstep',
            markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
            style: { stroke: '#7c2d12', strokeWidth: 1, strokeDasharray: '5,5' },
            data: { 
              protocol: 'DB Monitoring', 
              port: 443, 
              encryption: 'TLS 1.3',
              sourceLabel: 'DAM (Auto-added)',
              targetLabel: (database.data as any)?.label,
              description: 'Database activity monitoring and threat detection'
            }
          });
        });
        
        fixesApplied++;
      }
    }
    
    // Add Edge DNS if web servers exist but no Edge DNS
    if (existingNodes.some(n => ['web-server', 'api-gateway'].includes((n.data as any)?.type)) && !existingNodeTypes.includes('edge-dns')) {
      const webComponents = existingNodes.filter(n => ['web-server', 'api-gateway'].includes((n.data as any)?.type));
      
      if (webComponents.length > 0) {
        const avgX = webComponents.reduce((sum, n) => sum + n.position.x, 0) / webComponents.length;
        const avgY = webComponents.reduce((sum, n) => sum + n.position.y, 0) / webComponents.length;
        
        const edgeDnsId = `edge-dns-autofix-${Date.now()}`;
        const edgeDnsNode = {
          id: edgeDnsId,
          type: 'custom',
          position: { x: avgX - 200, y: avgY - 100 },
          data: { type: 'edge-dns', label: 'Edge DNS (Auto-added)', zone: 'Edge' }
        };
        
        newNodes.push(edgeDnsNode);
        
        // Connect Edge DNS to protect web components
        webComponents.slice(0, 2).forEach(component => {
          newEdges.push({
            id: `${edgeDnsId}-protect-${component.id}`,
            source: edgeDnsId,
            target: component.id,
            label: 'DNS:53',
            type: 'smoothstep',
            markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
            style: { stroke: '#166534', strokeWidth: 2 },
            data: { 
              protocol: 'DNS', 
              port: 53, 
              encryption: 'DNSSEC',
              sourceLabel: 'Edge DNS (Auto-added)',
              targetLabel: (component.data as any)?.label,
              description: 'DNS filtering and DDoS protection'
            }
          });
        });
        
        fixesApplied++;
      }
    }
    
    // Add Edge CDN if web servers exist but no Edge CDN
    if (existingNodes.some(n => (n.data as any)?.type === 'web-server') && !existingNodeTypes.includes('edge-cdn')) {
      const webServers = existingNodes.filter(n => (n.data as any)?.type === 'web-server');
      const browsers = existingNodes.filter(n => (n.data as any)?.type === 'web-browser');
      
      if (webServers.length > 0) {
        const avgX = webServers.reduce((sum, n) => sum + n.position.x, 0) / webServers.length;
        const avgY = webServers.reduce((sum, n) => sum + n.position.y, 0) / webServers.length;
        
        const edgeCdnId = `edge-cdn-autofix-${Date.now()}`;
        const edgeCdnNode = {
          id: edgeCdnId,
          type: 'custom',
          position: { x: avgX - 250, y: avgY - 150 },
          data: { type: 'edge-cdn', label: 'Edge CDN (Auto-added)', zone: 'Edge' }
        };
        
        newNodes.push(edgeCdnNode);
        
        // Connect browsers to Edge CDN and Edge CDN to web servers
        browsers.forEach(browser => {
          newEdges.push({
            id: `${browser.id}-${edgeCdnId}-autofix`,
            source: browser.id,
            target: edgeCdnId,
            label: 'HTTPS:443',
            type: 'smoothstep',
            markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
            style: { stroke: '#10b981', strokeWidth: 2 },
            data: { 
              protocol: 'HTTPS', 
              port: 443, 
              encryption: 'TLS 1.3',
              sourceLabel: (browser.data as any)?.label,
              targetLabel: 'Edge CDN (Auto-added)',
              description: 'Content delivery with DDoS protection'
            }
          });
        });
        
        // Connect Edge CDN to web servers
        webServers.forEach(server => {
          newEdges.push({
            id: `${edgeCdnId}-${server.id}-autofix`,
            source: edgeCdnId,
            target: server.id,
            label: 'HTTPS:443',
            type: 'smoothstep',
            markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
            style: { stroke: '#10b981', strokeWidth: 2 },
            data: { 
              protocol: 'HTTPS', 
              port: 443, 
              encryption: 'TLS 1.3',
              sourceLabel: 'Edge CDN (Auto-added)',
              targetLabel: (server.data as any)?.label,
              description: 'Origin server connection'
            }
          });
        });
        
        fixesApplied++;
      }
    }
    
    // Add WAF if web servers exist but no WAF
    if (existingNodes.some(n => (n.data as any)?.type === 'web-server') && !existingNodeTypes.includes('waf')) {
      const webServers = existingNodes.filter(n => (n.data as any)?.type === 'web-server');
      const browsers = existingNodes.filter(n => (n.data as any)?.type === 'web-browser');
      
      if (webServers.length > 0) {
        const avgX = webServers.reduce((sum, n) => sum + n.position.x, 0) / webServers.length;
        const avgY = webServers.reduce((sum, n) => sum + n.position.y, 0) / webServers.length;
        
        const wafId = `waf-autofix-${Date.now()}`;
        const wafNode = {
          id: wafId,
          type: 'custom',
          position: { x: avgX - 150, y: avgY - 50 },
          data: { type: 'waf', label: 'WAF (Auto-added)', zone: 'DMZ' }
        };
        
        newNodes.push(wafNode);
        
        // Connect browsers to WAF and WAF to web servers
        browsers.forEach(browser => {
          // Find existing browser -> web server connections and reroute through WAF
          const browserConnections = edges.filter(e => e.source === browser.id && 
            webServers.some(ws => ws.id === e.target));
          
          browserConnections.forEach(conn => {
            // Create browser -> WAF connection
            newEdges.push({
              id: `${browser.id}-${wafId}-autofix`,
              source: browser.id,
              target: wafId,
              label: 'HTTPS:443',
              type: 'smoothstep',
              markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
              style: { stroke: '#10b981', strokeWidth: 2 },
              data: { 
                protocol: 'HTTPS', 
                port: 443, 
                encryption: 'TLS 1.3',
                sourceLabel: (browser.data as any)?.label,
                targetLabel: 'WAF (Auto-added)'
              }
            });
            
            // Create WAF -> web server connection
            const targetServer = webServers.find(ws => ws.id === conn.target);
            if (targetServer) {
              newEdges.push({
                id: `${wafId}-${targetServer.id}-autofix`,
                source: wafId,
                target: targetServer.id,
                label: 'HTTPS:443',
                type: 'smoothstep',
                markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
                style: { stroke: '#10b981', strokeWidth: 2 },
                data: { 
                  protocol: 'HTTPS', 
                  port: 443, 
                  encryption: 'TLS 1.3',
                  sourceLabel: 'WAF (Auto-added)',
                  targetLabel: (targetServer.data as any)?.label
                }
              });
            }
          });
        });
        
        fixesApplied++;
      }
    }
    
    // Add firewall if none exists
    if (!existingNodeTypes.includes('firewall')) {
      const firewallId = `firewall-autofix-${Date.now()}`;
      const firewallNode = {
        id: firewallId,
        type: 'custom',
        position: { x: 50, y: 300 },
        data: { type: 'firewall', label: 'Firewall (Auto-added)', zone: 'Security' }
      };
      
      newNodes.push(firewallNode);
      
      // Connect firewall to protect internal traffic
      const internalNodes = existingNodes.filter(n => 
        ['app-server', 'database', 'cache'].includes((n.data as any)?.type));
      
      // Create monitoring connections from firewall to critical assets
      internalNodes.slice(0, 2).forEach((node, idx) => {
        newEdges.push({
          id: `${firewallId}-monitor-${node.id}`,
          source: firewallId,
          target: node.id,
          label: 'Monitor',
          type: 'smoothstep',
          markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
          style: { stroke: '#059669', strokeWidth: 1, strokeDasharray: '5,5' },
          data: { 
            protocol: 'Monitoring', 
            port: 443, 
            encryption: 'TLS 1.3',
            sourceLabel: 'Firewall (Auto-added)',
            targetLabel: (node.data as any)?.label,
            description: 'Traffic monitoring and filtering'
          }
        });
      });
      
      fixesApplied++;
    }
    
    // Add IDS/IPS if none exists and there are multiple tiers
    if (!existingNodeTypes.includes('ids-ips') && existingNodes.length > 3) {
      const idsId = `ids-autofix-${Date.now()}`;
      const idsNode = {
        id: idsId,
        type: 'custom',
        position: { x: 500, y: 350 },
        data: { type: 'ids-ips', label: 'IDS/IPS (Auto-added)', zone: 'Security' }
      };
      
      newNodes.push(idsNode);
      
      // Connect IDS/IPS to monitor east-west traffic between tiers
      const appServers = existingNodes.filter(n => (n.data as any)?.type === 'app-server');
      const databases = existingNodes.filter(n => (n.data as any)?.type === 'database');
      
      // Monitor app server to database connections
      if (appServers.length > 0 && databases.length > 0) {
        const appServer = appServers[0];
        const database = databases[0];
        
        // Create IDS monitoring connection
        newEdges.push({
          id: `${idsId}-monitor-${appServer.id}-${database.id}`,
          source: idsId,
          target: database.id,
          label: 'Monitor',
          type: 'smoothstep',
          markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
          style: { stroke: '#991b1b', strokeWidth: 1, strokeDasharray: '3,3' },
          data: { 
            protocol: 'IDS Monitoring', 
            port: 443, 
            encryption: 'TLS 1.3',
            sourceLabel: 'IDS/IPS (Auto-added)',
            targetLabel: (database.data as any)?.label,
            description: 'Intrusion detection and prevention'
          }
        });
      }
      
      fixesApplied++;
    }
    
    // Add load balancer if web servers exist without one
    const webServers = existingNodes.filter(n => (n.data as any)?.type === 'web-server');
    const hasLoadBalancer = existingNodeTypes.includes('load-balancer-global') || 
                          existingNodeTypes.includes('load-balancer-internal');
    
    if (webServers.length > 1 && !hasLoadBalancer) {
      const avgX = webServers.reduce((sum, n) => sum + n.position.x, 0) / webServers.length;
      const avgY = webServers.reduce((sum, n) => sum + n.position.y, 0) / webServers.length;
      
      const lbId = `lb-autofix-${Date.now()}`;
      const lbNode = {
        id: lbId,
        type: 'custom',
        position: { x: avgX, y: avgY - 100 },
        data: { type: 'load-balancer-global', label: 'Load Balancer (Auto-added)', zone: 'Web Tier' }
      };
      
      newNodes.push(lbNode);
      
      // Connect load balancer to web servers
      webServers.forEach(server => {
        newEdges.push({
          id: `${lbId}-${server.id}-autofix`,
          source: lbId,
          target: server.id,
          label: 'HTTPS:443',
          type: 'smoothstep',
          markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
          style: { stroke: '#10b981', strokeWidth: 2 },
          data: { 
            protocol: 'HTTPS', 
            port: 443, 
            encryption: 'TLS 1.3',
            sourceLabel: 'Load Balancer (Auto-added)',
            targetLabel: (server.data as any)?.label
          }
        });
      });
      
      fixesApplied++;
    }
    
    // Update nodes and edges
    if (newNodes.length > 0) {
      setNodes(nds => [...nds, ...newNodes]);
    }
    
    if (newEdges.length > 0) {
      setEdges(eds => [...eds, ...newEdges]);
    }
    
    // Remove old insecure direct connections that are now protected
    setTimeout(() => {
      setEdges(eds => eds.filter(edge => {
        const edgeData = edge.data || {};
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);
        
        // Remove direct browser -> web server connections if WAF was added
        if ((sourceNode?.data as any)?.type === 'web-browser' && 
            (targetNode?.data as any)?.type === 'web-server' &&
            newNodes.some(n => (n.data as any)?.type === 'waf')) {
          return false;
        }
        
        return true;
      }));
      
      // Re-run analysis to update findings (which will also run AI analysis)
      setTimeout(() => {
        runSecurityAnalysis();
      }, 200);
    }, 100);
    
    if (fixesApplied > 0) {
      toast.success(`Applied ${fixesApplied} security fixes. Re-analyzing...`);
    } else {
      toast.info('No automatic fixes available');
    }
  };

  // Connection Dialog Component
  const ConnectionDialog = () => {
    const [selectedProtocol, setSelectedProtocol] = useState('HTTPS');
    const [selectedPort, setSelectedPort] = useState(443);
    const [selectedEncryption, setSelectedEncryption] = useState('TLS 1.3');

    const sourceNode = nodes.find(n => n.id === pendingConnection?.source);
    const targetNode = nodes.find(n => n.id === pendingConnection?.target);

    const handleProtocolChange = (protocol: string) => {
      setSelectedProtocol(protocol);
      const config = protocolConfigs[protocol as keyof typeof protocolConfigs];
      if (config) {
        setSelectedPort(config.port);
      }
    };

    return (
      <Dialog open={showConnectionDialog} onOpenChange={setShowConnectionDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Configure Connection</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Connecting: <span className="font-medium">{sourceNode?.data?.label}</span> → <span className="font-medium">{targetNode?.data?.label}</span>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="connection-protocol">Protocol</Label>
              <Select value={selectedProtocol} onValueChange={handleProtocolChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(protocolConfigs).map(([protocol, config]) => (
                    <SelectItem key={protocol} value={protocol}>
                      <div className="flex flex-col">
                        <span>{protocol}</span>
                        <span className="text-xs text-muted-foreground">{config.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="connection-port">Port</Label>
              <Input
                id="connection-port"
                type="number"
                value={selectedPort}
                onChange={(e) => setSelectedPort(parseInt(e.target.value))}
                min="1"
                max="65535"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="connection-encryption">Encryption</Label>
              <Select value={selectedEncryption} onValueChange={setSelectedEncryption}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TLS 1.3">TLS 1.3 (Recommended)</SelectItem>
                  <SelectItem value="TLS 1.2">TLS 1.2</SelectItem>
                  <SelectItem value="mTLS">Mutual TLS (mTLS)</SelectItem>
                  <SelectItem value="SASL_SSL">SASL with SSL</SelectItem>
                  <SelectItem value="None">None (Not Recommended)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {selectedEncryption === 'None' && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <Shield className="w-4 h-4" />
                  <span className="font-medium">Security Warning</span>
                </div>
                <p className="text-xs text-destructive/80 mt-1">
                  Unencrypted connections are vulnerable to eavesdropping and tampering.
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowConnectionDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="secondary"
              onClick={createQuickConnection}
            >
              Quick Connect
            </Button>
            <Button 
              onClick={() => createConnection(selectedProtocol, selectedPort, selectedEncryption)}
            >
              Create Connection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  // Analysis Result Dialog Component
  const AnalysisResultDialog = () => (
    <Dialog open={showAnalysisResult} onOpenChange={setShowAnalysisResult}>
      <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Connection Analysis Results
          </DialogTitle>
        </DialogHeader>
        
        {analysisResult && (
          <div className="space-y-6">
            {/* Selected Components */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Analyzed Components</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.nodes.map((node: any) => (
                    <Badge key={node.id} variant="secondary">
                      {node.label} ({node.type})
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Connections */}
            {analysisResult.connections.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Connections Found</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analysisResult.connections.map((conn: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <Badge variant="outline">{conn.from}</Badge>
                        <span>→</span>
                        <Badge variant="outline">{conn.to}</Badge>
                        <span className="text-muted-foreground">
                          ({conn.protocol} : {conn.ports})
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Analysis */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  AI Security Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-sm">
                    {analysisResult.analysis}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        <DialogFooter>
          <Button onClick={() => setShowAnalysisResult(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="h-screen flex bg-background text-foreground">
      {/* Analysis Result Dialog */}
      <AnalysisResultDialog />
      
      {/* Sidebar */}
      <div className="w-80 border-r border-border bg-card flex flex-col h-screen">
        {/* Header */}
        <div className="p-4 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold">Koh Atlas</h1>
              <p className="text-sm text-muted-foreground">Secure Architecture Designer</p>
            </div>
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDarkTheme(isDarkTheme === 'true' ? 'false' : 'true')}
                disabled={isThemeLoading}
              >
                {isDarkTheme === 'true' ? <Sun /> : <Moon />}
              </Button>
              {isThemeLoading && (
                <div className="absolute -bottom-6 right-0 flex items-center gap-1.5 text-xs text-muted-foreground animate-pulse">
                  <div className="w-1 h-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1 h-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1 h-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="ml-1">Loading theme...</span>
                </div>
              )}
            </div>
          </div>

          {/* Cache Info Banner */}
          {aiAnalysisResult && aiAnalysisResult.cacheHit && (
            <div className="mb-3 p-2 bg-green-500/10 border border-green-500/30 rounded-md text-xs flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-green-500 flex-shrink-0" />
              <span className="text-green-500">Enhanced findings from cache - Instant, $0.00 cost</span>
            </div>
          )}
          
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

          <div className="space-y-2">
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={runSecurityAnalysis}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                disabled={isAIAnalyzing}
              >
                {isAIAnalyzing ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-1 animate-pulse" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-1" />
                    Analyze
                  </>
                )}
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

            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="secondary"
                onClick={reorganizeComponents}
                className="flex-1"
                disabled={nodes.length === 0}
              >
                <ArrowsClockwise className="w-4 h-4 mr-1" />
                Reorganize
              </Button>
              {findings.length > 0 && (
                <Button 
                  size="sm" 
                  variant="secondary"
                  onClick={autoFixVulnerabilities}
                  className="flex-1"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Fix Issues
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="destructive"
                onClick={clearAll}
                className="w-full"
                disabled={nodes.length === 0 && edges.length === 0}
              >
                <TrashSimple className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            </div>
            
            {/* Quick Actions */}
            <div className="pt-2 border-t border-border space-y-2">
              <div className="text-xs font-medium text-muted-foreground mb-1">Quick Actions</div>
              
              {/* Undo/Redo */}
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={undo}
                  className="flex-1"
                  disabled={historyIndex <= 0}
                  title="Undo (Ctrl+Z)"
                >
                  <ArrowsClockwise className="w-4 h-4 rotate-180" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={redo}
                  className="flex-1"
                  disabled={historyIndex >= history.length - 1}
                  title="Redo (Ctrl+Y)"
                >
                  <ArrowsClockwise className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Layout Tools */}
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={toggleSnapToGrid}
                  className={`flex-1 ${snapToGrid ? 'bg-primary/10' : ''}`}
                  title="Snap to Grid (Ctrl+Shift+G)"
                >
                  <Network className="w-4 h-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setShowGrid(!showGrid)}
                  className={`flex-1 ${showGrid ? 'bg-primary/10' : ''}`}
                  title="Toggle Grid (Ctrl+G)"
                >
                  <Hexagon className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Export */}
              <details className="group">
                <summary className="cursor-pointer list-none flex">
                  <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md w-full transition-colors">
                    <Plus className="w-4 h-4 group-open:rotate-45 transition-transform" />
                    <span>Export</span>
                  </div>
                </summary>
                <div className="mt-2 space-y-1 pl-2">
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={(e) => {
                      e.preventDefault();
                      exportToPNG();
                    }}
                    className="w-full justify-start"
                    disabled={isExporting || nodes.length === 0}
                  >
                    PNG Image
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={(e) => {
                      e.preventDefault();
                      exportToSVG();
                    }}
                    className="w-full justify-start"
                    disabled={nodes.length === 0}
                  >
                    SVG Vector
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={(e) => {
                      e.preventDefault();
                      exportToJSON();
                    }}
                    className="w-full justify-start"
                    disabled={nodes.length === 0}
                  >
                    JSON Data
                  </Button>
                </div>
              </details>
              
              {/* PDF Security Report */}
              <Button 
                size="sm" 
                variant="default"
                onClick={(e) => {
                  e.preventDefault();
                  generatePDFSecurityReport();
                }}
                className="w-full gap-2"
                disabled={isExporting || nodes.length === 0}
              >
                <FileText className="w-4 h-4" />
                <span>Generate Security Report</span>
              </Button>
              
              {/* System Documentation */}
              <Button 
                size="sm" 
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  generateFullDocumentation();
                }}
                className="w-full gap-2"
                disabled={isExporting}
              >
                <BookOpen className="w-4 h-4" />
                <span>System Documentation</span>
              </Button>
              
              {/* Import */}
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="flex-1 relative"
                  asChild
                >
                  <label className="cursor-pointer">
                    <Upload className="w-4 h-4 mr-1" />
                    Import File
                    <input
                      type="file"
                      accept=".json"
                      onChange={importFromJSON}
                      className="hidden"
                    />
                  </label>
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setShowPasteDialog(true)}
                  title="Paste JSON (Ctrl+Shift+I)"
                >
                  <ClipboardText className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {selectedNode && (
              <>
                <div className="flex gap-2 pt-2 border-t border-border">
                  <Button 
                    size="sm" 
                    variant="default"
                    onClick={() => visualizeFlow(selectedNode.id, 'both')}
                    className="w-full"
                    disabled={isFlowAnimating}
                  >
                    <ArrowsClockwise className="w-4 h-4 mr-1" />
                    {isFlowAnimating ? 'Animating...' : 'Show Flow'}
                  </Button>
                </div>

                {/* Flow Controls */}
                {isFlowAnimating && (
                  <div className="pt-2 space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Flow Controls</div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsFlowPaused(!isFlowPaused)}
                        className="flex-1"
                      >
                        {isFlowPaused ? (
                          <>
                            <Play className="w-4 h-4 mr-1" />
                            Resume
                          </>
                        ) : (
                          <>
                            <Pause className="w-4 h-4 mr-1" />
                            Pause
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setIsFlowAnimating(false);
                          setFlowingEdges(new Set());
                          setFlowingNodes(new Set());
                          setFlowLogs([]);
                        }}
                        className="flex-1"
                      >
                        <Stop className="w-4 h-4 mr-1" />
                        Stop
                      </Button>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Animation Speed</Label>
                      <div className="flex gap-2 items-center">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs"
                          onClick={() => setFlowSpeed(3000)}
                        >
                          Slow
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs"
                          onClick={() => setFlowSpeed(1500)}
                        >
                          Normal
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs"
                          onClick={() => setFlowSpeed(500)}
                        >
                          Fast
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground text-center">
                        {flowSpeed}ms per step
                      </div>
                    </div>
                  </div>
                )}

                {/* Node Styling Panel */}
                <div className="pt-2 border-t border-border">
                  <details className="group" open={showStylingPanel} onToggle={(e) => setShowStylingPanel((e.target as HTMLDetailsElement).open)}>
                    <summary className="cursor-pointer list-none flex">
                      <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md w-full transition-colors">
                        <Palette className="w-4 h-4 group-open:rotate-45 transition-transform" />
                        <span>Node Styling</span>
                      </div>
                    </summary>
                    <div className="mt-2 space-y-3 pl-1">
                      {/* Gradient */}
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-muted-foreground">Gradient</div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 h-8"
                            onClick={() => updateNodeStyling(selectedNode.id, {
                              gradient: { from: '#3b82f6', to: '#8b5cf6', direction: 'to-br' }
                            })}
                            style={{ background: 'linear-gradient(to bottom right, #3b82f6, #8b5cf6)' }}
                          >
                            <span className="text-white text-xs">Blue</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 h-8"
                            onClick={() => updateNodeStyling(selectedNode.id, {
                              gradient: { from: '#10b981', to: '#06b6d4', direction: 'to-br' }
                            })}
                            style={{ background: 'linear-gradient(to bottom right, #10b981, #06b6d4)' }}
                          >
                            <span className="text-white text-xs">Green</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 h-8"
                            onClick={() => updateNodeStyling(selectedNode.id, {
                              gradient: { from: '#f59e0b', to: '#ef4444', direction: 'to-br' }
                            })}
                            style={{ background: 'linear-gradient(to bottom right, #f59e0b, #ef4444)' }}
                          >
                            <span className="text-white text-xs">Warm</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2"
                            onClick={() => removeNodeStyling(selectedNode.id, 'gradient')}
                            title="Remove gradient"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Shadow */}
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-muted-foreground">Shadow</div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-xs"
                            onClick={() => updateNodeStyling(selectedNode.id, { shadow: 'sm' })}
                          >
                            Small
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-xs"
                            onClick={() => updateNodeStyling(selectedNode.id, { shadow: 'lg' })}
                          >
                            Large
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-xs"
                            onClick={() => updateNodeStyling(selectedNode.id, { shadow: '2xl' })}
                          >
                            XL
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2"
                            onClick={() => removeNodeStyling(selectedNode.id, 'shadow')}
                            title="Remove shadow"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Environment */}
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-muted-foreground">Environment</div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-xs border-blue-500 text-blue-600"
                            onClick={() => updateNodeStyling(selectedNode.id, { environment: 'dev' })}
                          >
                            🔵 Dev
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-xs border-yellow-500 text-yellow-600"
                            onClick={() => updateNodeStyling(selectedNode.id, { environment: 'staging' })}
                          >
                            🟡 Staging
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-xs border-red-500 text-red-600"
                            onClick={() => updateNodeStyling(selectedNode.id, { environment: 'prod' })}
                          >
                            🔴 Prod
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2"
                            onClick={() => removeNodeStyling(selectedNode.id, 'environment')}
                            title="Remove environment"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-muted-foreground">Status Badge</div>
                        <div className="grid grid-cols-2 gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            onClick={() => updateNodeStyling(selectedNode.id, { 
                              statusBadge: { text: 'Active', color: 'green' }
                            })}
                          >
                            ✓ Active
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            onClick={() => updateNodeStyling(selectedNode.id, { 
                              statusBadge: { text: 'Warning', color: 'yellow' }
                            })}
                          >
                            ⚠ Warning
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            onClick={() => updateNodeStyling(selectedNode.id, { 
                              statusBadge: { text: 'Error', color: 'red' }
                            })}
                          >
                            ✕ Error
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            onClick={() => updateNodeStyling(selectedNode.id, { 
                              statusBadge: { text: 'Offline', color: 'gray' }
                            })}
                          >
                            ● Offline
                          </Button>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-full text-xs"
                          onClick={() => removeNodeStyling(selectedNode.id, 'statusBadge')}
                        >
                          <X className="w-3 h-3 mr-1" />
                          Remove Badge
                        </Button>
                      </div>
                    </div>
                  </details>
                </div>
              </>
            )}
            
            {/* Keyboard Shortcuts Help */}
            <div className="pt-2 border-t border-border">
              <details className="group">
                <summary className="cursor-pointer list-none text-xs text-muted-foreground hover:text-foreground transition-colors">
                  ⌨️ Keyboard Shortcuts
                </summary>
                <div className="mt-2 text-xs space-y-1 text-muted-foreground">
                  <div className="flex justify-between"><kbd>Ctrl+Z</kbd><span>Undo</span></div>
                  <div className="flex justify-between"><kbd>Ctrl+Y</kbd><span>Redo</span></div>
                  <div className="flex justify-between"><kbd>Ctrl+C</kbd><span>Copy</span></div>
                  <div className="flex justify-between"><kbd>Ctrl+V</kbd><span>Paste</span></div>
                  <div className="flex justify-between"><kbd>Ctrl+D</kbd><span>Duplicate</span></div>
                  <div className="flex justify-between"><kbd>Ctrl+A</kbd><span>Select All</span></div>
                  <div className="flex justify-between"><kbd>Ctrl+S</kbd><span>Quick Save</span></div>
                  <div className="flex justify-between"><kbd>Ctrl+F</kbd><span>Search</span></div>
                  <div className="flex justify-between"><kbd>Delete</kbd><span>Remove</span></div>
                  <div className="flex justify-between"><kbd>Arrows</kbd><span>Move (+Shift=10px)</span></div>
                  <div className="flex justify-between"><kbd>Esc</kbd><span>Clear Selection</span></div>
                </div>
              </details>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="components" className="flex-1 flex flex-col min-h-0">
          <TabsList className="flex flex-wrap w-full mx-4 mt-2 mb-2 flex-shrink-0 p-1 bg-muted/30 h-auto">
            <TabsTrigger value="components" className="flex-1 min-w-0 text-[10px] py-2 px-1 flex items-center justify-center gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Palette className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden lg:inline truncate">Components</span>
            </TabsTrigger>
            <TabsTrigger value="properties" className="flex-1 min-w-0 text-[10px] py-2 px-1 flex items-center justify-center gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <ListBullets className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden lg:inline truncate">Properties</span>
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex-1 min-w-0 text-[10px] py-2 px-1 flex items-center justify-center gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Shield className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden lg:inline truncate">Analysis</span>
            </TabsTrigger>
            <TabsTrigger value="validation" className="flex-1 min-w-0 text-[10px] py-2 px-1 flex items-center justify-center gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden lg:inline truncate">Validation</span>
            </TabsTrigger>
            <TabsTrigger value="compliance" className="flex-1 min-w-0 text-[10px] py-2 px-1 flex items-center justify-center gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Scales className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden lg:inline truncate">Compliance</span>
            </TabsTrigger>
            <TabsTrigger value="metrics" className="flex-1 min-w-0 text-[10px] py-2 px-1 flex items-center justify-center gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <ChartBar className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden lg:inline truncate">Metrics</span>
            </TabsTrigger>
            <TabsTrigger value="backup" className="flex-1 min-w-0 text-[10px] py-2 px-1 flex items-center justify-center gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <HardDrives className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden lg:inline truncate">Backup</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="components" className="flex-1 min-h-0 px-4 pb-4">
            <ScrollArea className="h-full">
              <div className="space-y-3 py-2">
                {/* Search Bar */}
                <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 pb-2">
                  <Input
                    placeholder="Search components..."
                    value={componentSearch}
                    onChange={(e) => setComponentSearch(e.target.value)}
                    className="h-9"
                  />
                </div>

                {(() => {
                  const searchLower = componentSearch.toLowerCase();
                  
                  const matchesSearch = (c: ComponentConfig | { type: string; label: string; category: string }) => 
                    !searchLower ||
                    c.label.toLowerCase().includes(searchLower) ||
                    c.type.toLowerCase().includes(searchLower) ||
                    c.category.toLowerCase().includes(searchLower);

                  const awsComponents = allComponentTypes.filter(c => 
                    (c.type.startsWith('aws-') || c.label.includes('AWS')) && matchesSearch(c)
                  );
                  const azureComponents = allComponentTypes.filter(c => 
                    (c.type.startsWith('azure-') || c.label.includes('Azure')) && matchesSearch(c)
                  );
                  const gcpComponents = allComponentTypes.filter(c => 
                    (c.type.startsWith('gcp-') || c.label.includes('GCP')) && matchesSearch(c)
                  );
                  const genericComponents = allComponentTypes.filter(c => 
                    !c.type.startsWith('aws-') && !c.type.startsWith('azure-') && !c.type.startsWith('gcp-') &&
                    !c.label.includes('AWS') && !c.label.includes('Azure') && !c.label.includes('GCP') &&
                    matchesSearch(c)
                  );
                  const customFiltered = customComponents.filter(c => matchesSearch(c));

                  const toggleCategory = (cat: string) => {
                    const newExpanded = new Set(expandedCategories);
                    if (newExpanded.has(cat)) {
                      newExpanded.delete(cat);
                    } else {
                      newExpanded.add(cat);
                    }
                    setExpandedCategories(newExpanded);
                  };

                  const renderComponentButton = (component: ComponentConfig) => (
                    <Button
                      key={component.type}
                      variant="outline"
                      className="h-auto p-3 justify-start hover:bg-accent hover:shadow-sm transition-all"
                      draggable
                      onDragStart={() => setSelectedComponent(component)}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <div style={{ color: component.color }} className="flex-shrink-0">
                          {component.icon}
                        </div>
                        <span className="text-xs truncate">{component.label}</span>
                      </div>
                    </Button>
                  );

                  const renderCategory = (title: string, components: ComponentConfig[], key: string, icon: React.ReactNode) => {
                    if (components.length === 0) return null;
                    const isExpanded = expandedCategories.has(key);
                    return (
                      <div key={key} className="border border-border rounded-lg overflow-hidden">
                        <Button
                          variant="ghost"
                          className="w-full justify-between p-3 h-auto hover:bg-accent/50"
                          onClick={() => toggleCategory(key)}
                        >
                          <div className="flex items-center gap-2">
                            {icon}
                            <span className="font-medium">{title}</span>
                            <Badge variant="secondary" className="ml-2">{components.length}</Badge>
                          </div>
                          {isExpanded ? <CaretLeft className="w-4 h-4 rotate-90" /> : <CaretRight className="w-4 h-4" />}
                        </Button>
                        {isExpanded && (
                          <div className="grid grid-cols-2 gap-2 p-3 bg-muted/30">
                            {components.map(c => renderComponentButton(c))}
                          </div>
                        )}
                      </div>
                    );
                  };

                  return (
                    <>
                      {renderCategory('AWS Components', awsComponents, 'AWS', <Cloud className="w-4 h-4" />)}
                      {renderCategory('Azure Components', azureComponents, 'Azure', <Cloud className="w-4 h-4" />)}
                      {renderCategory('GCP Components', gcpComponents, 'GCP', <Cloud className="w-4 h-4" />)}
                      {renderCategory('Generic Components', genericComponents, 'Generic', <Hexagon className="w-4 h-4" />)}
                      
                      {customFiltered.length > 0 && renderCategory(
                        'Custom Components',
                        customFiltered.map(c => ({
                          type: c.type,
                          label: c.label,
                          icon: React.createElement(Shield),
                          category: c.category,
                          color: c.color,
                          isContainer: c.isContainer
                        })),
                        'Custom',
                        <Shield className="w-4 h-4" />
                      )}
                      
                      {searchLower && 
                       awsComponents.length === 0 && 
                       azureComponents.length === 0 && 
                       gcpComponents.length === 0 && 
                       genericComponents.length === 0 && 
                       customFiltered.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>No components found for "{componentSearch}"</p>
                        </div>
                      )}

                      <div className="pt-2 border-t border-border">
                        <ComponentLibrary
                          onImportComponents={handleImportComponents}
                          existingComponents={customComponents}
                        />
                      </div>
                    </>
                  );
                })()}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="properties" className="flex-1 min-h-0 px-4 pb-4">
            <ScrollArea className="h-full">
              <div className="py-2">
              {selectedNode && (
                <div className="space-y-4">
                  <h3 className="font-medium">
                    {componentTypes.find(c => c.type === selectedNode.data?.type)?.isContainer ? 'Container' : 'Node'} Properties
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="node-label">Label</Label>
                    <Input
                      id="node-label"
                      value={(selectedNode.data as any)?.label || ''}
                      onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
                      placeholder="Enter component label"
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
                        <SelectItem value="Cloud">Cloud</SelectItem>
                        <SelectItem value="Internal">Internal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Size properties */}
                  <div className="space-y-2">
                    <Label htmlFor="node-size">Size (Width x Height)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="node-width"
                        type="number"
                        placeholder="Width"
                        value={selectedNode.style?.width || selectedNode.measured?.width || ''}
                        onChange={(e) => {
                          const value = e.target.value.trim();
                          const width = value === '' ? undefined : parseInt(value);
                          
                          // Update nodes state
                          setNodes(nds => nds.map(node => 
                            node.id === selectedNode.id 
                              ? { 
                                  ...node, 
                                  style: { 
                                    ...node.style, 
                                    width: width 
                                  }
                                }
                              : node
                          ));
                          
                          // Update selectedNode to reflect changes immediately
                          setSelectedNode(prev => prev ? {
                            ...prev,
                            style: {
                              ...prev.style,
                              width: width
                            }
                          } : null);
                        }}
                        min="120"
                        max="1200"
                      />
                      <span className="flex items-center text-muted-foreground text-sm">×</span>
                      <Input
                        id="node-height"
                        type="number"
                        placeholder="Height"
                        value={selectedNode.style?.height || selectedNode.measured?.height || ''}
                        onChange={(e) => {
                          const value = e.target.value.trim();
                          const height = value === '' ? undefined : parseInt(value);
                          
                          // Update nodes state
                          setNodes(nds => nds.map(node => 
                            node.id === selectedNode.id 
                              ? { 
                                  ...node, 
                                  style: { 
                                    ...node.style, 
                                    height: height 
                                  }
                                }
                              : node
                          ));
                          
                          // Update selectedNode to reflect changes immediately
                          setSelectedNode(prev => prev ? {
                            ...prev,
                            style: {
                              ...prev.style,
                              height: height
                            }
                          } : null);
                        }}
                        min="60"
                        max="800"
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Leave empty for auto-sizing. Values are in pixels.
                    </div>
                  </div>

                  {/* Advanced Styling */}
                  <div className="space-y-4 pt-4 border-t border-border">
                    <h4 className="font-medium text-sm">Advanced Styling</h4>
                    
                    {/* Environment */}
                    <div className="space-y-2">
                      <Label htmlFor="node-environment">Environment</Label>
                      <Select
                        value={(selectedNode.data as any)?.environment || ''}
                        onValueChange={(value) => updateNodeData(selectedNode.id, { environment: value || undefined })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="None" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dev">Development</SelectItem>
                          <SelectItem value="staging">Staging</SelectItem>
                          <SelectItem value="prod">Production</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Status Badge */}
                    <div className="space-y-2">
                      <Label htmlFor="node-status">Status Badge</Label>
                      <div className="flex gap-2">
                        <Select
                          value={(selectedNode.data as any)?.statusBadge?.color || ''}
                          onValueChange={(value) => {
                            const current = (selectedNode.data as any)?.statusBadge;
                            updateNodeData(selectedNode.id, { 
                              statusBadge: value ? { 
                                text: current?.text || 'Status', 
                                color: value 
                              } : undefined 
                            });
                          }}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="None" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="green">✓ Healthy</SelectItem>
                            <SelectItem value="yellow">⚠ Warning</SelectItem>
                            <SelectItem value="red">✗ Error</SelectItem>
                            <SelectItem value="blue">ℹ Info</SelectItem>
                            <SelectItem value="gray">◯ Unknown</SelectItem>
                          </SelectContent>
                        </Select>
                        {(selectedNode.data as any)?.statusBadge && (
                          <Input
                            placeholder="Badge text"
                            value={(selectedNode.data as any)?.statusBadge?.text || ''}
                            onChange={(e) => {
                              const current = (selectedNode.data as any)?.statusBadge;
                              updateNodeData(selectedNode.id, { 
                                statusBadge: { ...current, text: e.target.value } 
                              });
                            }}
                          />
                        )}
                      </div>
                    </div>
                    
                    {/* Gradient Background */}
                    <div className="space-y-2">
                      <Label>Gradient Background</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="From color"
                          value={(selectedNode.data as any)?.gradient?.from || ''}
                          onChange={(e) => {
                            const current = (selectedNode.data as any)?.gradient;
                            if (e.target.value) {
                              updateNodeData(selectedNode.id, { 
                                gradient: { 
                                  from: e.target.value, 
                                  to: current?.to || '#ffffff',
                                  direction: current?.direction || 'to-br'
                                } 
                              });
                            } else {
                              updateNodeData(selectedNode.id, { gradient: undefined });
                            }
                          }}
                        />
                        <Input
                          placeholder="To color"
                          value={(selectedNode.data as any)?.gradient?.to || ''}
                          onChange={(e) => {
                            const current = (selectedNode.data as any)?.gradient;
                            if (current) {
                              updateNodeData(selectedNode.id, { 
                                gradient: { ...current, to: e.target.value } 
                              });
                            }
                          }}
                        />
                      </div>
                      <Select
                        value={(selectedNode.data as any)?.gradient?.direction || 'to-br'}
                        onValueChange={(value) => {
                          const current = (selectedNode.data as any)?.gradient;
                          if (current) {
                            updateNodeData(selectedNode.id, { 
                              gradient: { ...current, direction: value } 
                            });
                          }
                        }}
                        disabled={!(selectedNode.data as any)?.gradient}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Direction" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="to-r">→ Right</SelectItem>
                          <SelectItem value="to-br">↘ Bottom Right</SelectItem>
                          <SelectItem value="to-b">↓ Bottom</SelectItem>
                          <SelectItem value="to-bl">↙ Bottom Left</SelectItem>
                          <SelectItem value="to-l">← Left</SelectItem>
                          <SelectItem value="to-tl">↖ Top Left</SelectItem>
                          <SelectItem value="to-t">↑ Top</SelectItem>
                          <SelectItem value="to-tr">↗ Top Right</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Custom Shadow */}
                    <div className="space-y-2">
                      <Label htmlFor="node-shadow">Custom Shadow</Label>
                      <Select
                        value={(selectedNode.data as any)?.shadow || ''}
                        onValueChange={(value) => updateNodeData(selectedNode.id, { shadow: value || undefined })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="None" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sm">Small</SelectItem>
                          <SelectItem value="md">Medium</SelectItem>
                          <SelectItem value="lg">Large</SelectItem>
                          <SelectItem value="xl">Extra Large</SelectItem>
                          <SelectItem value="2xl">2X Large</SelectItem>
                          <SelectItem value="inner">Inner</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Container-specific properties */}
                  {componentTypes.find(c => c.type === selectedNode.data?.type)?.isContainer && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="container-cidr">CIDR Block (optional)</Label>
                        <Input
                          id="container-cidr"
                          placeholder="e.g., 10.0.0.0/16"
                          value={(selectedNode.data as any)?.cidr || ''}
                          onChange={(e) => updateNodeData(selectedNode.id, { cidr: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="container-description">Description</Label>
                        <Input
                          id="container-description"
                          placeholder="Container purpose or notes"
                          value={(selectedNode.data as any)?.description || ''}
                          onChange={(e) => updateNodeData(selectedNode.id, { description: e.target.value })}
                        />
                      </div>
                    </>
                  )}
                  
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">Sizing Options:</p>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>• Set exact dimensions using Width x Height textboxes above</p>
                      <p>• Drag corners/edges to resize visually</p>
                      <p>• Both width and height are fully adjustable</p>
                      <p>• Leave textboxes empty for auto-sizing</p>
                      <p>• <kbd>Delete</kbd> to delete component</p>
                      <p>• <kbd>Escape</kbd> to deselect</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => visualizeFlow(selectedNode.id, 'both')}
                      className="flex-1"
                      disabled={isFlowAnimating}
                    >
                      <ArrowsClockwise className="w-4 h-4 mr-2" />
                      Visualize Flow
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={onDeleteSelected}
                      className="flex-1"
                    >
                      <Trash className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              )}
              
              {selectedEdge && (
                <div className="space-y-4">
                  <h3 className="font-medium">Connection Properties</h3>
                  
                  <div className="p-3 bg-muted/50 rounded-md">
                    <div className="text-sm">
                      <span className="font-medium">{(selectedEdge.data as any)?.sourceLabel}</span>
                      <span className="mx-2 text-muted-foreground">→</span>
                      <span className="font-medium">{(selectedEdge.data as any)?.targetLabel}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edge-protocol">Protocol</Label>
                    <Select
                      value={(selectedEdge.data as any)?.protocol || 'HTTPS'}
                      onValueChange={(value) => {
                        const config = protocolConfigs[value as keyof typeof protocolConfigs];
                        updateEdgeData(selectedEdge.id, { 
                          ...(selectedEdge.data || {}), 
                          protocol: value,
                          port: config?.port || (selectedEdge.data as any)?.port || 443
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(protocolConfigs).map(([protocol, config]) => (
                          <SelectItem key={protocol} value={protocol}>
                            <div className="flex flex-col">
                              <span>{protocol}</span>
                              <span className="text-xs text-muted-foreground">{config.description}</span>
                            </div>
                          </SelectItem>
                        ))}
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
                      min="1"
                      max="65535"
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
                        <SelectItem value="TLS 1.3">TLS 1.3 (Recommended)</SelectItem>
                        <SelectItem value="TLS 1.2">TLS 1.2</SelectItem>
                        <SelectItem value="mTLS">Mutual TLS (mTLS)</SelectItem>
                        <SelectItem value="SASL_SSL">SASL with SSL</SelectItem>
                        <SelectItem value="None">None (Not Recommended)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {(selectedEdge.data as any)?.encryption === 'None' && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                      <div className="flex items-center gap-2 text-destructive text-sm">
                        <Shield className="w-4 h-4" />
                        <span className="font-medium">Security Risk</span>
                      </div>
                      <p className="text-xs text-destructive/80 mt-1">
                        This connection is unencrypted and vulnerable to attacks.
                      </p>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="edge-description">Description</Label>
                    <Input
                      id="edge-description"
                      placeholder="Optional connection description"
                      value={(selectedEdge.data as any)?.description || ''}
                      onChange={(e) => updateEdgeData(selectedEdge.id, { 
                        ...(selectedEdge.data || {}), 
                        description: e.target.value 
                      })}
                    />
                  </div>
                  
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">Keyboard Shortcuts:</p>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>• <kbd>Delete</kbd> to delete connection</p>
                      <p>• <kbd>Escape</kbd> to deselect</p>
                      <p>• Click connection line to select and edit</p>
                      <p>• Drag endpoints to reconnect</p>
                    </div>
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
                  <div className="mt-4 text-xs space-y-1">
                    <p>• Click on any component to select it</p>
                    <p>• Click on connections to edit protocols</p>
                    <p>• Use size textboxes for exact dimensions</p>
                    <p>• Drag corners/edges to resize visually</p>
                    <p>• All components scale freely in both dimensions</p>
                    <p>• Use <kbd>Delete</kbd> key to remove selected items</p>
                    <p>• Backspace only removes letters in text fields</p>
                  </div>
                </div>
              )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="analysis" className="flex-1 min-h-0 px-4 pb-4">
            <div className="h-full overflow-hidden">
              <ScrollArea className="h-full">
                <div className="py-2 space-y-4 pr-2 pb-4">
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
                    <div className="space-y-4">
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
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">Security Findings</h3>
                        {isAIAnalyzing && (
                          <Badge variant="outline" className="text-xs animate-pulse">
                            <Sparkles className="w-3 h-3 mr-1 animate-spin" />
                            Analyzing...
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {highlightedElements.length > 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={clearHighlights}
                          >
                            Clear Highlights
                          </Button>
                        )}
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
                    </div>
                    <div className="space-y-4">
                      {findings.map(finding => (
                        <Card 
                          key={finding.id}
                          className="cursor-pointer hover:bg-accent/5 transition-colors"
                          onClick={() => highlightFinding(finding)}
                        >
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 flex-1">
                                <CardTitle className="text-sm">{finding.title}</CardTitle>
                                {finding.id.startsWith('ai-') && (
                                  <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-600 border-purple-500/30">
                                    <Sparkles className="w-3 h-3 mr-1" />
                                    Enhanced
                                  </Badge>
                                )}
                              </div>
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
                            <div className="text-xs text-muted-foreground pt-1 border-t border-border">
                              Click to highlight affected components on the diagram
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
                  </div>
                )}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
          
          <TabsContent value="validation" className="flex-1 min-h-0 px-4 pb-4">
            <ScrollArea className="h-full">
              <div className="space-y-4 py-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Architecture Validation</h3>
                  <Button
                    onClick={runArchitecturalValidation}
                    disabled={nodes.length === 0 || isAIAnalyzing}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isAIAnalyzing ? (
                      <>
                        <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                        Validating...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Validate
                      </>
                    )}
                  </Button>
                </div>

                {validationResult && (
                  <div className="space-y-4">
                    {/* Score Card */}
                    <Card className={
                      validationResult.score >= 90 ? 'bg-green-900/20 border-green-500' :
                      validationResult.score >= 70 ? 'bg-yellow-900/20 border-yellow-500' :
                      'bg-red-900/20 border-red-500'
                    }>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-2xl font-bold">
                            Score: {validationResult.score}/100
                          </CardTitle>
                          {validationResult.valid ? (
                            <CheckCircle className="w-8 h-8 text-green-500" />
                          ) : (
                            <Warning className="w-8 h-8 text-red-500" />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-4 text-sm">
                          <span className="text-red-500 font-semibold">
                            {validationResult.summary.errors} Errors
                          </span>
                          <span className="text-yellow-500 font-semibold">
                            {validationResult.summary.warnings} Warnings
                          </span>
                          <span className="text-blue-500 font-semibold">
                            {validationResult.summary.infos} Info
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Issue List */}
                    <div className="space-y-2">
                      <h4 className="font-semibold">Issues Found:</h4>
                      
                      {validationResult.issues.length === 0 ? (
                        <Card className="bg-green-900/20 border-green-500">
                          <CardContent className="py-8 text-center">
                            <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                            <p className="text-green-500 font-semibold">
                              No issues found! Architecture follows best practices.
                            </p>
                          </CardContent>
                        </Card>
                      ) : (
                        validationResult.issues.map((issue) => (
                          <Card
                            key={issue.id}
                            className={
                              issue.severity === 'error' ? 'bg-red-900/20 border-red-500' :
                              issue.severity === 'warning' ? 'bg-yellow-900/20 border-yellow-500' :
                              'bg-blue-900/20 border-blue-500'
                            }
                          >
                            <CardHeader className="pb-2">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                  {issue.severity === 'error' && <X className="w-5 h-5 text-red-500" />}
                                  {issue.severity === 'warning' && <Warning className="w-5 h-5 text-yellow-500" />}
                                  {issue.severity === 'info' && <Info className="w-5 h-5 text-blue-500" />}
                                  <CardTitle className="text-sm">{issue.title}</CardTitle>
                                </div>
                                <Badge 
                                  variant="outline"
                                  className={
                                    issue.severity === 'error' ? 'border-red-500 text-red-500' :
                                    issue.severity === 'warning' ? 'border-yellow-500 text-yellow-500' :
                                    'border-blue-500 text-blue-500'
                                  }
                                >
                                  {issue.category}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              <p className="text-xs text-muted-foreground">{issue.description}</p>
                              <div className="bg-card/50 p-2 rounded text-xs">
                                <strong>Recommendation:</strong> {issue.recommendation}
                              </div>
                              {issue.affectedComponents.length > 0 && (
                                <div className="text-xs text-muted-foreground">
                                  Affects: {issue.affectedComponents.length} component(s)
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>

                    {/* Export Validation Report */}
                    <Button
                      onClick={() => {
                        const report = `# Architecture Validation Report
Generated: ${new Date().toISOString()}

## Score: ${validationResult.score}/100

## Summary
- Errors: ${validationResult.summary.errors}
- Warnings: ${validationResult.summary.warnings}
- Info: ${validationResult.summary.infos}

## Issues
${validationResult.issues.map(issue => `
### ${issue.title} [${issue.severity.toUpperCase()}]
**Category:** ${issue.category}
**Description:** ${issue.description}
**Recommendation:** ${issue.recommendation}
**Affected Components:** ${issue.affectedComponents.join(', ')}
`).join('\n')}
`;
                        const blob = new Blob([report], { type: 'text/markdown' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `architecture-validation-${Date.now()}.md`;
                        a.click();
                        URL.revokeObjectURL(url);
                        toast.success('Validation report exported');
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Export Validation Report
                    </Button>
                  </div>
                )}

                {!validationResult && (
                  <div className="text-center text-muted-foreground py-8">
                    <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No validation results yet</p>
                    <p className="text-xs">Click "Validate" to check your architecture</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          
          <TabsContent value="metrics" className="flex-1 min-h-0 px-4 pb-4">
            <ScrollArea className="h-full">
              <div className="space-y-4 py-2">
                {selectedNode ? (
                  <>
                    {(() => {
                      const nodeData = selectedNode.data as any;
                      return (
                        <div className="space-y-2">
                          <h3 className="font-medium flex items-center gap-2">
                            <ChartBar className="w-4 h-4" />
                            Node Metrics: {String(selectedNode.data.label)}
                          </h3>
                          
                          {/* Cost Metrics */}
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm flex items-center gap-2">
                                <CurrencyDollar className="w-4 h-4" />
                                Cost
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <Label className="text-xs">Monthly Cost ($)</Label>
                                  <Input
                                    type="number"
                                    placeholder="0"
                                    value={nodeData.metrics?.cost?.monthly || ''}
                                onChange={(e) => updateNodeMetrics(selectedNode.id, {
                                  cost: {
                                    ...nodeData.metrics?.cost,
                                    monthly: parseFloat(e.target.value) || 0,
                                    currency: 'USD'
                                  }
                                })}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Currency</Label>
                              <Select
                                value={nodeData.metrics?.cost?.currency || 'USD'}
                                onValueChange={(value) => updateNodeMetrics(selectedNode.id, {
                                  cost: { ...nodeData.metrics?.cost, currency: value }
                                })}
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="USD">USD</SelectItem>
                                  <SelectItem value="EUR">EUR</SelectItem>
                                  <SelectItem value="GBP">GBP</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          {nodeData.metrics?.cost?.monthly && (
                            <div className="text-sm font-medium text-green-600">
                              ${nodeData.metrics.cost.monthly}/month
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Latency Metrics */}
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Gauge className="w-4 h-4" />
                            Latency
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <Label className="text-xs">p50 (ms)</Label>
                              <Input
                                type="number"
                                placeholder="0"
                                value={nodeData.metrics?.latency?.p50 || ''}
                                onChange={(e) => updateNodeMetrics(selectedNode.id, {
                                  latency: {
                                    ...nodeData.metrics?.latency,
                                    p50: parseFloat(e.target.value) || 0
                                  }
                                })}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">p95 (ms)</Label>
                              <Input
                                type="number"
                                placeholder="0"
                                value={nodeData.metrics?.latency?.p95 || ''}
                                onChange={(e) => updateNodeMetrics(selectedNode.id, {
                                  latency: {
                                    ...nodeData.metrics?.latency,
                                    p95: parseFloat(e.target.value) || 0
                                  }
                                })}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">p99 (ms)</Label>
                              <Input
                                type="number"
                                placeholder="0"
                                value={nodeData.metrics?.latency?.p99 || ''}
                                onChange={(e) => updateNodeMetrics(selectedNode.id, {
                                  latency: {
                                    ...nodeData.metrics?.latency,
                                    p99: parseFloat(e.target.value) || 0
                                  }
                                })}
                                className="mt-1"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Throughput Metrics */}
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <TrendUp className="w-4 h-4" />
                            Throughput
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <Label className="text-xs">Current</Label>
                              <Input
                                type="number"
                                placeholder="0"
                                value={nodeData.metrics?.throughput?.current || ''}
                                onChange={(e) => updateNodeMetrics(selectedNode.id, {
                                  throughput: {
                                    ...nodeData.metrics?.throughput,
                                    current: parseFloat(e.target.value) || 0
                                  }
                                })}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Max</Label>
                              <Input
                                type="number"
                                placeholder="0"
                                value={nodeData.metrics?.throughput?.max || ''}
                                onChange={(e) => updateNodeMetrics(selectedNode.id, {
                                  throughput: {
                                    ...nodeData.metrics?.throughput,
                                    max: parseFloat(e.target.value) || 0
                                  }
                                })}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Unit</Label>
                              <Select
                                value={nodeData.metrics?.throughput?.unit || 'rps'}
                                onValueChange={(value: any) => updateNodeMetrics(selectedNode.id, {
                                  throughput: { ...nodeData.metrics?.throughput, unit: value }
                                })}
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="rps">req/s</SelectItem>
                                  <SelectItem value="mbps">MB/s</SelectItem>
                                  <SelectItem value="tps">tx/s</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          {nodeData.metrics?.throughput?.current && nodeData.metrics?.throughput?.max && (
                            <div className="mt-2">
                              <div className="flex justify-between text-xs mb-1">
                                <span>Capacity</span>
                                <span>{Math.round((nodeData.metrics.throughput.current / nodeData.metrics.throughput.max) * 100)}%</span>
                              </div>
                              <div className="w-full bg-secondary rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    (nodeData.metrics.throughput.current / nodeData.metrics.throughput.max) > 0.8 ? 'bg-red-500' :
                                    (nodeData.metrics.throughput.current / nodeData.metrics.throughput.max) > 0.6 ? 'bg-yellow-500' :
                                    'bg-green-500'
                                  }`}
                                  style={{ width: `${Math.min((nodeData.metrics.throughput.current / nodeData.metrics.throughput.max) * 100, 100)}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Resource Utilization */}
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Resource Utilization</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <Label>CPU (%)</Label>
                              <span>{nodeData.metrics?.resources?.cpu || 0}%</span>
                            </div>
                            <Input
                              type="range"
                              min="0"
                              max="100"
                              value={nodeData.metrics?.resources?.cpu || 0}
                              onChange={(e) => updateNodeMetrics(selectedNode.id, {
                                resources: {
                                  ...nodeData.metrics?.resources,
                                  cpu: parseInt(e.target.value)
                                }
                              })}
                            />
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <Label>Memory (%)</Label>
                              <span>{nodeData.metrics?.resources?.memory || 0}%</span>
                            </div>
                            <Input
                              type="range"
                              min="0"
                              max="100"
                              value={nodeData.metrics?.resources?.memory || 0}
                              onChange={(e) => updateNodeMetrics(selectedNode.id, {
                                resources: {
                                  ...nodeData.metrics?.resources,
                                  memory: parseInt(e.target.value)
                                }
                              })}
                            />
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <Label>Disk (%)</Label>
                              <span>{nodeData.metrics?.resources?.disk || 0}%</span>
                            </div>
                            <Input
                              type="range"
                              min="0"
                              max="100"
                              value={nodeData.metrics?.resources?.disk || 0}
                              onChange={(e) => updateNodeMetrics(selectedNode.id, {
                                resources: {
                                  ...nodeData.metrics?.resources,
                                  disk: parseInt(e.target.value)
                                }
                              })}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                      );
                    })()}
                  </>
                ) : (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <ChartBar className="w-5 h-5" />
                          Architecture Analytics
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {(() => {
                          const metrics = calculateTotalMetrics();
                          return (
                            <>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <div className="text-xs text-muted-foreground">Total Cost</div>
                                  <div className="text-2xl font-bold text-green-600">
                                    ${metrics.totalCost.toFixed(0)}/mo
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <div className="text-xs text-muted-foreground">Avg Latency</div>
                                  <div className="text-2xl font-bold">
                                    {metrics.avgLatency}ms
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <div className="text-xs text-muted-foreground">Total Throughput</div>
                                  <div className="text-2xl font-bold">
                                    {metrics.totalThroughput.toLocaleString()}
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <div className="text-xs text-muted-foreground">Bottlenecks</div>
                                  <div className="text-2xl font-bold text-red-600">
                                    {metrics.bottleneckCount}
                                  </div>
                                </div>
                              </div>

                              {metrics.nodesWithMetrics === 0 && (
                                <div className="text-center text-muted-foreground py-4">
                                  <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                  <p className="text-sm">No metrics data available</p>
                                  <p className="text-xs">Select a component and add performance metrics</p>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Metrics Overlay</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Show on Canvas</Label>
                          <Switch
                            checked={showMetricsOverlay}
                            onCheckedChange={setShowMetricsOverlay}
                          />
                        </div>
                        {showMetricsOverlay && (
                          <div className="space-y-2">
                            <Label className="text-xs">Display Mode</Label>
                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                size="sm"
                                variant={metricsView === 'cost' ? 'default' : 'outline'}
                                onClick={() => setMetricsView('cost')}
                                className="text-xs"
                              >
                                <CurrencyDollar className="w-3 h-3 mr-1" />
                                Cost
                              </Button>
                              <Button
                                size="sm"
                                variant={metricsView === 'latency' ? 'default' : 'outline'}
                                onClick={() => setMetricsView('latency')}
                                className="text-xs"
                              >
                                <Gauge className="w-3 h-3 mr-1" />
                                Latency
                              </Button>
                              <Button
                                size="sm"
                                variant={metricsView === 'throughput' ? 'default' : 'outline'}
                                onClick={() => setMetricsView('throughput')}
                                className="text-xs"
                              >
                                <TrendUp className="w-3 h-3 mr-1" />
                                Throughput
                              </Button>
                              <Button
                                size="sm"
                                variant={metricsView === 'utilization' ? 'default' : 'outline'}
                                onClick={() => setMetricsView('utilization')}
                                className="text-xs"
                              >
                                <ChartBar className="w-3 h-3 mr-1" />
                                Resources
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Warning className="w-4 h-4" />
                          Quick Actions
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => {
                            toast.info('Feature coming soon: Auto-populate metrics from monitoring systems');
                          }}
                        >
                          Import from Monitoring
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => {
                            toast.info('Feature coming soon: Generate cost optimization report');
                          }}
                        >
                          Generate Cost Report
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => {
                            toast.info('Feature coming soon: Run capacity simulation');
                          }}
                        >
                          Simulate Load (2x, 5x, 10x)
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="backup" className="flex-1 min-h-0 px-4 pb-4">
            <ScrollArea className="h-full">
              <div className="py-2">
                <BackupManager
                  nodes={nodes}
                  edges={edges}
                  customComponents={customComponents}
                  findings={findings}
                  attackPaths={attackPaths}
                  onLoadBackup={handleLoadBackup}
                />
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 relative" ref={reactFlowWrapper}>
        {/* Empty State Guidance */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
            <Card className="w-96 shadow-xl pointer-events-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary" />
                  Get Started with Koh Atlas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Start designing your secure architecture by adding components to the canvas.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <span className="font-medium text-primary">1.</span>
                    <span>Drag components from the left sidebar onto the canvas</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-medium text-primary">2.</span>
                    <span>Connect components by dragging between connection points</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-medium text-primary">3.</span>
                    <span>Run security analysis to identify vulnerabilities</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-border">
                  <p className="text-xs font-medium mb-2">💡 Pro Tips:</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Use Ctrl+F to search for components</li>
                    <li>• Delete key removes selected items</li>
                    <li>• Ctrl+Z/Y for undo/redo</li>
                    <li>• Select presets from the toolbar above</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes.map(node => ({
              ...node,
              style: {
                ...node.style,
                opacity: flowingNodes.size > 0 ? (flowingNodes.has(node.id) ? 1 : 0.3) : 1,
                boxShadow: flowingNodes.has(node.id) ? '0 0 20px rgba(59, 130, 246, 0.8)' : node.style?.boxShadow,
                transition: 'opacity 0.3s ease, box-shadow 0.3s ease',
              }
            }))}
            edges={edges.map(edge => ({
              ...edge,
              animated: flowingEdges.has(edge.id),
              style: {
                ...edge.style,
                stroke: flowingEdges.has(edge.id) ? '#3b82f6' : edge.style?.stroke,
                strokeWidth: flowingEdges.has(edge.id) ? 3 : edge.style?.strokeWidth || 2,
                opacity: flowingEdges.size > 0 ? (flowingEdges.has(edge.id) ? 1 : 0.3) : 1,
                transition: 'all 0.3s ease',
              }
            }))}
            onNodesChange={handleNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={(reactFlowInstance) => setReactFlowInstance(reactFlowInstance)}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onSelectionChange={onSelectionChange}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            className="bg-background"
            connectionMode={ConnectionMode.Loose}
            defaultEdgeOptions={{
              type: 'smoothstep',
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 20,
                height: 20,
              },
            }}
          >
            {showGrid && <Background gap={gridSize} />}
            <MiniMap />
            <Controls />
            
            {/* Analyze Connection Button - Appears when multiple nodes selected */}
            {showAnalyzeButton && !isAnalyzingConnection && (
              <div
                style={{
                  position: 'absolute',
                  left: analyzeButtonPosition.x,
                  top: analyzeButtonPosition.y,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 1000,
                }}
              >
                <Button
                  onClick={analyzeConnection}
                  className="shadow-2xl border-2 border-primary bg-primary hover:bg-primary/90 text-primary-foreground font-semibold animate-pulse"
                  size="lg"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analyze This Connection
                </Button>
              </div>
            )}
            
            {/* Analyzing indicator */}
            {isAnalyzingConnection && (
              <div
                style={{
                  position: 'absolute',
                  left: analyzeButtonPosition.x,
                  top: analyzeButtonPosition.y,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 1000,
                }}
              >
                <Card className="p-4 shadow-2xl border-2 border-primary">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-medium">Analyzing connection...</span>
                  </div>
                </Card>
              </div>
            )}
          </ReactFlow>
        </ReactFlowProvider>
        
        {/* Floating Toolbar */}
        {nodes.length > 0 && (
          <div className="absolute top-4 right-4 z-40">
            <Card className="shadow-lg">
              <CardContent className="p-2 flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={undo}
                  disabled={historyIndex <= 0}
                  title="Undo (Ctrl+Z)"
                  className="h-8 w-8 p-0"
                >
                  <ArrowsClockwise className="w-4 h-4 rotate-180" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={redo}
                  disabled={historyIndex >= history.length - 1}
                  title="Redo (Ctrl+Y)"
                  className="h-8 w-8 p-0"
                >
                  <ArrowsClockwise className="w-4 h-4" />
                </Button>
                <div className="w-px bg-border mx-1" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => alignNodes('top')}
                  title="Align Top"
                  className="h-8 w-8 p-0"
                >
                  <ListBullets className="w-4 h-4 rotate-90" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => alignNodes('left')}
                  title="Align Left"
                  className="h-8 w-8 p-0"
                >
                  <ListBullets className="w-4 h-4" />
                </Button>
                <div className="w-px bg-border mx-1" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  title="Clear All"
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <TrashSimple className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Connection Dialog */}
        <ConnectionDialog />
        
        {/* Search Bar */}
        {showSearch && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 w-96">
            <Card className="shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search components... (Ctrl+F)"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      const query = e.target.value.toLowerCase();
                      if (query) {
                        setNodes(nds => nds.map(n => ({
                          ...n,
                          selected: n.data?.label?.toLowerCase().includes(query) || 
                                    n.data?.type?.toLowerCase().includes(query)
                        })));
                      } else {
                        setNodes(nds => nds.map(n => ({ ...n, selected: false })));
                      }
                    }}
                    autoFocus
                    className="flex-1"
                  />
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => {
                      setShowSearch(false);
                      setSearchQuery('');
                      setNodes(nds => nds.map(n => ({ ...n, selected: false })));
                    }}
                  >
                    <CaretRight className="w-4 h-4" />
                  </Button>
                </div>
                {searchQuery && (
                  <div className="text-xs text-muted-foreground mt-2">
                    {nodes.filter(n => n.selected).length} component(s) found
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
        
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
                <p>• Start with container components (VPC, Subnet) to organize zones</p>
                <p>• Drag regular components into containers or onto the canvas</p>
                <p>• Connect components by dragging between connection points</p>
                <p>• Specify protocols and ports for each connection</p>
                <p>• Select components to set exact size via textboxes or drag corners to resize</p>
                <p>• Use the Properties panel to edit selected components and connections</p>
                <p>• Click <strong>Reorganize</strong> to automatically arrange components in logical tiers</p>
                <p>• Run security analysis to identify vulnerabilities</p>
                <p>• View attack paths to understand threat scenarios</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Flow Visualization Panel */}
      {showFlowPanel && (
        <div 
          ref={flowPanelRef}
          className="relative h-screen border-l border-border bg-card flex flex-col"
          style={{ width: flowPanelWidth }}
        >
          {/* Resize Handle */}
          <div
            className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-primary/50 transition-colors"
            onMouseDown={(e) => {
              e.preventDefault();
              setIsResizingPanel(true);
              
              const handleMouseMove = (e: MouseEvent) => {
                const newWidth = window.innerWidth - e.clientX;
                if (newWidth >= 300 && newWidth <= 800) {
                  setFlowPanelWidth(newWidth);
                }
              };
              
              const handleMouseUp = () => {
                setIsResizingPanel(false);
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };
              
              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          />
          
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <ListBullets className="w-5 h-5" />
              <h3 className="font-semibold">Flow Visualization Log</h3>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFlowLogs([])}
                disabled={flowLogs.length === 0}
              >
                Clear
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFlowPanel(false)}
              >
                <CaretRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Log Content */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-2">
              {flowLogs.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <ListBullets className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No flow logs yet</p>
                  <p className="text-xs">Select a component and click 'Show Flow'</p>
                </div>
              ) : (
                flowLogs.map((log, index) => (
                  <div 
                    key={index}
                    className={`p-3 rounded-lg border text-sm ${
                      log.type === 'start' ? 'bg-primary/10 border-primary/20' :
                      log.type === 'complete' ? 'bg-green-500/10 border-green-500/20' :
                      log.type === 'node' ? 'bg-blue-500/10 border-blue-500/20' :
                      'bg-muted border-border'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className="font-mono text-xs text-muted-foreground">{log.timestamp}</span>
                      <Badge variant="outline" className="text-xs">
                        {log.type}
                      </Badge>
                    </div>
                    <div className="font-medium mb-1">{log.message}</div>
                    {log.details && (
                      <div className="text-xs text-muted-foreground space-y-0.5 mt-2 pt-2 border-t border-border/50">
                        {log.details.protocol && (
                          <div>Protocol: <span className="font-mono">{log.details.protocol}</span></div>
                        )}
                        {log.details.port && (
                          <div>Port: <span className="font-mono">{log.details.port}</span></div>
                        )}
                        {log.details.encryption && (
                          <div>Encryption: <span className="font-mono">{log.details.encryption}</span></div>
                        )}
                        {log.details.direction && (
                          <div>Direction: <span className="font-mono">{log.details.direction}</span></div>
                        )}
                        {log.details.depth !== undefined && (
                          <div>Depth: <span className="font-mono">{log.details.depth}</span></div>
                        )}
                        {log.details.totalNodes && (
                          <div>Total Nodes: <span className="font-mono">{log.details.totalNodes}</span></div>
                        )}
                        {log.details.totalConnections !== undefined && (
                          <div>Total Connections: <span className="font-mono">{log.details.totalConnections}</span></div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
          
          {/* Footer Stats */}
          {flowLogs.length > 0 && (
            <div className="p-3 border-t border-border flex-shrink-0 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Total Logs: {flowLogs.length}</span>
                <span>
                  {isFlowAnimating ? (
                    <span className="text-primary animate-pulse">● Animating...</span>
                  ) : (
                    <span className="text-green-500">● Complete</span>
                  )}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Flow Panel Toggle Button (when panel is hidden) */}
      {!showFlowPanel && flowLogs.length > 0 && (
        <Button
          variant="default"
          size="sm"
          className="fixed right-4 top-4 z-50 shadow-lg"
          onClick={() => setShowFlowPanel(true)}
        >
          <CaretLeft className="w-4 h-4 mr-1" />
          Flow Log ({flowLogs.length})
        </Button>
      )}

      {/* Paste JSON Dialog */}
      {showPasteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <ClipboardText className="w-5 h-5" />
                Paste JSON Diagram
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowPasteDialog(false);
                  setPasteJsonText('');
                }}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-4 flex-1 overflow-auto">
              <Label htmlFor="paste-json" className="text-sm font-medium mb-2 block">
                Paste your diagram JSON here:
              </Label>
              <textarea
                id="paste-json"
                value={pasteJsonText}
                onChange={(e) => setPasteJsonText(e.target.value)}
                onPaste={(e) => {
                  // Ensure paste event is allowed
                  e.stopPropagation();
                }}
                className="w-full h-96 px-3 py-2 rounded-md border border-border bg-background text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder='{"nodes": [...], "edges": [...]}'
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
              />
              
              <div className="flex items-start gap-2 mt-3 text-sm text-muted-foreground">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Supported JSON formats:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li><strong>Diagram format:</strong> {"{"}"nodes": [...], "edges": [...]{"}"}</li>
                    <li><strong>Security architecture:</strong> {"{"}"components": [...], "connections": [...], "global_risks": [...]{"}"}</li>
                    <li>Both formats auto-detected and converted automatically</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-4 border-t border-border">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPasteDialog(false);
                  setPasteJsonText('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handlePasteImport}
                disabled={!pasteJsonText.trim()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Architecture Report Panel - Shows non-security recommendations */}
      {showAIPanel && aiAnalysisResult && (
        <div className="fixed right-0 top-0 w-[500px] h-screen bg-background border-l border-border shadow-2xl z-50 animate-in slide-in-from-right">
          <AIRecommendationsPanel
            result={{
              ...aiAnalysisResult,
              // Filter out security recommendations (they're in Security Findings now)
              recommendations: aiAnalysisResult.recommendations.filter(r => r.category !== 'security')
            }}
            isLoading={isAIAnalyzing}
            onAnalyze={runAIAnalysis}
            onClose={() => {
              setShowAIPanel(false);
              setAiAnalysisResult(null);
            }}
          />
        </div>
      )}
    </div>
  );
}

export default App;