import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Server, Trash2 } from 'lucide-react';
import { db } from '@/lib/db/drizzle';
import { assets } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { NewAssetDialog } from '@/components/bia/new-asset-dialog';
import { DeleteAssetButton } from '@/components/bia/delete-asset-button';
import Link from 'next/link';


async function getAssets() {
    const assetList = await db.query.assets.findMany({
        orderBy: [desc(assets.createdAt)],
    });
    return assetList;
}

export default async function AssetsPage() {
    const assetList = await getAssets();

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Asset Registry</h2>
                <div className="flex items-center space-x-2">
                    <NewAssetDialog />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-1">
                <Card>
                    <CardHeader>
                        <CardTitle>Critical Assets & Systems</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {assetList.length === 0 ? (
                                <div className="text-center text-muted-foreground py-8">No assets recorded. Add one to get started.</div>
                            ) : (
                                assetList.map((asset: any) => (
                                    <div key={asset.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center space-x-4">
                                            <div className="bg-blue-100 p-2 rounded-full">
                                                <Server className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <Link href={`/bia/assets/${asset.id}`} className="hover:underline">
                                                    <p className="font-medium text-lg text-blue-700">{asset.name}</p>
                                                </Link>
                                                <div className="flex items-center mt-1 text-sm text-muted-foreground space-x-2">
                                                    <span>{asset.type}</span>
                                                    <span>•</span>
                                                    <span>Owner: {asset.owner}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <Badge variant={asset.criticality === "High" ? "destructive" : asset.criticality === "Medium" ? "default" : "secondary"}>
                                                {asset.criticality}
                                            </Badge>
                                            <DeleteAssetButton id={asset.id} />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
