/**
 * Utility to parse WordPress HTML content into FAQ items.
 * Identifies header tags (h2, h3, h5, etc.) as questions and the subsequent content as answers.
 */
export interface FAQItem {
    q: string;
    a: string;
}

export function parseFAQs(html: string): FAQItem[] {
    if (!html) return [];

    const faqs: FAQItem[] = [];

    // Regex to match header tags (h1-h6) and the content following them until the next header or end of string.
    // We use [\s\S]*? to match across multiple lines and make it non-greedy.
    // Positive lookahead or end-of-string ensures we stop before the next header.
    const headerRegex = /<h([1-6])(?:\s+[^>]*)?>([\s\S]*?)<\/h\1>([\s\S]*?)(?=<h[1-6]|$)/gi;

    let match: RegExpExecArray | null;
    while ((match = headerRegex.exec(html)) !== null) {
        let question = match[2].trim();
        // Remove HTML tags from the question (e.g., links, spans)
        question = question.replace(/<[^>]*>/g, '').trim();

        let answer = match[3].trim();
        // Remove HTML tags from the answer to ensure clean text output
        answer = answer.replace(/<[^>]*>/g, '').trim();

        if (question) {
            faqs.push({ q: question, a: answer });
        }
    }

    return faqs;
}

/**
 * Extracts the "intro" text that comes before the first FAQ header.
 */
export function extractFAQIntro(html: string): string {
    if (!html) return '';
    const firstHeaderMatch = html.match(/<h[1-6]/i);
    if (firstHeaderMatch && firstHeaderMatch.index !== undefined) {
        return html.substring(0, firstHeaderMatch.index).trim();
    }
    return html; // Return everything if no headers found
}
