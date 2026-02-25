/**
 * Strips <script> tags from HTML content to prevent execution of problematic
 * WordPress plugin scripts in a Headless environment.
 */
export function stripScripts(html: string | undefined): string {
    if (!html) return "";
    return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
}

/**
 * Optimizes images within WordPress content by adding loading="lazy" 
 * and decoding="async" to improve Speed Index and reduce main thread work.
 */
export function optimizeContentImages(html: string): string {
    if (!html) return "";
    // Avoid lazy loading the very first image if it might be above the fold, 
    // but in our blog posts the featured image is separate and handled with priority.
    return html.replace(/<img\b([^>]*)/gi, (match, attributes) => {
        if (!attributes.includes('loading=')) {
            match += ' loading="lazy"';
        }
        if (!attributes.includes('decoding=')) {
            match += ' decoding="async"';
        }
        return match;
    });
}

/**
 * Strips specific unwanted terms from the content.
 * Used to clean up icon labels injected by plugins.
 */
export function stripUnwantedTerms(html: string): string {
    if (!html) return "";
    // Remove "Codepen" and "Stack-overflow" (case insensitive, word boundary)
    return html.replace(/\b(Codepen|Stack-overflow)\b/gi, "");
}

/**
 * Decodes common HTML entities like &#8217;, &amp;, etc.
 */
export function decodeEntities(text: string | undefined): string {
    if (!text) return "";

    const entities: { [key: string]: string } = {
        '&#8211;': '-',
        '&#8212;': '—',
        '&#8216;': "'",
        '&#8217;': "'",
        '&#8220;': '"',
        '&#8221;': '"',
        '&#8230;': '...',
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&apos;': "'",
        '&#160;': ' ',
        '&nbsp;': ' '
    };

    return text.replace(/&#?\w+;/g, (match) => entities[match] || match);
}
