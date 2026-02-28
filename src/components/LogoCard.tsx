import Link from 'next/link';

interface LogoCardProps {
    logo: {
        id: number;
        title: {
            rendered: string;
        };
        slug: string;
        _embedded?: {
            'wp:featuredmedia'?: {
                source_url: string;
                alt_text?: string;
            }[];
        };
    };
}

export default function LogoCard({ logo }: LogoCardProps) {
    const featuredImage = logo._embedded?.['wp:featuredmedia']?.[0]?.source_url;

    return (
        <div className="group relative">
            <Link
                href={`/logo/${logo.slug}`}
                prefetch={false}
                className="card-premium !p-0 aspect-square flex flex-col items-center justify-center gap-2 overflow-hidden bg-white hover:!border-primary/20"
            >
                <div className="flex-1 min-h-0 w-full flex items-center justify-center p-6">
                    <img
                        src={featuredImage || "https://via.placeholder.com/300"}
                        alt={logo._embedded?.['wp:featuredmedia']?.[0]?.alt_text || `${logo.title.rendered} Logo`}
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
}
