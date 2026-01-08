'use client';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import type { AssessmentControl } from '@/types/assessment';

interface ControlItemProps {
    domainId: number;
    control: AssessmentControl;
    initialStatus: string;
    initialNotes: string;
    onStatusChange: (domainId: number, controlId: number, status: string) => void;
    onNotesChange: (domainId: number, controlId: number, notes: string) => void;
}

export function ControlItem({
    domainId,
    control,
    initialStatus,
    initialNotes,
    onStatusChange,
    onNotesChange,
}: ControlItemProps) {
    return (
        <div className="border rounded-lg p-6 space-y-4">
            <div className="flex items-start justify-between">
                <div>
                    <h4 className="font-semibold flex items-center gap-2">
                        <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-sm">
                            {control.control_code}
                        </span>
                        {control.control_name}
                    </h4>
                    {control.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                            {control.description}
                        </p>
                    )}
                </div>
            </div>

            <div className="space-y-4 pt-2">
                <div className="space-y-2">
                    <Label>Compliance Status</Label>
                    <RadioGroup
                        value={initialStatus}
                        onValueChange={(value) => onStatusChange(domainId, control.control_id, value)}
                        className="flex gap-4"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="not_started" id={`ns-${control.control_id}`} />
                            <Label htmlFor={`ns-${control.control_id}`}>Not Started</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="in_progress" id={`ip-${control.control_id}`} />
                            <Label htmlFor={`ip-${control.control_id}`}>In Progress</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="completed" id={`co-${control.control_id}`} />
                            <Label htmlFor={`co-${control.control_id}`}>Compliant</Label>
                        </div>
                        {/* Add more statuses as needed matching your requirements, e.g. "Not Applicable" */}
                    </RadioGroup>
                </div>

                <div className="space-y-2">
                    <Label>Notes / Evidence</Label>
                    <Textarea
                        placeholder="Add notes or evidence..."
                        value={initialNotes}
                        onChange={(e) => onNotesChange(domainId, control.control_id, e.target.value)}
                        className="min-h-[100px]"
                    />
                </div>
            </div>
        </div>
    );
}
