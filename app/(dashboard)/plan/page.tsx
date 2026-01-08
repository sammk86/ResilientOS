import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, FileText, Users, Smartphone, AlertTriangle } from 'lucide-react';
import { NewRunbookDialog } from '@/components/plan/new-runbook-dialog';
import { ManageStepsDialog } from '@/components/plan/manage-steps-dialog';
import { db } from '@/lib/db/drizzle';
import { runbooks } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

async function getRunbooks() {
    return await db.query.runbooks.findMany({
        with: {
            steps: true,
            process: {
                with: {
                    risks: {
                        with: {
                            category: true // Fetch category for better context if needed
                        }
                    }
                }
            }
        },
        orderBy: [desc(runbooks.updatedAt)],
    });
}

export default async function PlanPage() {
    const runbookList = await getRunbooks();
    // Fetch processes for the dialog
    const processes = await db.query.businessProcesses.findMany({
        columns: { id: true, name: true }
    });

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Continuity Plans</h2>
                <div className="flex items-center space-x-2">
                    <NewRunbookDialog processes={processes} />
                    <Button variant="outline">
                        <Smartphone className="mr-2 h-4 w-4" /> Mobile View
                    </Button>
                    <Button>
                        <Play className="mr-2 h-4 w-4" />
                        Start Simulation
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="runbooks" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="runbooks">Digital Runbooks</TabsTrigger>
                    <TabsTrigger value="roles">My Role View</TabsTrigger>
                    <TabsTrigger value="contacts">Crisis Contacts</TabsTrigger>
                </TabsList>

                <TabsContent value="runbooks" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        {runbookList.length === 0 ? (
                            <div className="col-span-3 flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-slate-50 text-center space-y-4">
                                <FileText className="h-12 w-12 text-muted-foreground/50" />
                                <div className="space-y-2">
                                    <h3 className="text-lg font-semibold">No Continuity Plans Yet</h3>
                                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                                        Continuity plans (Runbooks) guide your team during a crisis.
                                        We recommend starting with a Business Impact Analysis (BIA) to identify what needs protection.
                                    </p>
                                </div>
                                <div className="flex gap-4">
                                    <Link href="/bia">
                                        <Button variant="outline">Go to BIA</Button>
                                    </Link>
                                    <NewRunbookDialog />
                                </div>
                            </div>
                        ) : (
                            runbookList.map((plan: any, i: number) => (
                                <Card key={plan.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <Badge variant="outline">{plan.type || 'General'}</Badge>
                                        {plan.status === "published" ? <Badge className="bg-green-500">Active</Badge> : <Badge variant="secondary">Draft</Badge>}
                                    </CardHeader>
                                    <CardContent>
                                        <CardTitle className="text-xl mb-2">{plan.title}</CardTitle>
                                        <CardDescription className="flex items-center">
                                            <FileText className="mr-2 h-4 w-4" /> {plan.steps.length} Actionable Steps
                                        </CardDescription>
                                        {plan.process && (
                                            <div className="mt-4 p-3 bg-slate-50 rounded-md border text-sm space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">BIA Context</span>
                                                    <Badge variant={(plan.process.priority || '').toLowerCase() === 'critical' ? 'destructive' : 'secondary'} className="text-[10px] h-5">
                                                        {plan.process.priority || 'Normal'}
                                                    </Badge>
                                                </div>

                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-muted-foreground">Target:</span>
                                                    <span className="font-medium">{plan.process.name}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-muted-foreground">Recovery Time (RTO):</span>
                                                    <span className="font-mono font-medium">{plan.process.rto || 'N/A'}</span>
                                                </div>

                                                {plan.process.risks.length > 0 && (
                                                    <div className="pt-2 mt-2 border-t border-slate-200">
                                                        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
                                                            <AlertTriangle className="h-3 w-3" />
                                                            <span className="text-xs font-medium">Mitigates {plan.process.risks.length} Risk{plan.process.risks.length !== 1 ? 's' : ''}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        <div className="mt-4">
                                            <ManageStepsDialog
                                                runbookId={plan.id}
                                                steps={plan.steps}
                                                runbookName={plan.title}
                                                description={plan.description || ''}
                                                biaContext={plan.process ? {
                                                    rto: plan.process.rto,
                                                    criticality: plan.process.priority
                                                } : undefined}
                                                risks={plan.process?.risks?.map((r: any) => r.riskName)}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="roles">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Tasks (Crisis Mode)</CardTitle>
                            <CardDescription>
                                Showing tasks assigned to <strong>Grid Operator</strong> (Demo Role).
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {runbookList.flatMap((rb: any) => rb.steps).length === 0 ? (
                                    <div className="p-4 text-center text-muted-foreground">
                                        No active tasks assigned to your role.
                                    </div>
                                ) : (
                                    runbookList.flatMap((rb: any) => rb.steps.map((step: any) => ({ ...step, runbookName: rb.name }))).map((step: any) => (
                                        <div key={step.id} className="p-4 border rounded hover:bg-gray-50 flex justify-between items-center">
                                            <div>
                                                <h4 className="font-medium text-gray-900">{step.title}</h4>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Plan: {step.runbookName} • Time: {step.estimatedTime}
                                                </p>
                                            </div>
                                            <Button size="sm" variant="outline">Mark Done</Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="contacts">
                    <div className="p-4 text-center text-muted-foreground">No contacts defined.</div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
