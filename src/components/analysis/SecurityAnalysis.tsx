import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { SecurityFinding, ArchComponent, Connection } from '../../types';
import { Icon } from '../Icon';
import { AttackPathVisualization } from './AttackPathVisualization';

interface SecurityAnalysisProps {
  findings: SecurityFinding[];
  isAnalyzing: boolean;
  onApplyFix: (findingId: string) => void;
  onExportReport: () => void;
  components: ArchComponent[];
  connections: Connection[];
  onHighlightPath?: (componentIds: string[], connectionIds: string[]) => void;
  onClearHighlight?: () => void;
}

const SEVERITY_COLORS = {
  critical: 'bg-red-100 text-red-800 border-red-300',
  high: 'bg-orange-100 text-orange-800 border-orange-300',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  low: 'bg-blue-100 text-blue-800 border-blue-300',
};

const SEVERITY_ICONS = {
  critical: 'Warning',
  high: 'ShieldWarning',
  medium: 'Info',
  low: 'CheckCircle',
};

export function SecurityAnalysis({ 
  findings, 
  isAnalyzing, 
  onApplyFix, 
  onExportReport,
  components,
  connections,
  onHighlightPath = () => {},
  onClearHighlight = () => {}
}: SecurityAnalysisProps) {
  const [activeTab, setActiveTab] = useState('findings');
  const criticalCount = findings.filter(f => f.severity === 'critical').length;
  const highCount = findings.filter(f => f.severity === 'high').length;
  const mediumCount = findings.filter(f => f.severity === 'medium').length;
  const lowCount = findings.filter(f => f.severity === 'low').length;

  if (isAnalyzing) {
    return (
      <div className="w-96 bg-card border-l border-border">
        <div className="p-6 text-center">
          <Icon name="CircleNotch" className="animate-spin mx-auto mb-4" size={32} />
          <h3 className="text-lg font-semibold mb-2">Analyzing Architecture</h3>
          <p className="text-muted-foreground">
            Running security checks and compliance validation...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[28rem] bg-card border-l border-border flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Security Analysis</h2>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onExportReport}
            disabled={findings.length === 0}
          >
            <Icon name="Download" size={16} className="mr-2" />
            Export
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="findings" className="flex items-center space-x-1">
              <Icon name="ShieldWarning" size={14} />
              <span>Findings</span>
              {findings.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {findings.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="threats" className="flex items-center space-x-1">
              <Icon name="Target" size={14} />
              <span>Threats</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 mt-4">
            <TabsContent value="findings" className="mt-0">
              {findings.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="text-center p-2 bg-red-50 rounded-lg">
                    <div className="text-xl font-bold text-red-600">{criticalCount}</div>
                    <div className="text-xs text-red-600">Critical</div>
                  </div>
                  <div className="text-center p-2 bg-orange-50 rounded-lg">
                    <div className="text-xl font-bold text-orange-600">{highCount}</div>
                    <div className="text-xs text-orange-600">High</div>
                  </div>
                  <div className="text-center p-2 bg-yellow-50 rounded-lg">
                    <div className="text-xl font-bold text-yellow-600">{mediumCount}</div>
                    <div className="text-xs text-yellow-600">Medium</div>
                  </div>
                  <div className="text-center p-2 bg-blue-50 rounded-lg">
                    <div className="text-xl font-bold text-blue-600">{lowCount}</div>
                    <div className="text-xs text-blue-600">Low</div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="threats" className="mt-0">
              <AttackPathVisualization
                components={components}
                connections={connections}
                onHighlightPath={onHighlightPath}
                onClearHighlight={onClearHighlight}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="findings" className="mt-0 h-full">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4">
                {findings.length === 0 ? (
                  <div className="text-center py-8">
                    <Icon name="ShieldCheck" className="mx-auto mb-4 text-green-500" size={48} />
                    <h3 className="text-lg font-semibold mb-2">No Issues Found</h3>
                    <p className="text-muted-foreground text-sm">
                      Your architecture passes all security checks!
                    </p>
                  </div>
                ) : (
                  findings.map((finding) => (
                    <Card key={finding.id} className="border-l-4" style={{
                      borderLeftColor: finding.severity === 'critical' ? '#ef4444' :
                                      finding.severity === 'high' ? '#f97316' :
                                      finding.severity === 'medium' ? '#eab308' : '#3b82f6'
                    }}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <Icon 
                              name={SEVERITY_ICONS[finding.severity]} 
                              size={16}
                              className={
                                finding.severity === 'critical' ? 'text-red-500' :
                                finding.severity === 'high' ? 'text-orange-500' :
                                finding.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                              }
                            />
                            <CardTitle className="text-sm">{finding.title}</CardTitle>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${SEVERITY_COLORS[finding.severity]}`}
                          >
                            {finding.severity}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          {finding.description}
                        </p>
                        
                        <div>
                          <h4 className="text-xs font-medium mb-1">Evidence:</h4>
                          <code className="text-xs bg-muted p-2 rounded block">
                            {finding.evidence}
                          </code>
                        </div>

                        <div>
                          <h4 className="text-xs font-medium mb-1">Suggested Fix:</h4>
                          <p className="text-xs text-muted-foreground">
                            {finding.suggestedFix}
                          </p>
                        </div>

                        {finding.standards.length > 0 && (
                          <div>
                            <h4 className="text-xs font-medium mb-1">Standards:</h4>
                            <div className="flex flex-wrap gap-1">
                              {finding.standards.map((standard) => (
                                <Badge key={standard} variant="secondary" className="text-xs">
                                  {standard}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <Separator />

                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">
                            Residual Risk: {finding.residualRisk}
                          </span>
                          {finding.autoFixAvailable && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => onApplyFix(finding.id)}
                              className="text-xs"
                            >
                              <Icon name="Wrench" size={12} className="mr-1" />
                              Apply Fix
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="threats" className="mt-0 h-full">
            {/* Attack path visualization is already rendered above */}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}