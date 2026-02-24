import { Metadata } from 'next';

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
