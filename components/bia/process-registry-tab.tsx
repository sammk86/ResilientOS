'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity } from 'lucide-react';
import { NewProcessDialog } from '@/components/bia/new-process-dialog';
import { DeleteProcessButton } from '@/components/bia/delete-process-button';

interface Props {
    processes: any[];
}

export function ProcessRegistryTab({ processes }: Props) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between space-y-2">
                <div></div>
                <div className="flex items-center space-x-2">
                    <NewProcessDialog />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-1">
                {processes.map((proc) => (
                    <Card key={proc.id} className="hover:bg-slate-50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {proc.name}
                            </CardTitle>
                            <Badge variant={(proc.priority || '').toLowerCase() === "critical" ? "destructive" : "secondary"}>
                                {proc.priority}
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-center">
                                <div className="space-y-1">
                                    <div className="text-2xl font-bold flex items-center">
                                        <Activity className={`w-5 h-5 mr-2 ${(proc.priority || '').toLowerCase() === 'critical' ? 'text-red-600 animate-pulse' : 'text-blue-600'}`} />
                                        <span className={(proc.priority || '').toLowerCase() === 'critical' ? 'text-red-700' : ''}>
                                            RTO: {proc.rto}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Owner: {proc.owner} | RPO: {proc.rpo}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="text-right mr-4">
                                        <p className="text-sm font-medium">${proc.downtimeCostPerHour?.toLocaleString() || 0}/hr</p>
                                        <p className="text-xs text-muted-foreground">Impact Cost</p>
                                    </div>
                                    <DeleteProcessButton id={proc.id} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {processes.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">No processes defined.</div>
                )}
            </div>
        </div>
    );
}
