/**
 * Shown by Next.js automatically (via Suspense) while logo/[slug]/page.tsx
 * is fetching data for the first time (uncached). Once a page is cached,
 * Next.js serves it instantly without showing this skeleton.
 */
export default function LogoPageSkeleton() {
    return (
        <div className="animate-pulse">
            {/* Breadcrumb skeleton */}
            <div className="bg-gray-50 border-b border-gray-100 py-4">
                <div className="container px-6 flex items-center gap-2">
                    <div className="h-4 w-10 bg-slate-200 rounded" />
                    <div className="h-4 w-2 bg-slate-200 rounded" />
                    <div className="h-4 w-14 bg-slate-200 rounded" />
                    <div className="h-4 w-2 bg-slate-200 rounded" />
                    <div className="h-4 w-32 bg-slate-200 rounded" />
                </div>
            </div>

            <div className="container py-16 px-6 max-w-5xl mx-auto">
                <div className="flex flex-col gap-12 text-center">
                    {/* Title skeleton */}
                    <div className="space-y-3 max-w-2xl mx-auto w-full">
                        <div className="h-10 bg-slate-200 rounded-2xl w-4/5 mx-auto" />
                        <div className="h-10 bg-slate-200 rounded-2xl w-3/5 mx-auto" />
                    </div>

                    {/* Category badges */}
                    <div className="flex justify-center gap-2">
                        <div className="h-7 w-20 bg-slate-200 rounded-full" />
                        <div className="h-7 w-24 bg-slate-200 rounded-full" />
                    </div>

                    {/* Logo preview box */}
                    <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 md:p-20 shadow-2xl flex items-center justify-center min-h-[400px]">
                        <div className="w-64 h-64 bg-slate-100 rounded-3xl" />
                    </div>

                    {/* Description skeleton */}
                    <div className="text-left max-w-4xl mx-auto w-full space-y-4">
                        <div className="h-7 w-72 bg-slate-200 rounded-xl" />
                        <div className="space-y-3">
                            <div className="h-4 bg-slate-100 rounded w-full" />
                            <div className="h-4 bg-slate-100 rounded w-full" />
                            <div className="h-4 bg-slate-100 rounded w-4/5" />
                            <div className="h-4 bg-slate-100 rounded w-full" />
                            <div className="h-4 bg-slate-100 rounded w-3/4" />
                        </div>

                        {/* Download box skeleton */}
                        <div className="bg-gray-50 rounded-3xl p-8 md:p-12 border border-gray-100 mt-8 space-y-6">
                            <div className="h-5 bg-slate-200 rounded w-2/3" />
                            <div className="h-16 bg-slate-200 rounded-2xl w-full" />
                        </div>
                    </div>
                </div>

                {/* Related logos skeleton */}
                <div className="mt-32">
                    <div className="flex justify-between items-end mb-12">
                        <div className="h-8 w-44 bg-slate-200 rounded-xl" />
                        <div className="h-5 w-20 bg-slate-200 rounded" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="aspect-square bg-slate-100 rounded-[1.5rem]" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
