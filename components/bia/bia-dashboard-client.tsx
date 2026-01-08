'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, DollarSign, Network, ArrowRight, Activity, AlertTriangle, ArrowUpRight, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { NewProcessDialog } from '@/components/bia/new-process-dialog';
import { DependencyGraph } from '@/components/bia/dependency-graph';
import { AddDependencyDialog } from '@/components/bia/add-dependency-dialog';
import { deleteProcessAction } from '@/app/(dashboard)/bia/actions';

interface Process {
    id: number;
    name: string;
    rto: string;
    rpo: string;
    priority: string;
    description?: string;
    dependencies: any[];
    risks?: any[];
    financialImpact?: string | null;
    downtimeCostPerHour?: number;
    recoveryCostFixed?: number;
    dataClassification?: string;
    operationalImpact?: string | null;
}

interface BiaDashboardProps {
    processes: Process[];
    allAssets: any[];
    allProcesses: any[];
}

export function BiaDashboardClient({ processes, allAssets, allProcesses }: BiaDashboardProps) {
    const [selectedProcessId, setSelectedProcessId] = useState<number | null>(processes.length > 0 ? processes[0].id : null);

    const selectedProcess = selectedProcessId ? processes.find(p => p.id === selectedProcessId) : null;
    const criticalCount = processes.filter(p => p.priority === 'Critical').length;
    const dependentCount = processes.reduce((acc, p) => acc + p.dependencies.length, 0);

    // Calculate Financial Impact
    const calculateCost = (p: Process) => {
        return (p.downtimeCostPerHour || 0);
    };
    const totalDowntimeCost = processes.reduce((acc, p) => acc + calculateCost(p), 0);


    // Prepare Graph Data for Selected Process
    let nodes: any[] = [];
    let edges: any[] = [];

    if (selectedProcess) {
        nodes = [
            {
                id: `p-${selectedProcess.id}`,
                type: 'input',
                data: { label: `${selectedProcess.name} (RTO: ${selectedProcess.rto})` },
                position: { x: 250, y: 0 },
                style: { border: '2px solid #f97316', background: '#ffedd5' }
            }
        ];

        selectedProcess.dependencies.forEach((dep, index) => {
            const targetId = dep.dependentOnAssetId ? `a-${dep.dependentOnAssetId}` : `p-${dep.dependentOnProcessId}`;
            const label = dep.asset ? dep.asset.name : dep.dependentProcess?.name || 'Unknown';

            if (!nodes.find(n => n.id === targetId)) {
                nodes.push({
                    id: targetId,
                    type: 'default',
                    data: { label: label },
                    position: { x: 50 + (index * 120), y: 150 },
                    style: dep.dependentOnAssetId ? { border: '1px solid #3b82f6', background: '#eff6ff', fontSize: '12px' } : { border: '1px solid #f97316', background: '#fff7ed', fontSize: '12px' }
                });
            }
            edges.push({
                id: `e-${dep.id}`,
                source: `p-${selectedProcess.id}`,
                target: targetId,
                animated: true,
                style: { stroke: '#cbd5e1' }
            });
        });
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Business Impact Analysis (BIA)</h2>
                <div className="flex items-center space-x-2">
                    <Link href="/bia/assets">
                        <Button variant="outline">Asset Registry</Button>
                    </Link>
                    <Link href="/bia/processes">
                        <Button variant="outline">Process Registry</Button>
                    </Link>
                    <NewProcessDialog />
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Critical Processes</CardTitle>
                        <Activity className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{criticalCount}</div>
                        <p className="text-xs text-muted-foreground">RTO {"<"} 4 hours</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Dependent Assets</CardTitle>
                        <Network className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dependentCount}</div>
                        <p className="text-xs text-muted-foreground">Mapped in Graph</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Est. Downtime Cost</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalDowntimeCost.toLocaleString()} / hr</div>
                        <p className="text-xs text-muted-foreground">Aggregate Impact</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-7">
                {/* Main Visualization & Details (Left) */}
                <Card className="col-span-4 h-full flex flex-col">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle>Impact Analysis Engine</CardTitle>
                                <CardDescription>
                                    {selectedProcess ? selectedProcess.name : "Select a process"}
                                </CardDescription>
                            </div>
                            {selectedProcess && (
                                <Badge variant="outline" className="capitalize">
                                    {selectedProcess.dataClassification} Data
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto">
                        {selectedProcess ? (
                            <div className="space-y-6">
                                {/* LOCKED Graph */}
                                <div className="h-[250px] border rounded bg-slate-50 relative overflow-hidden">
                                    <div className="absolute top-2 right-2 z-10">
                                        <Badge variant="outline" className="bg-white/80">Read-Only View</Badge>
                                    </div>
                                    <DependencyGraph initialNodes={nodes} initialEdges={edges} key={selectedProcess.id} interactive={false} />
                                </div>

                                {/* Impact & Details Tabs */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-semibold text-lg">Process Detail</h3>
                                        <div className="flex space-x-2">
                                            <AddDependencyDialog
                                                processId={selectedProcess.id}
                                                availableAssets={allAssets}
                                                availableProcesses={allProcesses}
                                            />
                                            <Link href={`/bia/processes/${selectedProcess.id}`}>
                                                <Button variant="outline" size="sm">Full Report</Button>
                                            </Link>
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                className="h-9 w-9"
                                                onClick={async () => {
                                                    if (confirm('Are you sure you want to delete this process? This action cannot be undone.')) {
                                                        await deleteProcessAction(selectedProcess.id);
                                                        setSelectedProcessId(null);
                                                    }
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 border rounded bg-green-50">
                                            <p className="text-xs font-semibold text-green-800 uppercase">Financial Impact</p>
                                            <div className="mt-2 space-y-1">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Hourly Loss:</span>
                                                    <span className="font-bold text-green-900">${(selectedProcess.downtimeCostPerHour || 0).toLocaleString()}/hr</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Fixed Cost:</span>
                                                    <span className="font-medium text-green-800">${(selectedProcess.recoveryCostFixed || 0).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-3 border rounded bg-blue-50">
                                            <p className="text-xs font-semibold text-blue-800 uppercase">Operational Impact</p>
                                            <p className="text-sm font-medium text-blue-900 line-clamp-2">{selectedProcess.operationalImpact || "No data"}</p>
                                        </div>
                                    </div>

                                    {/* Lists: Risks & Dependencies */}
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="border rounded-md p-3">
                                            <h4 className="text-sm font-semibold mb-2 flex items-center"><Activity className="w-4 h-4 mr-2 text-red-500" /> Relevant Risks</h4>
                                            {selectedProcess.risks && selectedProcess.risks.length > 0 ? (
                                                <ul className="space-y-1">
                                                    {selectedProcess.risks.map((risk: any) => (
                                                        <li key={risk.id} className="text-sm flex justify-between items-center bg-red-50 p-1.5 rounded">
                                                            <span>{risk.riskName}</span>
                                                            <Badge className="text-[10px] h-5" variant="outline">{risk.status}</Badge>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : <p className="text-xs text-muted-foreground">No risks identified.</p>}
                                        </div>

                                        <div className="border rounded-md p-3">
                                            <h4 className="text-sm font-semibold mb-2 flex items-center"><Network className="w-4 h-4 mr-2 text-blue-500" /> Dependencies</h4>
                                            {selectedProcess.dependencies.length > 0 ? (
                                                <div className="space-y-1 max-h-[150px] overflow-y-auto">
                                                    {selectedProcess.dependencies.map((dep: any) => (
                                                        <div key={dep.id} className="text-sm flex justify-between items-center bg-gray-50 p-1.5 rounded">
                                                            <span className="truncate max-w-[200px]">{dep.asset ? dep.asset.name : dep.dependentProcess?.name}</span>
                                                            <span className="text-xs text-muted-foreground">{dep.type}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : <p className="text-xs text-muted-foreground">No dependencies mapped.</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                                <Activity className="w-12 h-12 mb-2" />
                                <p>Select a process to analyze</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Process List (Right) */}
                <Card className="col-span-3 h-full overflow-hidden flex flex-col">
                    <CardHeader>
                        <CardTitle>Process Registry</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto p-0 px-6 pb-6">
                        <div className="space-y-2">
                            {processes.map((process, i) => (
                                <div
                                    key={process.id}
                                    onClick={() => setSelectedProcessId(process.id)}
                                    className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${selectedProcessId === process.id
                                        ? 'bg-orange-50 border-orange-200 shadow-md transform scale-[1.02]'
                                        : 'hover:bg-gray-50 border-transparent hover:border-gray-200'
                                        }`}
                                >
                                    <div className="flex-1 min-w-0 mr-4">
                                        <div className="flex items-center">
                                            <div className={`w-2 h-2 rounded-full mr-2 ${process.priority === 'Critical' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                            <p className={`font-medium truncate ${selectedProcessId === process.id ? 'text-orange-900' : ''}`}>{process.name}</p>
                                        </div>
                                        <div className="flex items-center mt-1 text-xs text-muted-foreground ml-4">
                                            <span className="font-mono">{process.rto} RTO</span>
                                            <span className="mx-2">•</span>
                                            <span>${calculateCost(process)}/hr</span>
                                        </div>
                                    </div>
                                    <Badge variant={process.priority === "Critical" ? "destructive" : "secondary"} className="shrink-0">
                                        {process.priority}
                                    </Badge>
                                </div>
                            ))}
                            {processes.length === 0 && (
                                <div className="text-center text-muted-foreground py-8">No processes found.</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
