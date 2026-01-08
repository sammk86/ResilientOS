import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface Assessment {
    id: number;
    name: string;
    progress: number | null;
    status: string | null;
    dueDate: Date | null;
}

interface AssessmentProgressProps {
    assessments: Assessment[];
}

export function AssessmentProgressWidget({ assessments }: AssessmentProgressProps) {
    return (
        <Card className="col-span-1 md:col-span-2 lg:col-span-1">
            <CardHeader>
                <CardTitle>Active Assessments</CardTitle>
            </CardHeader>
            <CardContent>
                {assessments.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No active assessments.</p>
                ) : (
                    <div className="space-y-6">
                        {assessments.map((assessment) => (
                            <div key={assessment.id} className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="font-medium">{assessment.name}</div>
                                    <div className="text-muted-foreground">
                                        {assessment.progress || 0}%
                                    </div>
                                </div>
                                <Progress value={assessment.progress || 0} />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Status: {assessment.status}</span>
                                    {assessment.dueDate && (
                                        <span>Due: {assessment.dueDate.toLocaleDateString()}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <div className="mt-6">
                    <Link href="/assessments">
                        <Button variant="outline" className="w-full">
                            View All Assessments <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
