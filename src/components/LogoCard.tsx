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
        <div className="group relative h-full">
            <Link
                href={`/logo/${logo.slug}`}
                prefetch={false}
                className="card-premium !p-0 aspect-square flex flex-col items-center justify-between overflow-hidden bg-white hover:!border-primary/20 h-full w-full"
            >
                <div className="flex-1 w-full flex items-center justify-center p-6 min-h-0">
                    <img
                        src={featuredImage || "https://via.placeholder.com/300"}
                        alt={logo._embedded?.['wp:featuredmedia']?.[0]?.alt_text || `${logo.title.rendered} Logo`}
                        className="max-w-full max-h-full object-contain filter group-hover:scale-110 transition-transform duration-500"
                    />
                </div>
                <div className="w-full py-4 px-3 bg-white border-t border-slate-100 transition-colors shrink-0">
                    <h3 className="text-[11px] sm:text-xs font-bold text-slate-800 line-clamp-2 group-hover:text-primary transition-colors text-center leading-tight">
                        {logo.title.rendered}
                    </h3>
                </div>
            </Link>
        </div>
    );
}
