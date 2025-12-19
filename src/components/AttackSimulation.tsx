import { useState, useCallback } from 'react';
import { Node, Edge, useReactFlow } from '@xyflow/react';
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
}

export function AttackSimulation({ nodes, edges }: AttackSimulationProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<AttackSimulationResult | null>(null);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedTab, setSelectedTab] = useState<'overview' | 'paths' | 'stride'>('overview');
  const [abstractionLevel, setAbstractionLevel] = useState<AbstractionLevel>('abstracted');
  const [claudeAnalysis, setClaudeAnalysis] = useState<string>('');
  const [securityReport, setSecurityReport] = useState<string>('');
  const { setNodes, setEdges } = useReactFlow();

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
    // Highlight nodes and edges in the attack path
    setNodes(prevNodes => 
      prevNodes.map(node => ({
        ...node,
        style: {
          ...node.style,
          opacity: path.path.includes(node.id) ? 1 : 0.3,
          border: path.path.includes(node.id) ? '3px solid #ef4444' : undefined
        }
      }))
    );
    
    setEdges(prevEdges =>
      prevEdges.map(edge => {
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
      })
    );
  };

  const clearHighlight = () => {
    setNodes(prevNodes => 
      prevNodes.map(node => ({
        ...node,
        style: {
          ...node.style,
          opacity: 1,
          border: undefined
        }
      }))
    );
    
    setEdges(prevEdges =>
      prevEdges.map(edge => ({
        ...edge,
        style: {
          ...edge.style,
          opacity: 1,
          stroke: undefined,
          strokeWidth: undefined
        }
      }))
    );
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
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Attack Simulation & Threat Modeling
            </CardTitle>
            <CardDescription>
              Discover potential attack paths and STRIDE threats in your architecture
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={abstractionLevel} onValueChange={(v) => setAbstractionLevel(v as AbstractionLevel)}>
              <SelectTrigger className="w-[180px]">
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
              className="gap-2"
            >
              {isRunning ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Running...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Run Simulation
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {!result && !isRunning && (
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Click "Run Simulation" to discover attack paths, analyze STRIDE threats, and get AI-powered security recommendations.
              {nodes.length === 0 && " (Import or create an architecture first)"}
            </AlertDescription>
          </Alert>
        )}

        {isRunning && (
          <div className="space-y-4">
            <div className="text-center py-8">
              <div className="inline-flex items-center gap-3 text-lg">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <span>Analyzing architecture security...</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Discovering attack paths, performing STRIDE analysis, and consulting Claude AI
              </p>
            </div>
          </div>
        )}

        {result && (
          <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as typeof selectedTab)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="paths">
                Attack Paths ({result.totalPaths})
              </TabsTrigger>
              <TabsTrigger value="stride">
                STRIDE Analysis ({result.strideAnalysis.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {/* Overall Risk Score */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Overall Risk Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className={`text-6xl font-bold ${getRiskColor(result.overallRiskScore).split(' ')[0]}`}>
                      {result.overallRiskScore}
                    </div>
                    <div className="flex-1">
                      <Progress value={result.overallRiskScore} className="h-3" />
                      <p className="text-sm text-muted-foreground mt-2">
                        Based on {result.totalPaths} attack paths analyzed
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Risk Distribution */}
              <div className="grid grid-cols-4 gap-4">
                <Card className="border-red-200 bg-red-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-red-900">Critical</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-red-600">{result.criticalRisks.length}</div>
                    <p className="text-xs text-red-700">Score ≥ 70</p>
                  </CardContent>
                </Card>

                <Card className="border-orange-200 bg-orange-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-orange-900">High</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-orange-600">{result.highRisks.length}</div>
                    <p className="text-xs text-orange-700">Score 50-69</p>
                  </CardContent>
                </Card>

                <Card className="border-yellow-200 bg-yellow-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-yellow-900">Medium</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-yellow-600">{result.mediumRisks.length}</div>
                    <p className="text-xs text-yellow-700">Score 30-49</p>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-green-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-green-900">Low</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">{result.lowRisks.length}</div>
                    <p className="text-xs text-green-700">Score &lt; 30</p>
                  </CardContent>
                </Card>
              </div>

              {/* Claude AI Analysis */}
              {claudeAnalysis && (
                <Card className="border-purple-200 bg-purple-50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                      AI Security Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{claudeAnalysis}</p>
                  </CardContent>
                </Card>
              )}

              {/* Recommendations */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Security Recommendations</CardTitle>
                  {securityReport && (
                    <Button variant="outline" size="sm" onClick={downloadReport} className="gap-2">
                      <Download className="h-4 w-4" />
                      Download Report
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="paths" className="space-y-3">
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
        )}
      </CardContent>
    </Card>
  );
}
