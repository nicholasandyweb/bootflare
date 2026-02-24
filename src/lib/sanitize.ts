/**
 * Strips <script> tags from HTML content to prevent execution of problematic
 * WordPress plugin scripts in a Headless environment.
 */
export function stripScripts(html: string | undefined): string {
    if (!html) return "";
    return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
}
