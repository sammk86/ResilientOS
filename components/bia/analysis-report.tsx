'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Activity, AlertTriangle, CheckCircle, Play, Loader2 } from 'lucide-react';
import { analyzeProcessAction } from '@/app/(dashboard)/bia/actions';
import { toast } from 'sonner';

interface AnalysisResult {
    totalDowntimeCost: number;
    maxRecoveryTime: number;
    rtoGaps: Array<{
        dependencyName: string;
        dependencyType: string;
        actualRTO: number;
        targetRTO: number;
        gap: number;
    }>;
    criticalPath: string[];
    aiAnalysis?: {
        analysis: string[];
        recommendations: {
            title: string;
            description: string;
            priority: string;
            category: string;
        }[];
    } | null;
}

export function AnalysisReport({ processId }: { processId: number }) {
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [isPending, startTransition] = useTransition();

    const handleRunAnalysis = () => {
        startTransition(async () => {
            const response = await analyzeProcessAction(processId);
            if (response?.error) {
                toast.error(response.error);
            } else if (response?.success && response.data) {
                console.log("Analysis Result Data:", response.data);
                setResult(response.data);
                toast.success('Analysis complete');
            }
        });
    };

    return (
        <Card className="mt-4 border-slate-200 shadow-sm">
            <CardHeader className="pb-3 bg-slate-50 border-b">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg">Automated Impact Analysis</CardTitle>
                        <CardDescription>Scan dependencies for RTO coverage and financial impact.</CardDescription>
                    </div>
                    <Button
                        onClick={handleRunAnalysis}
                        disabled={isPending}
                        className="bg-slate-900 text-white hover:bg-slate-800"
                    >
                        {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                        Run Analysis
                    </Button>
                </div>
            </CardHeader>
            {result && (
                <CardContent className="pt-4 space-y-4">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-white border rounded-md shadow-sm">
                            <p className="text-xs text-muted-foreground font-medium uppercase">Total Downtime Cost</p>
                            <p className="text-2xl font-bold mt-1 text-slate-900">
                                ${result.totalDowntimeCost.toLocaleString()}/hr
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Effective cost if this process and dependencies fail.
                            </p>
                        </div>
                        <div className="p-3 bg-white border rounded-md shadow-sm">
                            <p className="text-xs text-muted-foreground font-medium uppercase">Max Recovery Time</p>
                            <p className={`text-2xl font-bold mt-1 ${result.maxRecoveryTime > 4 ? 'text-red-600' : 'text-slate-900'}`}>
                                {result.maxRecoveryTime}h
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Longest recovery time in the dependency chain.
                            </p>
                        </div>
                    </div>

                    {/* RTO Gaps */}
                    <div className={`p-4 border rounded-md ${result.rtoGaps.length > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                        <h4 className={`font-semibold text-sm flex items-center ${result.rtoGaps.length > 0 ? 'text-red-800' : 'text-green-800'}`}>
                            {result.rtoGaps.length > 0 ? <AlertTriangle className="w-4 h-4 mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                            {result.rtoGaps.length > 0 ? 'RTO Policy Violations Detected' : 'All Dependencies Compliant'}
                        </h4>

                        {result.rtoGaps.length > 0 && (
                            <ul className="mt-2 space-y-2">
                                {result.rtoGaps.map((gap, i) => (
                                    <li key={i} className="text-sm bg-white p-2 rounded border border-red-100 shadow-sm flex justify-between items-center">
                                        <span>
                                            <span className="font-semibold text-red-900">{gap.dependencyName}</span>
                                            <span className="text-red-600 text-xs ml-1">({gap.dependencyType})</span>
                                        </span>
                                        <span className="text-xs font-mono bg-red-100 text-red-800 px-2 py-1 rounded">
                                            {gap.actualRTO}h {'>'} {gap.targetRTO}h
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                        {result.rtoGaps.length === 0 && (
                            <p className="text-sm text-green-700 mt-1">
                                No upstream dependencies exceed the target RTO of this process.
                            </p>
                        )}
                    </div>

                    {/* Critical Path */}
                    {result.criticalPath.length > 0 && (
                        <div className="p-4 bg-slate-50 border rounded-md">
                            <h4 className="font-semibold text-sm mb-2 text-slate-700">Critical Path (Longest Recovery)</h4>
                            <div className="flex items-center text-sm text-slate-600 overflow-x-auto">
                                {result.criticalPath.map((node, i) => (
                                    <span key={i} className="flex items-center whitespace-nowrap">
                                        <span className="font-mono bg-white border px-2 py-1 rounded">{node}</span>
                                        {i < result.criticalPath.length - 1 && <span className="mx-2 text-slate-400">→</span>}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* AI Recommendations */}
                    {result.aiAnalysis && result.aiAnalysis.recommendations && (
                        <Card className="border-indigo-100 bg-indigo-50/50 dark:bg-slate-900/50 dark:border-indigo-900">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                                    <span className="text-xl">✨</span> AI Resilience Recommendations
                                </CardTitle>
                                <CardDescription>
                                    Intelligent suggestions to improve RTO alignment and reduce risk.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-3">
                                {result.aiAnalysis.recommendations.map((rec: any, idx: number) => (
                                    <div key={idx} className="bg-white dark:bg-slate-950 p-4 rounded border border-indigo-100 dark:border-indigo-900 shadow-sm flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                                        <div>
                                            <h5 className="font-semibold text-slate-900 dark:text-slate-100">{rec.title}</h5>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{rec.description}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1 min-w-[100px]">
                                            <span className={`text-xs px-2 py-0.5 rounded font-medium text-white
                                                ${rec.priority === 'Critical' ? 'bg-red-500' :
                                                    rec.priority === 'High' ? 'bg-orange-500' :
                                                        rec.priority === 'Medium' ? 'bg-yellow-500' : 'bg-blue-500'}`}>
                                                {rec.priority}
                                            </span>
                                            <span className="text-xs text-slate-400 border px-1.5 rounded">{rec.category}</span>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </CardContent>
            )}
        </Card>
    );
}
