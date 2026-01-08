'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RiskHeatmap } from '@/components/risk/RiskHeatmap';
import { RiskDialog, NewRiskDialog } from '@/components/risk/new-risk-dialog';
import { AlertTriangle, Filter, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { deleteRiskAction, addFromUniverseAction } from '@/app/(dashboard)/risk/actions';
import { toast } from 'sonner';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function RiskPage() {
    const [activeTab, setActiveTab] = useState('universe');
    const [isAdding, setIsAdding] = useState<number | null>(null);

    // Fetch Risk Register data
    const { data: registerData, isLoading: isLoadingRegister, mutate: mutateRegister } = useSWR('/api/risks/register', fetcher);
    const registerRisks = registerData?.riskRegister || [];

    // Fetch Risk Universe data
    const { data: universeData, isLoading: isLoadingUniverse } = useSWR('/api/risks/universe', fetcher);
    const riskUniverse = universeData?.riskUniverse || [];

    async function handleDelete(id: number) {
        if (confirm('Are you sure you want to delete this risk?')) {
            const result = await deleteRiskAction(id);
            if (result.success) {
                toast.success('Risk deleted');
                mutateRegister(); // Refresh the list
            } else {
                toast.error('Failed to delete risk');
            }
        }
    }

    async function handleAddToRegister(universeId: number) {
        setIsAdding(universeId);
        const result = await addFromUniverseAction(universeId);
        if (result.success) {
            toast.success('Risk added to register');
            mutateRegister();
            setActiveTab('register');
        } else {
            toast.error('Failed to add risk');
        }
        setIsAdding(null);
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Risk Management</h2>
                <div className="flex items-center space-x-2">
                    <NewRiskDialog onSuccess={() => mutateRegister()} />
                </div>
            </div>

            <Tabs defaultValue="universe" className="space-y-4" onValueChange={setActiveTab} value={activeTab}>
                <TabsList>
                    <TabsTrigger value="universe">Risk Universe</TabsTrigger>
                    <TabsTrigger value="register">Risk Register</TabsTrigger>
                    <TabsTrigger value="heatmap">Summary & Heatmap</TabsTrigger>
                </TabsList>

                <TabsContent value="register" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <RiskHeatmap risks={registerRisks} />
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Stats</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center border-b pb-2">
                                    <span>Total Risks</span>
                                    <Badge variant="secondary" className="text-lg">{registerRisks.length}</Badge>
                                </div>
                                <div className="flex justify-between items-center border-b pb-2">
                                    <span>Extreme Risks</span>
                                    <Badge variant="destructive">{registerRisks.filter((r: any) => (r.likelihood * r.impact) >= 15).length}</Badge>
                                </div>
                                <div className="flex justify-between items-center border-b pb-2">
                                    <span>Open Risks</span>
                                    <Badge variant="outline">{registerRisks.filter((r: any) => r.status === 'open').length}</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Risk Register</CardTitle>
                                    <CardDescription>Qualified risks actively tracked and managed</CardDescription>
                                </div>
                                <Button variant="outline" size="sm">
                                    <Filter className="h-4 w-4 mr-2" />
                                    Filter
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isLoadingRegister ? (
                                <div className="text-center py-8">Loading risks...</div>
                            ) : registerRisks.length === 0 ? (
                                <div className="text-center py-8">
                                    <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-muted-foreground">No risks in register yet</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                                            <tr>
                                                <th className="px-4 py-3">ID</th>
                                                <th className="px-4 py-3">Risk Title</th>
                                                <th className="px-4 py-3">Scope</th>
                                                <th className="px-4 py-3">Category</th>
                                                <th className="px-4 py-3 text-center">Likelihood</th>
                                                <th className="px-4 py-3 text-center">Impact</th>
                                                <th className="px-4 py-3 text-center">Score</th>
                                                <th className="px-4 py-3">Strategy</th>
                                                <th className="px-4 py-3">Status</th>
                                                <th className="px-4 py-3 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {registerRisks.map((risk: any) => (
                                                <tr key={risk.id} className="border-b hover:bg-muted/50 transition-colors group">
                                                    <td className="px-4 py-3 text-muted-foreground">#{risk.id}</td>
                                                    <td className="px-4 py-3 font-medium">
                                                        <div>{risk.riskName || risk.title}</div>
                                                        {risk.description && (
                                                            <div className="text-xs text-muted-foreground truncate max-w-[200px]">{risk.description}</div>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="capitalize font-medium">{risk.scope || 'System'}</div>
                                                        {risk.scope === 'asset' && risk.assetId && (
                                                            <div className="text-xs text-muted-foreground">Asset #{risk.assetId}</div>
                                                        )}
                                                        {risk.scope === 'process' && risk.processId && (
                                                            <div className="text-xs text-muted-foreground">Process #{risk.processId}</div>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {risk.category?.name ? (
                                                            <Badge variant="secondary" style={{ backgroundColor: risk.category.color + '20', color: risk.category.color }}>
                                                                {risk.category.name}
                                                            </Badge>
                                                        ) : '-'}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">{risk.likelihood}</td>
                                                    <td className="px-4 py-3 text-center">{risk.impact}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        <Badge className={
                                                            (risk.riskScore || 0) >= 15 ? "bg-red-500 hover:bg-red-600" :
                                                                (risk.riskScore || 0) >= 10 ? "bg-orange-500 hover:bg-orange-600" :
                                                                    (risk.riskScore || 0) >= 5 ? "bg-yellow-500 hover:bg-yellow-600" :
                                                                        "bg-green-500 hover:bg-green-600"
                                                        }>
                                                            {risk.riskScore}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3 capitalize">{risk.strategy}</td>
                                                    <td className="px-4 py-3">
                                                        <Badge variant="outline" className="capitalize">{risk.status}</Badge>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <RiskDialog
                                                                risk={risk}
                                                                trigger={
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                        <Pencil className="h-4 w-4" />
                                                                    </Button>
                                                                }
                                                                onSuccess={() => mutateRegister()}
                                                            />
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-destructive hover:text-destructive"
                                                                onClick={() => handleDelete(risk.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="universe" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Risk Universe</CardTitle>
                            <CardDescription>All identified risks and their sources</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoadingUniverse ? (
                                <div className="text-center py-8">Loading universe...</div>
                            ) : riskUniverse.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground">No risks in universe yet</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                                            <tr>
                                                <th className="px-4 py-3">Description</th>
                                                <th className="px-4 py-3">Source Framework</th>
                                                <th className="px-4 py-3">Control Code</th>
                                                <th className="px-4 py-3">Type</th>
                                                <th className="px-4 py-3">Status</th>
                                                <th className="px-4 py-3 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {riskUniverse.map((item: any) => (
                                                <tr key={item.id} className="border-b hover:bg-muted/50 transition-colors">
                                                    <td className="px-4 py-3">{item.riskDescription}</td>
                                                    <td className="px-4 py-3">{item.framework?.name || item.frameworkName}</td>
                                                    <td className="px-4 py-3">{item.controlCode}</td>
                                                    <td className="px-4 py-3 capitalize">{item.riskType}</td>
                                                    <td className="px-4 py-3 capitalize">{item.status}</td>
                                                    <td className="px-4 py-3 text-right">
                                                        <Button
                                                            size="sm"
                                                            variant="default"
                                                            onClick={() => handleAddToRegister(item.id)}
                                                            disabled={isAdding === item.id}
                                                        >
                                                            {isAdding === item.id ? 'Adding...' : 'Add to Register'}
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="heatmap">
                    <div className="max-w-3xl mx-auto">
                        <RiskHeatmap risks={registerRisks} />
                    </div>
                </TabsContent>
            </Tabs>
        </div>

    );
}
