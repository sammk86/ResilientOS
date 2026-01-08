import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Trash2, Activity } from 'lucide-react';
import { db } from '@/lib/db/drizzle';
import { businessProcesses } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { NewProcessDialog } from '@/components/bia/new-process-dialog';
import { DeleteProcessButton } from '@/components/bia/delete-process-button';
import Link from 'next/link';

async function getProcesses() {
    const processList = await db.query.businessProcesses.findMany({
        orderBy: [desc(businessProcesses.createdAt)],
    });
    return processList;
}

export default async function ProcessPage() {
    const processList = await getProcesses();

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Process Registry</h2>
                <div className="flex items-center space-x-2">
                    <NewProcessDialog />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-1">
                <Card>
                    <CardHeader>
                        <CardTitle>Business Processes & Functions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {processList.length === 0 ? (
                                <div className="text-center text-muted-foreground py-8">No processes defined. Start a BIA to add one.</div>
                            ) : (
                                processList.map((proc: any) => (
                                    <div key={proc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center space-x-4">
                                            <div className="bg-orange-100 p-2 rounded-full">
                                                <Activity className="w-5 h-5 text-orange-600" />
                                            </div>
                                            <div>
                                                <Link href={`/bia/processes/${proc.id}`} className="hover:underline">
                                                    <p className="font-medium text-lg">{proc.name}</p>
                                                </Link>
                                                <div className="flex items-center mt-1 text-sm text-muted-foreground space-x-4">
                                                    <span className="flex items-center bg-gray-100 px-2 py-0.5 rounded"><Clock className="w-3 h-3 mr-1" /> RTO: {proc.rto || 'N/A'}</span>
                                                    <span className="flex items-center bg-gray-100 px-2 py-0.5 rounded">RPO: {proc.rpo || 'N/A'}</span>
                                                    <span>Owner: {proc.owner}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <Badge variant={proc.priority === "Critical" ? "destructive" : proc.priority === "High" ? "default" : "secondary"}>
                                                {proc.priority}
                                            </Badge>
                                            <DeleteProcessButton id={proc.id} />
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
