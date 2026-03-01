import { Metadata } from 'next';

const WP_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://bootflare.com';

interface WPPost {
    title?: { rendered: string } | string;
    excerpt?: { rendered: string } | string;
    content?: { rendered: string } | string;
    slug?: string;
    featuredImage?: {
        node?: {
            sourceUrl: string;
        };
    };
    _embedded?: {
        'wp:featuredmedia'?: Array<{
            source_url: string;
        }>;
    };
    seo?: {
        title?: string;
        metaDesc?: string;
        opengraphTitle?: string;
        opengraphDescription?: string;
        opengraphImage?: {
            sourceUrl: string;
        };
        twitterTitle?: string;
        twitterDescription?: string;
        twitterImage?: {
            sourceUrl: string;
        };
    };
}

interface RankMathSEO {
    title?: string;
    description?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    twitterTitle?: string;
    twitterDescription?: string;
    twitterImage?: string;
}

function extractMeta(head: string, name: string): string | undefined {
    // Matches both name= and property= meta tags
    const regex = new RegExp(
        `<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']+)["']`,
        'i'
    );
    const reversed = new RegExp(
        `<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${name}["']`,
        'i'
    );
    const m = head.match(regex) || head.match(reversed);
    return m?.[1] || undefined;
}

function extractTitle(head: string): string | undefined {
    const m = head.match(/<title>([\s\S]*?)<\/title>/i);
    return m?.[1]?.trim() || undefined;
}

/**
 * Fetches fully-rendered SEO tags from RankMath for a given post URL.
 * Uses the /wp-json/rankmath/v1/getHead endpoint.
 */
export async function fetchRankMathSEO(postUrl: string): Promise<RankMathSEO | null> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000); // 20s timeout

    try {
        const apiUrl = `${WP_URL}/wp-json/rankmath/v1/getHead?url=${encodeURIComponent(postUrl)}`;
        const res = await fetch(apiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json'
            },
            // Avoid Next.js fetch cache poisoning (e.g. previously cached HTML/404 during origin misrouting)
            // The router can cache WP JSON; keep Next fetches dynamic.
            cache: 'no-store',
            signal: controller.signal,
        });
        clearTimeout(timeout);

        if (!res.ok) return null;

        const data = await res.json();
        if (!data?.success || !data?.head) return null;

        const head: string = data.head;

        return {
            title: extractTitle(head),
            description: extractMeta(head, 'description'),
            ogTitle: extractMeta(head, 'og:title'),
            ogDescription: extractMeta(head, 'og:description'),
            ogImage: extractMeta(head, 'og:image'),
            twitterTitle: extractMeta(head, 'twitter:title'),
            twitterDescription: extractMeta(head, 'twitter:description'),
            twitterImage: extractMeta(head, 'twitter:image'),
        };
    } catch {
        clearTimeout(timeout);
        return null;
    }
}

export function mapWPToMetadata(post: WPPost, defaultTitle: string = 'Bootflare'): Metadata {
    if (!post) return {};

    const title = typeof post.title === 'object' ? post.title.rendered : post.title || '';
    const excerpt = typeof post.excerpt === 'object' ? post.excerpt.rendered : post.excerpt || '';

    // Clean excerpt from HTML
    const cleanExcerpt = excerpt.replace(/<[^>]*>/g, '').trim();

    // Fallback description from content if excerpt is empty
    let fallbackDesc = cleanExcerpt;
    if (!fallbackDesc && typeof post.content === 'object') {
        fallbackDesc = post.content.rendered.replace(/<[^>]*>/g, '').substring(0, 160).trim();
    } else if (!fallbackDesc && typeof post.content === 'string') {
        fallbackDesc = post.content.replace(/<[^>]*>/g, '').substring(0, 160).trim();
    }

    // Featured Image detection
    let featuredImageUrl = '';
    if (post.featuredImage?.node?.sourceUrl) {
        featuredImageUrl = post.featuredImage.node.sourceUrl;
    } else if (post._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
        featuredImageUrl = post._embedded['wp:featuredmedia'][0].source_url;
    }

    // SEO Overrides (from RankMath/Yoast if present via GraphQL/Custom Fields)
    const seoTitle = post.seo?.title || title;
    const seoDesc = post.seo?.metaDesc || fallbackDesc;
    const ogTitle = post.seo?.opengraphTitle || seoTitle;
    const ogDesc = post.seo?.opengraphDescription || seoDesc;
    const ogImage = post.seo?.opengraphImage?.sourceUrl || featuredImageUrl;

    return {
        title: seoTitle ? `${seoTitle} | ${defaultTitle}` : defaultTitle,
        description: seoDesc,
        openGraph: {
            title: ogTitle,
            description: ogDesc,
            images: ogImage ? [{ url: ogImage }] : [],
            type: 'article',
        },
        twitter: {
            card: 'summary_large_image',
            title: post.seo?.twitterTitle || ogTitle,
            description: post.seo?.twitterDescription || ogDesc,
            images: post.seo?.twitterImage?.sourceUrl || ogImage ? [post.seo?.twitterImage?.sourceUrl || ogImage] : [],
        }
    };
}

/**
 * Converts RankMath SEO data directly into Next.js Metadata.
 * Used when the WP REST API doesn't expose a `seo` field (e.g. custom CPTs).
 */
export function mapRankMathToMetadata(seo: RankMathSEO, fallbackTitle?: string): Metadata {
    const title = seo.title || fallbackTitle || 'Bootflare';
    const description = seo.description || '';
    const ogTitle = seo.ogTitle || title;
    const ogDesc = seo.ogDescription || description;

    return {
        title,
        description,
        openGraph: {
            title: ogTitle,
            description: ogDesc,
            images: seo.ogImage ? [{ url: seo.ogImage }] : [],
            type: 'article',
        },
        twitter: {
            card: 'summary_large_image',
            title: seo.twitterTitle || ogTitle,
            description: seo.twitterDescription || ogDesc,
            images: seo.twitterImage ? [seo.twitterImage] : (seo.ogImage ? [seo.ogImage] : []),
        },
    };
}
