/**
 * File Analyzer Service
 * Analyzes uploaded documents to detect type, structure, and research methodology
 */

import { GoogleGenAI } from '@google/genai';
import { FILE_ANALYSIS_PROMPT } from '../prompts/fileAnalysisPrompt';

// Types
export interface FileAnalysis {
  documentType: 'qualitative_research' | 'quantitative_research' | 'mixed_methods' | 
                'essay' | 'literature_review' | 'technical_doc' | 'unknown';
  confidence: number;
  
  structure: {
    hasAbstract: boolean;
    hasMethodology: boolean;
    hasResults: boolean;
    hasConclusion: boolean;
    estimatedSections: string[];
  };
  
  researchIndicators?: {
    methodology: string | null;
    sampleSize: string | null;
    keyFindings: string[];
    dataType: 'numeric' | 'textual' | 'mixed';
  };
  
  summary: string;
  suggestedActions: string[];
}

// Use environment variable for API key
const getApiKey = (): string => {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key) {
    throw new Error('VITE_GEMINI_API_KEY is not configured');
  }
  return key;
};

/**
 * Extract section headers from text for better analysis
 */
function extractSectionHeaders(text: string): string[] {
  const headers: string[] = [];
  
  // Common academic section patterns
  const patterns = [
    /^#+\s*(.+)$/gm,                          // Markdown headers
    /^([A-Z][A-Z\s]{2,})$/gm,                 // ALL CAPS headers
    /^(\d+\.?\s*[A-Z][a-zA-Z\s]+)$/gm,        // Numbered headers (1. Introduction)
    /^([IVX]+\.?\s*[A-Z][a-zA-Z\s]+)$/gm,     // Roman numeral headers
  ];
  
  for (const pattern of patterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const header = match[1].trim();
      if (header.length > 2 && header.length < 100) {
        headers.push(header);
      }
    }
  }
  
  return [...new Set(headers)].slice(0, 15); // Dedupe and limit
}

/**
 * Prepare document excerpt for analysis
 * Takes first 2000 chars + detected headers
 */
function prepareExcerpt(text: string): string {
  const headers = extractSectionHeaders(text);
  const firstChunk = text.slice(0, 2000);
  
  let excerpt = firstChunk;
  
  if (headers.length > 0) {
    excerpt += '\n\n--- DETECTED SECTION HEADERS ---\n';
    excerpt += headers.join('\n');
  }
  
  return excerpt;
}

/**
 * Analyze a document and return structured analysis
 */
export async function analyzeDocument(text: string, _fileName: string): Promise<FileAnalysis> {
  try {
    const apiKey = getApiKey();
    const ai = new GoogleGenAI({ apiKey });
    
    const excerpt = prepareExcerpt(text);
    
    // Check for image data (Multimodal Analysis)
    const base64ImageMatch = text.match(/^data:image\/(png|jpeg|jpg|webp);base64,([^"'\s]+)/);
    
    let contentParts: any[] = [];
    
    if (base64ImageMatch) {
      // It's an image. Send as image part + prompt
      const mimeType = base64ImageMatch[1] === 'jpg' ? 'jpeg' : base64ImageMatch[1];
      const base64Data = base64ImageMatch[2];
      
      console.log(`[FileAnalyzer] Analyzing image document (${mimeType})`);
      
      contentParts = [
        {
          inlineData: {
            mimeType: `image/${mimeType}`,
            data: base64Data
          }
        },
        { text: FILE_ANALYSIS_PROMPT + "\n\n(This document is an image/screenshot. Analyze its visual contents.)" }
      ];
    } else {
      // Text document
      contentParts = [{ text: FILE_ANALYSIS_PROMPT + excerpt }];
    }
    
    // Use Gemini Flash Lite for fast, cheap analysis
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-lite',
      contents: [{ role: 'user', parts: contentParts }],
      config: {
        responseMimeType: 'application/json',
        temperature: 0.1, 
      }
    });

    const responseText = response.text?.trim() || '';
    
    // Parse JSON response
    let analysis: FileAnalysis;
    try {
      // Try to extract JSON if wrapped in code blocks
      let jsonStr = responseText;
      if (jsonStr.includes('```')) {
        const match = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (match) {
          jsonStr = match[1].trim();
        }
      }
      
      analysis = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse analysis JSON:', parseError);
      // Return default analysis on parse failure
      return getDefaultAnalysis();
    }
    
    // Validate and sanitize the response
    return sanitizeAnalysis(analysis);
    
  } catch (error) {
    console.error('Document analysis failed:', error);
    return getDefaultAnalysis();
  }
}

/**
 * Sanitize and validate analysis response
 */
function sanitizeAnalysis(raw: any): FileAnalysis {
  const validTypes = ['qualitative_research', 'quantitative_research', 'mixed_methods', 
                      'essay', 'literature_review', 'technical_doc', 'unknown'];
  
  return {
    documentType: validTypes.includes(raw.documentType) ? raw.documentType : 'unknown',
    confidence: typeof raw.confidence === 'number' ? Math.min(1, Math.max(0, raw.confidence)) : 0.5,
    structure: {
      hasAbstract: Boolean(raw.structure?.hasAbstract),
      hasMethodology: Boolean(raw.structure?.hasMethodology),
      hasResults: Boolean(raw.structure?.hasResults),
      hasConclusion: Boolean(raw.structure?.hasConclusion),
      estimatedSections: Array.isArray(raw.structure?.estimatedSections) 
        ? raw.structure.estimatedSections.slice(0, 10) 
        : []
    },
    researchIndicators: raw.researchIndicators ? {
      methodology: raw.researchIndicators.methodology || null,
      sampleSize: raw.researchIndicators.sampleSize || null,
      keyFindings: Array.isArray(raw.researchIndicators.keyFindings) 
        ? raw.researchIndicators.keyFindings.slice(0, 5) 
        : [],
      dataType: ['numeric', 'textual', 'mixed'].includes(raw.researchIndicators.dataType) 
        ? raw.researchIndicators.dataType 
        : 'mixed'
    } : undefined,
    summary: typeof raw.summary === 'string' ? raw.summary.slice(0, 500) : 'Analysis completed.',
    suggestedActions: Array.isArray(raw.suggestedActions) 
      ? raw.suggestedActions.slice(0, 5) 
      : ['Humanize this document', 'Summarize key points']
  };
}

/**
 * Get default analysis when LLM fails
 */
function getDefaultAnalysis(): FileAnalysis {
  return {
    documentType: 'unknown',
    confidence: 0,
    structure: {
      hasAbstract: false,
      hasMethodology: false,
      hasResults: false,
      hasConclusion: false,
      estimatedSections: []
    },
    summary: ``,
    suggestedActions: ['Humanize this document', 'Summarize key points', 'Paraphrase sections']
  };
}
