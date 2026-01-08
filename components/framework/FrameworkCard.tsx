'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { FrameworkCard as FrameworkCardType } from '@/types/framework';
import { FileText, CheckCircle2, XCircle } from 'lucide-react';

export function FrameworkCard({ framework }: { framework: FrameworkCardType }) {
    // Mapping API specific fields if needed
    const status = framework.status || 'active';
    const controlsCount = framework.controls_count || 0;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{framework.framework_name || (framework as any).name}</CardTitle>
                        <CardDescription className="line-clamp-2">{framework.description}</CardDescription>
                    </div>
                    {framework.logo && (
                        <div className="ml-4 w-12 h-12 rounded bg-gray-100 flex items-center justify-center">
                            <FileText className="h-6 w-6 text-gray-400" />
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Badge variant={status === 'active' ? 'default' : 'secondary'}>
                            {status === 'active' ? (
                                <><CheckCircle2 className="h-3 w-3 mr-1" /> Active</>
                            ) : (
                                <><XCircle className="h-3 w-3 mr-1" /> Inactive</>
                            )}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                            {controlsCount} controls
                        </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        Type: {framework.framework_type || 'Standard'}
                    </div>
                    <div className="flex gap-2">
                        {/* 
                We use framework_id or id. ref uses framework_id. 
                Our API might return id. We should check.
                Usually 'framework as any' helps if type mismatch.
            */}
                        <Button asChild className="flex-1" variant="outline">
                            <Link href={`/frameworks/${framework.framework_id || (framework as any).id}`}>View Details</Link>
                        </Button>
                        <Button asChild className="flex-1">
                            <Link href={`/assessments/create?framework=${framework.framework_id || (framework as any).id}`}>Create Assessment</Link>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
