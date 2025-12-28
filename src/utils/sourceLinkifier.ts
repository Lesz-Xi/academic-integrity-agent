/**
 * Parse and linkify sources in generated content
 * Converts "Sources: [1] www.example.com" into clickable links
 */
export function linkifySources(text: string): string {
  // Capture "Sources:" section
  const sourcesMatch = text.match(/^([\s\S]*?)(\n+(?:[*#\s]*?)Sources?(?:[:*]*?)\s*)([\s\S]*)$/im);
  
  if (!sourcesMatch) {
    return text; // No sources section found
  }

  const mainContent = sourcesMatch[1];
  const rawSources = sourcesMatch[3];
  const sourceItems: string[] = [];
  
  // Normalize separation
  const normalizedSources = rawSources.replace(/(\[\d+\])/g, '\n$1');
  const lines = normalizedSources.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Match [N] marker
    const markerMatch = trimmed.match(/^\[(\d+)\]\s+(.+)$/);
    if (!markerMatch) {
       // Maybe just a URL line without marker? (Unlikely given our format)
       continue;
    }

    const num = markerMatch[1];
    const content = markerMatch[2];

    // Find URL strategy: Look for the LAST https occurring in the string
    // This is safer than regex strictness because titles might contain "http" or quotes
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-z]{2,}[^\s]*)/gi;
    const matches = [...content.matchAll(urlRegex)];
    
    let url = '';
    let displayTitle = content;

    if (matches.length > 0) {
      // Take the last match as the URL (assuming the structure is Title - URL)
      const lastMatch = matches[matches.length - 1];
      url = lastMatch[0];
      
      // Title is everything before the URL
      // Remove trailing " - " or quotes
      let rawTitle = content.substring(0, lastMatch.index).trim();
      
      // Cleanup title: remove trailing dash, quotes
      rawTitle = rawTitle.replace(/\s+-\s*$/, ''); // Remove " - " at end
      rawTitle = rawTitle.replace(/^"|"$/g, '');   // Remove surrounding quotes
      
      if (rawTitle.length > 0) {
        displayTitle = rawTitle;
      } else {
        displayTitle = url; // Fallback if no title
      }
    }

    if (url) {
      // Clean URL (remove trailing punctuation often caught by regex)
      const cleanUrl = url.replace(/[.,;:!?)]+$/, '');
      const fullUrl = cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`;
      
      sourceItems.push(
            `<li class="text-sm text-gray-600 dark:text-gray-400 pl-1">
                <span class="font-mono text-xs text-gray-400 select-none mr-2">[${num}]</span>
                <a href="${fullUrl}" target="_blank" rel="noopener noreferrer" class="text-[#CC785C] hover:text-[#D2B48C] hover:underline transition-colors break-all">
                    ${displayTitle}
                </a>
            </li>`
      );
    } else {
      // Plain text fallback (no URL found)
      sourceItems.push(
            `<li class="text-sm text-gray-600 dark:text-gray-400 pl-1">
                <span class="font-mono text-xs text-gray-400 select-none mr-2">[${num}]</span>
                <span class="text-gray-600 dark:text-gray-400">${displayTitle}</span>
            </li>`
      );
    }
  }

  if (sourceItems.length === 0) {
      return text;
  }

  // formatted sources block
  const sourcesHtml = `
<div class="mt-8 pt-6 border-t border-gray-100 dark:border-white/5">
  <h4 class="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4">Sources</h4>
  <ul class="space-y-3">
    ${sourceItems.join('\n')}
  </ul>
</div>`;

  return mainContent.trim() + '\n\n' + sourcesHtml;
}
