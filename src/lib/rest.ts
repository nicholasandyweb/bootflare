const WP_URL = 'https://bootflare.com';

export async function fetchREST(endpoint: string, retries = 10, namespace = 'wp/v2') {
    const separator = endpoint.includes('?') ? '&' : '?';
    const baseUrl = endpoint.startsWith('http') ? endpoint : `${WP_URL}/wp-json/${namespace}/${endpoint}${separator}_embed`;
    const url = baseUrl;

    for (let i = 0; i < retries; i++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 1 minute timeout per fetch

        try {
            const res = await fetch(url, {
                next: { revalidate: 60 }, // Cache for 1 minute for fresher updates
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (res.status === 429 || res.status === 503 || res.status === 502 || res.status === 504) {
                // Rate limited or server error, wait and retry
                const waitTime = Math.min(Math.pow(2, i) * 3000, 60000); // Max 60s
                console.warn(`Retry ${i + 1}/${retries} for ${url} after ${waitTime}ms (Status: ${res.status})`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                continue;
            }

            if (!res.ok) {
                console.error(`Link fetch failed: ${url} - ${res.statusText}`);
                return i === retries - 1 ? [] : continue_retry();
            }

            const text = await res.text();

            // Find the outermost JSON structure
            const firstBracket = text.indexOf('[');
            const firstBrace = text.indexOf('{');
            let start = -1;
            if (firstBracket !== -1 && firstBrace !== -1) {
                start = Math.min(firstBracket, firstBrace);
            } else {
                start = firstBracket !== -1 ? firstBracket : firstBrace;
            }

            if (start === -1) {
                console.error(`No JSON found in response from ${url}`);
                return [];
            }

            const lastBracket = text.lastIndexOf(']');
            const lastBrace = text.lastIndexOf('}');
            let end = -1;
            if (lastBracket !== -1 && lastBrace !== -1) {
                end = Math.max(lastBracket, lastBrace);
            } else {
                end = lastBracket !== -1 ? lastBracket : lastBrace;
            }

            if (end === -1 || end < start) {
                console.error(`Invalid JSON boundaries in response from ${url}`);
                return [];
            }

            const jsonText = text.substring(start, end + 1);
            try {
                return JSON.parse(jsonText);
            } catch (e) {
                console.error(`Status: ${res.status} ${res.statusText}`);
                console.error(`Failed to parse JSON for ${url}. Raw response starts with: ${text.substring(0, 500)}`);
                throw e;
            }
        } catch (error) {
            if (i === retries - 1) {
                console.error(`Error fetching from REST API after ${retries} attempts (${url}):`, error);
                return [];
            }
            const waitTime = Math.pow(2, i) * 1000;
            console.warn(`Retry ${i + 1}/${retries} for ${url} after ${waitTime}ms due to network error: ${error instanceof Error ? error.message : String(error)}`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }
    return [];

    function continue_retry() {
        // Helper to satisfy loop continue logic for non-ok status if needed
        return null;
    }
}

export async function fetchRESTWithMeta(endpoint: string, retries = 10, namespace = 'wp/v2') {
    const separator = endpoint.includes('?') ? '&' : '?';
    const baseUrl = endpoint.startsWith('http') ? endpoint : `${WP_URL}/wp-json/${namespace}/${endpoint}${separator}_embed`;
    const url = baseUrl;

    for (let i = 0; i < retries; i++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 1 minute timeout per fetch

        try {
            const res = await fetch(url, {
                next: { revalidate: 60 }, // Cache for 1 minute
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (res.status === 429 || res.status === 503 || res.status === 502 || res.status === 504) {
                // Rate limited or server error, wait and retry
                const waitTime = Math.min(Math.pow(2, i) * 3000, 60000); // Max 60s
                console.warn(`Retry ${i + 1}/${retries} for ${url} after ${waitTime}ms (Status: ${res.status})`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                continue;
            }

            if (!res.ok) {
                console.error(`Link fetch failed: ${url} - ${res.statusText}`);
                if (i === retries - 1) return { data: [], totalPages: 1, totalItems: 0 };
                continue;
            }

            const totalPagesStr = res.headers.get('X-WP-TotalPages');
            const totalItemsStr = res.headers.get('X-WP-Total');
            const totalPages = totalPagesStr ? parseInt(totalPagesStr, 10) : 1;
            const totalItems = totalItemsStr ? parseInt(totalItemsStr, 10) : 0;

            const text = await res.text();

            // Find the outermost JSON structure
            const firstBracket = text.indexOf('[');
            const firstBrace = text.indexOf('{');
            let start = -1;
            if (firstBracket !== -1 && firstBrace !== -1) {
                start = Math.min(firstBracket, firstBrace);
            } else {
                start = firstBracket !== -1 ? firstBracket : firstBrace;
            }

            if (start === -1) {
                console.error(`No JSON found in response from ${url}`);
                return { data: [], totalPages, totalItems };
            }

            const lastBracket = text.lastIndexOf(']');
            const lastBrace = text.lastIndexOf('}');
            let end = -1;
            if (lastBracket !== -1 && lastBrace !== -1) {
                end = Math.max(lastBracket, lastBrace);
            } else {
                end = lastBracket !== -1 ? lastBracket : lastBrace;
            }

            if (end === -1 || end < start) {
                console.error(`Invalid JSON boundaries in response from ${url}`);
                return { data: [], totalPages, totalItems };
            }

            const jsonText = text.substring(start, end + 1);
            return { data: JSON.parse(jsonText), totalPages, totalItems };
        } catch (error) {
            if (i === retries - 1) {
                console.error(`Error fetching from REST API after ${retries} attempts (${url}):`, error);
                return { data: [], totalPages: 1, totalItems: 0 };
            }
            const waitTime = Math.pow(2, i) * 1000;
            console.warn(`Retry ${i + 1}/${retries} for ${url} after ${waitTime}ms due to network error: ${error instanceof Error ? error.message : String(error)}`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }
    return { data: [], totalPages: 1, totalItems: 0 };
}
