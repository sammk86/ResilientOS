'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ArrowLeft, Save, Clock } from 'lucide-react';
import Link from 'next/link';
import { useAssessmentProgress } from '@/lib/hooks/useAssessment';
// import type { AssessmentProgress } from '@/types/assessment';
// import type { AssessmentControl } from '@/types/assessment';
import { ControlItem } from './ControlItem';

export default function AssessmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const assessmentId = parseInt(resolvedParams.id, 10);
    const { progress, isLoading, isError, mutate } = useAssessmentProgress(assessmentId);
    const [activeTab, setActiveTab] = useState<string>('');
    const [savingDomains, setSavingDomains] = useState<Set<number>>(new Set());
    const [controlNotes, setControlNotes] = useState<Map<string, string>>(new Map());
    const [controlStatuses, setControlStatuses] = useState<Map<string, string>>(new Map());
    const [unsavedDomains, setUnsavedDomains] = useState<Set<number>>(new Set());

    // Initialize state from progress data
    useEffect(() => {
        if (progress) {
            const notesMap = new Map<string, string>();
            const statusMap = new Map<string, string>();

            // progress structure check: needs matching backend response
            if (progress.domains) {
                progress.domains.forEach((domain: any) => {
                    domain.controls.forEach((control: any) => {
                        const key = `${domain.domain_id}-${control.control_id}`;
                        if (control.notes) {
                            notesMap.set(key, control.notes);
                        }
                        statusMap.set(key, control.status);
                    });
                });
            }

            setControlNotes(notesMap);
            setControlStatuses(statusMap);
            setUnsavedDomains(new Set());

            if (progress.domains && progress.domains.length > 0 && !activeTab) {
                setActiveTab(`domain-${progress.domains[0].domain_id}`);
            }
        }
    }, [progress, activeTab]);

    const handleStatusChange = (domainId: number, controlId: number, status: string) => {
        const key = `${domainId}-${controlId}`;
        setControlStatuses((prev) => {
            const newMap = new Map(prev);
            newMap.set(key, status);
            return newMap;
        });
        setUnsavedDomains((prev) => new Set(prev).add(domainId));
    };

    const handleNotesChange = (domainId: number, controlId: number, notes: string) => {
        const key = `${domainId}-${controlId}`;
        setControlNotes((prev) => {
            const newMap = new Map(prev);
            newMap.set(key, notes);
            return newMap;
        });
        setUnsavedDomains((prev) => new Set(prev).add(domainId));
    };

    const handleSaveDomain = async (domainId: number) => {
        if (!progress) return;

        setSavingDomains((prev) => new Set(prev).add(domainId));

        try {
            const domain = progress.domains.find((d: any) => d.domain_id === domainId);
            if (!domain) {
                throw new Error('Domain not found');
            }

            const controlsToSave = domain.controls.map((control: any) => {
                const key = `${domainId}-${control.control_id}`;
                // Use current status from state, valid fallback to 'in_progress' or existing
                const status = controlStatuses.get(key) || control.status || 'not_started';
                const notes = controlNotes.get(key) || control.notes || '';

                return {
                    control_id: control.control_id,
                    status: status,
                    notes: notes || undefined,
                };
            });

            // Updated API endpoint to /api/assessments/...
            const response = await fetch(`/api/assessments/${assessmentId}/domain/${domainId}/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    controls: controlsToSave,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to save domain');
            }

            // Refresh progress data
            await mutate();

            // Clear unsaved for this domain
            setUnsavedDomains((prev) => {
                const newSet = new Set(prev);
                newSet.delete(domainId);
                return newSet;
            });

        } catch (error) {
            console.error('Error saving domain:', error);
            alert(error instanceof Error ? error.message : 'Failed to save domain');
        } finally {
            setSavingDomains((prev) => {
                const newSet = new Set(prev);
                newSet.delete(domainId);
                return newSet;
            });
        }
    };


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

    if (isError || !progress) {
        return (
            <div className="flex-1 p-4 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <Card>
                        <CardContent className="pt-6">
                            <p className="text-muted-foreground">Unable to load assessment.</p>
                            <Button asChild className="mt-4" variant="outline">
                                <Link href="/assessments">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Assessments
                                </Link>
                            </Button>
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
                            <Link href="/assessments">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Assessments
                            </Link>
                        </Button>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold">{progress.assessment_name}</h1>
                            {progress.type && <Badge>{progress.type}</Badge>}
                        </div>
                        <p className="text-muted-foreground mt-2">
                            Framework: {progress.framework_name}
                        </p>
                    </div>
                    {progress.status === 'completed' && (
                        <Button asChild>
                            <Link href={`/assessments/${assessmentId}/results`}>
                                View Results
                            </Link>
                        </Button>
                    )}
                </div>

                {/* Overall Progress Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Overall Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Progress</span>
                                <span className="text-2xl font-bold">{progress.overall_progress}%</span>
                            </div>
                            <Progress value={progress.overall_progress} />
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div>
                                    Status: <Badge variant={progress.status === 'completed' ? 'default' : 'secondary'}>{progress.status}</Badge>
                                </div>
                                {progress.due_date && (
                                    <div>
                                        Due: {new Date(progress.due_date).toLocaleDateString()}
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Domains and Controls - Tabbed Interface */}
                <Card>
                    <CardContent className="pt-6">
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="flex w-full gap-2 overflow-x-auto">
                                {progress.domains?.map((domain: any) => (
                                    <TabsTrigger
                                        key={domain.domain_id}
                                        value={`domain-${domain.domain_id}`}
                                        className="flex items-center gap-2"
                                    >
                                        {domain.domain_code && (
                                            <span className="font-mono text-xs">{domain.domain_code}</span>
                                        )}
                                        <span className="truncate">{domain.domain_name}</span>
                                        <Badge variant="outline" className="ml-1">
                                            {domain.controls_completed}/{domain.controls_total}
                                        </Badge>
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                            {progress.domains?.map((domain: any) => (
                                <TabsContent
                                    key={domain.domain_id}
                                    value={`domain-${domain.domain_id}`}
                                    className="mt-6"
                                >
                                    <div className="space-y-4 mb-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-lg font-semibold">
                                                    {domain.domain_code && (
                                                        <span className="font-mono text-sm mr-2">{domain.domain_code}</span>
                                                    )}
                                                    {domain.domain_name}
                                                </h3>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {domain.controls_completed} of {domain.controls_total} controls completed
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold">{domain.progress}%</div>
                                                    <Progress value={domain.progress} className="w-32 mt-1" />
                                                </div>
                                                <Button
                                                    onClick={() => handleSaveDomain(domain.domain_id)}
                                                    disabled={savingDomains.has(domain.domain_id) || !unsavedDomains.has(domain.domain_id)}
                                                    className="min-w-[120px]"
                                                >
                                                    {savingDomains.has(domain.domain_id) ? (
                                                        <>
                                                            <Clock className="h-4 w-4 mr-2 animate-spin" />
                                                            Saving...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Save className="h-4 w-4 mr-2" />
                                                            Save Domain
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                        {unsavedDomains.has(domain.domain_id) && !savingDomains.has(domain.domain_id) && (
                                            <div className="text-sm text-orange-500 bg-orange-50 border border-orange-200 rounded-md p-2">
                                                You have unsaved changes in this domain. Click "Save Domain" to save all answers.
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-6">
                                        {domain.controls.map((control: any) => {
                                            const key = `${domain.domain_id}-${control.control_id}`;
                                            const currentStatus = controlStatuses.get(key) || control.status;
                                            const currentNotes = controlNotes.get(key) || control.notes || '';

                                            return (
                                                <ControlItem
                                                    key={control.control_id}
                                                    domainId={domain.domain_id}
                                                    control={control}
                                                    initialStatus={currentStatus}
                                                    initialNotes={currentNotes}
                                                    onStatusChange={handleStatusChange}
                                                    onNotesChange={handleNotesChange}
                                                />
                                            );
                                        })}
                                    </div>
                                </TabsContent>
                            ))}
                        </Tabs>
                    </CardContent>
                </Card>

                {/* Complete Button */}
                {progress.status !== 'completed' && (() => {
                    // Check if all controls have answers (not 'not_started')
                    const allControlsAnswered = progress.domains?.every((domain: any) =>
                        domain.controls.every((control: any) => {
                            const key = `${domain.domain_id}-${control.control_id}`;
                            const status = controlStatuses.get(key) || control.status;
                            return status !== 'not_started';
                        })
                    ) || false;

                    return (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex justify-end">
                                    <Button
                                        onClick={async () => {
                                            if (confirm('Are you sure you want to complete this assessment? This action cannot be undone.')) {
                                                try {
                                                    // Updated to correct Endpoint
                                                    const response = await fetch(`/api/assessments/${assessmentId}/complete`, {
                                                        method: 'POST',
                                                    });
                                                    if (response.ok) {
                                                        router.push(`/assessments/${assessmentId}/results`);
                                                    } else {
                                                        const data = await response.json();
                                                        alert(data.error || 'Failed to complete assessment');
                                                    }
                                                } catch (error) {
                                                    console.error('Error completing assessment:', error);
                                                    alert('Failed to complete assessment');
                                                }
                                            }
                                        }}
                                        disabled={!allControlsAnswered}
                                    >
                                        Complete Assessment
                                    </Button>
                                </div>
                                {!allControlsAnswered && (
                                    <p className="text-sm text-muted-foreground mt-2 text-right">
                                        Please answer all questions before completing
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    );
                })()}
            </div>
        </div>
    );
}
