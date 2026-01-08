'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, BrainCircuit, CheckCircle, AlertTriangle } from 'lucide-react';
import { getProcessRecommendationsAction } from '@/app/(dashboard)/bia/actions';
import { motion, AnimatePresence } from 'framer-motion';

// Types (mirrored from backend for now, or imported if shared)
interface Recommendation {
    title: string;
    description: string;
    priority: 'Critical' | 'High' | 'Medium' | 'Low';
    category: 'Resilience' | 'Compliance' | 'Cost-Optimization';
}

interface AIAdvisorProps {
    processId: number;
}

export function ProcessAIAdvisor({ processId }: AIAdvisorProps) {
    const [loading, setLoading] = useState(false);
    const [analysisSteps, setAnalysisSteps] = useState<string[]>([]);
    const [recommendations, setRecommendations] = useState<Recommendation[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);
        setAnalysisSteps([]);
        setRecommendations(null);

        try {
            const result = await getProcessRecommendationsAction(processId);

            if (result.error || !result.success || !result.data) {
                setError(result.error || 'Failed to generate recommendations');
                return;
            }

            // Simulate "streaming" of thinking steps if they come all at once
            const steps = result.data.analysis || [];
            if (steps.length > 0) {
                // Reveal steps one by one for effect (fast)
                for (let i = 0; i < steps.length; i++) {
                    setAnalysisSteps(prev => [...prev, steps[i]]);
                    await new Promise(r => setTimeout(r, 800)); // 800ms delay per step
                }
            }

            setRecommendations(result.data.recommendations);

        } catch (err) {
            console.error(err);
            setError('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const getPriorityColor = (p: string) => {
        switch (p) {
            case 'Critical': return 'bg-red-500 hover:bg-red-600';
            case 'High': return 'bg-orange-500 hover:bg-orange-600';
            case 'Medium': return 'bg-yellow-500 hover:bg-yellow-600';
            case 'Low': return 'bg-blue-500 hover:bg-blue-600';
            default: return 'bg-slate-500';
        }
    };

    return (
        <Card className="border-indigo-100 dark:border-indigo-900 shadow-sm">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Sparkles className="h-5 w-5 text-indigo-500" />
                            AI Resilience Advisor
                        </CardTitle>
                        <CardDescription>
                            Generate intelligent recommendations based on sequential analysis of dependencies and risks.
                        </CardDescription>
                    </div>
                    {!loading && !recommendations && (
                        <Button onClick={handleGenerate} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                            <BrainCircuit className="mr-2 h-4 w-4" />
                            Analyze Process
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

                {/* Analysis Steps (Sequential Thinking) */}
                <div className="space-y-4 mb-6">
                    <AnimatePresence>
                        {analysisSteps.map((step, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-md border border-slate-100 dark:border-slate-800"
                            >
                                <div className="mt-0.5">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                </div>
                                <div>{step}</div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {loading && analysisSteps.length < 4 && (
                        <div className="flex items-center gap-2 text-sm text-slate-400 p-3">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Analyzing process context...</span>
                        </div>
                    )}
                </div>

                {/* Recommendations */}
                {recommendations && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid gap-4"
                    >
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                            Actionable Recommendations
                        </h3>
                        {recommendations.map((rec, idx) => (
                            <Card key={idx} className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="space-y-1">
                                            <div className="font-medium text-slate-900 dark:text-slate-100">
                                                {rec.title}
                                            </div>
                                            <div className="text-sm text-slate-500 dark:text-slate-400">
                                                {rec.description}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <Badge className={`${getPriorityColor(rec.priority)} text-white border-0`}>
                                                {rec.priority} Priority
                                            </Badge>
                                            <Badge variant="outline" className="text-xs">
                                                {rec.category}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        <div className="flex justify-end mt-4">
                            <Button variant="outline" size="sm" onClick={handleGenerate} disabled={loading}>
                                Re-run Analysis
                            </Button>
                        </div>
                    </motion.div>
                )}
            </CardContent>
        </Card>
    );
}
