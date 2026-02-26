import Link from 'next/link';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    baseUrl: string;
    usePathBased?: boolean;
}

export default function Pagination({ currentPage, totalPages, baseUrl, usePathBased }: PaginationProps) {
    if (totalPages <= 1) return null;

    const getPageUrl = (pageNumber: number) => {
        if (usePathBased) {
            const cleanBase = baseUrl.replace(/\/+$/, '');
            if (pageNumber > 1) {
                return `${cleanBase}/page/${pageNumber}/`;
            }
            return `${cleanBase}/`;
        }

        // Efficient URL building
        const cleanBase = baseUrl.split('?')[0];
        const searchParams = new URLSearchParams(baseUrl.includes('?') ? baseUrl.split('?')[1] : '');

        if (pageNumber > 1) {
            searchParams.set('page', pageNumber.toString());
        } else {
            searchParams.delete('page');
        }

        const qs = searchParams.toString();
        return cleanBase + (qs ? `?${qs}` : '');
    };

    const getPages = () => {
        const pages: (number | string)[] = [];
        const showMax = 5;

        if (totalPages <= showMax) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, '...', totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }
        return pages;
    };

    return (
        <div className="flex items-center justify-center gap-4 mt-16 mb-8 text-[1.1rem]">
            {currentPage > 1 && (
                <Link
                    href={getPageUrl(currentPage - 1)}
                    className="font-medium text-slate-800 hover:text-[#8b5cf6] transition-colors"
                >
                    Prev
                </Link>
            )}

            <div className="flex items-center gap-3">
                {getPages().map((page, index) => {
                    if (page === '...') {
                        return (
                            <span key={`ellipsis-${index}`} className="text-[#8b5cf6] font-medium tracking-[0.2em] mb-2 px-1">
                                ...
                            </span>
                        );
                    }

                    const isActive = page === currentPage;
                    return (
                        <Link
                            key={page}
                            href={getPageUrl(page as number)}
                            className={`min-w-[42px] h-[42px] px-2 flex items-center justify-center rounded-[10px] font-medium transition-all ${isActive
                                ? "bg-[#8b5cf6] text-white"
                                : "text-slate-800 hover:bg-slate-100 hover:text-[#8b5cf6]"
                                }`}
                        >
                            {page}
                        </Link>
                    );
                })}
            </div>

            {currentPage < totalPages && (
                <Link
                    href={getPageUrl(currentPage + 1)}
                    className="font-medium text-slate-800 hover:text-[#8b5cf6] transition-colors"
                >
                    Next
                </Link>
            )}
        </div>
    );
}
