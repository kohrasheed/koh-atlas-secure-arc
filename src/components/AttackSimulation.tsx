import { useState, useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';
import { 
  discoverAttackPaths, 
  performSTRIDEAnalysis, 
  generateRecommendations,
  type AttackPath,
  type STRIDEAnalysis,
  type AttackSimulationResult
} from '@/lib/attack-simulation';
import {
  analyzeAttackPathsWithClaude,
  analyzeSTRIDEWithClaude,
  generateSecurityReport,
  type AbstractionLevel
} from '@/lib/threat-analysis-claude';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  ChevronDown,
  ChevronRight,
  Download,
  Sparkles,
  Lock,
  Unlock
} from 'lucide-react';

interface AttackSimulationProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange?: (nodes: Node[]) => void;
  onEdgesChange?: (edges: Edge[]) => void;
}

export function AttackSimulation({ nodes, edges, onNodesChange, onEdgesChange }: AttackSimulationProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<AttackSimulationResult | null>(null);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedTab, setSelectedTab] = useState<'overview' | 'paths' | 'stride'>('overview');
  const [abstractionLevel, setAbstractionLevel] = useState<AbstractionLevel>('abstracted');
  const [claudeAnalysis, setClaudeAnalysis] = useState<string>('');
  const [securityReport, setSecurityReport] = useState<string>('');

  const runSimulation = useCallback(async () => {
    if (nodes.length === 0) {
      alert('No architecture loaded. Please create or import an architecture first.');
      return;
    }

    setIsRunning(true);
    setResult(null);
    setClaudeAnalysis('');
    setSecurityReport('');

    try {
      // Step 1: Discover attack paths
      const attackPaths = discoverAttackPaths(nodes, edges);
      
      // Step 2: Perform STRIDE analysis
      const strideAnalysis = performSTRIDEAnalysis(nodes);
      
      // Step 3: Generate basic recommendations
      const recommendations = generateRecommendations(attackPaths, strideAnalysis);
      
      // Step 4: Use Claude AI for advanced analysis
      let claudeResult;
      try {
        claudeResult = await analyzeAttackPathsWithClaude(attackPaths, nodes, abstractionLevel);
        setClaudeAnalysis(claudeResult.analysis);
      } catch (error) {
        console.error('Claude analysis failed:', error);
        claudeResult = null;
      }
      
      // Step 5: Calculate overall risk score
      const totalRisk = attackPaths.reduce((sum, p) => sum + p.riskScore, 0);
      const overallRiskScore = attackPaths.length > 0 
        ? Math.round(totalRisk / attackPaths.length) 
        : 0;
      
      // Step 6: Categorize paths
      const finalPaths = claudeResult?.prioritizedPaths || attackPaths;
      const criticalRisks = finalPaths.filter(p => p.riskScore >= 70);
      const highRisks = finalPaths.filter(p => p.riskScore >= 50 && p.riskScore < 70);
      const mediumRisks = finalPaths.filter(p => p.riskScore >= 30 && p.riskScore < 50);
      const lowRisks = finalPaths.filter(p => p.riskScore < 30);
      
      // Step 7: Combine recommendations
      const allRecommendations = [
        ...recommendations,
        ...(claudeResult?.recommendations || [])
      ].filter((r, i, arr) => arr.indexOf(r) === i).slice(0, 10);
      
      const simulationResult: AttackSimulationResult = {
        totalPaths: attackPaths.length,
        criticalRisks,
        highRisks,
        mediumRisks,
        lowRisks,
        overallRiskScore,
        strideAnalysis,
        recommendations: allRecommendations,
        timestamp: new Date().toISOString()
      };
      
      setResult(simulationResult);
      
      // Step 8: Generate comprehensive report
      try {
        const report = await generateSecurityReport(
          finalPaths,
          strideAnalysis,
          nodes,
          abstractionLevel
        );
        setSecurityReport(report);
      } catch (error) {
        console.error('Report generation failed:', error);
      }
      
    } catch (error) {
      console.error('Attack simulation failed:', error);
      alert('Attack simulation failed. See console for details.');
    } finally {
      setIsRunning(false);
    }
  }, [nodes, edges, abstractionLevel]);

  const togglePathExpanded = (pathId: string) => {
    setExpandedPaths(prev => {
      const next = new Set(prev);
      if (next.has(pathId)) {
        next.delete(pathId);
      } else {
        next.add(pathId);
      }
      return next;
    });
  };

  const toggleNodeExpanded = (nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const highlightAttackPath = (path: AttackPath) => {
    if (!onNodesChange || !onEdgesChange) return;
    
    // Highlight nodes and edges in the attack path
    const highlightedNodes = nodes.map(node => ({
      ...node,
      style: {
        ...node.style,
        opacity: path.path.includes(node.id) ? 1 : 0.3,
        border: path.path.includes(node.id) ? '3px solid #ef4444' : undefined
      }
    }));
    
    const highlightedEdges = edges.map(edge => {
      const sourceIndex = path.path.indexOf(edge.source);
      const targetIndex = path.path.indexOf(edge.target);
      const isInPath = sourceIndex !== -1 && targetIndex === sourceIndex + 1;
      
      return {
        ...edge,
        style: {
          ...edge.style,
          opacity: isInPath ? 1 : 0.3,
          stroke: isInPath ? '#ef4444' : undefined,
          strokeWidth: isInPath ? 3 : undefined
        }
      };
    });
    
    onNodesChange(highlightedNodes);
    onEdgesChange(highlightedEdges);
  };

  const clearHighlight = () => {
    if (!onNodesChange || !onEdgesChange) return;
    
    const clearedNodes = nodes.map(node => ({
      ...node,
      style: {
        ...node.style,
        opacity: 1,
        border: undefined
      }
    }));
    
    const clearedEdges = edges.map(edge => ({
      ...edge,
      style: {
        ...edge.style,
        opacity: 1,
        stroke: undefined,
        strokeWidth: undefined
      }
    }));
    
    onNodesChange(clearedNodes);
    onEdgesChange(clearedEdges);
  };

  const downloadReport = () => {
    if (!securityReport) return;
    
    const blob = new Blob([securityReport], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-assessment-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-red-600 bg-red-50 border-red-200';
    if (score >= 50) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (score >= 30) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getRiskBadgeVariant = (score: number): "default" | "destructive" | "secondary" | "outline" => {
    if (score >= 70) return 'destructive';
    if (score >= 50) return 'default';
    return 'secondary';
  };

  const abstractionLevelIcon = abstractionLevel === 'full' ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />;
  const abstractionLevelColor = abstractionLevel === 'full' ? 'text-yellow-600' : 'text-green-600';

  return (
    <div className="w-full space-y-4">
      {/* Header Card with Actions */}
      <Card className="border-2">
        <CardHeader className="pb-3">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Shield className="h-6 w-6 text-primary" />
                Attack Simulation & Threat Modeling
              </CardTitle>
              <CardDescription className="mt-1.5">
                Discover potential attack paths and STRIDE threats in your architecture
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Select value={abstractionLevel} onValueChange={(v) => setAbstractionLevel(v as AbstractionLevel)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <div className="flex items-center gap-2">
                    <span className={abstractionLevelIcon.props.className + ' ' + abstractionLevelColor}>
                      {abstractionLevelIcon}
                    </span>
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confidential">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-green-600" />
                      <span>Confidential</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="abstracted">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-blue-600" />
                      <span>Abstracted</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="full">
                    <div className="flex items-center gap-2">
                      <Unlock className="h-4 w-4 text-yellow-600" />
                      <span>Full Details</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={runSimulation} 
                disabled={isRunning || nodes.length === 0}
                size="lg"
                className="gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg"
              >
                {isRunning ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Running...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Run Simulation
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Empty State - Hero Section */}
      {!result && !isRunning && (
        <Card className="border-2 border-dashed bg-gradient-to-br from-background to-muted/20">
          <CardContent className="pt-12 pb-12">
            <div className="text-center max-w-2xl mx-auto space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
                <Shield className="h-10 w-10 text-primary" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold">Security Threat Analysis</h3>
                <p className="text-muted-foreground">
                  {nodes.length === 0 
                    ? "Import or create an architecture to begin security analysis"
                    : "Click 'Run Simulation' to discover vulnerabilities and attack vectors"}
                </p>
              </div>

              {nodes.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                  <div className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                      <TrendingUp className="h-5 w-5" />
                      <span className="font-semibold">Attack Paths</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Discover potential routes attackers could take</p>
                  </div>
                  
                  <div className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-2 text-purple-600 mb-2">
                      <AlertTriangle className="h-5 w-5" />
                      <span className="font-semibold">STRIDE Analysis</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Categorize threats across 6 categories</p>
                  </div>
                  
                  <div className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-2 text-green-600 mb-2">
                      <Sparkles className="h-5 w-5" />
                      <span className="font-semibold">AI Insights</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Get Claude AI-powered recommendations</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

        {isRunning && (
          <Card className="border-2 border-primary/50 bg-primary/5">
            <CardContent className="pt-8 pb-8">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="inline-flex items-center gap-4 text-xl font-medium">
                    <div className="relative">
                      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                      <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full border-4 border-primary opacity-20" />
                    </div>
                    <span>Analyzing architecture security...</span>
                  </div>
                </div>
                
                <div className="max-w-md mx-auto space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>Discovering attack paths</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent flex-shrink-0" />
                    <span>Performing STRIDE threat analysis</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="h-4 w-4 rounded-full border-2 border-muted flex-shrink-0" />
                    <span>Consulting Claude AI for vulnerabilities</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="h-4 w-4 rounded-full border-2 border-muted flex-shrink-0" />
                    <span>Generating security report</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {result && (
          <div className="space-y-6">
            {/* Executive Summary Card */}
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1">
                    <CardTitle className="text-3xl font-bold">
                      Risk Score: {result.overallRiskScore}/100
                    </CardTitle>
                    <CardDescription className="text-base">
                      Analysis of {result.totalPaths} attack path{result.totalPaths !== 1 ? 's' : ''} discovered
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {securityReport && (
                      <Button 
                        onClick={downloadReport} 
                        variant="outline"
                        className="gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download Report
                      </Button>
                    )}
                    <Button 
                      onClick={clearHighlight} 
                      variant="outline"
                      size="sm"
                    >
                      Clear Highlights
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Card className="border-2 border-red-200 bg-red-50 dark:bg-red-950/20">
                    <CardContent className="pt-6 pb-4">
                      <div className="text-center space-y-1">
                        <div className="text-3xl font-bold text-red-600">{result.criticalRisks.length}</div>
                        <div className="text-sm font-medium text-red-700 dark:text-red-400">Critical</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-2 border-orange-200 bg-orange-50 dark:bg-orange-950/20">
                    <CardContent className="pt-6 pb-4">
                      <div className="text-center space-y-1">
                        <div className="text-3xl font-bold text-orange-600">{result.highRisks.length}</div>
                        <div className="text-sm font-medium text-orange-700 dark:text-orange-400">High</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-2 border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
                    <CardContent className="pt-6 pb-4">
                      <div className="text-center space-y-1">
                        <div className="text-3xl font-bold text-yellow-600">{result.mediumRisks.length}</div>
                        <div className="text-sm font-medium text-yellow-700 dark:text-yellow-400">Medium</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-2 border-green-200 bg-green-50 dark:bg-green-950/20">
                    <CardContent className="pt-6 pb-4">
                      <div className="text-center space-y-1">
                        <div className="text-3xl font-bold text-green-600">{result.lowRisks.length}</div>
                        <div className="text-sm font-medium text-green-700 dark:text-green-400">Low</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* Tabbed Details */}
            <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as typeof selectedTab)}>
              <TabsList className="grid w-full grid-cols-3 h-auto">
                <TabsTrigger value="overview" className="text-sm py-2.5">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="paths" className="text-sm py-2.5">
                  <Shield className="h-4 w-4 mr-2" />
                  Attack Paths ({result.totalPaths})
                </TabsTrigger>
                <TabsTrigger value="stride" className="text-sm py-2.5">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  STRIDE ({result.strideAnalysis.length})
                </TabsTrigger>
              </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              {/* Top Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Top Security Recommendations
                  </CardTitle>
                  <CardDescription>
                    Priority actions to improve your architecture security posture
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {result.recommendations.slice(0, 5).map((rec, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                          {idx + 1}
                        </div>
                        <p className="text-sm flex-1">{rec}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Claude AI Analysis */}
              {claudeAnalysis && (
                <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-background dark:from-purple-950/20 dark:to-background">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                      AI Security Analysis
                    </CardTitle>
                    <CardDescription>
                      Advanced vulnerability detection powered by Claude
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <div className="whitespace-pre-wrap text-sm">{claudeAnalysis}</div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="paths" className="space-y-3 mt-4">
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-muted-foreground">
                  Click on a path to highlight it in the diagram
                </p>
                <Button variant="outline" size="sm" onClick={clearHighlight}>
                  Clear Highlight
                </Button>
              </div>

              {[...result.criticalRisks, ...result.highRisks, ...result.mediumRisks, ...result.lowRisks].map(path => (
                <Card 
                  key={path.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${getRiskColor(path.riskScore)}`}
                  onClick={() => highlightAttackPath(path)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={getRiskBadgeVariant(path.riskScore)}>
                            Risk: {path.riskScore}/100
                          </Badge>
                          <Badge variant="outline">{path.attackType}</Badge>
                          <Badge variant="outline">{path.threatCategory}</Badge>
                        </div>
                        <CardTitle className="text-base">{path.name}</CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {path.description}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePathExpanded(path.id);
                        }}
                      >
                        {expandedPaths.has(path.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>

                  {expandedPaths.has(path.id) && (
                    <CardContent className="pt-0 space-y-3">
                      <div>
                        <p className="text-sm font-medium mb-1">Attack Path:</p>
                        <div className="flex flex-wrap gap-1 text-xs">
                          {path.pathLabels.map((label, i) => (
                            <span key={i} className="flex items-center">
                              <Badge variant="secondary">{label}</Badge>
                              {i < path.pathLabels.length - 1 && (
                                <span className="mx-1">→</span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>

                      {path.vulnerabilities.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-1 flex items-center gap-1">
                            <XCircle className="h-4 w-4 text-red-600" />
                            Vulnerabilities:
                          </p>
                          <ul className="text-xs space-y-1 ml-5">
                            {path.vulnerabilities.map((vuln, i) => (
                              <li key={i} className="list-disc">{vuln}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {path.mitigations.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-1 flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            Existing Mitigations:
                          </p>
                          <ul className="text-xs space-y-1 ml-5">
                            {path.mitigations.map((mit, i) => (
                              <li key={i} className="list-disc">{mit}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="font-medium">Likelihood:</span> {path.likelihood}/10
                        </div>
                        <div>
                          <span className="font-medium">Impact:</span> {path.impact}/10
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="stride" className="space-y-3">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  STRIDE analysis identifies potential threats: Spoofing, Tampering, Repudiation, 
                  Information Disclosure, Denial of Service, and Elevation of Privilege.
                </AlertDescription>
              </Alert>

              {result.strideAnalysis.map(analysis => (
                <Card key={analysis.nodeId}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="destructive">
                            {analysis.totalThreats} threats
                          </Badge>
                        </div>
                        <CardTitle className="text-base">{analysis.nodeLabel}</CardTitle>
                        <CardDescription className="text-xs">
                          Component ID: {analysis.nodeId}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleNodeExpanded(analysis.nodeId)}
                      >
                        {expandedNodes.has(analysis.nodeId) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>

                  {expandedNodes.has(analysis.nodeId) && (
                    <CardContent className="pt-0 space-y-3">
                      {Object.entries(analysis.threats).map(([category, threats]) => 
                        threats.length > 0 && (
                          <div key={category}>
                            <p className="text-sm font-medium mb-1 capitalize">
                              {category.replace(/([A-Z])/g, ' $1').trim()}:
                            </p>
                            <ul className="text-xs space-y-1 ml-5">
                              {threats.map((threat, i) => (
                                <li key={i} className="list-disc text-muted-foreground">{threat}</li>
                              ))}
                            </ul>
                          </div>
                        )
                      )}
                    </CardContent>
                  )}
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
