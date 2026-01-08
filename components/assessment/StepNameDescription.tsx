'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface StepNameDescriptionProps {
    name: string;
    description: string;
    type: string;
    scope: string;
    assetId: number | null;
    processId: number | null;
    assets: any[]; // Type properly if possible
    processes: any[];
    onNameChange: (name: string) => void;
    onDescriptionChange: (description: string) => void;
    onTypeChange: (type: string) => void;
    onScopeChange: (scope: string) => void;
    onAssetIdChange: (id: number | null) => void;
    onProcessIdChange: (id: number | null) => void;
}

export function StepNameDescription({
    name,
    description,
    type,
    scope,
    assetId,
    processId,
    assets = [],
    processes = [],
    onNameChange,
    onDescriptionChange,
    onTypeChange,
    onScopeChange,
    onAssetIdChange,
    onProcessIdChange,
}: StepNameDescriptionProps) {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="assessment-name">Assessment Name *</Label>
                <Input
                    id="assessment-name"
                    value={name}
                    onChange={(e) => onNameChange(e.target.value)}
                    placeholder="Enter assessment name"
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="assessment-type">Assessment Type *</Label>
                <Select value={type} onValueChange={onTypeChange} required>
                    <SelectTrigger>
                        <SelectValue placeholder="Select assessment type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Compliance">Compliance</SelectItem>
                        <SelectItem value="Audit">Audit</SelectItem>
                        <SelectItem value="Risk Assessment">Risk Assessment</SelectItem>
                        <SelectItem value="Vendor Assessment">Vendor Assessment</SelectItem>
                        <SelectItem value="Privacy Impact Assessment">Privacy Impact Assessment</SelectItem>
                        <SelectItem value="Security Assessment">Security Assessment</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="assessment-scope">Assessment Scope</Label>
                <Select value={scope} onValueChange={onScopeChange}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select scope" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="organisation">Organisation</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                        <SelectItem value="asset">Asset</SelectItem>
                        <SelectItem value="process">Process</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {scope === 'asset' && (
                <div className="space-y-2">
                    <Label htmlFor="assessment-asset">Select Asset</Label>
                    <Select value={assetId?.toString() || ''} onValueChange={(v) => onAssetIdChange(parseInt(v))}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select an asset" />
                        </SelectTrigger>
                        <SelectContent>
                            {assets.map((asset) => (
                                <SelectItem key={asset.id} value={asset.id.toString()}>
                                    {asset.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {scope === 'process' && (
                <div className="space-y-2">
                    <Label htmlFor="assessment-process">Select Process</Label>
                    <Select value={processId?.toString() || ''} onValueChange={(v) => onProcessIdChange(parseInt(v))}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a process" />
                        </SelectTrigger>
                        <SelectContent>
                            {processes.map((process) => (
                                <SelectItem key={process.id} value={process.id.toString()}>
                                    {process.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="assessment-description">Assessment Description *</Label>
                <Textarea
                    id="assessment-description"
                    value={description}
                    onChange={(e) => onDescriptionChange(e.target.value)}
                    placeholder="Enter assessment description"
                    rows={6}
                    required
                />
            </div>
        </div>
    );
}
