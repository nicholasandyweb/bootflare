'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useRef, useEffect } from 'react';

/**
 * Renders article HTML and intercepts clicks on internal links so they use
 * Next.js client-side navigation instead of triggering full HTTP requests.
 */
export default function ArticleContent({ html }: { html: string }) {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  const handleClick = useCallback(
    (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      // Skip external links, anchors, mailto, tel, etc.
      if (
        anchor.target === '_blank' ||
        href.startsWith('http') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('#')
      ) {
        return;
      }

      // Internal relative link — navigate with Next.js router
      e.preventDefault();
      router.push(href);
    },
    [router]
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.addEventListener('click', handleClick);
    return () => el.removeEventListener('click', handleClick);
  }, [handleClick]);

  return (
    <div
      ref={ref}
      className="prose prose-slate prose-xl max-w-none text-slate-700 leading-relaxed font-light article-content
        [&_p]:mb-10 [&_p:last-child]:mb-0
        [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:mt-16 [&_h2]:mb-8 [&_h2]:text-slate-900
        [&_h3]:text-2xl [&_h3]:font-bold [&_h3]:mt-12 [&_h3]:mb-6 [&_h3]:text-slate-900
        [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-8 [&_ul]:space-y-3
        [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-8 [&_ol]:space-y-3
        [&_li]:mb-2"
      dangerouslySetInnerHTML={{ __html: html }}
      suppressHydrationWarning
    />
  );
}
