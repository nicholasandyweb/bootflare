import { fetchREST } from '@/lib/rest';
import Link from 'next/link';
import DmcaCard from './DmcaCard';

interface LogoCategory {
    id: number;
    name: string;
    slug: string;
    count: number;
}

export default async function CategoryList() {
    let categories: LogoCategory[] = [];

    try {
        categories = await fetchREST('logos?per_page=100&hide_empty=true');
    } catch (error) {
        console.error('Error fetching logo categories:', error);
    }

    // Double-ensure we only show categories with logos
    const activeCategories = (categories || []).filter(cat => cat.count > 0);

    if (activeCategories.length === 0) return null;

    return (
        <section className="mt-24 mb-32">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-slate-800">Browse Logos by Category</h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {activeCategories.map((cat) => (
                    <Link
                        key={cat.id}
                        href={`/logos/${cat.slug}`}
                        className="block bg-white border border-pink-100 rounded-2xl px-6 py-5 text-center shadow-[0_4px_20px_-4px_rgba(252,231,243,0.5)] hover:border-primary/30 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                    >
                        <h3 className="font-bold text-slate-900 text-[15px] mb-1.5 leading-tight">{cat.name}</h3>
                        <div className="font-semibold text-[#8b5cf6] text-[14px]">
                            {cat.count} Logos
                        </div>
                    </Link>
                ))}
            </div>

            <DmcaCard />
        </section>
    );
}
