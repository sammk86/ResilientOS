import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, Activity, AlertTriangle, BookOpen, Trash2 } from 'lucide-react';
import { db } from '@/lib/db/drizzle';
import { businessProcesses, assets, dependencies, riskRegister } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import Link from 'next/link';
import { DependencyGraph } from '@/components/bia/dependency-graph';
import { AddDependencyDialog } from '@/components/bia/add-dependency-dialog';
import { DeleteDependencyButton } from '@/components/bia/delete-dependency-button';
import { AnalysisReport } from '@/components/bia/analysis-report';
import { EditProcessDialog } from '@/components/bia/edit-process-dialog';
import { ProcessAIAdvisor } from '@/components/bia/ProcessAIAdvisor';

// Helper to remove circular references for Client Components if needed
const clean = (obj: any) => JSON.parse(JSON.stringify(obj));

export default async function ProcessDetailsPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const processId = parseInt(params.id);
    if (isNaN(processId)) return <div>Invalid ID</div>;

    const proc = await db.query.businessProcesses.findFirst({
        where: eq(businessProcesses.id, processId),
        with: {
            dependencies: {
                with: {
                    asset: true,
                    dependentProcess: true
                }
            },
            inverseDependencies: {
                with: {
                    process: true
                }
            },
            risks: true
        }
    });

    if (!proc) return <div>Process not found</div>;

    // Fetch lists for Add Dialog
    const allAssets = await db.query.assets.findMany();
    const allProcesses = await db.query.businessProcesses.findMany();

    // Prepare Graph Data
    const nodes = [
        {
            id: `p-${proc.id}`,
            type: 'input', // Main node
            data: { label: `${proc.name} (RTO: ${proc.rto})` },
            position: { x: 250, y: 0 },
            style: { border: '2px solid #f97316', background: '#ffedd5' }
        }
    ];
    const edges: any[] = [];

    // Add Upstream Dependencies (Things this process depends on) - Displayed at Bottom (y=300) to show flow A -> B? 
    // Wait, if A -> B (A needs B). A is top, B is bottom? 
    // Standard Tree: Root -> Leaves.
    // If "Impact": Asset (Leaf) breaks -> Process breaks.
    // Let's stick to "Dependency": Source (Needs) -> Target (Needed).
    // Main Process (Needs) -> Dependencies (Needed). 
    // So Main (Top) -> Dependencies (Bottom).
    // And Inverse: Dependent (Needs) -> Main (Needed).
    // Dependent (Top Top) -> Main (Top/Middle).

    // Let's adjust Main to y=150.
    nodes[0].position.y = 150;

    // Upstream (Dependencies) - Things we need. Place at y=300.
    proc.dependencies.forEach((dep: any, index: number) => {
        const targetId = dep.dependentOnAssetId ? `a-${dep.dependentOnAssetId}` : `p-${dep.dependentOnProcessId}`;
        const label = dep.asset ? dep.asset.name : dep.dependentProcess?.name || 'Unknown';

        if (!nodes.find(n => n.id === targetId)) {
            nodes.push({
                id: targetId,
                type: 'default',
                data: { label: label },
                position: { x: 100 + (index * 150), y: 300 },
                style: dep.dependentOnAssetId ? { border: '1px solid #3b82f6', background: '#eff6ff' } : { border: '1px solid #f97316', background: '#fff7ed' }
            });
        }

        edges.push({
            id: `e-${dep.id}`,
            source: `p-${proc.id}`,
            target: targetId,
            animated: true,
            label: 'Depends on',
            style: { stroke: '#94a3b8' }
        });
    });

    // Downstream (Inverse) - Things that need us. Place at y=0.
    proc.inverseDependencies.forEach((invDep: any, index: number) => {
        const sourceId = `p-${invDep.process.id}`;

        if (!nodes.find(n => n.id === sourceId)) {
            nodes.push({
                id: sourceId,
                type: 'default',
                data: { label: invDep.process.name },
                position: { x: 100 + (index * 150), y: 0 },
                style: { border: '1px solid #f97316', background: '#fff7ed' }
            });
        }

        edges.push({
            id: `e-inv-${invDep.id}`,
            source: sourceId,
            target: `p-${proc.id}`,
            animated: true,
            label: 'Depends on Main',
            style: { stroke: '#94a3b8' }
        });
    });

    // Calculate RTO Gaps
    const parseRTO = (rtoStr: string | null) => {
        if (!rtoStr) return 0;
        const val = parseInt(rtoStr); // Extract number
        if (rtoStr.includes('d')) return val * 24;
        if (rtoStr.includes('m')) return val / 60;
        return val; // assume hours
    };

    const targetRTO = parseRTO(proc.rto);
    const rtoGaps = proc.dependencies
        .filter((d: any) => d.dependentProcess && d.dependentProcess.rto)
        .map((d: any) => {
            const depRTO = parseRTO(d.dependentProcess!.rto);
            if (depRTO > targetRTO) {
                return {
                    name: d.dependentProcess!.name,
                    actual: d.dependentProcess!.rto,
                    target: proc.rto
                };
            }
            return null;
        })
        .filter((g: any): g is { name: string, actual: string, target: string } => g !== null);


    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center space-x-2 mb-4">
                <Link href="/bia/processes">
                    <Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4" /> Back to List</Button>
                </Link>
            </div>


            // ... (existing imports)

            // ...

            <div className="flex items-center justify-between space-y-2">
                <div className="flex items-center space-x-4">
                    <div className="bg-orange-100 p-3 rounded-full">
                        <Activity className="w-8 h-8 text-orange-600" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">{proc.name}</h2>
                        <div className="flex items-center space-x-4 mt-2 text-muted-foreground">
                            <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> RTO: {proc.rto}</span>
                            <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> RPO: {proc.rpo}</span>
                            <Badge variant={proc.priority === "Critical" ? "destructive" : "default"}>{proc.priority}</Badge>
                        </div>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <EditProcessDialog process={proc} />
                    <AddDependencyDialog
                        processId={proc.id}
                        availableAssets={allAssets}
                        availableProcesses={allProcesses}
                    />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>Dependency Map</CardTitle>
                        <CardDescription>Visualizing upstream and downstream dependencies.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DependencyGraph initialNodes={nodes} initialEdges={edges} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Impact & Recovery</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h4 className="font-semibold mb-1">Impact Analysis</h4>
                            <p className="text-sm text-muted-foreground bg-gray-50 p-2 rounded">
                                {proc.description || "No description provided."}
                            </p>
                        </div>

                        {/* Automated Analysis */}
                        <AnalysisReport processId={proc.id} />

                        {/* Static Gap Analysis (Legacy/Quick View) */}
                        <div className={`p-4 border rounded text-sm ${rtoGaps.length > 0 ? 'bg-red-50 border-red-200 text-red-800' : 'bg-green-50 border-green-200 text-green-800'}`}>
                            <h4 className="font-semibold flex items-center">
                                {rtoGaps.length > 0 ? <AlertTriangle className="w-4 h-4 mr-2" /> : <Activity className="w-4 h-4 mr-2" />}
                                RTO Gap Analysis (Static)
                            </h4>
                            <div className="mt-2 text-xs">
                                {rtoGaps.length > 0 ? (
                                    <ul className="list-disc list-inside space-y-1">
                                        {rtoGaps.map((gap: any, i: number) => (
                                            <li key={i}>
                                                <strong>{gap.name}</strong> (RTO: {gap.actual}) {'>'} Target ({gap.target})
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>No direct RTO gaps detected.</p>
                                )}
                            </div>
                        </div>

                        {/* AI Advisor */}
                        <ProcessAIAdvisor processId={proc.id} />
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Dependencies ({proc.dependencies.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {proc.dependencies.map((dep: any) => (
                                <div key={dep.id} className="flex justify-between items-center p-2 border rounded bg-gray-50">
                                    <div className="flex items-center">
                                        {dep.asset ? (
                                            <div className="bg-blue-100 p-1 rounded mr-2"><Activity className="w-3 h-3 text-blue-600" /></div>
                                        ) : (
                                            <div className="bg-orange-100 p-1 rounded mr-2"><Activity className="w-3 h-3 text-orange-600" /></div>
                                        )}
                                        <div className="text-sm font-medium">
                                            {dep.asset ? dep.asset.name : dep.dependentProcess?.name}
                                        </div>
                                    </div>
                                    <DeleteDependencyButton id={dep.id} processId={proc.id} />
                                </div>
                            ))}
                            {proc.dependencies.length === 0 && <p className="text-sm text-muted-foreground">No dependencies.</p>}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Related Risks ({proc.risks.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {proc.risks.map((risk: any) => (
                                <div key={risk.id} className="flex justify-between items-center p-2 border rounded bg-red-50">
                                    <div className="text-sm font-medium text-red-900">{risk.riskName}</div>
                                    <Badge variant="outline" className="border-red-200 text-red-700">{risk.status}</Badge>
                                </div>
                            ))}
                            {proc.risks.length === 0 && <p className="text-sm text-muted-foreground">No directly linked risks.</p>}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
