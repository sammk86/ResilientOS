'use client';

import { useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { Quote } from 'lucide-react';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

export function SocialProof() {
    const container = useRef(null);
    const marqueeRef = useRef(null);

    useGSAP(() => {
        // Marquee animation
        gsap.to(marqueeRef.current, {
            xPercent: -50,
            repeat: -1,
            duration: 20,
            ease: 'linear',
        });

        // Testimonial reveal
        gsap.from('.testimonial-content', {
            scrollTrigger: {
                trigger: '.testimonial-section',
                start: 'top 70%',
            },
            y: 50,
            opacity: 0,
            duration: 1,
        });
    }, { scope: container });

    const logos = [
        { name: 'TechCorp', color: 'bg-blue-500' },
        { name: 'FinSys', color: 'bg-green-500' },
        { name: 'HealthGuard', color: 'bg-red-500' },
        { name: 'DataFlow', color: 'bg-purple-500' },
        { name: 'CloudNet', color: 'bg-orange-500' },
    ];

    return (
        <section ref={container} className="py-20 bg-transparent overflow-hidden">
            {/* Logo Marquee */}
            <div className="mb-32 relative">
                <p className="text-center text-sm font-semibold text-muted-foreground mb-8 uppercase tracking-widest">Trusted for Governance & Compliance</p>
                <div className="flex overflow-hidden w-full relative mask-linear-fade">
                    <div ref={marqueeRef} className="flex gap-16 items-center whitespace-nowrap pl-4">
                        {[...logos, ...logos, ...logos].map((logo, i) => (
                            <div key={i} className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity cursor-default">
                                <div className={`w-8 h-8 rounded ${logo.color}`} />
                                <span className="text-xl font-bold text-foreground">{logo.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-slate-900 to-transparent z-10" />
                <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-slate-900 to-transparent z-10" />
            </div>

            {/* Deep Social Proof */}
            <div className="testimonial-section max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-br from-blue-500 to-indigo-600 opacity-20 blur-2xl rounded-full" />
                    <div className="relative w-full aspect-square bg-gray-200 dark:bg-gray-800 rounded-2xl overflow-hidden shadow-2xl">
                        {/* Placeholder for Headshot */}
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-gray-600">
                            <span className="text-9xl">👤</span>
                        </div>
                    </div>
                    {/* Trust Badges Overlay */}
                    <div className="absolute -bottom-6 -right-6 bg-slate-900/90 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-xl flex gap-4">
                        {['ISO 22301', 'SOC 2', 'NIST'].map(badge => (
                            <div key={badge} className="px-2 py-1 bg-green-500/10 text-green-600 text-xs font-bold rounded border border-green-500/20">
                                {badge}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="testimonial-content space-y-8">
                    <Quote className="w-16 h-16 text-blue-500/20" />
                    <blockquote className="text-3xl md:text-4xl font-medium leading-tight">
                        &quot;ResilientOS transformed our BCMS from a static binder into a <span className="text-blue-500">living system</span>. We cut our ISO 22301 audit preparation time by 80%.&quot;
                    </blockquote>
                    <div>
                        <div className="font-bold text-xl">Sarah Jenkins</div>
                        <div className="text-muted-foreground">CISO, FinTech Enterprise</div>
                    </div>
                </div>
            </div>
        </section>
    );
}
