export const revalidate = 3600;
import { fetchREST } from '@/lib/rest';
import Link from 'next/link';
import { stripScripts, decodeEntities } from '@/lib/sanitize';
import { Calendar, ChevronRight, Hash } from 'lucide-react';
import { Metadata } from 'next';

export const dynamicParams = true;

// Define WordPress REST interfaces
interface WPCategory {
    id: number;
    name: string;
    description: string;
    slug: string;
}

interface WPPost {
    id: number;
    title: { rendered: string };
    slug: string;
    excerpt: { rendered: string };
    date: string;
    _embedded?: {
        'wp:featuredmedia'?: { source_url: string }[];
        'wp:term'?: { taxonomy: string; name: string; slug: string }[][];
    };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    try {
        const categories: WPCategory[] = await fetchREST(`categories?slug=${slug}&_fields=id,name,description`);
        if (categories && categories.length > 0) {
            const category = categories[0];
            return {
                title: `${decodeEntities(category.name)} | Blog Category | Bootflare`,
                description: category.description || `Browse all articles in the ${decodeEntities(category.name)} category.`
            };
        }
    } catch (error) {
        console.error('Error generating category metadata:', error);
    }
    return { title: 'Category Not Found | Bootflare' };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    let category: WPCategory | null = null;
    let posts: WPPost[] = [];

    try {
        // Fetch Category by slug
        const categories: WPCategory[] = await fetchREST(`categories?slug=${slug}&_fields=id,name,description,slug`);

        if (categories && categories.length > 0) {
            category = categories[0];
            // Fetch posts in this category
            posts = await fetchREST(`posts?categories=${category.id}&_embed&per_page=12&_fields=id,title,slug,excerpt,date,_links,_embedded`);
        }
    } catch (error) {
        console.error('Error fetching category posts:', error);
    }

    if (!category) {
        return (
            <div className="bg-slate-50 min-h-screen pt-32 pb-20">
                <div className="container text-center py-32 bg-white rounded-[3rem] border border-dashed border-slate-200">
                    <p className="text-slate-400 text-xl font-light">Category not found.</p>
                    <Link href="/blog" prefetch={true} className="text-primary font-bold mt-4 inline-block hover:underline">
                        Back to Blog
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen pt-32 pb-20">
            <div className="container">
                {/* Header */}
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-xs mb-8 uppercase tracking-widest">
                        <Hash className="w-3 h-3" /> Category
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 font-ubuntu">
                        Posts in <span className="text-gradient" dangerouslySetInnerHTML={{ __html: category.name }} />
                    </h1>
                    {category.description && (
                        <p className="text-lg text-slate-500 font-light" dangerouslySetInnerHTML={{ __html: category.description }} />
                    )}
                </div>

                {/* Grid Section */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post) => {
                        const featuredImage = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;

                        // Extract category name from terms if available, fallback to current category
                        let postCategoryParams = { name: category.name, slug: category.slug };
                        const terms = post._embedded?.['wp:term'] || [];
                        for (const taxonomyList of terms) {
                            for (const term of taxonomyList) {
                                if (term.taxonomy === 'category') {
                                    postCategoryParams = { name: term.name, slug: term.slug };
                                    break;
                                }
                            }
                        }

                        return (
                            <article key={post.id} className="card-premium !p-0 flex flex-col group h-full">
                                {featuredImage && (
                                    <Link href={`/blog/${post.slug}`} prefetch={true} className="relative h-64 overflow-hidden rounded-t-[2rem]">
                                        <img
                                            src={featuredImage}
                                            alt={post.title.rendered}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                    </Link>
                                )}
                                <div className="p-8 flex flex-col flex-1">
                                    <div className="flex items-center gap-4 mb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        <span className="text-primary" dangerouslySetInnerHTML={{ __html: postCategoryParams.name }} />
                                        <span>•</span>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(post.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                    </div>

                                    <Link href={`/blog/${post.slug}`} prefetch={true} className="mb-4">
                                        <h3
                                            className="text-xl font-bold text-slate-900 hover:text-primary transition-colors line-clamp-2 leading-tight"
                                            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                                        />
                                    </Link>

                                    <div
                                        className="text-slate-500 text-sm line-clamp-2 mb-8 font-light flex-1 [&_p]:mb-0"
                                        dangerouslySetInnerHTML={{ __html: stripScripts(post.excerpt.rendered) }}
                                    />

                                    <Link href={`/blog/${post.slug}`} prefetch={true} className="flex items-center gap-2 text-primary font-bold text-sm group-link">
                                        Read Story <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </article>
                        )
                    })}
                </div>

                {posts.length === 0 && (
                    <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-slate-200">
                        <p className="text-slate-400 text-xl font-light">No articles found in this category.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
