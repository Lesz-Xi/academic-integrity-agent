/**
 * Parse and linkify sources in generated content
 * Converts "Sources: [1] www.example.com" into clickable links
 */
export function linkifySources(text: string): string {
  // Split content into main text and sources section
  // Capture "Sources:" or "**Sources:**" or "## Sources" and everything after
  // Regex Breakdown:
  // \n+            : At least one newline
  // (?:[*#\s]*?)   : Optional non-capturing prefix (asterisks, hashes, spaces)
  // Sources?       : Literal "Source" or "Sources"
  // (?:[:*]*?)     : Optional non-capturing suffix (colon, asterisks)
  // \s*            : Trailing spaces
  const sourcesMatch = text.match(/^([\s\S]*?)(\n+(?:[*#\s]*?)Sources?(?:[:*]*?)\s*)([\s\S]*)$/im);
  
  if (!sourcesMatch) {
    return text; // No sources section found
  }

  const mainContent = sourcesMatch[1];
  // const heading = sourcesMatch[2]; // e.g. "\n\nSources: "
  const rawSources = sourcesMatch[3];

  // Helper to process source lines
  // Matches: [1] "Title" - url OR [1] url
  const sourceItems: string[] = [];
  
  // Pre-process: If sources are inline "[1] ... [2] ...", split them into newlines
  // We look for [d] that is NOT at the start of the string, and add a newline before it.
  // Actually, we can just replace all `[`d`]` with `\n[`d`]` and then trim.
  const normalizedSources = rawSources.replace(/(\[\d+\])/g, '\n$1');
  
  const lines = normalizedSources.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Try robust structured match first: [1] "Title" - url. 
    // We enforce that the last part ([^\s]+) must have at least one dot or be http(s) to be considered a URL.
    // This prevents [1] "Title" from being matched as a URL.
    const structuredMatch = trimmed.match(/^\[(\d+)\]\s+(?:(?:"([^"]+)"|([^"-]+))\s+-\s+)?((?:https?:\/\/|www\.|[\w-]+\.)[^\s]+)$/i);
    // Fallback match: [1] anything else
    const fallbackMatch = trimmed.match(/^\[(\d+)\]\s+(.+)$/);

    if (structuredMatch) {
        // [1] "Title" - URL OR [1] URL
        // Groups: 1=num, 2=quoted_title, 3=unquoted_title, 4=url
        
        const num = structuredMatch[1];
        const title = structuredMatch[2] || structuredMatch[3];
        let rawUrl = structuredMatch[4];
        
        // If we only caught a URL (no title parts), 
        // rawUrl is fine, title is undefined.
        
        let displayTitle = '';
        let url = rawUrl || '';

        if (title) {
            displayTitle = title;
        } else {
            displayTitle = url;
        }

        // Clean link
        const cleanUrl = url.replace(/[.,;:!?)]+$/, '');
        const fullUrl = cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`;
        const display = displayTitle || cleanUrl;

        sourceItems.push(
            `<li class="text-sm text-gray-600 dark:text-gray-400 pl-1">
                <span class="font-mono text-xs text-gray-400 select-none mr-2">[${num}]</span>
                <a href="${fullUrl}" target="_blank" rel="noopener noreferrer" class="text-[#CC785C] hover:text-[#D2B48C] hover:underline transition-colors break-all">
                    ${display}
                </a>
            </li>`
        );
    } else if (fallbackMatch) {
         // [1] Rest of line
         const num = fallbackMatch[1];
         const rest = fallbackMatch[2];
         
         // Try to extract URL from 'rest'
         let url = '';
         let displayTitle = rest;
         
         const urlMatch = rest.match(/(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-z]{2,}[^\s]*)/);
         if (urlMatch) {
             url = urlMatch[0];
             // If title is just the URL, clean it up
             const remainder = rest.replace(url, '').replace(/^\s*-\s*/, '').trim();
             if (remainder) {
                 displayTitle = remainder;
             } else {
                 displayTitle = url;
             }
         } else {
             // Treat whole thing as title, no URL? Or assume it is a URL?
             // If no URL found, arguably we shouldn't link it, or link it as is.
             // Let's assume it might serve as a URL if it has no spaces, else just text.
             if (!rest.match(/\s/)) {
                 url = rest;
             }
         }

         if (url) {
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
             // just text
            sourceItems.push(
                `<li class="text-sm text-gray-600 dark:text-gray-400 pl-1">
                    <span class="font-mono text-xs text-gray-400 select-none mr-2">[${num}]</span>
                    <span class="text-gray-600 dark:text-gray-400">${displayTitle}</span>
                </li>`
            );
         }
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
