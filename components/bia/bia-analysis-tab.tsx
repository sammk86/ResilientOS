'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, FileText } from 'lucide-react';
import { NewAnalysisDialog } from '@/components/bia/new-analysis-dialog';
import Link from 'next/link';

interface AnalysisTabProps {
    processes: any[];
    runs: any[];
}

export function BiaAnalysisTab({ processes, runs }: AnalysisTabProps) {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium">Analysis Workspaces</h3>
                    <p className="text-sm text-muted-foreground">Manage ongoing and completed impact assessments.</p>
                </div>
                <NewAnalysisDialog processes={processes} />
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[300px]">Analysis Name</TableHead>
                                <TableHead>Target Process</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Last Run</TableHead>
                                <TableHead>Impact</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {runs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                        No analyses created yet.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                runs.map((run) => (
                                    <TableRow key={run.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex flex-col">
                                                <span>{run.name}</span>
                                                <span className="text-xs text-muted-foreground">ID: {run.id}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{run.processName}</TableCell>
                                        <TableCell>
                                            <Badge variant={run.status === 'completed' ? 'default' : 'secondary'}>
                                                {run.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{run.runDate ? new Date(run.runDate).toLocaleDateString() : '-'}</TableCell>
                                        <TableCell>
                                            {run.summaryData?.totalDowntimeCost ? `$${run.summaryData.totalDowntimeCost.toLocaleString()}/hr` : '-'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Link href={`/bia/analysis/${run.id}`}>
                                                <Button variant="ghost" size="sm">
                                                    Open <ArrowRight className="w-4 h-4 ml-2" />
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
