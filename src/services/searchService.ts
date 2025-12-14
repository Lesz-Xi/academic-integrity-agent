// Search Service with MCTS Source Selection
// Uses Serper.dev API for web search and Monte Carlo Tree Search for intelligent source selection

import { serperRateLimiter, checkRateLimit } from '../utils/rateLimiter';

const SERPER_API_KEY = import.meta.env.VITE_SERPER_API_KEY;
const SERPER_API_URL = 'https://google.serper.dev/search';

export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  position: number;
  domain: string;
}

export interface ScoredSource extends SearchResult {
  score: number;
  visits: number;
  informativeness: number;
  essentiality: number;
  comprehensiveness: number;
}

export interface SearchContext {
  sources: ScoredSource[];
  query: string;
  formattedContext: string;
}

/**
 * Check if search is available (API key configured)
 */
export function isSearchAvailable(): boolean {
  return !!SERPER_API_KEY && SERPER_API_KEY.length > 0;
}

/**
 * Search the web using Serper.dev API
 */
export async function searchWeb(query: string, numResults: number = 10): Promise<SearchResult[]> {
  if (!isSearchAvailable()) {
    console.warn('[SearchService] No API key configured');
    return [];
  }

  // Check rate limit before making API call
  checkRateLimit(serperRateLimiter, 'Serper Search API');

  try {
    const response = await fetch(SERPER_API_URL, {
      method: 'POST',
      headers: {
        'X-API-KEY': SERPER_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: query,
        num: numResults,
      }),
    });

    if (!response.ok) {
      throw new Error(`Search API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Parse organic results
    const results: SearchResult[] = (data.organic || []).map((item: any, index: number) => ({
      title: item.title || '',
      link: item.link || '',
      snippet: item.snippet || '',
      position: index + 1,
      domain: new URL(item.link || 'https://unknown.com').hostname,
    }));

    console.log(`[SearchService] Found ${results.length} results for "${query}"`);
    return results;
  } catch (error) {
    console.error('[SearchService] Search failed:', error);
    return [];
  }
}

/**
 * MCTS Node for source evaluation
 */
class MCTSNode {
  source: SearchResult;
  visits: number = 0;
  totalScore: number = 0;
  informativeness: number = 0;
  essentiality: number = 0;
  comprehensiveness: number = 0;

  constructor(source: SearchResult) {
    this.source = source;
  }

  get averageScore(): number {
    return this.visits > 0 ? this.totalScore / this.visits : 0;
  }

  // UCB1 formula for selection
  ucb1(totalVisits: number, explorationConstant: number = 1.414): number {
    if (this.visits === 0) return Infinity;
    return this.averageScore + explorationConstant * Math.sqrt(Math.log(totalVisits) / this.visits);
  }
}

/**
 * Evaluate source quality based on multiple criteria
 */
function evaluateSource(source: SearchResult, query: string): { informativeness: number; essentiality: number; comprehensiveness: number } {
  const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
  const titleLower = source.title.toLowerCase();
  const snippetLower = source.snippet.toLowerCase();
  const combined = titleLower + ' ' + snippetLower;

  // Informativeness: Does it contain factual indicators?
  const factIndicators = ['study', 'research', 'data', 'percent', 'million', 'billion', 'report', 'analysis', 'found', 'showed', 'according'];
  const factScore = factIndicators.filter(f => combined.includes(f)).length / factIndicators.length;
  
  // Essentiality: How relevant is it to the query?
  const matchedTerms = queryTerms.filter(term => combined.includes(term)).length;
  const relevanceScore = queryTerms.length > 0 ? matchedTerms / queryTerms.length : 0;
  
  // Comprehensiveness: Length and depth indicators
  const depthIndicators = ['comprehensive', 'complete', 'guide', 'overview', 'explained', 'detail', 'in-depth', 'analysis'];
  const depthScore = depthIndicators.filter(d => combined.includes(d)).length / depthIndicators.length;
  const lengthScore = Math.min(source.snippet.length / 300, 1); // Longer snippets = more comprehensive
  
  // Domain authority bonus
  const authorityDomains = ['.edu', '.gov', '.org', 'nature.com', 'sciencedirect', 'ieee', 'acm.org', 'springer'];
  const hasAuthority = authorityDomains.some(d => source.domain.includes(d) || source.link.includes(d));
  const authorityBonus = hasAuthority ? 0.2 : 0;

  return {
    informativeness: Math.min(factScore + authorityBonus + 0.3, 1),
    essentiality: Math.min(relevanceScore + 0.2, 1),
    comprehensiveness: Math.min((depthScore + lengthScore) / 2 + 0.2, 1),
  };
}

/**
 * Monte Carlo Tree Search for source selection
 */
export function mctsSelectSources(
  sources: SearchResult[],
  query: string,
  iterations: number = 100,
  topK: number = 5
): ScoredSource[] {
  if (sources.length === 0) return [];
  if (sources.length <= topK) {
    // If we have fewer sources than needed, return all with basic scoring
    return sources.map(s => {
      const scores = evaluateSource(s, query);
      return {
        ...s,
        score: (scores.informativeness + scores.essentiality + scores.comprehensiveness) / 3,
        visits: 1,
        ...scores,
      };
    });
  }

  // Initialize nodes
  const nodes: MCTSNode[] = sources.map(s => new MCTSNode(s));
  let totalVisits = 0;

  // MCTS iterations
  for (let i = 0; i < iterations; i++) {
    // SELECTION: Choose node with highest UCB1
    let selectedNode = nodes[0];
    let bestUCB = -Infinity;
    
    for (const node of nodes) {
      const ucb = node.ucb1(totalVisits + 1);
      if (ucb > bestUCB) {
        bestUCB = ucb;
        selectedNode = node;
      }
    }

    // EXPANSION & SIMULATION: Evaluate the source
    const scores = evaluateSource(selectedNode.source, query);
    
    // Combined score with slight randomness for exploration
    const randomFactor = 0.9 + Math.random() * 0.2; // 0.9 to 1.1
    const simulationScore = (
      scores.informativeness * 0.35 +
      scores.essentiality * 0.40 +
      scores.comprehensiveness * 0.25
    ) * randomFactor;

    // BACKPROPAGATION: Update node statistics
    selectedNode.visits++;
    selectedNode.totalScore += simulationScore;
    selectedNode.informativeness = scores.informativeness;
    selectedNode.essentiality = scores.essentiality;
    selectedNode.comprehensiveness = scores.comprehensiveness;
    totalVisits++;
  }

  // Select top K sources by average score
  const scoredSources: ScoredSource[] = nodes
    .map(node => ({
      ...node.source,
      score: node.averageScore,
      visits: node.visits,
      informativeness: node.informativeness,
      essentiality: node.essentiality,
      comprehensiveness: node.comprehensiveness,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  console.log('[SearchService] MCTS selected sources:', scoredSources.map(s => ({
    title: s.title.substring(0, 50),
    score: s.score.toFixed(3),
    visits: s.visits,
  })));

  return scoredSources;
}

/**
 * Full search pipeline: search → MCTS select → format context
 */
export async function searchAndSelectSources(
  query: string,
  numResults: number = 10,
  topK: number = 5,
  mctsIterations: number = 100
): Promise<SearchContext | null> {
  if (!isSearchAvailable()) {
    return null;
  }

  // Search web
  const results = await searchWeb(query, numResults);
  if (results.length === 0) {
    return null;
  }

  // MCTS selection
  const selectedSources = mctsSelectSources(results, query, mctsIterations, topK);

  // Format context for prompt injection
  const formattedContext = formatSourcesForPrompt(selectedSources);

  return {
    sources: selectedSources,
    query,
    formattedContext,
  };
}

/**
 * Format sources for injection into the prompt
 */
function formatSourcesForPrompt(sources: ScoredSource[]): string {
  if (sources.length === 0) return '';

  let context = '## RESEARCH SOURCES (Use these for citations)\n\n';
  
  sources.forEach((source, index) => {
    context += `[${index + 1}] "${source.title}"\n`;
    context += `    Source: ${source.domain}\n`;
    context += `    URL: ${source.link}\n`;
    context += `    Summary: ${source.snippet}\n\n`;
  });

  context += `\nWhen writing, cite these sources using [1], [2], etc. format.\n`;
  context += `Include a "Sources:" section at the end listing the cited references.\n`;

  return context;
}

/**
 * Format sources for display in UI
 */
export function formatSourcesForDisplay(sources: ScoredSource[]): string {
  if (sources.length === 0) return '';

  let output = '\n\n---\n**Sources:**\n';
  sources.forEach((source, index) => {
    output += `[${index + 1}] "${source.title}" - ${source.domain}\n`;
  });

  return output;
}
