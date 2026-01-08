'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Server } from 'lucide-react';
import { NewAssetDialog } from '@/components/bia/new-asset-dialog';
import { DeleteAssetButton } from '@/components/bia/delete-asset-button';
import Link from 'next/link';

interface AssetRegistryTabProps {
    assets: any[];
}

export function AssetRegistryTab({ assets }: AssetRegistryTabProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between space-y-2">
                <div>

                </div>
                <div className="flex items-center space-x-2">
                    <NewAssetDialog />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Critical Assets & Systems</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {assets.length === 0 ? (
                            <div className="text-center text-muted-foreground py-8">No assets recorded. Add one to get started.</div>
                        ) : (
                            assets.map((asset) => (
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
                                                {asset.recoveryTimeObjective && (
                                                    <>
                                                        <span>•</span>
                                                        <Badge variant="outline" className="text-xs">RTO: {asset.recoveryTimeObjective}</Badge>
                                                    </>
                                                )}
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
    );
}
