/**
 * Parse and linkify sources in generated content
 * Converts "Sources: [1] www.example.com" into clickable links
 */
export function linkifySources(text: string): string {
  // Split content into main text and sources section
  const sourcesMatch = text.match(/^([\s\S]*?)(\n*Sources?:\s*\[[\s\S]*)$/im);
  
  if (!sourcesMatch) {
    return text; // No sources section found
  }

  const mainContent = sourcesMatch[1];
  const sourcesSection = sourcesMatch[2];

  // Parse individual source lines: [1] www.example.com or [1] "Title" - domain.com
  const linkedSources = sourcesSection.replace(
    /\[(\d+)\]\s+(?:"[^"]*"\s+-\s+)?([^\s\n]+)/g,
    (_match, num, url) => {
      // Clean up URL (remove trailing punctuation)
      const cleanUrl = url.replace(/[.,;:!?]+$/, '');
      
      // Add protocol if missing
      const fullUrl = cleanUrl.startsWith('http') 
        ? cleanUrl 
        : `https://${cleanUrl}`;
      
      return `[${num}] <a href="${fullUrl}" target="_blank" rel="noopener noreferrer" class="text-[#CC785C] hover:text-[#D2B48C] underline font-medium">${cleanUrl}</a>`;
    }
  );

  return mainContent + linkedSources;
}
