"use client";

import { Mail, Phone, MapPin, Send, MessageSquare, Sparkles, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ContactPage() {
    return (
        <div className="bg-slate-50 min-h-screen pt-32 pb-32">
            <div className="container px-6">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-24">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-xs mb-8 uppercase tracking-widest">
                        <Sparkles className="w-3 h-3" /> Connect With Us
                    </div>
                    <h1 className="text-4xl md:text-7xl font-black text-slate-900 mb-8 leading-tight font-ubuntu">
                        Let's Start Your <span className="text-gradient">Next Chapter</span>
                    </h1>
                    <p className="text-xl text-slate-500 font-light leading-relaxed">
                        Ready to elevate your digital presence? Our team of experts is here to help you navigate the future of your brand.
                    </p>
                </div>

                <div className="grid lg:grid-cols-5 gap-16 items-start">
                    {/* Information Grid */}
                    <div className="lg:col-span-2 space-y-12">
                        <div className="card-premium !p-10 group">
                            <h3 className="text-2xl font-bold text-slate-900 mb-8">Contact Information</h3>

                            <div className="space-y-8">
                                <div className="flex gap-6 items-center">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                        <Mail className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Us</p>
                                        <p className="text-lg font-bold text-slate-900">hello@bootflare.com</p>
                                    </div>
                                </div>

                                <div className="flex gap-6 items-center">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                        <MessageSquare className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Chat</p>
                                        <p className="text-lg font-bold text-slate-900">Available 24/7</p>
                                    </div>
                                </div>

                                <div className="flex gap-6 items-center">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Headquarters</p>
                                        <p className="text-lg font-bold text-slate-900">Digital District, Global</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-10 rounded-[3rem] bg-slate-900 text-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                                <Sparkles className="w-32 h-32" />
                            </div>
                            <h4 className="text-xl font-bold mb-4 relative z-10">Follow Our Journey</h4>
                            <p className="text-slate-400 mb-8 relative z-10">Get the latest updates on digital trends and agency news.</p>
                            <div className="flex gap-4 relative z-10">
                                {['Twitter', 'LinkedIn', 'Instagram'].map(platform => (
                                    <span key={platform} className="text-xs font-bold uppercase tracking-widest text-primary border-b border-primary hover:text-white hover:border-white transition-all cursor-pointer">
                                        {platform}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-3">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[3rem] p-10 md:p-16 shadow-2xl shadow-slate-200 border border-slate-100"
                        >
                            <h3 className="text-3xl font-bold text-slate-900 mb-4">Send a Message</h3>
                            <p className="text-slate-500 mb-12">We'll get back to you within 24 business hours.</p>

                            <form className="space-y-8">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                                        <input
                                            type="text"
                                            placeholder="John Doe"
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                                        <input
                                            type="email"
                                            placeholder="john@example.com"
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Subject</label>
                                    <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium appearance-none">
                                        <option>Web Design Project</option>
                                        <option>SEO Services</option>
                                        <option>Marketing Campaign</option>
                                        <option>Other Inquiry</option>
                                    </select>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Message</label>
                                    <textarea
                                        rows={5}
                                        placeholder="Tell us about your goals..."
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium resize-none"
                                    />
                                </div>

                                <button type="submit" className="btn-premium w-full group !py-5">
                                    Submit Inquiry
                                    <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </form>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
