/**
 * Shown automatically by Next.js during client-side navigation
 * while logos/[slug]/page.tsx is fetching data.
 */
export default function CategorySkeleton() {
    return (
        <div className="animate-pulse bg-slate-50 min-h-screen">
            {/* Header / Hero Section Skeleton */}
            <div className="bg-[#FBF3FF] py-16 px-6 pt-32 pb-16">
                <div className="container max-w-4xl mx-auto flex flex-col items-center text-center">
                    {/* Title Skeleton */}
                    <div className="h-10 md:h-12 w-3/4 md:w-1/2 bg-slate-200 rounded-2xl mb-6" />

                    {/* Breadcrumbs Skeleton */}
                    <div className="flex gap-2 items-center mb-8">
                        <div className="h-4 w-12 bg-slate-200 rounded" />
                        <div className="h-4 w-2 bg-slate-200 rounded" />
                        <div className="h-4 w-24 bg-slate-200 rounded" />
                        <div className="h-4 w-2 bg-slate-200 rounded" />
                        <div className="h-4 w-20 bg-slate-200 rounded" />
                    </div>

                    {/* Description Skeleton */}
                    <div className="space-y-3 w-full max-w-2xl mb-10">
                        <div className="h-4 w-full bg-slate-200 rounded" />
                        <div className="h-4 w-5/6 bg-slate-200 rounded mx-auto" />
                    </div>

                    {/* Search Input Skeleton */}
                    <div className="w-full max-w-xl h-14 bg-white border border-pink-100 rounded-2xl shadow-sm" />
                </div>
            </div>

            {/* Logo Grid Skeleton */}
            <div className="container py-16 px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-6">
                    {[...Array(16)].map((_, i) => (
                        <div key={i} className="bg-white rounded-[2rem] p-6 pb-5 shadow-sm border border-slate-100/50 aspect-square flex flex-col justify-between">
                            <div className="flex-1 w-full bg-slate-100 rounded-xl mb-4" />
                            <div className="h-4 w-3/4 bg-slate-100 rounded mx-auto" />
                        </div>
                    ))}
                </div>

                {/* Category List Skeleton */}
                <div className="mt-32 mb-32">
                    <div className="h-8 w-64 bg-slate-200 rounded mx-auto mb-12" />
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="h-24 bg-white rounded-2xl border border-pink-100" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
