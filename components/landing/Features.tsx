'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { Network, FileText, Brain, Layout, PlayCircle } from 'lucide-react';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

export function Features() {
    const container = useRef(null);

    useGSAP(() => {
        gsap.from('.feature-card', {
            scrollTrigger: {
                trigger: container.current,
                start: 'top 80%',
            },
            y: 50,
            opacity: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power3.out',
        });
    }, { scope: container });

    const features = [
        {
            icon: <Network className="w-8 h-8" />,
            title: "Unified Framework Modeling",
            desc: "Map ISO 22301, SOC 2, and NIST controls in one place. Use inheritance to reduce effort by 60%.",
            color: "text-blue-500",
            bg: "bg-blue-500/10"
        },
        {
            icon: <Brain className="w-8 h-8" />,
            title: "Intelligent AI Agents",
            desc: "Your built-in BCM expert. Automate gap analysis, query plans during a crisis, and guide users.",
            color: "text-purple-500",
            bg: "bg-purple-500/10"
        },
        {
            icon: <Layout className="w-8 h-8" />,
            title: "Dynamic BIA & Risk",
            desc: "Move beyond static lists. Use dynamic heat maps and data-driven dependency mapping that links directly to plans.",
            color: "text-green-500",
            bg: "bg-green-500/10"
        },
        {
            icon: <PlayCircle className="w-8 h-8" />,
            title: "Automated Exercises",
            desc: "Integrated exercise program with automated scheduling, reporting, and 'Lessons Learned' tracking.",
            color: "text-orange-500",
            bg: "bg-orange-500/10"
        },
    ];

    return (
        <section ref={container} className="py-24 bg-transparent">
            <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">Powered by an Advanced Core</h2>
                    <p className="text-xl text-muted-foreground">The technical pillars that drive a modern BCMS.</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((f, i) => (
                        <div key={i} className="feature-card bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10 hover:border-orange-500/50 transition-colors group">
                            <div className={`w-14 h-14 rounded-xl ${f.bg} ${f.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                {f.icon}
                            </div>
                            <h3 className="text-lg font-bold mb-3">{f.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
