'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Play, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { DependencyGraph } from '@/components/bia/dependency-graph';
import { AddDependencyDialog } from '@/components/bia/add-dependency-dialog';
import { DeleteDependencyButton } from '@/components/bia/delete-dependency-button';
import { analyzeProcessAction } from '@/app/(dashboard)/bia/actions';

interface AppProps {
    analysis: any;
    process: any;
    allAssets: any[];
    allProcesses: any[];
}

export function AnalysisWorkspaceClient({ analysis, process, allAssets, allProcesses }: AppProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [result, setResult] = useState<any>(analysis.summaryData);

    const handleRunAnalysis = () => {
        startTransition(async () => {
            const response = await analyzeProcessAction(analysis.id);
            if (response.error) {
                toast.error(response.error);
            } else if (response.success && response.data) {
                setResult(response.data);
                toast.success('Analysis complete');
                router.refresh();
            }
        });
    };

    // Helper to generate graph elements
    const getGraphElements = () => {
        const nodes: any[] = [];
        const edges: any[] = [];

        // Root Node
        nodes.push({
            id: `p-${process.id}`,
            type: 'input',
            data: { label: process.name },
            position: { x: 250, y: 0 },
            style: { background: '#fff', border: '1px solid #777', padding: 10, borderRadius: 5, width: 150, textAlign: 'center', fontWeight: 'bold' }
        });

        // Dependencies
        if (process.dependencies) {
            process.dependencies.forEach((dep: any, index: number) => {
                const targetId = dep.asset ? `a-${dep.asset.id}` : `p-${dep.dependentProcess?.id}`;
                const label = dep.asset ? dep.asset.name : dep.dependentProcess?.name;
                const rto = dep.asset ? dep.asset.recoveryTimeObjective : dep.dependentProcess?.rto;

                // Spread nodes out
                const xPos = (index - (process.dependencies.length - 1) / 2) * 200 + 250;

                nodes.push({
                    id: targetId,
                    data: { label: `${label}\n(RTO: ${rto})` },
                    position: { x: xPos, y: 150 },
                    style: {
                        background: dep.asset ? '#e3f2fd' : '#f3e5f5',
                        border: '1px solid #ddd',
                        padding: 10,
                        borderRadius: 5,
                        width: 150,
                        fontSize: '12px',
                        textAlign: 'center'
                    }
                });

                edges.push({
                    id: `e-${process.id}-${targetId}`,
                    source: `p-${process.id}`,
                    target: targetId,
                    type: 'smoothstep',
                    animated: true,
                });
            });
        }

        return { nodes, edges };
    };

    const { nodes, edges } = getGraphElements();

    return (
        <div className="flex flex-col h-full bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/bia')}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold flex items-center space-x-2">
                            <span>{analysis.name}</span>
                            <Badge variant={analysis.status === 'completed' ? 'default' : 'secondary'} className="ml-2">
                                {analysis.status}
                            </Badge>
                        </h1>
                        <p className="text-sm text-muted-foreground">Target Process: {process.name} (RTO: {process.rto})</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        onClick={handleRunAnalysis}
                        disabled={isPending}
                        className="bg-slate-900 text-white hover:bg-slate-800"
                    >
                        {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                        Run Analysis
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">

                {/* Left Panel: Report & Settings */}
                <div className="w-1/3 border-r bg-white overflow-y-auto p-6 space-y-6">
                    {/* Results Section */}
                    {result ? (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
                            <h3 className="font-semibold text-lg">Analysis Report</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-slate-50 border rounded-md">
                                    <p className="text-xs text-muted-foreground font-medium uppercase">Total Downtime Cost</p>
                                    <p className="text-2xl font-bold mt-1">${result.totalDowntimeCost?.toLocaleString()}/hr</p>
                                </div>
                                <div className={`p-3 border rounded-md ${result.maxRecoveryTime > (parseInt(process.rto) || 4) ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                                    <p className="text-xs text-muted-foreground font-medium uppercase">Actual Recovery Time</p>
                                    <p className={`text-2xl font-bold mt-1 ${result.maxRecoveryTime > (parseInt(process.rto) || 4) ? 'text-red-700' : 'text-green-700'}`}>
                                        {result.maxRecoveryTime}h
                                    </p>
                                </div>
                            </div>

                            <div className={`p-4 border rounded-md ${result.rtoGaps && result.rtoGaps.length > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                                <h4 className={`font-semibold text-sm flex items-center ${result.rtoGaps && result.rtoGaps.length > 0 ? 'text-red-800' : 'text-green-800'}`}>
                                    {result.rtoGaps && result.rtoGaps.length > 0 ? <AlertTriangle className="w-4 h-4 mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                                    {result.rtoGaps && result.rtoGaps.length > 0 ? 'RTO Policy Violations' : 'All Compliance Checks Passed'}
                                </h4>

                                {result.rtoGaps && result.rtoGaps.length > 0 && (
                                    <ul className="mt-2 space-y-2">
                                        {result.rtoGaps.map((gap: any, i: number) => (
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
                            </div>

                            {result.criticalPath && result.criticalPath.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-muted-foreground">Critical Path Trace</h4>
                                    <div className="flex flex-wrap gap-2 text-sm">
                                        {result.criticalPath.map((node: string, i: number) => (
                                            <span key={i} className="flex items-center">
                                                <Badge variant="outline">{node}</Badge>
                                                {i < result.criticalPath.length - 1 && <span className="mx-1 text-muted-foreground">→</span>}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* AI Recommendations */}
                            {result.aiAnalysis && result.aiAnalysis.recommendations && (
                                <div className="border border-indigo-100 rounded-md bg-indigo-50/50 p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-xl">✨</span>
                                        <div>
                                            <h4 className="font-semibold text-indigo-900">AI Resilience Recommendations</h4>
                                            <p className="text-xs text-indigo-700">Intelligent suggestions to improve RTO alignment.</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        {result.aiAnalysis.recommendations.map((rec: any, idx: number) => (
                                            <div key={idx} className="bg-white p-3 rounded border border-indigo-100 shadow-sm">
                                                <div className="flex justify-between items-start gap-2">
                                                    <h5 className="font-medium text-sm text-slate-900">{rec.title}</h5>
                                                    <Badge className={`text-[10px] px-1.5 py-0 h-5 
                                                        ${rec.priority === 'Critical' ? 'bg-red-500 hover:bg-red-600' :
                                                            rec.priority === 'High' ? 'bg-orange-500 hover:bg-orange-600' :
                                                                rec.priority === 'Medium' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-500 hover:bg-blue-600'}`}>
                                                        {rec.priority}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-slate-600 mt-1">{rec.description}</p>
                                                <div className="mt-2 flex items-center gap-2">
                                                    <span className="text-[10px] text-slate-400 border px-1 rounded bg-slate-50">{rec.category}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <Separator />
                        </div>
                    ) : (
                        <div className="p-8 text-center border-2 border-dashed rounded-lg bg-slate-50">
                            <p className="text-muted-foreground">Run analysis to identify RTO gaps and calculate impact.</p>
                        </div>
                    )}

                    {/* Dependencies List */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-lg">Dependencies</h3>
                            <AddDependencyDialog
                                processId={process.id}
                                availableAssets={allAssets}
                                availableProcesses={allProcesses}
                            />
                        </div>

                        <div className="space-y-2">
                            {process.dependencies.map((dep: any) => (
                                <div key={dep.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-md border text-sm group">
                                    <div className="flex items-center space-x-2">
                                        <Badge variant="outline" className="text-xs font-normal">
                                            {dep.asset ? 'Asset' : 'Process'}
                                        </Badge>
                                        <span className="font-medium">
                                            {dep.asset ? dep.asset.name : dep.dependentProcess?.name}
                                        </span>
                                        <span className="text-xs text-muted-foreground ml-2">
                                            (RTO: {dep.asset ? dep.asset.recoveryTimeObjective : dep.dependentProcess?.rto})
                                        </span>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <DeleteDependencyButton id={dep.id} processId={process.id} />
                                    </div>
                                </div>
                            ))}
                            {process.dependencies.length === 0 && (
                                <p className="text-sm text-muted-foreground italic">No dependencies mapped.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Panel: Graph */}
                <div className="flex-1 bg-slate-50 relative">
                    <div className="absolute inset-0">
                        <DependencyGraph initialNodes={nodes} initialEdges={edges} interactive={false} />
                    </div>
                </div>

            </div>
        </div>
    );
}
