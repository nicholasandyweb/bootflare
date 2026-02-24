import { fetchREST } from '@/lib/rest';
import Link from 'next/link';

interface Logo {
  id: number;
  title: {
    rendered: string;
  };
  slug: string;
  _embedded?: {
    'wp:featuredmedia'?: {
      source_url: string;
    }[];
  };
}

export async function generateStaticParams() {
  try {
    const categories: { slug: string }[] = await fetchREST('logos?per_page=100');
    return categories.map((cat) => ({
      slug: cat.slug,
    }));
  } catch (error) {
    console.error('Error generating static params for categories:', error);
    return [];
  }
}

export default async function LogoCategory({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let logos: Logo[] = [];
  let categoryName = slug;

  try {
    // First find the category ID by slug
    const categories = await fetchREST(`logos?slug=${slug}`);
    if (categories.length > 0) {
      const catId = categories[0].id;
      categoryName = categories[0].name;
      // Then fetch logos with that category
      logos = await fetchREST(`logo?logos=${catId}&per_page=100`);
    }
  } catch (error) {
    console.error('Error fetching category logos:', error);
  }

  return (
    <div className="container py-20 px-6 pt-32">
      <h1 className="text-5xl font-bold mb-10 text-center">{categoryName}</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {logos.map((logo) => {
          const featuredImage = logo._embedded?.['wp:featuredmedia']?.[0]?.source_url;

          return (
            <div key={logo.id} className="group relative">
              <Link
                href={`/logo/${logo.slug}`}
                className="card-premium !p-0 aspect-square flex flex-col items-center justify-center gap-2 overflow-hidden bg-white hover:!border-primary/20"
              >
                <div className="flex-1 w-full flex items-center justify-center p-6">
                  <img
                    src={featuredImage || "https://via.placeholder.com/300"}
                    alt={logo.title.rendered}
                    className="max-w-[80%] max-h-[80%] object-contain filter group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                <div className="w-full py-5 px-4 bg-white border-t border-slate-100 transition-colors">
                  <h3 className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-primary transition-colors text-center">
                    {logo.title.rendered}
                  </h3>
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      {logos.length === 0 && (
        <div className="container py-20 text-center text-gray-500">
          No logos found in this category.
        </div>
      )}
    </div>
  );
}
