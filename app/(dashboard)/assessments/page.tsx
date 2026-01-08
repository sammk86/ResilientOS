'use client';

import { useAssessmentList } from '@/lib/hooks/useAssessment';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, FileText, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';

// Simple mapping for demonstration
const statusConfig: any = {
    created: { label: 'Created', icon: FileText, className: 'bg-gray-100 text-gray-800 border-gray-300' },
    in_progress: { label: 'In Progress', icon: Clock, className: 'bg-blue-100 text-blue-800 border-blue-300' },
    completed: { label: 'Completed', icon: CheckCircle2, className: 'bg-green-100 text-green-800 border-green-300' },
    pending: { label: 'Pending', icon: FileText, className: 'bg-gray-100 text-gray-800 border-gray-300' },
    overdue: { label: 'Overdue', icon: AlertCircle, className: 'bg-red-100 text-red-800 border-red-300' },
};

export default function AssessmentsPage() {
    const { assessments, isLoading } = useAssessmentList();

    if (isLoading) {
        return (
            <div className="flex-1 p-4 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 p-4 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Assessments</h1>
                        <p className="text-muted-foreground mt-2">Manage your assessment tasks</p>
                    </div>
                    <Button asChild>
                        <Link href="/assessments/create">
                            <Plus className="h-4 w-4 mr-2" />
                            Create New Assessment
                        </Link>
                    </Button>
                </div>

                {assessments && assessments.length > 0 ? (
                    <Card>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th className="text-left p-4 font-semibold">Name</th>
                                            <th className="text-left p-4 font-semibold">Framework</th>
                                            <th className="text-left p-4 font-semibold">Status</th>
                                            <th className="text-center p-4 font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {assessments.map((assessment: any) => {
                                            const statusInfo = statusConfig[assessment.status] || statusConfig.pending;
                                            const StatusIcon = statusInfo.icon;

                                            return (
                                                <tr key={assessment.assessment_id || assessment.id} className="border-b hover:bg-muted/50 transition-colors">
                                                    <td className="p-4">
                                                        <div className="font-medium">{assessment.assessment_name || assessment.name}</div>
                                                        {assessment.description && (
                                                            <div className="text-sm text-muted-foreground mt-1 line-clamp-1">
                                                                {assessment.description}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="text-sm">{assessment.framework_name || assessment.framework?.name || 'N/A'}</span>
                                                    </td>
                                                    <td className="p-4">
                                                        <Badge className={statusInfo.className} variant="outline">
                                                            <StatusIcon className="h-3 w-3 mr-1" />
                                                            {statusInfo.label}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex justify-center gap-2">
                                                            <Button asChild variant="ghost" size="sm">
                                                                <Link href={`/assessments/${assessment.assessment_id || assessment.id}`}>
                                                                    <Eye className="h-4 w-4 mr-1" />
                                                                    View
                                                                </Link>
                                                            </Button>
                                                            {assessment.status === 'completed' && (
                                                                <Button asChild variant="ghost" size="sm">
                                                                    <Link href={`/assessments/${assessment.assessment_id || assessment.id}/results`}>
                                                                        <FileText className="h-4 w-4 mr-1" />
                                                                        Results
                                                                    </Link>
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardContent className="pt-6">
                            <p className="text-muted-foreground text-center">No assessments found.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
