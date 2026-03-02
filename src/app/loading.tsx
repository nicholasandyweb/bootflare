/** Home page skeleton — shown while the server component fetches hero images */
export default function HomeLoading() {
    return (
        <div className="animate-pulse flex flex-col overflow-hidden">
            {/* Hero */}
            <section className="relative min-h-[90vh] flex items-center pt-20 pb-20 bg-slate-50">
                <div className="container relative z-10 grid lg:grid-cols-2 gap-16 items-center">
                    <div className="flex flex-col gap-6 text-center lg:text-left">
                        <div className="h-6 w-56 bg-purple-100 rounded-full mx-auto lg:mx-0" />
                        <div className="space-y-4">
                            <div className="h-14 bg-slate-200 rounded-2xl w-full" />
                            <div className="h-14 bg-slate-200 rounded-2xl w-4/5 mx-auto lg:mx-0" />
                            <div className="h-14 bg-slate-100 rounded-2xl w-3/5 mx-auto lg:mx-0" />
                        </div>
                        <div className="h-5 bg-slate-100 rounded w-full max-w-xl mx-auto lg:mx-0" />
                        <div className="h-5 bg-slate-100 rounded w-4/5 max-w-xl mx-auto lg:mx-0" />
                        <div className="flex gap-4 justify-center lg:justify-start mt-2">
                            <div className="h-14 w-44 bg-purple-200 rounded-2xl" />
                            <div className="h-14 w-36 bg-slate-200 rounded-2xl" />
                        </div>
                    </div>
                    <div className="hidden lg:block">
                        <div className="h-[500px] bg-slate-200 rounded-3xl" />
                    </div>
                </div>
            </section>

            {/* Logo marquee skeleton */}
            <section className="py-16 bg-white">
                <div className="container">
                    <div className="h-7 w-72 bg-slate-200 rounded-xl mx-auto mb-10" />
                    <div className="flex gap-6 overflow-hidden">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="flex-shrink-0 w-28 h-28 bg-slate-100 rounded-2xl" />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
