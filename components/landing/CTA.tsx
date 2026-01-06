'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export function CTA() {
    return (
        <section className="py-32 relative overflow-hidden bg-gray-900 text-white text-center px-6">
            {/* Dynamic Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-3xl mx-auto space-y-8">
                <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
                    Ready to Orchestrate Your Resilience?
                </h2>
                <p className="text-xl text-gray-300">
                    Move beyond static plans. Build a dynamic, audit-ready BCMS today.
                </p>

                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-block"
                >
                    <Link href="/sign-up">
                        <button className="px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white text-xl font-bold rounded-2xl shadow-[0_0_50px_rgba(37,99,235,0.5)] transition-all flex items-center gap-3 mx-auto">
                            Start Your Transformation
                            <ArrowRight className="w-6 h-6" />
                        </button>
                    </Link>
                </motion.div>

                <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400" /> 14-Day Free Trial
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400" /> ISO 22301 Ready
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400" /> No Credit Card
                    </div>
                </div>
            </div>
        </section>
    );
}
