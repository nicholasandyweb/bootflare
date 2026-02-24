import { fetchGraphQL } from '@/lib/graphql';
import ContactForm from '@/components/ContactForm';

const GET_CONTACT_PAGE = `
  query GetContactPage {
    page(id: "/contact/", idType: URI) {
      title
      excerpt
    }
  }
`;

interface WPPage {
  title: string;
  excerpt?: string;
}

export default async function ContactPage() {
  let page: WPPage | null = null;
  try {
    const data: { page: WPPage } = await fetchGraphQL(GET_CONTACT_PAGE);
    page = data.page;
  } catch (error) {
    console.error('Error fetching contact page:', error);
  }

  // Strip HTML tags from excerpt for plain text display
  const plainExcerpt = page?.excerpt
    ? page.excerpt.replace(/<[^>]*>/g, '').trim()
    : undefined;

  return <ContactForm title={page?.title} excerpt={plainExcerpt} />;
}
