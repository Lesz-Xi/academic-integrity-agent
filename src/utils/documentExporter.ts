/**
 * Document Export Utilities for Academic Integrity Agent
 * Exports generated content to DOCX and PDF formats
 */

import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';

interface ParsedBlock {
  type: 'heading1' | 'heading2' | 'heading3' | 'paragraph' | 'list-item' | 'code' | 'blockquote' | 'hr';
  content: string;
  level?: number;
}

/**
 * Parse markdown text into structured blocks
 */
function parseMarkdown(text: string): ParsedBlock[] {
  const lines = text.split('\n');
  const blocks: ParsedBlock[] = [];
  let inCodeBlock = false;
  let codeContent = '';

  for (const line of lines) {
    // Handle code blocks
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        blocks.push({ type: 'code', content: codeContent.trim() });
        codeContent = '';
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeContent += line + '\n';
      continue;
    }

    // Skip empty lines
    if (!line.trim()) continue;

    // Headers
    if (line.startsWith('### ')) {
      blocks.push({ type: 'heading3', content: line.slice(4) });
    } else if (line.startsWith('## ')) {
      blocks.push({ type: 'heading2', content: line.slice(3) });
    } else if (line.startsWith('# ')) {
      blocks.push({ type: 'heading1', content: line.slice(2) });
    }
    // Horizontal rule
    else if (line.match(/^---+$/)) {
      blocks.push({ type: 'hr', content: '' });
    }
    // Blockquote
    else if (line.startsWith('> ')) {
      blocks.push({ type: 'blockquote', content: line.slice(2) });
    }
    // List items
    else if (line.match(/^[\*\-] /)) {
      blocks.push({ type: 'list-item', content: line.slice(2) });
    } else if (line.match(/^\d+\. /)) {
      blocks.push({ type: 'list-item', content: line.replace(/^\d+\. /, '') });
    }
    // Regular paragraph
    else {
      blocks.push({ type: 'paragraph', content: line });
    }
  }

  return blocks;
}

/**
 * Parse inline formatting (bold, italic) and return TextRun array
 */
function parseInlineFormatting(text: string): TextRun[] {
  const runs: TextRun[] = [];
  
  // Simple approach: split by bold markers first, then italic
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_)/g);
  
  for (const part of parts) {
    if (!part) continue;
    
    if (part.startsWith('**') && part.endsWith('**')) {
      runs.push(new TextRun({ text: part.slice(2, -2), bold: true }));
    } else if ((part.startsWith('*') && part.endsWith('*')) || (part.startsWith('_') && part.endsWith('_'))) {
      runs.push(new TextRun({ text: part.slice(1, -1), italics: true }));
    } else {
      runs.push(new TextRun({ text: part }));
    }
  }
  
  return runs.length > 0 ? runs : [new TextRun({ text })];
}

/**
 * Export content to DOCX format
 */
export async function exportToDocx(text: string, filename: string = 'generated-content'): Promise<void> {
  const blocks = parseMarkdown(text);
  const children: Paragraph[] = [];

  for (const block of blocks) {
    switch (block.type) {
      case 'heading1':
        children.push(new Paragraph({
          children: parseInlineFormatting(block.content),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        }));
        break;
        
      case 'heading2':
        children.push(new Paragraph({
          children: parseInlineFormatting(block.content),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 150 },
        }));
        break;
        
      case 'heading3':
        children.push(new Paragraph({
          children: parseInlineFormatting(block.content),
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 100 },
        }));
        break;
        
      case 'paragraph':
        children.push(new Paragraph({
          children: parseInlineFormatting(block.content),
          spacing: { after: 200 },
        }));
        break;
        
      case 'list-item':
        children.push(new Paragraph({
          children: [new TextRun({ text: '• ' }), ...parseInlineFormatting(block.content)],
          indent: { left: 720 }, // 0.5 inch
          spacing: { after: 100 },
        }));
        break;
        
      case 'blockquote':
        children.push(new Paragraph({
          children: parseInlineFormatting(block.content),
          indent: { left: 720 },
          spacing: { after: 200 },
          style: 'Quote',
        }));
        break;
        
      case 'code':
        children.push(new Paragraph({
          children: [new TextRun({ text: block.content, font: 'Courier New', size: 20 })],
          spacing: { before: 200, after: 200 },
        }));
        break;
        
      case 'hr':
        children.push(new Paragraph({
          children: [new TextRun({ text: '─'.repeat(50) })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 300, after: 300 },
        }));
        break;
    }
  }

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: 'Arial',
            size: 24, // 12pt
          },
        },
        heading1: {
          run: {
            font: 'Arial',
            size: 32,
            bold: true,
            color: '000000',
          },
        },
        heading2: {
          run: {
            font: 'Arial',
            size: 28,
            bold: true,
            color: '000000',
          },
        },
        heading3: {
          run: {
            font: 'Arial',
            size: 24,
            bold: true,
            color: '000000',
          },
        },
      },
    },
    sections: [{
      properties: {},
      children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${filename}.docx`);
}

/**
 * Export content to PDF format
 */
export async function exportToPdf(text: string, filename: string = 'generated-content'): Promise<void> {
  const blocks = parseMarkdown(text);
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;
  let y = margin;
  const lineHeight = 6;

  const addNewPageIfNeeded = (height: number) => {
    if (y + height > pageHeight - margin) {
      pdf.addPage();
      y = margin;
    }
  };

  for (const block of blocks) {
    switch (block.type) {
      case 'heading1':
        addNewPageIfNeeded(12);
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.text(block.content, margin, y);
        y += 12;
        break;

      case 'heading2':
        addNewPageIfNeeded(10);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text(block.content, margin, y);
        y += 10;
        break;

      case 'heading3':
        addNewPageIfNeeded(8);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(block.content, margin, y);
        y += 8;
        break;

      case 'paragraph': {
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        // Clean markdown formatting for PDF (strip ** and *)
        const cleanText = block.content.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1');
        const lines = pdf.splitTextToSize(cleanText, maxWidth);
        for (const line of lines) {
          addNewPageIfNeeded(lineHeight);
          pdf.text(line, margin, y);
          y += lineHeight;
        }
        y += 2; // Extra spacing after paragraph
        break;
      }

      case 'list-item': {
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        const cleanText = block.content.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1');
        const lines = pdf.splitTextToSize(`• ${cleanText}`, maxWidth - 10);
        for (let i = 0; i < lines.length; i++) {
          addNewPageIfNeeded(lineHeight);
          pdf.text(lines[i], margin + (i === 0 ? 0 : 5), y);
          y += lineHeight;
        }
        break;
      }

      case 'blockquote': {
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'italic');
        const lines = pdf.splitTextToSize(block.content, maxWidth - 20);
        for (const line of lines) {
          addNewPageIfNeeded(lineHeight);
          pdf.text(line, margin + 10, y);
          y += lineHeight;
        }
        y += 2;
        break;
      }

      case 'code': {
        addNewPageIfNeeded(lineHeight);
        pdf.setFontSize(9);
        pdf.setFont('courier', 'normal');
        const lines = pdf.splitTextToSize(block.content, maxWidth);
        for (const line of lines) {
          addNewPageIfNeeded(lineHeight);
          pdf.text(line, margin, y);
          y += lineHeight - 1;
        }
        y += 4;
        break;
      }

      case 'hr':
        addNewPageIfNeeded(8);
        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, y, pageWidth - margin, y);
        y += 8;
        break;
    }
  }

  pdf.save(`${filename}.pdf`);
}
