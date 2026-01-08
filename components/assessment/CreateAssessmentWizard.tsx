'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StepNameDescription } from './StepNameDescription';
import { StepFrameworkSelection } from './StepFrameworkSelection';
import { StepDomainSelection } from './StepDomainSelection';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';

type Step = 1 | 2 | 3;

function CreateAssessmentWizardContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialFrameworkId = searchParams.get('framework') ? parseInt(searchParams.get('framework')!, 10) : null;

    const [currentStep, setCurrentStep] = useState<Step>(initialFrameworkId ? 2 : 1);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('Compliance'); // Default type
    const [scope, setScope] = useState('organisation'); // Default scope
    const [assetId, setAssetId] = useState<number | null>(null);
    const [processId, setProcessId] = useState<number | null>(null);
    const [assets, setAssets] = useState<any[]>([]);
    const [processes, setProcesses] = useState<any[]>([]);
    const [selectedFrameworkId, setSelectedFrameworkId] = useState<number | null>(initialFrameworkId);
    const [selectedDomainIds, setSelectedDomainIds] = useState<number[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (initialFrameworkId) {
            setSelectedFrameworkId(initialFrameworkId);
        }
    }, [initialFrameworkId]);

    // Fetch assets and processes on load
    useEffect(() => {
        const fetchData = async () => {
            try {
                const assetsRes = await fetch('/api/assets');
                if (assetsRes.ok) {
                    const data = await assetsRes.json();
                    setAssets(data.assets || []);
                }
                const processesRes = await fetch('/api/business-processes');
                if (processesRes.ok) {
                    const data = await processesRes.json();
                    setProcesses(data.processes || []);
                }
            } catch (error) {
                console.error('Failed to fetch scoping entities:', error);
            }
        };
        fetchData();
    }, []);

    const canProceedToStep2 = name.trim().length > 0 && description.trim().length > 0 && type.length > 0;
    const canProceedToStep3 = selectedFrameworkId !== null;
    const canSubmit = selectedDomainIds.length > 0;

    const handleNext = () => {
        if (currentStep < 3) {
            setCurrentStep((currentStep + 1) as Step);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep((currentStep - 1) as Step);
        }
    };

    const handleSubmit = async () => {
        if (!canSubmit || !selectedFrameworkId) return;

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/assessments', { // Updated API endpoint
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    assessment_name: name,
                    type: type,
                    description: description,
                    framework_id: selectedFrameworkId,
                    domain_ids: selectedDomainIds,
                    scope: scope,
                    asset_id: assetId,
                    process_id: processId,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                const errorMessage = data.error || data.details
                    ? `${data.error || 'Validation error'}: ${data.details ? JSON.stringify(data.details) : ''}`
                    : 'Failed to create assessment';
                throw new Error(errorMessage);
            }

            const data = await response.json();
            router.push(`/assessments/${data.assessment_id}`); // Assuming redirection to details page
        } catch (error) {
            console.error('Error creating assessment:', error);
            const errorMessage = error instanceof Error
                ? error.message
                : 'Failed to create assessment. Please check the console for details.';
            alert(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Create New Assessment</CardTitle>
                    <CardDescription>
                        Step {currentStep} of 3: {
                            currentStep === 1 ? 'Name and Description' :
                                currentStep === 2 ? 'Framework Selection' :
                                    'Domain Selection'
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Step 1: Name and Description */}
                    {currentStep === 1 && (
                        <StepNameDescription
                            name={name}
                            description={description}
                            type={type}
                            scope={scope}
                            assetId={assetId}
                            processId={processId}
                            assets={assets}
                            processes={processes}
                            onNameChange={setName}
                            onDescriptionChange={setDescription}
                            onTypeChange={setType}
                            onScopeChange={setScope}
                            onAssetIdChange={setAssetId}
                            onProcessIdChange={setProcessId}
                        />
                    )}

                    {/* Step 2: Framework Selection */}
                    {currentStep === 2 && (
                        <StepFrameworkSelection
                            selectedFrameworkId={selectedFrameworkId}
                            onFrameworkChange={setSelectedFrameworkId}
                        />
                    )}

                    {/* Step 3: Domain Selection */}
                    {currentStep === 3 && (
                        <StepDomainSelection
                            frameworkId={selectedFrameworkId}
                            selectedDomainIds={selectedDomainIds}
                            onDomainIdsChange={setSelectedDomainIds}
                        />
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleBack}
                            disabled={currentStep === 1}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                        {currentStep < 3 ? (
                            <Button
                                type="button"
                                onClick={handleNext}
                                disabled={
                                    (currentStep === 1 && !canProceedToStep2) ||
                                    (currentStep === 2 && !canProceedToStep3)
                                }
                            >
                                Next
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                onClick={handleSubmit}
                                disabled={!canSubmit || isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    'Create Assessment'
                                )}
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export function CreateAssessmentWizard() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CreateAssessmentWizardContent />
        </Suspense>
    );
}
