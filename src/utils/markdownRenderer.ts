/**
 * Simple markdown-to-HTML converter for Academic Integrity Agent
 * Converts common markdown syntax to clean HTML formatting
 */

export function markdownToHtml(markdown: string): string {
  let html = markdown;

  // Headers (## Header -> <h2>Header</h2>)
  // Check for \n to ensure we don't match inside other text, and add newlines around output
  html = html.replace(/^### (.+)$/gm, '\n\n<h3 class="text-lg font-bold text-[#2D2D2D] dark:text-white mt-6 mb-3">$1</h3>\n\n');
  html = html.replace(/^## (.+)$/gm, '\n\n<h2 class="text-xl font-bold text-[#2D2D2D] dark:text-white mt-8 mb-4">$1</h2>\n\n');
  html = html.replace(/^# (.+)$/gm, '\n\n<h1 class="text-2xl font-bold text-[#2D2D2D] dark:text-white mt-10 mb-5">$1</h1>\n\n');

  // Bold (**text** -> <strong>text</strong>)
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-[#2D2D2D] dark:text-gray-200">$1</strong>');

  // Italic (*text* or _text_ -> <em>text</em>)
  html = html.replace(/\*(.+?)\*/g, '<em class="italic">$1</em>');
  html = html.replace(/_(.+?)_/g, '<em class="italic">$1</em>');

  // Code blocks (```language\ncode\n``` -> <pre><code>code</code></pre>)
  // Added font-mono and Ensuring overflow-x-auto
  html = html.replace(/```(\w+)?\n([\s\S]+?)```/g, '\n\n<pre class="bg-gray-100 dark:bg-[#252525] border border-gray-300 dark:border-[#444] rounded-lg p-4 my-4 overflow-x-auto font-mono"><code class="text-sm text-gray-800 dark:text-gray-200 block">$2</code></pre>\n\n');

  // Inline code (`code` -> <code>code</code>)
  html = html.replace(/`(.+?)`/g, '<code class="bg-gray-100 dark:bg-[#444] text-[#CC785C] px-1.5 py-0.5 rounded text-sm font-mono">$1</code>');

  // Blockquotes (> quote -> <blockquote>quote</blockquote>)
  html = html.replace(/^> (.+)$/gm, '\n\n<blockquote class="border-l-4 border-[#CC785C] pl-4 py-2 my-4 text-gray-600 dark:text-gray-400 italic">$1</blockquote>\n\n');

  // Links ([text](url) -> <a href="url">text</a>)
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-[#CC785C] underline hover:text-[#b06348]" target="_blank" rel="noopener noreferrer">$1</a>');

  // Unordered lists (- item or * item -> <ul><li>item</li></ul>)
  html = html.replace(/^[\*\-] (.+)$/gm, '<li class="ml-6 mb-2 list-disc text-gray-700 dark:text-gray-300">$1</li>');
  html = html.replace(/(<li class="ml-6[^>]*>.*<\/li>\n?)+/g, '\n\n<ul class="my-4">$&</ul>\n\n');

  // Ordered lists (1. item -> <ol><li>item</li></ol>)
  html = html.replace(/^\d+\.\s+(.+)$/gm, '<li class="ml-6 mb-2 list-decimal text-gray-700 dark:text-gray-300">$1</li>');
  html = html.replace(/(<li class="ml-6[^>]*decimal[^>]*>.*<\/li>\n?)+/g, '\n\n<ol class="my-4">$&</ol>\n\n');

  // Horizontal rules (--- -> <hr>)
  html = html.replace(/^---$/gm, '\n\n<hr class="my-8 border-t border-gray-300 dark:border-gray-600">\n\n');

  // Tables (basic support)
  html = html.replace(/^\|(.+)\|$/gm, (match) => {
    const cells = match.split('|').filter(c => c.trim()).map(c => c.trim());
    return '<tr>' + cells.map(c => {
      if (c.match(/^:?-+:?$/)) return ''; // Skip separator rows
      return `<td class="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">$c</td>`;
    }).join('') + '</tr>';
  });
  html = html.replace(/(<tr>.*<\/tr>\n?)+/g, '\n\n<table class="w-full border-collapse my-6">$&</table>\n\n');

  // Normalize newlines to avoid mix of \n\n and \r\n\r\n etc
  html = html.replace(/\r\n/g, '\n');

  // Paragraphs (double newline -> <p>)
  // Use a more robust split that consumes surrounding whitespace
  return html.split(/\n\s*\n/).map(para => {
    const trimmed = para.trim();
    if (!trimmed) return '';

    // Don't wrap if it's already an HTML element (block level)
    if (trimmed.match(/^<(h[1-6]|ul|ol|pre|blockquote|table|hr|div)/i)) {
      return trimmed;
    }
    
    return `<p class="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">${trimmed}</p>`;
  }).join('\n');
}
