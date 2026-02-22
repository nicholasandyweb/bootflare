import Link from 'next/link';

const Footer = () => {
    return (
        <footer className="bg-[#383838] text-white py-12 mt-20">
            <div className="container grid md:grid-cols-4 gap-8">
                <div>
                    <h3 className="text-xl mb-4">Latest Articles</h3>
                    {/* placeholder for dynamically fetched articles */}
                    <ul className="space-y-2 text-sm opacity-80">
                        <li><Link href="#" className="hover:underline">How To Share WordPress Posts Automatically To Pinterest</Link></li>
                        <li><Link href="#" className="hover:underline">How To Find Your Opay Account Number</Link></li>
                    </ul>
                </div>
                <div>
                    <h3 className="text-xl mb-4">Links</h3>
                    <ul className="space-y-2 text-sm opacity-80">
                        <li><Link href="/contact" className="hover:underline">Contact</Link></li>
                        <li><Link href="/privacy-policy" className="hover:underline">Privacy</Link></li>
                        <li><Link href="/terms-of-use" className="hover:underline">Terms</Link></li>
                        <li><Link href="/dmca-policy" className="hover:underline">DMCA</Link></li>
                    </ul>
                </div>
                <div>
                    <h3 className="text-xl mb-4">Discover</h3>
                    <ul className="space-y-2 text-sm opacity-80">
                        <li><Link href="/royalty-free-music" className="hover:underline">Royalty Free Music</Link></li>
                        <li><Link href="/free-brand-logos" className="hover:underline">Brand Logos</Link></li>
                        <li><Link href="/blog" className="hover:underline">Blog</Link></li>
                    </ul>
                </div>
                <div>
                    <h3 className="text-xl mb-4">Subscribe to Newsletter</h3>
                    <p className="text-sm opacity-80 mb-4">Get first hand information about our services, offers and tips to boost your business.</p>
                    <form className="flex">
                        <input type="email" placeholder="Email Address" className="p-2 w-full text-black" />
                        <button type="submit" className="bg-secondary text-black px-4 font-bold">OK</button>
                    </form>
                </div>
            </div>
            <div className="container border-t border-gray-600 mt-10 pt-6 text-center text-sm opacity-60">
                <p>© {new Date().getFullYear()} Bootflare ❤️ From Africa.</p>
            </div>
        </footer>
    );
};

export default Footer;
