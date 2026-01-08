import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Server, Activity, Users, Database, Building } from 'lucide-react';
import { db } from '@/lib/db/drizzle';
import { assets, dependencies, businessProcesses, riskRegister } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import Link from 'next/link';
import { DependencyGraph } from '@/components/bia/dependency-graph';
import { EditAssetDialog } from '@/components/bia/edit-asset-dialog';

export default async function AssetDetailsPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const assetId = parseInt(params.id);
    if (isNaN(assetId)) return <div>Invalid ID</div>;

    const asset = await db.query.assets.findFirst({
        where: eq(assets.id, assetId),
        // We need to find what depends ON this asset
    });

    if (!asset) return <div>Asset not found</div>;

    // Fetch dependent processes (Reverse Dependencies)
    // "Which processes depend on this Asset?"
    const downstreamDeps = await db.query.dependencies.findMany({
        where: eq(dependencies.dependentOnAssetId, assetId),
        with: {
            process: true
        }
    });

    const relatedRisks = await db.query.riskRegister.findMany({
        where: eq(riskRegister.assetId, assetId)
    });

    // Prepare Graph Data for Reverse View
    // Center: Asset
    // Left: (None, Assets usually don't have upstream dependencies in this model unless we add Asset-Asset links later)
    // Right: Dependent Processes

    const nodes = [
        {
            id: `a-${asset.id}`,
            type: 'input',
            data: { label: `${asset.name}` },
            position: { x: 250, y: 150 },
            style: { border: '2px solid #3b82f6', background: '#eff6ff', width: 180 }
        }
    ];

    const edges: any[] = [];

    downstreamDeps.forEach((dep: any, index: number) => {
        const sourceId = `p-${dep.process.id}`;

        // Add Process Node (Upstream consumer of the asset)
        // Visually we can place them above or to the left to show they "rely" on it.
        // Or strictly strictly speaking: Process -> Asset. 
        // So Process (Source) -> Asset (Target).
        // Let's visualize Process on Top, Asset on Bottom? Or Left -> Right.
        // Standard DFD: Source -> Destination. 
        // Dependency: Process -> Asset.

        if (!nodes.find(n => n.id === sourceId)) {
            nodes.push({
                id: sourceId,
                type: 'default',
                data: { label: dep.process.name },
                position: { x: 100 + (index * 170), y: 0 }, // Top
                style: { border: '1px solid #f97316', background: '#fff7ed', width: 150 }
            });
        }

        edges.push({
            id: `e-${dep.id}`,
            source: sourceId,
            target: `a-${asset.id}`,
            animated: true,
            label: 'Depended on by',
        });
    });

    const AssetIcon = () => {
        switch (asset.type) {
            case 'Data': return <Database className="w-8 h-8 text-blue-600" />;
            case 'People': return <Users className="w-8 h-8 text-blue-600" />;
            case 'Facility': return <Building className="w-8 h-8 text-blue-600" />;
            default: return <Server className="w-8 h-8 text-blue-600" />;
        }
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center space-x-2 mb-4">
                <Link href="/bia/assets">
                    <Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Assets</Button>
                </Link>
            </div>


            <div className="flex items-center justify-between space-y-2">
                <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                        <AssetIcon />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">{asset.name}</h2>
                        <div className="flex items-center space-x-4 mt-2 text-muted-foreground">
                            <span className="flex items-center">{asset.type}</span>
                            <span>Owner: {asset.owner}</span>
                            <Badge variant={asset.criticality === "High" ? "destructive" : "default"}>{asset.criticality}</Badge>
                        </div>
                    </div>
                </div>
                <div>
                    <EditAssetDialog asset={asset} />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>Impact Map</CardTitle>
                        <CardDescription>Processes that depend on this asset.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DependencyGraph initialNodes={nodes} initialEdges={edges} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Asset Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h4 className="font-semibold mb-1">Description</h4>
                            <p className="text-sm text-muted-foreground bg-gray-50 p-2 rounded">
                                {asset.description || "No description provided."}
                            </p>
                        </div>
                        <div className="p-4 border rounded bg-slate-50">
                            <h4 className="font-semibold text-sm">Dependent Processes</h4>
                            <p className="text-2xl font-bold mt-1">{downstreamDeps.length}</p>
                            <p className="text-xs text-muted-foreground">Business functions at risk if this asset fails.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Dependent Processes ({downstreamDeps.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {downstreamDeps.map((dep: any) => (
                                <div key={dep.id} className="flex justify-between items-center p-3 border rounded bg-gray-50">
                                    <div className="flex items-center">
                                        <div className="bg-orange-100 p-1.5 rounded mr-3"><Activity className="w-4 h-4 text-orange-600" /></div>
                                        <div>
                                            <Link href={`/bia/processes/${dep.process.id}`} className="font-medium hover:underline text-blue-600">
                                                {dep.process.name}
                                            </Link>
                                            <p className="text-xs text-muted-foreground">RTO: {dep.process.rto}</p>
                                        </div>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Type: {dep.type || 'Technical'}
                                    </div>
                                </div>
                            ))}
                            {downstreamDeps.length === 0 && <p className="text-sm text-muted-foreground">No processes currently depend on this asset.</p>}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Related Risks ({relatedRisks.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {relatedRisks.map((risk: any) => (
                                <div key={risk.id} className="flex justify-between items-center p-2 border rounded bg-red-50">
                                    <div className="text-sm font-medium text-red-900">{risk.riskName}</div>
                                    <Badge variant="outline" className="border-red-200 text-red-700">{risk.status}</Badge>
                                </div>
                            ))}
                            {relatedRisks.length === 0 && <p className="text-sm text-muted-foreground">No directly linked risks.</p>}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
