/**
 * Strips <script> tags from HTML content to prevent execution of problematic
 * WordPress plugin scripts in a Headless environment.
 */
export function stripScripts(html: string | undefined): string {
    if (!html) return "";
    return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
}

/**
 * Converts absolute bootflare.com links in article HTML to relative paths.
 * This ensures "See Also" and other in-content links navigate via Next.js
 * client-side routing (handled by the ArticleContent component) instead of
 * making full HTTP requests to the WordPress origin.
 *
 * Example: href="https://bootflare.com/my-post/" → href="/my-post/"
 */
export function internalizeLinks(html: string | undefined): string {
    if (!html) return "";

    // Convert absolute bootflare.com URLs to relative paths
    return html.replace(
        /href="https?:\/\/(?:www\.)?bootflare\.com\//gi,
        'href="/'
    );
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
