export const revalidate = 3600;
import { fetchGraphQL } from '@/lib/graphql';
import Link from 'next/link';
import { stripScripts, decodeEntities } from '@/lib/sanitize';
import { Calendar, ChevronRight, Hash, AlertTriangle } from 'lucide-react';
import { Metadata } from 'next';

export const dynamicParams = true;
export const dynamic = 'force-dynamic';

const GET_CATEGORY_POSTS = `
  query GetCategoryPosts($slug: ID!) {
    category(id: $slug, idType: SLUG) {
      id
      name
      description
      slug
      posts(first: 12) {
        nodes {
          id
          title
          slug
          excerpt
          date
          featuredImage {
            node {
              sourceUrl
            }
          }
          categories {
            nodes {
              name
              slug
            }
          }
        }
      }
    }
  }
`;

interface GQLCategory {
    id: string;
    name: string;
    description: string;
    slug: string;
    posts?: {
        nodes: GQLPost[];
    };
}

interface GQLPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    date: string;
    featuredImage?: {
        node: {
            sourceUrl: string;
        };
    };
    categories?: {
        nodes: {
            name: string;
            slug: string;
        }[];
    };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    try {
        const data: { category?: GQLCategory | null } | null = await fetchGraphQL(GET_CATEGORY_POSTS, { slug });
        if (data && data.category) {
            return {
                title: `${decodeEntities(data.category.name)} | Blog Category | Bootflare`,
                description: data.category.description || `Browse all articles in the ${decodeEntities(data.category.name)} category.`
            };
        }
    } catch (error) {
        console.error('Error generating category metadata:', error);
    }
    return { title: 'Category Not Found | Bootflare' };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    let category: GQLCategory | null = null;
    let errorOccurred = false;

    try {
        const data: { category?: GQLCategory | null } | null = await fetchGraphQL(GET_CATEGORY_POSTS, { slug });
        if (data && data.category) {
            category = data.category;
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
                    <Link href="/blog" prefetch={true} className="btn-premium">
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
                    <Link href="/blog" prefetch={true} className="text-primary font-bold mt-4 inline-block hover:underline transition-colors">
                        Back to Blog
                    </Link>
                </div>
            </div>
        );
    }

    const posts = category.posts?.nodes || [];

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
                        const featuredImage = post.featuredImage?.node?.sourceUrl;
                        const postCategory = post.categories?.nodes[0] || { name: category!.name, slug: category!.slug };

                        return (
                            <article key={post.id} className="card-premium !p-0 flex flex-col group h-full transition-all hover:shadow-2xl hover:shadow-primary/5">
                                {featuredImage && (
                                    <Link href={`/blog/${post.slug}`} prefetch={true} className="relative h-64 overflow-hidden rounded-t-[2rem]">
                                        <img
                                            src={featuredImage}
                                            alt={post.title}
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

                                    <Link href={`/blog/${post.slug}`} prefetch={true} className="mb-4">
                                        <h3
                                            className="text-xl font-bold text-slate-900 hover:text-primary transition-colors line-clamp-2 leading-tight"
                                            dangerouslySetInnerHTML={{ __html: post.title }}
                                        />
                                    </Link>

                                    <div
                                        className="text-slate-500 text-sm line-clamp-2 mb-8 font-light flex-1 [&_p]:mb-0 leading-relaxed"
                                        dangerouslySetInnerHTML={{ __html: stripScripts(post.excerpt) }}
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

