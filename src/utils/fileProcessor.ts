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
    
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    
    fullText += pageText + '\n\n';
  }
  
  return fullText.trim();
}

/**
 * Process DOCX files using mammoth
 */
async function processDocxFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
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
