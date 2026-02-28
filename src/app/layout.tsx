import type { Metadata } from "next";
import { Montserrat, Ubuntu } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const ubuntu = Ubuntu({
  variable: "--font-ubuntu",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Bootflare - Powering Your Digital Footprint",
  description: "Powering digital footprints for businesses and organizations. Download Royalty Free Music and Free Brand Logos for your creative projects.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${montserrat.variable} ${ubuntu.variable} antialiased font-sans`}
        suppressHydrationWarning
      >
        <Header />
        <main className="mt-16 min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
