import { db } from '@/lib/db/drizzle';
import { businessProcesses, assets, biaRuns } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { BiaDashboardClient } from '@/components/bia/bia-dashboard-client';
import { AssetRegistryTab } from '@/components/bia/asset-registry-tab';
import { BiaAnalysisTab } from '@/components/bia/bia-analysis-tab';
import { ProcessRegistryTab } from '@/components/bia/process-registry-tab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

async function getBIAData() {
    const processes = await db.query.businessProcesses.findMany({
        with: {
            dependencies: {
                with: {
                    asset: true,
                    dependentProcess: true
                }
            },
            risks: true
        },
        orderBy: [desc(businessProcesses.createdAt)],
    });

    // Fetch History
    const runs = await db.query.biaRuns.findMany({
        orderBy: [desc(biaRuns.runDate)],
        with: {
            // we need process name, but relation might not be defined in schema relations yet
            // we will refetch or just rely on IDs, or add relation. 
            // For now let's just fetch everything.
        }
    });

    // Manual join for process names since I didn't add the relation to 'relations' block yet
    // Efficiency note: in production, add proper Relation.
    const allAssets = await db.query.assets.findMany();
    const allProcesses = await db.query.businessProcesses.findMany();

    const enrichedRuns = runs.map((run: any) => {
        const p = allProcesses.find((proc: any) => proc.id === run.processId);
        return {
            ...run,
            processName: p ? p.name : 'Deleted Process',
            runDate: run.runDate.toISOString(), // ensure serializable
        };
    });

    return { processes, allAssets, allProcesses, runs: enrichedRuns };
}

export default async function BIAPage() {
    const { processes, allAssets, allProcesses, runs } = await getBIAData();

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Business Impact Analysis</h2>
            </div>

            <Tabs defaultValue="analysis" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="analysis">BIA Analysis</TabsTrigger>
                    <TabsTrigger value="processes">Process Registry</TabsTrigger>
                    <TabsTrigger value="assets">Asset Registry</TabsTrigger>
                </TabsList>

                <TabsContent value="analysis" className="space-y-4">
                    <BiaAnalysisTab processes={allProcesses} runs={runs} />
                </TabsContent>

                <TabsContent value="processes" className="space-y-4">
                    <ProcessRegistryTab processes={processes} />
                </TabsContent>

                <TabsContent value="assets" className="space-y-4">
                    <AssetRegistryTab assets={allAssets} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
