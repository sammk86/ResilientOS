'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { FileWarning, Link2Off, RefreshCw, AlertOctagon } from 'lucide-react';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

export function Problem() {
    const container = useRef(null);
    const cardsRef = useRef([]);

    useGSAP(() => {
        // Stagger cards in
        gsap.from(cardsRef.current, {
            scrollTrigger: {
                trigger: container.current,
                start: 'top 80%',
            },
            y: 50,
            opacity: 0,
            duration: 0.8,
            stagger: 0.2,
            ease: 'power3.out',
        });
    }, { scope: container });

    const cards = [
        {
            icon: <FileWarning className="w-10 h-10 text-orange-500" />,
            title: "Static, Siloed Data",
            desc: "BIAs live in spreadsheets, risk registers in other tools. They don't talk, leaving you with a fragmented view of reality.",
            stat: "Data Silos"
        },
        {
            icon: <RefreshCw className="w-10 h-10 text-orange-500" />,
            title: "\"Set-and-Forget\" Plans",
            desc: "Processes change daily, but plans are only reviewed annually. By the time you need them, they are dangerously outdated.",
            stat: "Outdated PDFs"
        },
        {
            icon: <Link2Off className="w-10 h-10 text-orange-500" />,
            title: "Manual Overhead",
            desc: "Endless cycles of manually collecting data, chasing emails for updates, and copy-pasting into reports.",
            stat: "Admin Heavy"
        }
    ];

    return (
        <section ref={container} className="relative py-24 bg-gray-50 dark:bg-gray-900/50">
            <div className="max-w-6xl mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                        The Essential Pillars are <span className="text-orange-600">Operating in Isolation</span>.
                    </h2>
                    <p className="text-xl text-muted-foreground">
                        Without a central nervous system, your governance, risk, and strategy become inefficient and disconnected.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {cards.map((card, i) => (
                        <div
                            key={i}
                            ref={el => { if (el) cardsRef.current[i] = el; }}
                            className="bg-background border border-border/50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group"
                        >
                            <div className="mb-6 bg-orange-500/10 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                {card.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-3">{card.title}</h3>
                            <p className="text-muted-foreground mb-6 leading-relaxed">
                                {card.desc}
                            </p>
                            <div className="flex items-center gap-2 text-sm font-semibold text-orange-600 bg-orange-500/5 px-3 py-1 rounded-full w-fit">
                                <AlertOctagon className="w-4 h-4" />
                                {card.stat}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
