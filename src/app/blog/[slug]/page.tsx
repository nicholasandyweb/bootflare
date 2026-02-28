export const revalidate = 86400; // 24 hours
import { fetchGraphQL } from '@/lib/graphql';
import { stripScripts } from '@/lib/sanitize';
import { Calendar, User, ArrowLeft, Share2, Clock, AlertTriangle, MessageCircle, Facebook, Twitter, Linkedin } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';
import { fetchRankMathSEO, mapRankMathToMetadata, mapWPToMetadata } from '@/lib/seo';
import { cache } from 'react';
import CommentForm from '@/components/CommentForm';

export const dynamicParams = true;
export const dynamic = 'force-dynamic';

const GET_POST_BY_SLUG = `
  query GetPostBySlug($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      id
      databaseId
      title
      content
      excerpt
      slug
      date
      featuredImage {
        node {
          sourceUrl
        }
      }
      author {
        node {
          name
          avatar {
            url
          }
        }
      }
      categories {
        nodes {
          name
          slug
        }
      }
      comments(first: 50, where: { order: ASC }) {
        nodes {
          id
          databaseId
          content
          date
          author {
            node {
              name
              avatar {
                url
              }
            }
          }
          parentId
        }
      }
    }
  }
`;

interface GQLComment {
  id: string;
  databaseId: number;
  content: string;
  date: string;
  author: {
    node: {
      name: string;
      avatar?: {
        url: string;
      };
    };
  };
  parentId: string | null;
}

interface GQLPost {
  id: string;
  databaseId: number;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  date: string;
  featuredImage?: {
    node: {
      sourceUrl: string;
    };
  };
  author?: {
    node: {
      name: string;
      avatar?: {
        url: string;
      };
    };
  };
  categories?: {
    nodes: {
      name: string;
      slug: string;
    }[];
  };
  comments?: {
    nodes: GQLComment[];
  };
}

const getPostBySlug = cache(async (slug: string) => {
  const data: { post?: GQLPost | null } | null = await fetchGraphQL(GET_POST_BY_SLUG, { slug });
  return data?.post || null;
});

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await getPostBySlug(slug);
    if (post) {
      // Try fetching precise RankMath tags first
      const seo = await fetchRankMathSEO(`https://bootflare.com/${slug}/`);
      if (seo) return mapRankMathToMetadata(seo);

      // Fallback
      return mapWPToMetadata({
        title: { rendered: post.title },
        excerpt: { rendered: post.excerpt },
        _embedded: {
          'wp:featuredmedia': post.featuredImage ? [{ source_url: post.featuredImage.node.sourceUrl }] : []
        }
      } as any, 'Blog | Bootflare');
    }
  } catch (error) {
    console.error('Error generating metadata for blog post:', error);
  }
  return { title: 'Post Not Found | Bootflare' };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let post: GQLPost | null = null;
  let errorOccurred = false;

  try {
    post = await getPostBySlug(slug);
  } catch (error) {
    console.error('Error fetching post:', error);
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
          <Link href="/blog" prefetch={false} className="btn-premium">
            Back to Insights
          </Link>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="bg-slate-50 min-h-screen pt-32 pb-20">
        <div className="container text-center py-32 bg-white rounded-[3rem] border border-dashed border-slate-200">
          <p className="text-slate-400 text-xl font-light">Post not found.</p>
          <Link href="/blog" prefetch={false} className="text-primary font-bold mt-4 inline-block hover:underline">
            Back to Insights
          </Link>
        </div>
      </div>
    );
  }

  const sanitizedContent = stripScripts(post.content);
  const categories = post.categories?.nodes || [];
  const authorName = post.author?.node?.name || "Bootflare Editorial";
  const authorAvatar = post.author?.node?.avatar?.url;
  const featuredImage = post.featuredImage?.node?.sourceUrl;
  const shareUrl = `https://bootflare.com/blog/${post.slug}`;

  return (
    <article className="bg-white min-h-screen pb-20" suppressHydrationWarning>
      <div className="container pt-20 pb-16">
        <Link href="/blog" prefetch={false} className="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-bold mb-12 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Insights
        </Link>

        <div className="max-w-4xl mx-auto">
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 mb-8">
            {categories.map(cat => (
              <Link key={cat.slug} href={`/category/${cat.slug}`} prefetch={false} className="text-[10px] font-bold text-primary uppercase tracking-widest px-3 py-1 bg-primary/10 rounded-full hover:bg-primary hover:text-white transition-all">
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

          <h1
            className="text-4xl md:text-6xl font-bold mb-12 leading-tight text-slate-900 font-ubuntu"
            dangerouslySetInnerHTML={{ __html: post.title }}
          />

          {featuredImage && (
            <div className="mb-20 rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-200 border-8 border-white ring-1 ring-slate-100">
              <img src={featuredImage} alt={post.title} className="w-full h-auto" />
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
                    {authorAvatar ? (
                      <img 
                        src={authorAvatar} 
                        alt={authorName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-400">
                        <User className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-slate-900">{authorName}</p>
                      <p className="text-xs text-slate-500">Editorial Team</p>
                    </div>
                  </div>
                </div>

                {/* Share */}
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Spread the knowledge</h4>
                  <div className="flex gap-3">
                    <a 
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-[#1877F2] hover:text-white transition-all"
                      aria-label="Share on Facebook"
                    >
                      <Facebook className="w-4 h-4" />
                    </a>
                    <a 
                      href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-black hover:text-white transition-all"
                      aria-label="Share on X"
                    >
                      <Twitter className="w-4 h-4" />
                    </a>
                    <a 
                      href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(post.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-[#0A66C2] hover:text-white transition-all"
                      aria-label="Share on LinkedIn"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <CommentsSection comments={post.comments?.nodes || []} postId={post.databaseId} />
        </div>
      </div>
    </article>
  );
}

function CommentsSection({ comments, postId }: { comments: GQLComment[]; postId: number }) {
  // Build a tree structure for nested comments
  const rootComments = comments.filter(c => !c.parentId);
  const childComments = comments.filter(c => c.parentId);

  const getChildComments = (parentId: string) => 
    childComments.filter(c => c.parentId === parentId);

  if (comments.length === 0) {
    return (
      <div className="mt-20 pt-16 border-t border-slate-100">
        <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
          <MessageCircle className="w-6 h-6 text-primary" />
          Comments
        </h2>
        <p className="text-slate-500 text-center py-12 bg-slate-50 rounded-2xl">
          No comments yet. Be the first to share your thoughts!
        </p>
        <CommentForm postId={postId.toString()} />
      </div>
    );
  }

  return (
    <div className="mt-20 pt-16 border-t border-slate-100">
      <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
        <MessageCircle className="w-6 h-6 text-primary" />
        {comments.length} Comment{comments.length > 1 ? 's' : ''}
      </h2>
      <div className="space-y-8">
        {rootComments.map(comment => (
          <CommentItem key={comment.id} comment={comment} replies={getChildComments(comment.id)} getChildComments={getChildComments} />
        ))}
      </div>
      <CommentForm postId={postId.toString()} />
    </div>
  );
}

function CommentItem({ 
  comment, 
  replies, 
  getChildComments,
  depth = 0 
}: { 
  comment: GQLComment; 
  replies: GQLComment[];
  getChildComments: (parentId: string) => GQLComment[];
  depth?: number;
}) {
  const authorName = comment.author?.node?.name || 'Anonymous';
  const avatarUrl = comment.author?.node?.avatar?.url;
  const date = new Date(comment.date).toLocaleDateString(undefined, { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });

  return (
    <div className={depth > 0 ? 'ml-8 pl-6 border-l-2 border-slate-100' : ''}>
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-start gap-4">
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={authorName}
              className="w-12 h-12 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
              <User className="w-6 h-6" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <span className="font-bold text-slate-900">{authorName}</span>
              <span className="text-xs text-slate-400">{date}</span>
            </div>
            <div 
              className="text-slate-600 prose prose-sm max-w-none [&_p]:mb-2 [&_p:last-child]:mb-0"
              dangerouslySetInnerHTML={{ __html: comment.content }}
            />
          </div>
        </div>
      </div>
      
      {/* Nested replies */}
      {replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {replies.map(reply => (
            <CommentItem 
              key={reply.id} 
              comment={reply} 
              replies={getChildComments(reply.id)}
              getChildComments={getChildComments}
              depth={depth + 1} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

