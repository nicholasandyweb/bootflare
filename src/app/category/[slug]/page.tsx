import { fetchGraphQL } from '@/lib/graphql';
import Link from 'next/link';
import { stripScripts } from '@/lib/sanitize';
import { Calendar, ChevronRight, Hash } from 'lucide-react';
import { Metadata } from 'next';

export const runtime = 'edge';
export const dynamicParams = true;

const GET_CATEGORY_POSTS = `
  query GetCategoryPosts($slug: ID!) {
    category(id: $slug, idType: SLUG) {
      name
      description
      posts(first: 20) {
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

interface Post {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    date: string;
    featuredImage?: {
        node: {
            sourceUrl: string;
        }
    };
    categories: {
        nodes: {
            name: string;
            slug: string;
        }[]
    };
}

interface CategoryData {
    category: {
        name: string;
        description: string;
        posts: {
            nodes: Post[];
        };
    } | null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    try {
        const data = await fetchGraphQL<CategoryData>(GET_CATEGORY_POSTS, { slug });
        if (data.category) {
            return {
                title: `${data.category.name} | Blog Category | Bootflare`,
                description: data.category.description || `Browse all articles in the ${data.category.name} category.`
            };
        }
    } catch (error) {
        console.error('Error generating category metadata:', error);
    }
    return { title: 'Category Not Found | Bootflare' };
}


export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    let category: CategoryData['category'] = null;

    try {
        const data = await fetchGraphQL<CategoryData>(GET_CATEGORY_POSTS, { slug });
        category = data.category;
    } catch (error) {
        console.error('Error fetching category posts:', error);
    }

    if (!category) {
        return (
            <div className="bg-slate-50 min-h-screen pt-32 pb-20">
                <div className="container text-center py-32 bg-white rounded-[3rem] border border-dashed border-slate-200">
                    <p className="text-slate-400 text-xl font-light">Category not found.</p>
                    <Link href="/blog" className="text-primary font-bold mt-4 inline-block hover:underline">
                        Back to Blog
                    </Link>
                </div>
            </div>
        );
    }

    const posts = category.posts.nodes;

    return (
        <div className="bg-slate-50 min-h-screen pt-32 pb-20">
            <div className="container">
                {/* Header */}
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-xs mb-8 uppercase tracking-widest">
                        <Hash className="w-3 h-3" /> Category
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 font-ubuntu">
                        Posts in <span className="text-gradient">{category.name}</span>
                    </h1>
                    {category.description && (
                        <p className="text-lg text-slate-500 font-light">
                            {category.description}
                        </p>
                    )}
                </div>

                {/* Grid Section */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post) => (
                        <article key={post.id} className="card-premium !p-0 flex flex-col group h-full">
                            {post.featuredImage && (
                                <Link href={`/blog/${post.slug}`} className="relative h-64 overflow-hidden rounded-t-[2rem]">
                                    <img
                                        src={post.featuredImage.node.sourceUrl}
                                        alt={post.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                </Link>
                            )}
                            <div className="p-8 flex flex-col flex-1">
                                <div className="flex items-center gap-4 mb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    <span className="text-primary">{post.categories.nodes[0]?.name}</span>
                                    <span>•</span>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(post.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                </div>

                                <Link href={`/blog/${post.slug}`} className="mb-4">
                                    <h3 className="text-xl font-bold text-slate-900 hover:text-primary transition-colors line-clamp-2 leading-tight">
                                        {post.title}
                                    </h3>
                                </Link>

                                <div
                                    className="text-slate-500 text-sm line-clamp-2 mb-8 font-light flex-1 [&_p]:mb-0"
                                    dangerouslySetInnerHTML={{ __html: stripScripts(post.excerpt) }}
                                />

                                <Link href={`/blog/${post.slug}`} className="flex items-center gap-2 text-primary font-bold text-sm group-link">
                                    Read Story <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </article>
                    ))}
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
