export const revalidate = 3600;
import { fetchREST } from '@/lib/rest';
import { stripScripts, optimizeContentImages } from '@/lib/sanitize';
import { Calendar, User, ArrowLeft, Share2, Clock } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';
import { fetchRankMathSEO, mapRankMathToMetadata, mapWPToMetadata } from '@/lib/seo';
import ReactDOM from 'react-dom';

import { cache } from 'react';

export const dynamicParams = true;

interface WPPost {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  slug: string;
  date: string;
  _embedded?: {
    'wp:featuredmedia'?: { source_url: string }[];
    'wp:term'?: { taxonomy: string; name: string; slug: string }[][];
    author?: { name: string }[];
  };
}

const getPostBySlug = cache(async (slug: string) => {
  const posts: WPPost[] = await fetchREST(`posts?slug=${slug}&_embed&_fields=id,title,content,excerpt,slug,date,_links,_embedded`);
  return posts.length > 0 ? posts[0] : null;
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
      const metadata = mapWPToMetadata(post, 'Blog | Bootflare');

      return {
        ...metadata,
        alternates: {
          canonical: `https://bootflare.com/${slug}/`,
        }
      };
    }
  } catch (error) {
    console.error('Error generating metadata for blog post:', error);
  }
  return { title: 'Post Not Found | Bootflare' };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let post: WPPost | null = null;

  try {
    post = await getPostBySlug(slug);
  } catch (error) {
    console.error('Error fetching post:', error);
  }

  if (!post) {
    return <div className="container py-32 text-center text-slate-500">Post not found</div>;
  }

  const sanitizedContent = optimizeContentImages(stripScripts(post.content.rendered));

  // Extract categories safely from WP REST _embedded terms
  const terms = post._embedded?.['wp:term'] || [];
  const categories: { name: string, slug: string }[] = [];
  for (const taxonomyList of terms) {
    for (const term of taxonomyList) {
      if (term.taxonomy === 'category') {
        categories.push({ name: term.name, slug: term.slug });
      }
    }
  }

  const authorName = post._embedded?.author?.[0]?.name || "Bootflare Editorial";
  const featuredImage = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;

  if (featuredImage) {
    // Correct preloading method for Next.js/React - ensures discovery even before hydration
    ReactDOM.preload(featuredImage, { as: 'image', fetchPriority: 'high' });
  }

  return (
    <article className="bg-white min-h-screen pb-20" suppressHydrationWarning>
      <div className="container pt-20 pb-16">
        <Link href="/blog" prefetch={true} className="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-bold mb-12 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Insights
        </Link>

        <div className="max-w-4xl mx-auto">
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 mb-8">
            {categories.map(cat => (
              <Link key={cat.slug} href={`/category/${cat.slug}`} prefetch={true} className="text-[10px] font-bold text-primary uppercase tracking-widest px-3 py-1 bg-primary/10 rounded-full hover:bg-primary hover:text-white transition-all">
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
            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
          />

          {featuredImage && (
            <div className="mb-20 rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-200 border-8 border-white ring-1 ring-slate-100">
              <img
                src={featuredImage}
                alt={post.title.rendered}
                className="w-full h-auto"
                width={1200}
                height={630}
                decoding="async"
                // @ts-ignore - fetchPriority is supported in modern browsers
                fetchPriority="high"
              />
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
                    <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-400">
                      <User className="w-6 h-6" />
                    </div>
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
