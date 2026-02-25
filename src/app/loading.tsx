import { Sparkles } from 'lucide-react';

export default function Loading() {
    return (
        <div className="bg-slate-50 min-h-screen pt-32 pb-20 flex flex-col items-center justify-center">
            <div className="text-center">
                <div className="relative inline-flex mb-8">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                    <div className="bg-white p-4 rounded-2xl relative shadow-xl border border-slate-100">
                        <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                    </div>
                </div>

                <h2 className="text-3xl font-black text-slate-900 mb-4 animate-pulse">
                    Loading
                </h2>
                <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-primary/80 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
            </div>
        </div>
    );
}
