'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ArrowRight, FileCheck, Shield, PieChart } from 'lucide-react';
import Link from 'next/link';

export function Hero() {
    const container = useRef(null);
    const dashboardRef = useRef(null);

    useGSAP(() => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        tl.from('.hero-badge', { y: 20, opacity: 0, duration: 0.8 })
            .from('.hero-text', { y: 30, opacity: 0, duration: 0.8, stagger: 0.1 }, '-=0.4')
            .from('.hero-cta', { y: 20, opacity: 0, duration: 0.8 }, '-=0.4')
            .from(dashboardRef.current, {
                rotationX: 45,
                y: 100,
                opacity: 0,
                duration: 1.5,
                ease: 'power4.out',
            }, '-=1');
    }, { scope: container });

    return (
        <section ref={container} className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-orange-500/20 rounded-full blur-[120px] -z-10" />

            <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center">

                {/* Badge */}
                <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 font-medium text-sm mb-8">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                    </span>
                    The Intelligent Core for ISO 22301
                </div>

                {/* Headline */}
                <h1 className="hero-text text-5xl md:text-7xl font-bold tracking-tight mb-6 max-w-5xl">
                    From Static Documents to a <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-500 to-red-600">
                        Dynamic Resilience System
                    </span>
                </h1>

                {/* Subheadline */}
                <p className="hero-text text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
                    Orchestrate your entire Business Continuity Management System (BCMS) from a single hub.
                    Unify governance, risk, BIA, and strategy to ensure you're audit-ready and crisis-proof.
                </p>

                {/* CTA */}
                <div className="hero-cta flex flex-col md:flex-row items-center gap-4">
                    <Link href="/sign-up">
                        <button className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl font-semibold shadow-lg shadow-orange-500/25 transition-all text-lg flex items-center gap-2">
                            Book a Demo
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </Link>
                    <Link href="/demo">
                        <button className="px-8 py-4 bg-background border border-border hover:bg-muted text-foreground rounded-xl font-semibold transition-all text-lg">
                            View the Orchestrator
                        </button>
                    </Link>
                </div>

                {/* Dashboard Mockup - The Central Hub */}
                <div ref={dashboardRef} className="mt-20 relative w-full max-w-5xl mx-auto perspective-1000">
                    <div className="relative bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden aspect-[16/9] group">

                        {/* UI Header */}
                        <div className="bg-gray-800/50 border-b border-gray-700 p-4 flex items-center gap-4">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                <div className="w-3 h-3 rounded-full bg-green-500/50" />
                            </div>
                            <div className="text-xs text-gray-500 font-mono flex-1 text-center">ResilientOS - BCMS Orchestrator</div>
                        </div>

                        {/* Main Content - "The Hub" */}
                        <div className="p-8 h-full bg-gray-900/90 flex items-center justify-center relative">
                            {/* Grid Background */}
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />

                            {/* Central Node */}
                            <div className="relative z-10 flex flex-col items-center">
                                <div className="w-32 h-32 rounded-full border-2 border-orange-500 bg-orange-900/20 flex items-center justify-center shadow-[0_0_50px_rgba(249,115,22,0.3)] animate-pulse">
                                    <Shield className="w-16 h-16 text-orange-400" />
                                </div>
                                <div className="mt-4 text-orange-400 font-bold tracking-widest text-sm">RESILIENTOS CORE</div>
                            </div>

                            {/* Connected Nodes */}
                            <div className="absolute inset-0 pointer-events-none">
                                {/* Top Left - Governance */}
                                <div className="absolute top-20 left-20 animate-[float_6s_ease-in-out_infinite]">
                                    <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex items-center gap-3">
                                        <FileCheck className="text-green-400 w-6 h-6" />
                                        <div>
                                            <div className="text-xs text-gray-400">Governance</div>
                                            <div className="text-white font-bold">ISO 22301</div>
                                        </div>
                                    </div>
                                    {/* Connecting Line */}
                                    <svg className="absolute top-full left-1/2 w-40 h-40 -z-10 text-gray-700" style={{ transform: 'rotate(45deg)' }}>
                                        <line x1="0" y1="0" x2="100%" y2="100%" stroke="currentColor" strokeWidth="2" strokeDasharray="4" />
                                    </svg>
                                </div>

                                {/* Top Right - Analytics */}
                                <div className="absolute top-20 right-20 animate-[float_7s_ease-in-out_infinite]">
                                    <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex items-center gap-3">
                                        <PieChart className="text-purple-400 w-6 h-6" />
                                        <div>
                                            <div className="text-xs text-gray-400">Risk Analysis</div>
                                            <div className="text-white font-bold">Dynamic BIA</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60" />
                    </div>

                    {/* Reflection */}
                    <div className="absolute -bottom-4 left-4 right-4 h-4 bg-orange-500/20 blur-xl rounded-[100%]" />
                </div>
            </div>
        </section>
    );
}
