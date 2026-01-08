'use client';

import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Framework {
    framework_id: number;
    framework_name: string;
    framework_type: string;
    description?: string;
    controls_count: number;
}

interface StepFrameworkSelectionProps {
    selectedFrameworkId: number | null;
    onFrameworkChange: (frameworkId: number) => void;
}

export function StepFrameworkSelection({
    selectedFrameworkId,
    onFrameworkChange,
}: StepFrameworkSelectionProps) {
    const [frameworks, setFrameworks] = useState<Framework[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchFrameworks() {
            try {
                const response = await fetch('/api/frameworks'); // Updated API Endpoint
                if (response.ok) {
                    const data = await response.json();
                    setFrameworks(data.frameworks || []);
                }
            } catch (error) {
                console.error('Error fetching frameworks:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchFrameworks();
    }, []);

    if (loading) {
        return <div className="text-center py-8">Loading frameworks...</div>;
    }

    if (frameworks.length === 0) {
        return <div className="text-center py-8 text-muted-foreground">No frameworks available</div>;
    }

    return (
        <div className="space-y-4">
            <Label>Select Framework *</Label>
            <RadioGroup
                value={selectedFrameworkId?.toString() || ''}
                onValueChange={(value) => onFrameworkChange(parseInt(value, 10))}
            >
                <div className="space-y-3">
                    {frameworks.map((framework) => (
                        <label
                            key={framework.framework_id}
                            htmlFor={`framework-${framework.framework_id}`}
                            className="block cursor-pointer"
                        >
                            <Card
                                className={`transition-all ${selectedFrameworkId === framework.framework_id
                                        ? 'border-primary ring-2 ring-primary'
                                        : 'hover:border-primary/50'
                                    }`}
                            >
                                <CardHeader>
                                    <div className="flex items-start gap-3">
                                        <RadioGroupItem
                                            value={framework.framework_id.toString()}
                                            id={`framework-${framework.framework_id}`}
                                            className="mt-1"
                                        />
                                        <div className="flex-1">
                                            <CardTitle>{framework.framework_name}</CardTitle>
                                            <CardDescription>
                                                {framework.framework_type} • {framework.controls_count} controls
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                {framework.description && (
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">{framework.description}</p>
                                    </CardContent>
                                )}
                            </Card>
                        </label>
                    ))}
                </div>
            </RadioGroup>
        </div>
    );
}
