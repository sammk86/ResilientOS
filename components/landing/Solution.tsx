'use client';

import { useState, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { Network, Database, FileText, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Solution() {
    const container = useRef(null);
    const [sliderPosition, setSliderPosition] = useState(50);
    const isDragging = useRef(false);

    const handleMouseDown = () => { isDragging.current = true; };
    const handleMouseUp = () => { isDragging.current = false; };
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging.current) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const percent = (x / rect.width) * 100;
        setSliderPosition(percent);
    };

    useGSAP(() => {
        gsap.from('.solution-header', {
            scrollTrigger: {
                trigger: container.current,
                start: 'top 80%',
            },
            y: 30,
            opacity: 0,
            duration: 1
        });
    }, { scope: container });

    return (
        <section ref={container} className="py-24 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16 space-y-4 solution-header">
                    <h2 className="text-3xl md:text-5xl font-bold">
                        The <span className="text-blue-600">Central Nervous System</span> for Resilience.
                    </h2>
                    <p className="text-xl text-muted-foreground">
                        Transform disparate documents into a live, integrated framework.
                    </p>
                </div>

                {/* Interactive Slider */}
                <div
                    className="relative h-[600px] w-full rounded-2xl overflow-hidden border border-border shadow-2xl cursor-col-resize select-none"
                    onMouseMove={handleMouseMove}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchMove={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width));
                        const percent = (x / rect.width) * 100;
                        setSliderPosition(percent);
                    }}
                >
                    {/* RIGHT SIDE (NEW WAY - ResilientOS) */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-gray-900 flex items-center justify-center">
                        <div className="grid grid-cols-2 gap-12 max-w-4xl p-12 w-full h-full pt-32">
                            <div className="space-y-8">
                                <div className="bg-blue-500/10 p-6 rounded-xl border border-blue-500/20">
                                    <h3 className="text-2xl font-bold text-blue-400 mb-2 flex items-center gap-2">
                                        <LayoutDashboard className="w-6 h-6" /> Dynamic View
                                    </h3>
                                    <p className="text-gray-300">Live integrated framework where policies map to controls.</p>
                                </div>
                                <div className="bg-blue-500/10 p-6 rounded-xl border border-blue-500/20">
                                    <h3 className="text-2xl font-bold text-blue-400 mb-2 flex items-center gap-2">
                                        <Network className="w-6 h-6" /> Interconnected
                                    </h3>
                                    <p className="text-gray-300">BIA data directly updates Plans. Standards inherit controls.</p>
                                </div>
                            </div>
                            <div className="relative">
                                {/* Abstract node visualization */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-64 h-64 border-2 border-blue-500/50 rounded-full animate-[spin_10s_linear_infinite]" />
                                    <div className="absolute w-4 h-4 bg-white rounded-full shadow-[0_0_20px_white]" />
                                    <div className="absolute top-10 left-10 text-blue-300 text-xs text-center backdrop-blur-sm bg-blue-900/30 p-2 rounded">Use AI to<br />Query Plans</div>
                                </div>
                            </div>
                        </div>
                        <div className="absolute bottom-10 right-10 text-right">
                            <h4 className="text-3xl font-bold text-white">ResilientOS</h4>
                            <p className="text-blue-400">Orchestrated & Dynamic</p>
                        </div>
                    </div>

                    {/* LEFT SIDE (OLD WAY) - clipped */}
                    <div
                        className="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center border-r-4 border-white"
                        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                    >
                        <div className="grid grid-cols-2 gap-12 max-w-4xl p-12 w-full h-full pt-32 opacity-60 grayscale">
                            <div className="space-y-8">
                                <div className="bg-gray-200 dark:bg-gray-700 p-6 rounded-xl border border-gray-300 dark:border-gray-600">
                                    <h3 className="text-2xl font-bold text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                                        <FileText className="w-6 h-6" /> Static Docs
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-300">100-page PDFs on a shared drive. Impossible to use in a crisis.</p>
                                </div>
                                <div className="bg-gray-200 dark:bg-gray-700 p-6 rounded-xl border border-gray-300 dark:border-gray-600">
                                    <h3 className="text-2xl font-bold text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                                        <Database className="w-6 h-6" /> Fragmented
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-300">Spreadsheets, emails, and disconnected tools.</p>
                                </div>
                            </div>
                            <div className="relative flex items-center justify-center">
                                <div className="w-48 h-32 bg-gray-300 dark:bg-gray-600 rounded flex items-center justify-center border-2 border-dashed border-gray-400">
                                    <span className="text-sm font-mono p-4">Policy_FINAL_v2_2023.pdf</span>
                                </div>
                            </div>
                        </div>
                        <div className="absolute bottom-10 left-10">
                            <h4 className="text-3xl font-bold text-gray-800 dark:text-white">The Old Way</h4>
                            <p className="text-gray-500">Static & Siloed</p>
                        </div>
                    </div>

                    {/* Slider Handle */}
                    <div
                        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-20 flex items-center justify-center"
                        style={{ left: `${sliderPosition}%` }}
                    >
                        <div className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-black">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18-6-6 6-6" /><path d="m15 6 6 6-6 6" /></svg>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}
