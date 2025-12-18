/**
 * File Analysis Prompt for Academic Document Detection
 * Uses Gemini Flash Lite for fast, cheap analysis
 */

export const FILE_ANALYSIS_PROMPT = `You are an academic document analyzer. Analyze the following document excerpt and return a structured JSON analysis.

CRITICAL: Return ONLY valid JSON. No markdown, no code blocks, no explanation - just the JSON object.

Detect:
1. Document type (qualitative_research, quantitative_research, mixed_methods, essay, literature_review, technical_doc, unknown)
2. Research methodology indicators
3. Key structural sections present
4. 2-3 sentence summary
5. 3-4 suggested actions for the user

Research Type Detection Guidelines:
- QUANTITATIVE: Statistical analysis, surveys, experiments, numerical data, sample sizes (n=X), p-values, regression, ANOVA, t-tests, chi-square, correlation coefficients
- QUALITATIVE: Interviews, focus groups, thematic analysis, coding, grounded theory, phenomenology, narrative analysis, case studies, ethnography
- MIXED METHODS: Combination of both approaches, triangulation, sequential/concurrent design, pragmatist paradigm

JSON Schema (follow exactly):
{
  "documentType": "quantitative_research|qualitative_research|mixed_methods|essay|literature_review|technical_doc|unknown",
  "confidence": 0.0-1.0,
  "structure": {
    "hasAbstract": true/false,
    "hasMethodology": true/false,
    "hasResults": true/false,
    "hasConclusion": true/false,
    "estimatedSections": ["Introduction", "Literature Review", etc.]
  },
  "researchIndicators": {
    "methodology": "Survey/Interviews/Experiment/Statistical Analysis/etc. or null",
    "sampleSize": "n=150 or 12 participants or null",
    "keyFindings": ["Finding 1", "Finding 2", "Finding 3"],
    "dataType": "numeric|textual|mixed"
  },
  "summary": "2-3 sentence summary of the document",
  "suggestedActions": ["Paraphrase the methodology section", "Summarize key findings", "Humanize the writing style", "Expand the discussion"]
}

DOCUMENT EXCERPT:
`;

export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  quantitative_research: '📊 Quantitative Research',
  qualitative_research: '📝 Qualitative Research',
  mixed_methods: '🔀 Mixed Methods',
  essay: '✍️ Essay/Argument',
  literature_review: '📚 Literature Review',
  technical_doc: '💻 Technical Documentation',
  unknown: '📄 Document'
};

export const DOCUMENT_TYPE_COLORS: Record<string, string> = {
  quantitative_research: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  qualitative_research: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  mixed_methods: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  essay: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  literature_review: 'bg-green-500/20 text-green-400 border-green-500/30',
  technical_doc: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  unknown: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
};
