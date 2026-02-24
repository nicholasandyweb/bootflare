import { fetchGraphQL } from '@/lib/graphql';
import Link from 'next/link';
import { stripScripts } from '@/lib/sanitize';
import { Calendar, ChevronRight, Clock, User } from 'lucide-react';
import { fetchRankMathSEO, mapRankMathToMetadata } from '@/lib/seo';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await fetchRankMathSEO('https://bootflare.com/blog/');
  if (seo) return mapRankMathToMetadata(seo);
  return { title: 'Blog | Bootflare' };
}


const GET_POSTS = `
  query GetPosts($first: Int) {
    posts(first: $first) {
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

export default async function BlogPage() {
  let posts: Post[] = [];
  try {
    const data: { posts: { nodes: Post[] } } = await fetchGraphQL(GET_POSTS, { first: 20 });
    posts = data.posts.nodes;
  } catch (error) {
    console.error('Error fetching posts:', error);
  }

  return (
    <div className="bg-slate-50 min-h-screen pt-32 pb-20">
      <div className="container">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 font-ubuntu">Insights & <span className="text-gradient">Resources</span></h1>
          <p className="text-lg text-slate-500 font-light">
            Discover the latest trends in web design, SEO strategies, and digital transformation tips to scale your brand.
          </p>
        </div>

        {/* Featured Post (Optional, taking first) */}
        {posts.length > 0 && (
          <div className="mb-16">
            <div className="grid lg:grid-cols-2 gap-10 items-center bg-white rounded-[3rem] overflow-hidden shadow-sm border border-slate-100 p-6 md:p-10">
              {posts[0].featuredImage && (
                <Link href={`/blog/${posts[0].slug}`} className="block relative aspect-video rounded-[2rem] overflow-hidden group">
                  <img
                    src={posts[0].featuredImage.node.sourceUrl}
                    alt={posts[0].title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </Link>
              )}
              <div>
                <div className="flex gap-2 mb-6">
                  {posts[0].categories.nodes.map(cat => (
                    <Link key={cat.slug} href={`/category/${cat.slug}`} className="text-xs font-bold text-primary uppercase tracking-widest px-3 py-1 bg-primary/10 rounded-full hover:bg-primary hover:text-white transition-all">
                      {cat.name}
                    </Link>
                  ))}
                </div>
                <Link href={`/blog/${posts[0].slug}`}>
                  <h2 className="text-3xl md:text-4xl font-bold mb-6 hover:text-primary transition-colors text-slate-900">{posts[0].title}</h2>
                </Link>
                <div
                  className="text-slate-500 text-lg line-clamp-3 mb-8 font-light [&_p]:mb-0"
                  dangerouslySetInnerHTML={{ __html: stripScripts(posts[0].excerpt) }}
                  suppressHydrationWarning
                />
                <Link href={`/blog/${posts[0].slug}`} className="btn-premium group !px-10">
                  Read Article <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Grid Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.slice(1).map((post) => (
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
                  <Link href={`/category/${post.categories.nodes[0]?.slug}`} className="text-primary hover:underline">
                    {post.categories.nodes[0]?.name}
                  </Link>
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
                  suppressHydrationWarning
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
            <p className="text-slate-400 text-xl font-light">No articles found. Stay tuned for updates!</p>
          </div>
        )}
      </div>
    </div>
  );
}
