/**
 * Strips <script> tags from HTML content to prevent execution of problematic
 * WordPress plugin scripts in a Headless environment.
 */
export function stripScripts(html: string | undefined): string {
    if (!html) return "";
    return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
}

/**
 * Rewrites internal WordPress post links in blog content so that links like
 * https://bootflare.com/some-post/ or /some-post/ become /blog/some-post.
 *
 * This fixes in-article "See also" style links that would otherwise point to
 * non-existent root-level routes in the Next.js app.
 */
export function rewriteBlogInternalLinks(html: string | undefined): string {
    if (!html) return "";

    let output = html;

    // Absolute links: https://bootflare.com/some-post[/...]
    const absolutePattern = /href="https?:\/\/bootflare\.com\/(?:www\.)?([^"?#\/]+)\/?([^\"]*)"/gi;
    output = output.replace(absolutePattern, (match, slug, rest) => {
        if (!slug) return match;
        const suffix = rest || "";
        return `href="/blog/${slug}${suffix}"`;
    });

    // Root-relative links: /some-post[/...]
    const relativePattern = /href="\/([^"?#\/]+)\/?([^\"]*)"/gi;
    output = output.replace(relativePattern, (match, slug, rest) => {
        if (!slug) return match;
        const suffix = rest || "";
        return `href="/blog/${slug}${suffix}"`;
    });

    return output;
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
