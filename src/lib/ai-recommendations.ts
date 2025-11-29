/**
 * AI-Powered Architecture Recommendations
 * Using Claude Sonnet 4.5 with intelligent caching
 */

import type { Node, Edge } from '@xyflow/react';

// Cache configuration
const CACHE_KEY = 'ai_recommendations_cache';
const CACHE_TTL_DAYS = 30;
const CACHE_VERSION = '2.0'; // v2.0: Added affectedComponents field

// AI configuration
const AI_CONFIG = {
  model: 'claude-sonnet-4-5-20250929',
  maxTokens: 8000,  // Increased to allow full detailed responses
  temperature: 0.7,
};

// Types
export interface AIRecommendation {
  id: string;
  category: 'security' | 'performance' | 'cost' | 'reliability' | 'architecture';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  impact: string;
  solution: string;
  estimatedCost?: string;
  priority: number;
  quickWin?: boolean;
  affectedComponents?: string[]; // Component IDs or types affected by this recommendation
}

export interface AIAnalysisResult {
  recommendations: AIRecommendation[];
  summary: string;
  overallScore: number; // 0-100
  cacheHit: boolean;
  analysisTime: number; // milliseconds
  tokenUsage?: {
    input: number;
    output: number;
    cost: number;
  };
}

interface CachedAnalysis {
  patternKey: string;
  result: AIAnalysisResult;
  timestamp: number;
  hitCount: number;
  version: string;
}

interface CacheStats {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  totalTokens: number;
  estimatedCost: number;
}

// Proxy endpoint for API calls - use relative path to avoid CORS
const PROXY_ENDPOINT = '/api/anthropic';

/**
 * Generate cache key from diagram structure
 */
function generateCacheKey(nodes: Node[], edges: Edge[]): string {
  // Extract component types and sort for consistency
  const componentTypes = nodes
    .map(n => n.data?.type || 'unknown')
    .sort()
    .join('_');
  
  // Extract zones
  const zones = [...new Set(nodes.map(n => n.data?.zone || 'none'))]
    .sort()
    .join('_');
  
  // Count connections
  const connectionCount = edges.length;
  
  // Count nodes by type
  const nodeCount = nodes.length;
  
  // Create fingerprint
  const fingerprint = `${nodeCount}_${componentTypes}_${connectionCount}_${zones}`;
  
  // Hash to reasonable length
  return `pattern_${simpleHash(fingerprint)}`;
}

/**
 * Simple hash function for cache keys
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Get cache from localStorage
 */
function getCache(): Map<string, CachedAnalysis> {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return new Map();
    
    const data = JSON.parse(cached);
    return new Map(Object.entries(data));
  } catch (error) {
    console.error('Failed to load cache:', error);
    return new Map();
  }
}

/**
 * Save cache to localStorage
 */
function saveCache(cache: Map<string, CachedAnalysis>): void {
  try {
    const data = Object.fromEntries(cache);
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save cache:', error);
  }
}

/**
 * Get cached analysis if available and not expired
 */
function getCachedAnalysis(cacheKey: string): AIAnalysisResult | null {
  const cache = getCache();
  const cached = cache.get(cacheKey);
  
  if (!cached) return null;
  
  // Check if expired
  const age = Date.now() - cached.timestamp;
  const maxAge = CACHE_TTL_DAYS * 24 * 60 * 60 * 1000;
  
  if (age > maxAge) {
    // Expired, remove from cache
    cache.delete(cacheKey);
    saveCache(cache);
    return null;
  }
  
  // Check version
  if (cached.version !== CACHE_VERSION) {
    cache.delete(cacheKey);
    saveCache(cache);
    return null;
  }
  
  // Update hit count
  cached.hitCount++;
  cache.set(cacheKey, cached);
  saveCache(cache);
  
  // Update stats
  updateCacheStats('hit');
  
  return {
    ...cached.result,
    cacheHit: true,
  };
}

/**
 * Save analysis to cache
 */
function cacheAnalysis(cacheKey: string, result: AIAnalysisResult): void {
  const cache = getCache();
  
  cache.set(cacheKey, {
    patternKey: cacheKey,
    result,
    timestamp: Date.now(),
    hitCount: 0,
    version: CACHE_VERSION,
  });
  
  // Limit cache size (keep 1000 most recent)
  if (cache.size > 1000) {
    const entries = Array.from(cache.entries())
      .sort((a, b) => b[1].timestamp - a[1].timestamp)
      .slice(0, 1000);
    cache.clear();
    entries.forEach(([key, value]) => cache.set(key, value));
  }
  
  saveCache(cache);
}

/**
 * Update cache statistics
 */
function updateCacheStats(type: 'hit' | 'miss', tokens?: { input: number; output: number }): void {
  try {
    const stats = getCacheStats();
    stats.totalRequests++;
    
    if (type === 'hit') {
      stats.cacheHits++;
    } else {
      stats.cacheMisses++;
      if (tokens) {
        stats.totalTokens += tokens.input + tokens.output;
        // Pricing: $3/M input, $15/M output
        stats.estimatedCost += (tokens.input / 1000000 * 3) + (tokens.output / 1000000 * 15);
      }
    }
    
    localStorage.setItem('ai_cache_stats', JSON.stringify(stats));
  } catch (error) {
    console.error('Failed to update cache stats:', error);
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats(): CacheStats {
  try {
    const stats = localStorage.getItem('ai_cache_stats');
    if (!stats) {
      return {
        totalRequests: 0,
        cacheHits: 0,
        cacheMisses: 0,
        totalTokens: 0,
        estimatedCost: 0,
      };
    }
    return JSON.parse(stats);
  } catch (error) {
    return {
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      totalTokens: 0,
      estimatedCost: 0,
    };
  }
}

/**
 * Clear cache
 */
export function clearCache(): void {
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem('ai_cache_stats');
}

/**
 * Build prompt for Claude
 */
function buildPrompt(nodes: Node[], edges: Edge[]): string {
  // Serialize architecture
  const architecture = {
    components: nodes.map(n => ({
      id: n.id,
      type: n.data?.type || 'unknown',
      label: n.data?.label || 'Unknown',
      zone: n.data?.zone || 'unknown',
    })),
    connections: edges.map(e => ({
      from: e.source,
      to: e.target,
      protocol: e.data?.protocol || 'unknown',
      port: e.data?.port,
    })),
    stats: {
      totalComponents: nodes.length,
      totalConnections: edges.length,
      zones: [...new Set(nodes.map(n => n.data?.zone))],
    },
  };

  return `You are an expert cloud architect specializing in AWS, Azure, and GCP. Analyze this architecture diagram and provide actionable recommendations.

ARCHITECTURE:
${JSON.stringify(architecture, null, 2)}

Provide recommendations in the following JSON format (valid JSON only, no markdown):
{
  "summary": "Brief 2-3 sentence overview of the architecture's strengths and weaknesses",
  "overallScore": 75,
  "recommendations": [
    {
      "id": "unique-id",
      "category": "security|performance|cost|reliability|architecture",
      "severity": "critical|high|medium|low|info",
      "title": "Short actionable title",
      "description": "Detailed explanation of the issue",
      "impact": "What happens if not fixed",
      "solution": "Specific steps to fix",
      "estimatedCost": "$50/month additional" (optional),
      "priority": 1-10,
      "quickWin": true/false,
      "affectedComponents": ["component-id-1", "component-id-2"] (use component IDs from the architecture above, or component types like "database", "web-server" if specific components cannot be identified)
    }
  ]
}

GUIDELINES:
- Focus on ACTIONABLE recommendations with specific implementation steps
- Include cost estimates where relevant
- Prioritize by impact (1=highest, 10=lowest)
- Mark quick wins (< 1 hour, low cost, high impact)
- Consider security, performance, cost, and reliability
- Reference AWS Well-Architected Framework where applicable
- Be specific about instance types, services, configurations
- Limit to 8-12 most important recommendations
- Keep descriptions concise but actionable
- In affectedComponents, list the specific component IDs from the architecture (e.g., matching the "id" field of components), or use component types (e.g., "database", "web-server") if the recommendation applies to all components of that type

Return ONLY the JSON object, no additional text or markdown formatting.`;
}

/**
 * Parse Claude's response
 */
function parseClaudeResponse(response: string): { recommendations: AIRecommendation[]; summary: string; overallScore: number } {
  try {
    console.log('🔍 Parsing response, length:', response.length);
    console.log('🔍 First 500 chars of raw response:', response.substring(0, 500));
    
    // Remove markdown code blocks if present
    let cleaned = response.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.substring(7);
    }
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.substring(3);
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.substring(0, cleaned.length - 3);
    }
    cleaned = cleaned.trim();
    
    console.log('🔍 Cleaned response length:', cleaned.length);
    console.log('🔍 First 500 chars of cleaned:', cleaned.substring(0, 500));
    
    const parsed = JSON.parse(cleaned);
    console.log('✅ Parse successful! Recommendations count:', parsed.recommendations?.length);
    
    return {
      recommendations: parsed.recommendations || [],
      summary: parsed.summary || 'Analysis complete',
      overallScore: parsed.overallScore || 70,
    };
  } catch (error) {
    console.error('❌ Failed to parse Claude response:', error);
    console.error('❌ Response was:', response);
    throw new Error('Failed to parse AI response. Please try again.');
  }
}

/**
 * Main function: Get AI recommendations with caching
 */
export async function getAIRecommendations(
  nodes: Node[],
  edges: Edge[]
): Promise<AIAnalysisResult> {
  const startTime = Date.now();
  
  // Validate input
  if (!nodes || nodes.length === 0) {
    throw new Error('No components in diagram to analyze');
  }
  
  // Generate cache key
  const cacheKey = generateCacheKey(nodes, edges);
  
  // Check cache first
  const cached = getCachedAnalysis(cacheKey);
  if (cached) {
    console.log('✅ Cache HIT - Instant result');
    return {
      ...cached,
      analysisTime: Date.now() - startTime,
    };
  }
  
  console.log('❌ Cache MISS - Calling Claude API via proxy...');
  console.log('📍 Proxy endpoint:', PROXY_ENDPOINT);
  console.log('🔧 Request config:', {
    model: AI_CONFIG.model,
    max_tokens: AI_CONFIG.maxTokens,
    temperature: AI_CONFIG.temperature
  });
  
  // Call Claude API via proxy
  try {
    const prompt = buildPrompt(nodes, edges);
    
    console.log('🚀 Sending request to proxy...');
    
    // Call proxy endpoint
    const response = await fetch(PROXY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: AI_CONFIG.model,
        max_tokens: AI_CONFIG.maxTokens,
        temperature: AI_CONFIG.temperature,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });
    
    console.log('📨 Response status:', response.status);
    console.log('📨 Response ok:', response.ok);
    
    if (!response.ok) {
      const error = await response.json();
      console.error('❌ API returned error:', error);
      throw new Error(error.error || 'API call failed');
    }
    
    const message = await response.json();
    console.log('📨 Full response:', message);
    console.log('📨 Message content:', message.content);
    
    // Extract response
    const responseText = message.content[0]?.type === 'text' 
      ? message.content[0].text 
      : '';
    
    console.log('📨 Extracted text length:', responseText.length);
    console.log('📨 First 200 chars:', responseText.substring(0, 200));
    
    // Parse response
    const parsed = parseClaudeResponse(responseText);
    
    // Calculate token usage and cost
    const tokenUsage = {
      input: message.usage?.input_tokens || 0,
      output: message.usage?.output_tokens || 0,
      cost: ((message.usage?.input_tokens || 0) / 1000000 * 3) + ((message.usage?.output_tokens || 0) / 1000000 * 15),
    };
    
    // Update stats
    updateCacheStats('miss', { 
      input: message.usage?.input_tokens || 0, 
      output: message.usage?.output_tokens || 0
    });
    
    // Build result
    const result: AIAnalysisResult = {
      recommendations: parsed.recommendations,
      summary: parsed.summary,
      overallScore: parsed.overallScore,
      cacheHit: false,
      analysisTime: Date.now() - startTime,
      tokenUsage,
    };
    
    // Cache for next time
    cacheAnalysis(cacheKey, result);
    
    console.log(`✅ Analysis complete in ${result.analysisTime}ms`);
    console.log(`💰 Cost: $${tokenUsage.cost.toFixed(4)}`);
    
    return result;
    
  } catch (error: any) {
    console.error('❌ CAUGHT ERROR in getAIRecommendations:', error);
    console.error('❌ Error type:', error.constructor.name);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error status:', error.status);
    console.error('❌ Full error object:', JSON.stringify(error, null, 2));
    
    // Check for CORS error
    if (error.message && error.message.includes('CORS')) {
      throw new Error('CORS Error: Browser cannot call Anthropic API directly. Please set up a backend proxy or use the demo mode.');
    }
    
    if (error.status === 401) {
      throw new Error('Invalid API key. Please check your Anthropic API key in .env file.');
    } else if (error.status === 429) {
      throw new Error('Rate limit exceeded. Please try again in a moment.');
    } else if (error.status === 500) {
      throw new Error('Anthropic API error. Please try again.');
    } else if (!error.status) {
      // Network error or CORS
      throw new Error(`Network/Fetch Error: ${error.message || 'Unknown error'}. Check console for details.`);
    } else {
      throw new Error(`Failed to get AI recommendations: ${error.message}`);
    }
  }
}

/**
 * Get quick recommendations (cached only, no API call)
 */
export function getQuickRecommendations(nodes: Node[], edges: Edge[]): AIAnalysisResult | null {
  const cacheKey = generateCacheKey(nodes, edges);
  return getCachedAnalysis(cacheKey);
}

/**
 * Check if analysis is available in cache
 */
export function hasAnalysisInCache(nodes: Node[], edges: Edge[]): boolean {
  const cacheKey = generateCacheKey(nodes, edges);
  return getCachedAnalysis(cacheKey) !== null;
}

/**
 * Generate demo recommendations (fallback when API unavailable)
 */
export function getDemoRecommendations(nodes: Node[], edges: Edge[]): AIAnalysisResult {
  const hasDatabase = nodes.some(n => n.data?.type?.toLowerCase().includes('rds') || n.data?.type?.toLowerCase().includes('database'));
  const hasLoadBalancer = nodes.some(n => n.data?.type?.toLowerCase().includes('alb') || n.data?.type?.toLowerCase().includes('load'));
  const hasVPC = nodes.some(n => n.data?.type?.toLowerCase().includes('vpc'));
  
  const recommendations: AIRecommendation[] = [
    {
      id: 'demo-1',
      category: 'security',
      severity: 'critical',
      title: 'Enable Multi-AZ for Database',
      description: 'Your database appears to be running in a single availability zone, creating a single point of failure.',
      impact: 'If the AZ fails, your database will be unavailable, causing application downtime and potential data loss.',
      solution: 'Enable Multi-AZ deployment in RDS settings. This creates a synchronous standby replica in a different AZ with automatic failover. Takes ~10 minutes to enable with no downtime.',
      estimatedCost: '+$45/month (doubles DB cost)',
      priority: 1,
      quickWin: false,
    },
    {
      id: 'demo-2',
      category: 'performance',
      severity: 'high',
      title: 'Add Auto Scaling for Compute Layer',
      description: 'Static EC2 instances cannot handle traffic spikes, leading to performance degradation or downtime.',
      impact: 'During traffic spikes, users will experience slow response times or errors. Manual scaling is slow and error-prone.',
      solution: 'Create an Auto Scaling Group with min=2, desired=2, max=6 instances. Add scaling policies based on CPU (>70%) and ALB request count (>1000). Configure health checks.',
      estimatedCost: '+$15-90/month depending on traffic',
      priority: 2,
      quickWin: false,
    },
    {
      id: 'demo-3',
      category: 'security',
      severity: 'high',
      title: 'Implement Network Segmentation',
      description: 'Components in the same network segment can communicate freely, violating the principle of least privilege.',
      impact: 'If one component is compromised, attackers can pivot to other resources. Compliance frameworks (PCI-DSS, HIPAA) require network isolation.',
      solution: 'Create separate subnets: Public (ALB), Private (App), Isolated (DB). Use Security Groups to allow only necessary traffic: ALB→App (443), App→DB (3306). Add NACLs for defense in depth.',
      estimatedCost: '$0 (AWS native feature)',
      priority: 3,
      quickWin: true,
    },
    {
      id: 'demo-4',
      category: 'cost',
      severity: 'medium',
      title: 'Use Reserved Instances for Baseline Load',
      description: 'On-Demand instances cost 3x more than Reserved Instances for predictable workloads.',
      impact: 'Overpaying ~$200/month for instances that run 24/7.',
      solution: 'Purchase 1-year Reserved Instances for baseline capacity (min instances in ASG). Keep On-Demand for scaling. Commit to t3.medium for web tier, db.t3.small for DB.',
      estimatedCost: '-$200/month savings (65% discount)',
      priority: 4,
      quickWin: true,
    },
    {
      id: 'demo-5',
      category: 'reliability',
      severity: 'medium',
      title: 'Add CloudWatch Alarms and SNS Notifications',
      description: 'No monitoring means you learn about issues from angry users, not proactive alerts.',
      impact: 'Delayed incident response, longer MTTR (Mean Time To Recovery), poor customer experience.',
      solution: 'Create CloudWatch alarms: CPU>80%, Disk>85%, HealthyHostCount<2, DBConnections>80. Send to SNS topic → email/Slack. Add CloudWatch dashboard for visibility.',
      estimatedCost: '$5-10/month',
      priority: 5,
      quickWin: true,
    },
    {
      id: 'demo-6',
      category: 'architecture',
      severity: 'low',
      title: 'Implement Caching Layer with ElastiCache',
      description: 'Every request hits the database, causing unnecessary load and slow response times.',
      impact: 'Database becomes bottleneck at scale. Higher RDS costs. Slower page loads (300ms+ vs 10ms with cache).',
      solution: 'Add ElastiCache Redis cluster (cache.t3.micro for dev). Cache frequently accessed data: user sessions, product catalogs, API responses. Use cache-aside pattern.',
      estimatedCost: '+$15/month',
      priority: 6,
      quickWin: false,
    },
  ];

  return {
    recommendations: recommendations.slice(0, Math.min(6, Math.max(3, nodes.length / 3))),
    summary: `Analyzed ${nodes.length} components and ${edges.length} connections. Found ${recommendations.length} recommendations across security, performance, cost, and reliability. Priority focus: Enable Multi-AZ for databases and implement proper network segmentation.`,
    overallScore: 65,
    cacheHit: false,
    analysisTime: 50,
  };
}
