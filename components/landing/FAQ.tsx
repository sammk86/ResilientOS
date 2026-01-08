'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqs = [
        {
            q: "Does ResilientOS automate my actual infrastructure failover?",
            a: "No. ResilientOS is the intelligent core for your Business Continuity Management System (BCMS). It orchestrates your plans, policies, and governance to ensure your team has the right information to execute a failover confidently."
        },
        {
            q: "How does it help with compliance like ISO 22301?",
            a: "ResilientOS includes pre-built frameworks and automated mapping for ISO 22301. It transforms static compliance tasks into a continuous monitoring process, significantly simplifying audits."
        },
        {
            q: "Can I migrate my existing BIA spreadsheets?",
            a: "Yes. We provide tools to import your existing data into our dynamic data model, allowing you to instantly benefit from visualized dependencies and real-time updates."
        },
        {
            q: "What role does AI play if it doesn't automate failover?",
            a: "The AI agent acts as a BCM expert. It helps you identify gaps in your plans, suggests policy improvements, and provides instant answers to procedural questions during a crisis."
        }
    ];

    return (
        <section className="py-24 max-w-3xl mx-auto px-6">
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">Frequently Asked Questions</h2>

            <div className="space-y-4">
                {faqs.map((faq, i) => (
                    <div key={i} className="border border-white/10 rounded-xl overflow-hidden bg-white/5 backdrop-blur-sm">
                        <button
                            onClick={() => setOpenIndex(openIndex === i ? null : i)}
                            className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
                        >
                            <span className="text-lg font-semibold pr-8">{faq.q}</span>
                            {openIndex === i ? <Minus className="w-5 h-5 flex-shrink-0 text-blue-500" /> : <Plus className="w-5 h-5 flex-shrink-0" />}
                        </button>
                        <AnimatePresence>
                            {openIndex === i && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="p-6 pt-0 text-muted-foreground leading-relaxed">
                                        {faq.a}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </section>
    );
}
