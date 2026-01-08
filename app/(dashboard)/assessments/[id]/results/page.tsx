'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useAssessmentResults } from '@/lib/hooks/useAssessment';

export default function AssessmentResultsPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const assessmentId = parseInt(resolvedParams.id, 10);
    const { results, isLoading, isError } = useAssessmentResults(assessmentId);

    if (isLoading) {
        return (
            <div className="flex-1 p-4 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-64 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (isError || !results) {
        return (
            <div className="flex-1 p-4 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center py-6">
                                <h2 className="text-xl font-semibold text-gray-900">Unable to load results</h2>
                                <p className="text-muted-foreground mt-2">The results for this assessment could not be found or are not ready.</p>
                                <div className="mt-6 flex justify-center gap-4">
                                    <Button asChild variant="outline">
                                        <Link href={`/assessments/${assessmentId}`}>
                                            <ArrowLeft className="h-4 w-4 mr-2" />
                                            Back to Assessment
                                        </Link>
                                    </Button>
                                    <Button asChild>
                                        <Link href="/assessments">
                                            Return to List
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 p-4 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <Button asChild variant="ghost" className="mb-2">
                            <Link href={`/assessments/${assessmentId}`}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Assessment
                            </Link>
                        </Button>
                        <h1 className="text-3xl font-bold">Assessment Results</h1>
                        <p className="text-muted-foreground mt-2">
                            Completed on {new Date(results.completedAt).toLocaleDateString()}
                        </p>
                    </div>
                    <div>
                        <Button asChild variant="outline">
                            <Link href="/assessments">
                                Done
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Score Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Overall Score</CardTitle>
                            <CardDescription>
                                Calculated based on risk impact and likelihood
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-3xl font-bold">{results.overallScore}</span>
                                <Badge variant="outline">/ 100</Badge>
                            </div>
                            <Progress value={results.overallScore} className="h-4" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Compliance Score</CardTitle>
                            <CardDescription>
                                Percentage of compliant controls
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-3xl font-bold">{results.overallCompliance}%</span>
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                            </div>
                            <Progress value={results.overallCompliance} className="h-4" />
                        </CardContent>
                    </Card>
                </div>

                {/* Detailed Breakdown Placeholder - Can be expanded */}
                <Card>
                    <CardHeader>
                        <CardTitle>Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
                            <div className="sm:col-span-1">
                                <dt className="text-sm font-medium text-gray-500">Total Domains</dt>
                                <dd className="mt-1 text-2xl font-semibold text-gray-900">{results.totalDomains}</dd>
                            </div>
                            <div className="sm:col-span-1">
                                <dt className="text-sm font-medium text-gray-500">Total Controls</dt>
                                <dd className="mt-1 text-2xl font-semibold text-gray-900">{results.totalControls}</dd>
                            </div>
                        </dl>
                    </CardContent>
                </Card>
                {/* Identified Risks */}
                {results.resultsData?.risks && results.resultsData.risks.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Identified Risks & Remediations</CardTitle>
                            <CardDescription>
                                AI-detected risks based on your assessment answers
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {results.resultsData.risks.map((risk: any) => {
                                    const remediation = results.resultsData.remediations?.find((r: any) => r.risk_id === risk.risk_id);

                                    return (
                                        <div key={risk.risk_id} className="border rounded-lg p-4 space-y-3">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-semibold">{risk.control_name}</h4>
                                                        <Badge variant={risk.severity === 'high' ? 'destructive' : risk.severity === 'medium' ? 'default' : 'secondary'}>
                                                            {risk.severity.toUpperCase()}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mt-1">{risk.description}</p>
                                                </div>
                                                <PromoteRiskButton assessmentId={assessmentId} risk={risk} />
                                            </div>

                                            {remediation && (
                                                <div className="bg-muted/50 p-3 rounded text-sm">
                                                    <span className="font-medium block mb-1">Recommended Action:</span>
                                                    {remediation.description}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}

function PromoteRiskButton({ assessmentId, risk }: { assessmentId: number, risk: any }) {
    const [isLoading, setIsLoading] = useState(false);
    const [isPromoted, setIsPromoted] = useState(false);

    const handlePromote = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/risks/promote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assessmentId, risk }),
            });

            if (!response.ok) throw new Error('Failed to promote risk');

            setIsPromoted(true);
            // toast.success('Risk added to Risk Universe'); // If sonner/toast is available
        } catch (error) {
            console.error(error);
            // toast.error('Failed to promote risk');
        } finally {
            setIsLoading(false);
        }
    };

    if (isPromoted) {
        return <Button size="sm" variant="outline" disabled><CheckCircle2 className="h-4 w-4 mr-2" /> Added</Button>;
    }

    return (
        <Button size="sm" onClick={handlePromote} disabled={isLoading}>
            {isLoading ? 'Adding...' : 'Add to Risk Universe'}
        </Button>
    );
}
