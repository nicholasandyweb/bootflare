export default function CategoryListSkeleton() {
    return (
        <div className="mt-32 mb-32 animate-pulse">
            <div className="h-8 w-64 bg-slate-200 rounded mx-auto mb-12" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-24 bg-white rounded-2xl border border-pink-100" />
                ))}
            </div>
        </div>
    );
}
