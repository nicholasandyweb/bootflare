import { fetchREST } from '@/lib/rest';
import Link from 'next/link';
import { stripScripts, decodeEntities } from '@/lib/sanitize';
import { Calendar, ChevronRight, Hash, AlertTriangle } from 'lucide-react';
import { Metadata } from 'next';

export const dynamicParams = true;
export const dynamic = 'force-dynamic';

interface RESTCategory {
    id: number;
    name: string;
    description: string;
    slug: string;
}

interface RESTPost {
    id: number;
    title: { rendered: string };
    slug: string;
    excerpt: { rendered: string };
    date: string;
    _embedded?: {
        'wp:featuredmedia'?: { source_url: string }[];
        'wp:term'?: { name: string; slug: string }[][];
    };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    try {
        const categories = await fetchREST(`categories?slug=${slug}&_fields=name,description`);
        if (categories && Array.isArray(categories) && categories.length > 0) {
            const cat = categories[0];
            return {
                title: `${decodeEntities(cat.name)} | Blog Category | Bootflare`,
                description: cat.description || `Browse all articles in the ${decodeEntities(cat.name)} category.`
            };
        }
    } catch (error) {
        console.error('Error generating category metadata:', error);
    }
    return { title: 'Category Not Found | Bootflare' };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    let category: RESTCategory | null = null;
    let posts: RESTPost[] = [];
    let errorOccurred = false;

    try {
        const categories = await fetchREST(`categories?slug=${slug}&_fields=id,name,description,slug`);
        if (categories && Array.isArray(categories) && categories.length > 0) {
            category = categories[0];
            const postsData = await fetchREST(`posts?categories=${category!.id}&per_page=12&_embed&_fields=id,title,slug,excerpt,date,_links,_embedded`);
            posts = Array.isArray(postsData) ? postsData : [];
        }
    } catch (error) {
        console.error('Error fetching category posts:', error);
        errorOccurred = true;
    }

    if (errorOccurred) {
        return (
            <div className="bg-slate-50 min-h-screen pt-32 pb-20">
                <div className="container text-center py-32 bg-white rounded-[3rem] border border-dashed border-red-200">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">WordPress is taking too long</h2>
                    <p className="text-slate-500 text-lg font-light mb-8 max-w-md mx-auto">
                        We couldn't reach the WordPress server in time. Please try refreshing the page in a few moments.
                    </p>
                    <Link href="/blog" className="btn-premium">
                        Back to Blog
                    </Link>
                </div>
            </div>
        );
    }

    if (!category) {
        return (
            <div className="bg-slate-50 min-h-screen pt-32 pb-20">
                <div className="container text-center py-32 bg-white rounded-[3rem] border border-dashed border-slate-200">
                    <p className="text-slate-400 text-xl font-light">Category not found.</p>
                    <Link href="/blog" className="text-primary font-bold mt-4 inline-block hover:underline transition-colors">
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
                        <Hash className="w-3 h-3" /> Blog Category
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 font-ubuntu leading-tight">
                        Posts in <span className="text-gradient" dangerouslySetInnerHTML={{ __html: category.name }} />
                    </h1>
                    {category.description && (
                        <p className="text-lg text-slate-500 font-light leading-relaxed" dangerouslySetInnerHTML={{ __html: category.description }} />
                    )}
                </div>

                {/* Grid Section */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post) => {
                        const featuredImage = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
                        const postCategory = post._embedded?.['wp:term']?.[0][0] || { name: category!.name, slug: category!.slug };

                        return (
                            <article key={post.id} className="card-premium !p-0 flex flex-col group h-full transition-all hover:shadow-2xl hover:shadow-primary/5">
                                {featuredImage && (
                                    <Link href={`/${post.slug}/`} prefetch={false} className="relative h-64 overflow-hidden rounded-t-[2rem]">
                                        <img
                                            src={featuredImage}
                                            alt={post.title.rendered}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                )}
                                <div className="p-8 flex flex-col flex-1">
                                    <div className="flex items-center gap-4 mb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        <span className="text-primary" dangerouslySetInnerHTML={{ __html: postCategory.name }} />
                                        <span>•</span>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(post.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                    </div>

                                    <Link href={`/${post.slug}/`} prefetch={false} className="mb-4">
                                        <h3
                                            className="text-xl font-bold text-slate-900 hover:text-primary transition-colors line-clamp-2 leading-tight"
                                            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                                        />
                                    </Link>

                                    <div
                                        className="text-slate-500 text-sm line-clamp-2 mb-8 font-light flex-1 [&_p]:mb-0 leading-relaxed"
                                        dangerouslySetInnerHTML={{ __html: stripScripts(post.excerpt.rendered) }}
                                    />

                                    <Link href={`/${post.slug}/`} prefetch={false} className="flex items-center gap-2 text-primary font-bold text-sm group-link">
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

