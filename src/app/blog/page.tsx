export const dynamic = 'force-dynamic';
export const revalidate = 3600;
import { fetchREST } from '@/lib/rest';
import Link from 'next/link';
import { stripScripts } from '@/lib/sanitize';
import { Calendar, ChevronRight, Hash } from 'lucide-react';
import { fetchRankMathSEO, mapRankMathToMetadata } from '@/lib/seo';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await fetchRankMathSEO('https://bootflare.com/blog/');
  if (seo) return mapRankMathToMetadata(seo);
  return { title: 'Blog | Bootflare' };
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

export default async function BlogPage() {
  let posts: WPPost[] = [];
  try {
    const res = await fetchREST('posts?_embed&per_page=8&_fields=id,title,slug,excerpt,date,_links,_embedded');
    if (Array.isArray(res)) {
      posts = Array.from(new Map(res.map((item: any) => [item.id, item])).values()) as WPPost[];
    }
  } catch (error) {
    console.error('Error fetching posts:', error);
  }

  const extractCategories = (post: WPPost) => {
    const terms = post._embedded?.['wp:term'] || [];
    const categories: { name: string, slug: string }[] = [];
    for (const taxonomyList of terms) {
      for (const term of taxonomyList) {
        if (term.taxonomy === 'category') {
          categories.push({ name: term.name, slug: term.slug });
        }
      }
    }
    return categories;
  };

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
        {posts.length > 0 && (() => {
          const firstPost = posts[0];
          const featuredImage = firstPost._embedded?.['wp:featuredmedia']?.[0]?.source_url;
          const categories = extractCategories(firstPost);

          return (
            <div className="mb-16">
              <div className="grid lg:grid-cols-2 gap-10 items-center bg-white rounded-[3rem] overflow-hidden shadow-sm border border-slate-100 p-6 md:p-10">
                {featuredImage && (
                  <Link href={`/blog/${firstPost.slug}`} prefetch={true} className="block relative aspect-video rounded-[2rem] overflow-hidden group">
                    <img
                      src={featuredImage}
                      alt={firstPost.title.rendered}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </Link>
                )}
                <div>
                  <div className="flex gap-2 mb-6">
                    {categories.map(cat => (
                      <Link key={cat.slug} href={`/category/${cat.slug}`} prefetch={true} className="text-xs font-bold text-primary uppercase tracking-widest px-3 py-1 bg-primary/10 rounded-full hover:bg-primary hover:text-white transition-all">
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                  <Link href={`/blog/${firstPost.slug}`} prefetch={true}>
                    <h2
                      className="text-3xl md:text-4xl font-bold mb-6 hover:text-primary transition-colors text-slate-900"
                      dangerouslySetInnerHTML={{ __html: firstPost.title.rendered }}
                    />
                  </Link>
                  <div
                    className="text-slate-500 text-lg line-clamp-3 mb-8 font-light [&_p]:mb-0"
                    dangerouslySetInnerHTML={{ __html: stripScripts(firstPost.excerpt.rendered) }}
                  />
                  <Link href={`/blog/${firstPost.slug}`} prefetch={true} className="btn-premium group !px-10">
                    Read Article <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Grid Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.slice(1).map((post) => {
            const featuredImage = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
            const categories = extractCategories(post);

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
                    {categories.length > 0 && (
                      <>
                        <Link href={`/category/${categories[0].slug}`} prefetch={true} className="text-primary hover:underline">
                          {categories[0].name}
                        </Link>
                        <span>•</span>
                      </>
                    )}
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
            );
          })}
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

