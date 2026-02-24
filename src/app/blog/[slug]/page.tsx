export const dynamic = 'force-dynamic';
import { fetchGraphQL } from '@/lib/graphql';
import { stripScripts } from '@/lib/sanitize';
import { Calendar, User, ArrowLeft, Share2, Clock } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';
import { mapWPToMetadata } from '@/lib/seo';

export const dynamicParams = true;

const GET_SINGLE_POST = `
  query GetSinglePost($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      title
      content
      excerpt
      date
      featuredImage {
        node {
          sourceUrl
        }
      }
      author {
        node {
          name
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
`;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const data = await fetchGraphQL<{ post: Post }>(GET_SINGLE_POST, { slug });
    if (data.post) {
      return mapWPToMetadata(data.post, 'Blog - Bootflare');
    }
  } catch (error) {
    console.error('Error generating metadata for blog post:', error);
  }
  return { title: 'Post Not Found | Bootflare' };
}

interface Post {
  title: string;
  content: string;
  excerpt?: string;
  date: string;
  featuredImage?: {
    node: {
      sourceUrl: string;
    }
  };
  author?: {
    node: {
      name: string;
    }
  };
  categories: {
    nodes: {
      name: string;
      slug: string;
    }[]
  };
}


export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let post: Post | null = null;
  try {
    const data: { post: Post } = await fetchGraphQL(GET_SINGLE_POST, { slug });
    post = data.post;
  } catch (error) {
    console.error('Error fetching post:', error);
  }

  if (!post) {
    return <div className="container py-32 text-center text-slate-500">Post not found</div>;
  }

  const sanitizedContent = stripScripts(post.content);

  return (
    <article className="bg-white min-h-screen pb-20" suppressHydrationWarning>


      <div className="container pt-20 pb-16">
        <Link href="/blog" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-bold mb-12 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Insights
        </Link>

        <div className="max-w-4xl mx-auto">
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 mb-8">
            {post.categories.nodes.map(cat => (
              <Link key={cat.slug} href={`/category/${cat.slug}`} className="text-[10px] font-bold text-primary uppercase tracking-widest px-3 py-1 bg-primary/10 rounded-full hover:bg-primary hover:text-white transition-all">
                {cat.name}
              </Link>
            ))}
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
              <Calendar className="w-3 h-3" />
              {new Date(post.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
              <Clock className="w-3 h-3" />
              <span>5 min read</span>
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-12 leading-tight text-slate-900 font-ubuntu">
            {post.title}
          </h1>

          {post.featuredImage && (
            <div className="mb-20 rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-200 border-8 border-white ring-1 ring-slate-100">
              <img src={post.featuredImage.node.sourceUrl} alt={post.title} className="w-full h-auto" />
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-16">
            {/* Content Side */}
            <div className="flex-1">
              <div
                className="prose prose-slate prose-xl max-w-none text-slate-700 leading-relaxed font-light article-content
                  [&_p]:mb-10 [&_p:last-child]:mb-0
                  [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:mt-16 [&_h2]:mb-8 [&_h2]:text-slate-900
                  [&_h3]:text-2xl [&_h3]:font-bold [&_h3]:mt-12 [&_h3]:mb-6 [&_h3]:text-slate-900
                  [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-8 [&_ul]:space-y-3
                  [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-8 [&_ol]:space-y-3
                  [&_li]:mb-2"
                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                suppressHydrationWarning
              />
            </div>

            {/* Author/Share Side */}
            <div className="lg:w-72 shrink-0">
              <div className="sticky top-32 space-y-12">
                {/* Author Card */}
                <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Published By</h4>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-200" />
                    <div>
                      <p className="font-bold text-slate-900">{post.author?.node?.name || "Andy"}</p>
                      <p className="text-xs text-slate-500">Editorial Team</p>
                    </div>
                  </div>
                </div>

                {/* Share */}
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Spread the knowledge</h4>
                  <div className="flex gap-3">
                    <button className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-primary hover:text-white transition-all">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
