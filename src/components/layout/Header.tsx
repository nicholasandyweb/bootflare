import Link from 'next/link';
import Image from 'next/image';

const Header = () => {
    return (
        <header className="fixed top-0 left-0 w-full bg-white z-50 shadow-sm">
            <div className="container flex justify-between items-center py-4">
                <Link href="/">
                    <Image
                        src="https://bootflare.com/wp-content/uploads/2023/03/Bootflare-Logo-e1679434514501-300x110.png"
                        alt="Bootflare Logo"
                        width={150}
                        height={55}
                        priority
                    />
                </Link>
                <nav className="hidden md:flex gap-6 items-center">
                    <Link href="/" className="font-semibold text-primary">Home</Link>
                    <Link href="/about-us" className="hover:text-primary transition-colors">About</Link>
                    <div className="group relative">
                        <span className="cursor-pointer hover:text-primary transition-colors">Downloads</span>
                        <div className="absolute hidden group-hover:block top-full left-0 bg-white shadow-lg p-4 min-w-[200px]">
                            <Link href="/free-brand-logos" className="block py-2 hover:text-primary">Free Brand Logos</Link>
                            <Link href="/royalty-free-music" className="block py-2 hover:text-primary">Royalty free music</Link>
                        </div>
                    </div>
                    <div className="group relative">
                        <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
                        <div className="absolute hidden group-hover:block top-full left-0 bg-white shadow-lg p-4 min-w-[150px]">
                            <Link href="/category/general" className="block py-2 hover:text-primary">General</Link>
                            <Link href="/category/tech" className="block py-2 hover:text-primary">Tech</Link>
                            <Link href="/category/tips" className="block py-2 hover:text-primary">Tips</Link>
                            <Link href="/category/web-design" className="block py-2 hover:text-primary">Web Design</Link>
                        </div>
                    </div>
                    <Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link>
                </nav>
                <button className="md:hidden">
                    {/* Mobile menu icon */}
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                    </svg>
                </button>
            </div>
        </header>
    );
};

export default Header;
