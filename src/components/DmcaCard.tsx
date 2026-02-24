import Link from 'next/link';

export default function DmcaCard() {
    return (
        <div className="mt-16 bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-600 text-[15px] leading-relaxed mx-auto w-full">
            <span className="font-bold text-slate-800">Bootflare is DMCA compliant.</span> If your copyrighted work has been posted on bootflare.com, please <Link href="/dmca-policy" className="text-[#8b5cf6] hover:underline font-medium">request takedown</Link> or contact us via{' '}
            <br className="hidden md:inline" />
            <a href="mailto:dmca@bootflare.com" className="text-[#8b5cf6] hover:underline font-medium">dmca@bootflare.com</a> for immediate removal.
        </div>
    );
}
