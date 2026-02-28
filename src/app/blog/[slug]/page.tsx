import { redirect } from 'next/navigation';

/**
 * Backward-compatibility redirect: /blog/<slug> → /<slug>/
 * Blog posts now live at the root to match WordPress canonical URLs.
 */
export default async function BlogPostRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/${slug}/`);
}

