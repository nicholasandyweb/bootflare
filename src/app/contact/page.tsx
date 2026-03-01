export const revalidate = 86400; // 24 hours
import { fetchREST } from '@/lib/rest';
import ContactForm from '@/components/ContactForm';
import Link from 'next/link';

interface RESTPage {
  title: { rendered: string };
  excerpt: { rendered: string };
}

export default async function ContactPage() {
  let page: RESTPage | null = null;
  try {
    const data = await fetchREST('pages?slug=contact&_fields=title,excerpt');
    if (data && Array.isArray(data) && data.length > 0) {
      page = data[0];
    }
  } catch (error) {
    console.error('Error fetching contact page:', error);
  }

  if (!page) {
    return (
      <div className="bg-slate-50 min-h-screen pt-32 pb-20 flex items-center justify-center">
        <div className="container text-center py-32 bg-white rounded-[3rem] border border-dashed border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Contact Information Unavailable</h2>
          <p className="text-slate-500 text-lg font-light mb-8 max-w-md mx-auto">
            Our contact page is temporarily undergoing maintenance. Please try again shortly.
          </p>
          <Link href="/" className="btn-premium">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Strip HTML tags from excerpt for plain text display
  const plainExcerpt = page.excerpt.rendered
    ? page.excerpt.rendered.replace(/<[^>]*>/g, '').trim()
    : undefined;

  return <ContactForm title={page.title.rendered} excerpt={plainExcerpt} />;
}
