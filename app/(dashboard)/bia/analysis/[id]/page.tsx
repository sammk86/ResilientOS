import { db } from '@/lib/db/drizzle';
import { notFound } from 'next/navigation';
import { AnalysisWorkspaceClient } from '@/components/bia/analysis-workspace-client';
import { biaRuns, businessProcesses } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export default async function AnalysisWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;

    // 1. Fetch Analysis Meta
    const analysis = await db.query.biaRuns.findFirst({
        where: eq(biaRuns.id, parseInt(resolvedParams.id)),
    });

    if (!analysis) return notFound();

    // 2. Fetch Process & Dependencies
    const process = await db.query.businessProcesses.findFirst({
        where: eq(businessProcesses.id, analysis.processId),
        with: {
            dependencies: {
                with: {
                    asset: true,
                    dependentProcess: true
                }
            },
            risks: true
        }
    });

    if (!process) return notFound();

    // 3. Fetch Master Data (for adding new dependencies)
    const allAssets = await db.query.assets.findMany();
    const allProcesses = await db.query.businessProcesses.findMany();

    return (
        <AnalysisWorkspaceClient
            analysis={analysis}
            process={process}
            allAssets={allAssets}
            allProcesses={allProcesses}
        />
    );
}
