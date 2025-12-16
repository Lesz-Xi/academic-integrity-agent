/**
 * File processor utility for Academic Integrity Agent
 * Supports: .txt, .md, .pdf, .docx
 */

import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Configure PDF.js worker with jsDelivr CDN (CORS-friendly)
// Using legacy build for browser compatibility
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.449/legacy/build/pdf.worker.min.mjs';

export interface FileProcessingResult {
  text: string;
  fileName: string;
  fileType: string;
  characterCount: number;
  error?: string;
}

/**
 * Main file processor function
 */
export async function processFile(file: File): Promise<FileProcessingResult> {
  const fileName = file.name;
  const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
  
  try {
    let extractedText = '';
    
    switch (fileExtension) {
      case 'txt':
      case 'md':
        extractedText = await processTextFile(file);
        break;
      case 'pdf':
        extractedText = await processPdfFile(file);
        break;
      case 'docx':
        extractedText = await processDocxFile(file);
        break;
      default:
        throw new Error(`Unsupported file type: .${fileExtension}`);
    }
    
    // Apply common text cleaning to all file types
    extractedText = cleanText(extractedText, fileExtension);
    
    return {
      text: extractedText,
      fileName,
      fileType: fileExtension,
      characterCount: extractedText.length
    };
    
  } catch (error) {
    return {
      text: '',
      fileName,
      fileType: fileExtension,
      characterCount: 0,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Clean up extracted text
 * Removes visual noise like leader dots from TOCs
 * @param text - The extracted text
 * @param fileType - The file extension (pdf, docx, txt, md)
 */
function cleanText(text: string, fileType: string): string {
  // 1. Remove leader dots and force newline after page numbers
  text = text.replace(/([\t ]*\.[\t ]*){3,}\s*(\d+)/g, ' $2\n');
  text = text.replace(/([\t ]*\.[\t ]*){3,}/g, ' ');

  // 2. Collapse multiple spaces into single space
  text = text.replace(/[ \t]+/g, ' ');
  
  // 3. Fix excessive newlines (max 2 consecutive)
  text = text.replace(/\n{3,}/g, '\n\n');
  
  // 4. Fix spaced "P a g e" artifact
  text = text.replace(/P\s+a\s+g\s+e/g, 'Page');

  // 5. Remove repetitive "Revision No" headers/footers
  text = text.replace(/Revision No:.*?Laboratory Manual\s*\d+\s*\|\s*Page[\r\n]*/gi, '\n');
  text = text.replace(/Revision No:.*?\|\s*Page[\r\n]*/gi, '\n');

  // 6. PDF-specific: Smart Header Detection (PDFs need more structure detection)
  if (fileType === 'pdf') {
    // Detect "End of sentence. HEADER Start of sentence" and add breaks
    text = text.replace(/([.!?])\s+([A-Z]{3,}(?: [A-Z]{3,})*)\s+([A-Z][a-z])/g, '$1\n\n$2\n$3');
    // Fix "Page X. INTRODUCTION" pattern
    text = text.replace(/(Page\s+[IVX0-9]+)\.\s+([A-Z]{3,})/g, '$1.\n\n$2');
    // Join orphaned Roman numerals with headers
    text = text.replace(/\n\s*([IVX]+\.)\s*\n+\s*([A-Z])/g, '\n$1 $2');
  }
  
  // 7. Clean up lines with only whitespace
  text = text.replace(/\n[ \t]+\n/g, '\n\n');
  
  // 8. Final cleanup - reduce excessive newlines
  text = text.replace(/\n{3,}/g, '\n\n');

  return text.trim();
}

/**
 * Process plain text and markdown files
 */
async function processTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target?.result as string;
      resolve(text);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Process PDF files using pdf.js
 */
async function processPdfFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  
  let fullText = '';
  
  // Extract text from each page
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    
    let pageText = '';
    let lastY: number | null = null;
    
    // Process each text item, detecting line breaks based on Y position
    for (const item of textContent.items as any[]) {
      if (!item.str) continue;
      
      // Get Y position from transform matrix (index 5 is the Y coordinate)
      const currentY = item.transform ? item.transform[5] : null;
      
      if (lastY !== null && currentY !== null) {
        // If Y position changed significantly (different line), add newline
        const yDiff = Math.abs(lastY - currentY);
        if (yDiff > 5) { // Threshold for line change
          pageText += '\n';
        } else if (item.str && !pageText.endsWith(' ') && !item.str.startsWith(' ')) {
          // Same line, add space between items if needed
          pageText += ' ';
        }
      }
      
      pageText += item.str;
      lastY = currentY;
    }
    
    fullText += pageText + '\n\n';
  }
  
  return fullText; // cleanText will handle trimming
}

/**
 * Process DOCX files using mammoth
 */
async function processDocxFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  // extracting raw text often misses structural whitespace.
  // Converting to HTML first preserves paragraphs as tags.
  const result = await mammoth.convertToHtml({ arrayBuffer });
  const html = result.value;
  
  // Convert HTML to text while preserving structure
  // 1. Handle list items - add bullet and newline for each item
  let text = html.replace(/<li[^>]*>/gi, '\n• ');
  text = text.replace(/<\/li>/gi, '');
  // 2. Remove list containers
  text = text.replace(/<\/?[ou]l[^>]*>/gi, '\n');
  
  // 3. Handle structure tags (tables, divs) to prevent text merging
  // Replace row/div closings with newline
  text = text.replace(/<\/(div|tr|blockquote)[^>]*>/gi, '\n');
  // Replace cell closings with space/tab
  text = text.replace(/<\/(td|th)[^>]*>/gi, ' \t ');
  
  // 4. Replace paragraph closings with SINGLE newline (matches Word's default spacing)
  text = text.replace(/<\/p>/gi, '\n');
  
  // 5. Replace hard breaks with single newline
  text = text.replace(/<br\s*\/?>/gi, '\n');
  
  // 6. Replace headings with double newline (section breaks)
  text = text.replace(/<\/h[1-6]>/gi, '\n\n');
  
  // 7. Strip all remaining tags
  text = text.replace(/<[^>]+>/g, '');
  
  // 8. Decode typical entities
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  
  return text; // cleanText will handle further cleaning and trimming
}

/**
 * Validate file size (max 10MB)
 */
export function validateFileSize(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size of 10MB`
    };
  }
  
  return { valid: true };
}

/**
 * Validate file type
 */
export function validateFileType(file: File): { valid: boolean; error?: string } {
  const allowedExtensions = ['txt', 'md', 'pdf', 'docx'];
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  if (!extension || !allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: `Unsupported file type. Allowed types: ${allowedExtensions.join(', ')}`
    };
  }
  
  return { valid: true };
}
