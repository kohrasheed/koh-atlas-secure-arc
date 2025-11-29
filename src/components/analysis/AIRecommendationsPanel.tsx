/**
 * AI Recommendations Panel Component
 */

import React, { useState } from 'react';
import { 
  Sparkles, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  Clock,
  DollarSign,
  Shield,
  Zap,
  TrendingUp,
  Database,
  Loader,
  RefreshCw,
  X,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { AIRecommendation, AIAnalysisResult } from '@/lib/ai-recommendations';
import { getCacheStats } from '@/lib/ai-recommendations';

interface AIRecommendationsPanelProps {
  result: AIAnalysisResult | null;
  isLoading: boolean;
  onAnalyze: () => void;
  onClose: () => void;
}

// Category icons and colors
const categoryConfig = {
  security: { icon: Shield, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950', label: 'Security' },
  performance: { icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-950', label: 'Performance' },
  cost: { icon: DollarSign, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950', label: 'Cost' },
  reliability: { icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950', label: 'Reliability' },
  architecture: { icon: Database, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950', label: 'Architecture' },
};

// Severity icons and colors
const severityConfig = {
  critical: { icon: AlertTriangle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900', label: 'Critical' },
  high: { icon: AlertTriangle, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900', label: 'High' },
  medium: { icon: Info, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900', label: 'Medium' },
  low: { icon: Info, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900', label: 'Low' },
  info: { icon: CheckCircle, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900', label: 'Info' },
};

// Score color
function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600 dark:text-green-400';
  if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
}

// Recommendation Card
const RecommendationCard: React.FC<{ rec: AIRecommendation; index: number }> = ({ rec, index }) => {
  const [expanded, setExpanded] = useState(false);
  const category = categoryConfig[rec.category];
  const severity = severityConfig[rec.severity];
  const CategoryIcon = category.icon;
  const SeverityIcon = severity.icon;

  return (
    <Card className={`p-4 ${category.bg} border-l-4 ${category.color.replace('text', 'border')}`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${severity.bg}`}>
          <SeverityIcon className={`w-5 h-5 ${severity.color}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs">
                  #{index + 1}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  <CategoryIcon className="w-3 h-3 mr-1" />
                  {category.label}
                </Badge>
                <Badge className={`text-xs ${severity.bg} ${severity.color}`}>
                  {severity.label}
                </Badge>
                {rec.quickWin && (
                  <Badge className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                    ⚡ Quick Win
                  </Badge>
                )}
              </div>
              <h3 className="font-semibold text-sm mb-1">{rec.title}</h3>
              <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
            </div>
          </div>

          {expanded && (
            <div className="mt-3 space-y-3 text-sm">
              <div>
                <h4 className="font-medium mb-1 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  Impact
                </h4>
                <p className="text-muted-foreground pl-5">{rec.impact}</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-1 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Solution
                </h4>
                <p className="text-muted-foreground pl-5 whitespace-pre-wrap">{rec.solution}</p>
              </div>
              
              {rec.estimatedCost && (
                <div>
                  <h4 className="font-medium mb-1 flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    Estimated Cost
                  </h4>
                  <p className="text-muted-foreground pl-5">{rec.estimatedCost}</p>
                </div>
              )}
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Priority: {rec.priority}/10</span>
              </div>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="mt-2 h-7 text-xs"
          >
            {expanded ? 'Show Less' : 'Show More'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

// Main Panel Component
export const AIRecommendationsPanel: React.FC<AIRecommendationsPanelProps> = ({
  result,
  isLoading,
  onAnalyze,
  onClose,
}) => {
  const [showStats, setShowStats] = useState(false);
  const stats = getCacheStats();
  
  // Sort recommendations by priority and severity
  const sortedRecommendations = result?.recommendations.slice().sort((a, b) => {
    // Quick wins first
    if (a.quickWin && !b.quickWin) return -1;
    if (!a.quickWin && b.quickWin) return 1;
    
    // Then by priority
    if (a.priority !== b.priority) return a.priority - b.priority;
    
    // Then by severity
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  const quickWins = sortedRecommendations?.filter(r => r.quickWin) || [];
  const criticalIssues = sortedRecommendations?.filter(r => r.severity === 'critical') || [];

  return (
    <div className="w-full h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <h2 className="text-lg font-semibold">Performance & Cost Insights</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowStats(!showStats)}
          >
            <BarChart3 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onAnalyze}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Stats Panel */}
      {showStats && (
        <div className="p-4 bg-muted/50 border-b flex-shrink-0">
          <h3 className="text-sm font-medium mb-3">Cache Statistics</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-muted-foreground">Total Requests</div>
              <div className="font-semibold">{stats.totalRequests}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Cache Hit Rate</div>
              <div className="font-semibold">
                {stats.totalRequests > 0 
                  ? `${Math.round((stats.cacheHits / stats.totalRequests) * 100)}%`
                  : '0%'
                }
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Total Cost</div>
              <div className="font-semibold text-green-600">${stats.estimatedCost.toFixed(4)}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Cost Saved</div>
              <div className="font-semibold text-green-600">
                ${(stats.cacheHits * 0.015).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="p-4 space-y-4">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Loader className="w-8 h-8 animate-spin text-purple-500 mb-4" />
              <p className="text-sm text-muted-foreground">
                Analyzing your architecture...
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                This may take 3-5 seconds
              </p>
            </div>
          )}

          {!isLoading && !result && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Sparkles className="w-12 h-12 text-purple-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Generate Architecture Report</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                Analyze your architecture and get expert recommendations
                on security, performance, cost, and reliability.
              </p>
              <Button onClick={onAnalyze} className="gap-2">
                <Sparkles className="w-4 h-4" />
                Analyze Architecture
              </Button>
              <p className="text-xs text-muted-foreground mt-4">
                💰 Cost: ~$0.015 per analysis • ⚡ Results cached for instant re-use
              </p>
            </div>
          )}

          {!isLoading && result && (
            <>
              {/* Summary */}
              <Card className="p-4">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">Analysis Summary</h3>
                    <p className="text-sm text-muted-foreground">{result.summary}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground mb-1">Overall Score</div>
                    <div className={`text-3xl font-bold ${getScoreColor(result.overallScore)}`}>
                      {result.overallScore}
                    </div>
                  </div>
                </div>
                
                <Separator className="my-3" />
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="text-muted-foreground">Critical Issues:</span>
                    <span className="font-semibold">{criticalIssues.length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-green-500" />
                    <span className="text-muted-foreground">Quick Wins:</span>
                    <span className="font-semibold">{quickWins.length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span className="text-muted-foreground">Analysis Time:</span>
                    <span className="font-semibold">{result.analysisTime}ms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {result.cacheHit ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-muted-foreground">Cached</span>
                        <Badge variant="secondary" className="text-xs">$0.00</Badge>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-purple-500" />
                        <span className="text-muted-foreground">Analysis Cost</span>
                        {result.tokenUsage && (
                          <Badge variant="secondary" className="text-xs">
                            ${result.tokenUsage.cost.toFixed(4)}
                          </Badge>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </Card>

              {/* Quick Wins Section */}
              {quickWins.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-5 h-5 text-green-500" />
                    <h3 className="font-semibold">Quick Wins ({quickWins.length})</h3>
                  </div>
                  <div className="space-y-3">
                    {quickWins.map((rec, idx) => (
                      <RecommendationCard key={rec.id} rec={rec} index={idx} />
                    ))}
                  </div>
                </div>
              )}

              {/* All Recommendations */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">
                    All Recommendations ({sortedRecommendations?.length || 0})
                  </h3>
                </div>
                <div className="space-y-3">
                  {sortedRecommendations?.map((rec, idx) => (
                    <RecommendationCard key={rec.id} rec={rec} index={idx} />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
