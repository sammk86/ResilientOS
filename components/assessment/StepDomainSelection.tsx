'use client';

import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Domain {
    domain_id: number;
    domain_name: string;
    domain_code?: string;
    control_count: number;
}

interface StepDomainSelectionProps {
    frameworkId: number | null;
    selectedDomainIds: number[];
    onDomainIdsChange: (domainIds: number[]) => void;
}

export function StepDomainSelection({
    frameworkId,
    selectedDomainIds,
    onDomainIdsChange,
}: StepDomainSelectionProps) {
    const [domains, setDomains] = useState<Domain[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!frameworkId) {
            setDomains([]);
            return;
        }

        async function fetchDomains() {
            setLoading(true);
            try {
                const response = await fetch(`/api/frameworks/${frameworkId}/domains`); // Updated API endpoint
                if (response.ok) {
                    const data = await response.json();
                    setDomains(data.domains || []);
                }
            } catch (error) {
                console.error('Error fetching domains:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchDomains();
    }, [frameworkId]);

    const handleToggleDomain = (domainId: number) => {
        if (selectedDomainIds.includes(domainId)) {
            onDomainIdsChange(selectedDomainIds.filter((id) => id !== domainId));
        } else {
            onDomainIdsChange([...selectedDomainIds, domainId]);
        }
    };

    const handleSelectAll = () => {
        if (selectedDomainIds.length === domains.length) {
            onDomainIdsChange([]);
        } else {
            onDomainIdsChange(domains.map((d) => d.domain_id));
        }
    };

    if (!frameworkId) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                Please select a framework first
            </div>
        );
    }

    if (loading) {
        return <div className="text-center py-8">Loading domains...</div>;
    }

    if (domains.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                No domains available for this framework
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label>Select Domains *</Label>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                >
                    {selectedDomainIds.length === domains.length ? 'Deselect All' : 'Select All'}
                </Button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
                {domains.map((domain) => (
                    <Card
                        key={domain.domain_id}
                        className={`transition-all cursor-pointer ${selectedDomainIds.includes(domain.domain_id)
                                ? 'border-primary ring-2 ring-primary'
                                : 'hover:border-primary/50'
                            }`}
                        onClick={() => handleToggleDomain(domain.domain_id)}
                    >
                        <CardHeader>
                            <div className="flex items-start gap-3">
                                <Checkbox
                                    checked={selectedDomainIds.includes(domain.domain_id)}
                                    onCheckedChange={() => handleToggleDomain(domain.domain_id)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="mt-1"
                                />
                                <div className="flex-1">
                                    <CardTitle>
                                        {domain.domain_code && (
                                            <span className="font-mono text-sm mr-2">{domain.domain_code}</span>
                                        )}
                                        {domain.domain_name}
                                    </CardTitle>
                                    <CardDescription>
                                        {domain.control_count} control{domain.control_count !== 1 ? 's' : ''}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>
                ))}
            </div>
            {selectedDomainIds.length > 0 && (
                <p className="text-sm text-muted-foreground">
                    {selectedDomainIds.length} domain{selectedDomainIds.length !== 1 ? 's' : ''} selected
                </p>
            )}
        </div>
    );
}
