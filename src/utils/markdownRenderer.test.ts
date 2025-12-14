import { describe, it, expect } from 'vitest';
import { markdownToHtml } from './markdownRenderer';

describe('markdownRenderer', () => {
  describe('markdownToHtml', () => {
    it('should convert headings correctly', () => {
      const markdown = '# Heading 1\n## Heading 2\n### Heading 3';
      const html = markdownToHtml(markdown);
      
      expect(html).toContain('<h1');
      expect(html).toContain('<h2');
      expect(html).toContain('<h3');
    });

    it('should convert bold text', () => {
      const markdown = 'This is **bold** text';
      const html = markdownToHtml(markdown);
      
      expect(html).toContain('<strong');
      expect(html).toContain('bold</strong>');
    });

    it('should convert italic text', () => {
      const markdown = 'This is *italic* text';
      const html = markdownToHtml(markdown);
      
      expect(html).toContain('<em');
      expect(html).toContain('italic</em>');
    });

    it('should convert inline code', () => {
      const markdown = 'This is `code` inline';
      const html = markdownToHtml(markdown);
      
      expect(html).toContain('<code');
      expect(html).toContain('code');
    });

    it('should handle links', () => {
      const markdown = 'Check [this link](https://example.com)';
      const html = markdownToHtml(markdown);
      
      expect(html).toContain('href="https://example.com"');
      expect(html).toContain('target="_blank"');
    });

    it('should handle unordered lists', () => {
      const markdown = '- Item 1\n- Item 2\n- Item 3';
      const html = markdownToHtml(markdown);
      
      expect(html).toContain('<ul');
      expect(html).toContain('<li');
    });

    it('should return paragraph wrapper for empty input', () => {
      const html = markdownToHtml('');
      expect(html).toContain('<p');
    });
  });
});
