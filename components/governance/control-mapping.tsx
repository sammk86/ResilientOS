'use client';

import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { mapPolicyToControlAction, unmapPolicyFromControlAction } from '@/app/(dashboard)/governance/actions';
import { useState } from 'react';
import { Loader2, Link as LinkIcon, Unlink } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

interface Policy {
    id: number;
    title: string;
}

interface ControlMappingProps {
    controlId: number;
    mappedPolicies: Policy[];
    availablePolicies: Policy[];
}

export function ControlMapping({ controlId, mappedPolicies, availablePolicies }: ControlMappingProps) {
    const [loading, setLoading] = useState(false);
    const [selectedPolicyId, setSelectedPolicyId] = useState<string>('');

    async function handleMap() {
        if (!selectedPolicyId) return;
        setLoading(true);
        await mapPolicyToControlAction(parseInt(selectedPolicyId), controlId);
        setLoading(false);
        setSelectedPolicyId('');
    }

    async function handleUnmap(policyId: number) {
        setLoading(true);
        await unmapPolicyFromControlAction(policyId, controlId);
        setLoading(false);
    }

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
                {mappedPolicies.map(p => (
                    <Badge key={p.id} variant="secondary" className="flex items-center gap-1">
                        <Link href={`/governance/policies/${p.id}`} className="hover:underline">
                            {p.title}
                        </Link>
                        <button onClick={() => handleUnmap(p.id)} disabled={loading} className="ml-1 text-muted-foreground hover:text-destructive" title="Unmap Policy">
                            <Unlink className="h-3 w-3" />
                        </button>
                    </Badge>
                ))}
            </div>
            <div className="flex gap-2 text-sm">
                <Select value={selectedPolicyId} onValueChange={setSelectedPolicyId}>
                    <SelectTrigger className="w-[180px] h-8 text-xs">
                        <SelectValue placeholder="Map Policy..." />
                    </SelectTrigger>
                    <SelectContent>
                        {availablePolicies.map(p => (
                            <SelectItem key={p.id} value={p.id.toString()}>
                                {p.title}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={handleMap} disabled={!selectedPolicyId || loading}>
                    {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <LinkIcon className="h-3 w-3" />}
                </Button>
            </div>
        </div>
    );
}

