import { stripScripts } from '@/lib/sanitize';

interface WPPageContentProps {
    title: string;
    content: string;
    badge?: string;
}

/**
 * Generic WordPress page content renderer.
 * Used for legal/policy pages (Privacy Policy, Terms of Use, DMCA, etc.)
 * Content is fetched server-side and rendered here as sanitized HTML.
 * The "wp-content" class ties into global SVG/image constraints in globals.css.
 */
export default function WPPageContent({ title, content, badge }: WPPageContentProps) {
    return (
        <div className="bg-slate-50 min-h-screen pt-32 pb-32">
            <div className="container max-w-4xl">
                {/* Header */}
                <div className="mb-14 pb-10 border-b border-slate-200">
                    {badge && (
                        <p className="text-xs font-bold text-primary uppercase tracking-widest mb-4">{badge}</p>
                    )}
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 font-ubuntu">{title}</h1>
                </div>

                {/* WordPress Content */}
                <div
                    className="wp-content
                        [&_p]:text-black [&_p]:leading-relaxed [&_p]:mb-10 [&_p:last-child]:mb-0
                        [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-black [&_h2]:mt-12 [&_h2]:mb-5
                        [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-black [&_h3]:mt-8 [&_h3]:mb-4
                        [&_h4]:text-lg [&_h4]:font-bold [&_h4]:text-black [&_h4]:mt-6 [&_h4]:mb-3
                        [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-6 [&_ul]:space-y-2
                        [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-6 [&_ol]:space-y-2
                        [&_li]:text-black [&_li]:leading-relaxed
                        [&_a]:text-primary [&_a]:no-underline hover:[&_a]:underline
                        [&_strong]:text-black [&_strong]:font-semibold
                        [&_blockquote]:border-l-4 [&_blockquote]:border-primary/30 [&_blockquote]:pl-6 [&_blockquote]:italic [&_blockquote]:text-black [&_blockquote]:my-8
                        [&_hr]:border-slate-200 [&_hr]:my-10
                        [&_table]:w-full [&_table]:mb-6 [&_td]:py-2 [&_td]:pr-4 [&_td]:text-black [&_th]:text-left [&_th]:font-bold [&_th]:text-black [&_th]:pb-2"
                    dangerouslySetInnerHTML={{ __html: stripScripts(content) }}
                    suppressHydrationWarning
                />
            </div>
        </div>
    );
}
