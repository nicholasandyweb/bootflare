"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Layout, Monitor, Search, RefreshCw, Mail, ArrowRight, Play, CheckCircle2, Sparkles } from "lucide-react";

interface HomeClientProps {
    logos: string[];
    music: string[];
}

export default function HomeClient({ logos, music }: HomeClientProps) {
    return (
        <div className="flex flex-col overflow-hidden">
            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center pt-20 pb-20 lg:pb-0 overflow-hidden bg-slate-50">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-2/3 h-2/3 bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-secondary/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4" />

                <div className="container relative z-10 grid lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-center lg:text-left"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-sm mb-8 border border-primary/20"
                        >
                            <Sparkles className="w-4 h-4" />
                            <span>Empowering Your Digital Presence</span>
                        </motion.div>

                        <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-[1.1] text-slate-900">
                            Build Your <span className="text-gradient">Digital Empire</span> With Bootflare
                        </h1>

                        <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0">
                            The ultimate destination for premium digital assets. Download high-quality logos and royalty-free music for your next big project.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
                            <Link href="/contact" className="btn-premium group">
                                Start Your Project
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link href="/logos" className="px-8 py-3.5 rounded-2xl bg-white border border-slate-200 font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2 shadow-sm">
                                Browse Assets
                            </Link>
                        </div>

                        <div className="mt-12 flex items-center justify-center lg:justify-start gap-6 text-slate-400">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200" />
                                ))}
                            </div>
                            <span className="text-sm font-medium">Trusted by 2k+ companies</span>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="relative hidden lg:block"
                    >
                        <div className="relative z-10 card-premium !p-4 overflow-hidden border-8 border-white">
                            <Image
                                src="https://bootflare.com/wp-content/uploads/2025/08/Bootflare-Hero.webp"
                                alt="Bootflare Hero"
                                width={700}
                                height={700}
                                priority
                                className="rounded-2xl"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        </div>

                        {/* Status Cards */}
                        <motion.div
                            animate={{ y: [0, -15, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-10 -left-10 glass p-5 rounded-2xl shadow-2xl z-20 flex items-center gap-4"
                        >
                            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-green-600">
                                <CheckCircle2 className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400">PROJECT SCORE</p>
                                <p className="text-xl font-bold text-slate-900">98/100</p>
                            </div>
                        </motion.div>

                        <motion.div
                            animate={{ y: [0, 15, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -bottom-10 -right-10 glass p-5 rounded-2xl shadow-2xl z-20 flex items-center gap-4 border border-white/50"
                        >
                            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                                <Search className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400">SEO OPTIMIZED</p>
                                <p className="text-xl font-bold text-slate-900">RANK #1</p>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Digital Assets Section */}
            <section className="py-32 bg-white">
                <div className="container">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                        <div className="max-w-2xl text-center md:text-left">
                            <h2 className="text-primary font-bold tracking-widest text-sm mb-4 uppercase">Marketplace</h2>
                            <h3 className="text-4xl md:text-5xl font-bold text-slate-900">Premium Digital Downloads</h3>
                        </div>
                        <div className="flex gap-4">
                            <Link href="/logos" prefetch={false} className="text-slate-600 font-bold hover:text-primary transition-colors flex items-center gap-2">
                                View Gallery <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    {/* Logos Scroll */}
                    <div className="relative mb-20">
                        <div className="flex overflow-hidden group">
                            <motion.div
                                animate={{ x: [0, -1000] }}
                                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                                className="flex gap-12 items-center py-10"
                            >
                                {[...logos, ...logos].map((src, i) => (
                                    <div key={i} className="flex-shrink-0 w-48 h-24 bg-slate-50 rounded-3xl p-6 flex items-center justify-center hover:bg-white hover:shadow-xl hover:scale-105 transition-all duration-300 border border-slate-100 group-hover:pause">
                                        <img src={src} alt="Brand Logo" className="max-w-full max-h-full object-contain grayscale hover:grayscale-0 transition-all opacity-70 hover:opacity-100" />
                                    </div>
                                ))}
                            </motion.div>
                        </div>
                        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10" />
                        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10" />
                    </div>

                    {/* Music Section */}
                    <div className="grid lg:grid-cols-3 gap-10">
                        <div className="lg:col-span-1 bg-gradient-to-br from-primary to-primary-dark p-12 rounded-[2.5rem] text-white overflow-hidden relative group">
                            <div className="absolute top-0 right-0 p-8 transform group-hover:scale-110 transition-transform duration-500 opacity-20">
                                <Play className="w-32 h-32 fill-current" />
                            </div>
                            <h4 className="text-3xl font-bold mb-6 relative z-10">Royalty Free Music</h4>
                            <p className="opacity-80 mb-10 leading-relaxed relative z-10">High-quality audio tracks for your podcasts, videos, and presentations.</p>
                            <Link href="/royalty-free-music" prefetch={false} className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary rounded-xl font-bold hover:bg-slate-100 transition-colors relative z-10 shadow-lg">
                                Listen Now <Play className="w-4 h-4 fill-current" />
                            </Link>
                        </div>

                        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-6">
                            {music.slice(0, 6).map((src, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ y: -8 }}
                                    className="group relative aspect-square rounded-[2rem] overflow-hidden shadow-lg"
                                >
                                    <img src={src} alt="Music Asset" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white scale-75 group-hover:scale-100 transition-transform">
                                            <Play className="w-5 h-5 fill-current" />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Grid */}
            <section className="py-32 bg-slate-50 relative overflow-hidden">
                <div className="container relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h2 className="text-primary font-bold tracking-widest text-sm mb-4 uppercase">Our Expertise</h2>
                        <h3 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Innovative Business Solutions</h3>
                        <p className="text-lg text-slate-500">We combine technical excellence with creative thinking to help your business thrive in the digital age.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <ServiceCard
                            icon={<Monitor className="w-7 h-7" />}
                            title="Web Design"
                            description="Crafting edge-cutting, responsive websites that convert visitors into customers."
                            color="bg-indigo-500"
                        />
                        <ServiceCard
                            icon={<Search className="w-7 h-7" />}
                            title="SEO Power"
                            description="Deep optimization strategy to ensure your brand dominates search results."
                            color="bg-emerald-500"
                        />
                        <ServiceCard
                            icon={<RefreshCw className="w-7 h-7" />}
                            title="Website Revamp"
                            description="Transform your legacy website into a modern, lightning-fast digital asset."
                            color="bg-amber-500"
                        />
                        <ServiceCard
                            icon={<Mail className="w-7 h-7" />}
                            title="Marketing"
                            description="Data-driven campaigns designed to scale your reach and maximize ROI."
                            color="bg-rose-500"
                        />
                    </div>
                </div>
            </section>

            {/* Final CTA/About Section */}
            <section className="py-32 bg-white overflow-hidden">
                <div className="container grid lg:grid-cols-2 gap-20 items-center">
                    <div className="relative">
                        <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl">
                            <Image
                                src="https://bootflare.com/wp-content/uploads/2025/08/Bootflare-Engineers.webp"
                                alt="Bootflare Team"
                                width={600}
                                height={600}
                            />
                        </div>
                        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />
                    </div>

                    <div className="text-center lg:text-left">
                        <h3 className="text-primary font-bold tracking-widest text-sm mb-4 uppercase">Who We Are</h3>
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-8 leading-tight">Building A Digital Future, One Project At A Time</h2>
                        <p className="text-lg text-slate-600 mb-10 leading-relaxed">
                            We are a team of passionate professionals creatively combining design and marketing ideas to provide well-formulated business solutions. Our mission is to help companies adapt and flourish in the digital era.
                        </p>

                        <div className="grid sm:grid-cols-2 gap-6 mb-12">
                            <FeatureItem text="Expert Team Members" />
                            <FeatureItem text="Customer Focused Design" />
                            <FeatureItem text="Performance Optimized" />
                            <FeatureItem text="24/7 Quality Support" />
                        </div>

                        <Link href="/about-us" className="btn-premium group">
                            Learn More About Us
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

function ServiceCard({ icon, title, description, color }: { icon: React.ReactNode, title: string, description: string, color: string }) {
    return (
        <motion.div
            whileHover={{ y: -10 }}
            className="card-premium group"
        >
            <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg shadow-current/20 transform group-hover:rotate-6 transition-transform`}>
                {icon}
            </div>
            <h3 className="text-2xl font-bold mb-4 text-slate-900">{title}</h3>
            <p className="text-slate-500 leading-relaxed">{description}</p>
        </motion.div>
    );
}

function FeatureItem({ text }: { text: string }) {
    return (
        <div className="flex items-center gap-3 text-slate-700 font-semibold">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <CheckCircle2 className="w-4 h-4" />
            </div>
            <span>{text}</span>
        </div>
    );
}
