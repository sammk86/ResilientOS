'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Pencil } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createRiskAction, updateRiskAction, getCategoriesAction, getAssetsAction, getProcessesAction } from '@/app/(dashboard)/risk/actions';
import { toast } from 'sonner';

interface RiskDialogProps {
    risk?: any; // If provided, we are in Edit mode
    trigger?: React.ReactNode;
    onSuccess?: () => void;
}

export function RiskDialog({ risk, trigger, onSuccess }: RiskDialogProps) {
    const [open, setOpen] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [assets, setAssets] = useState<any[]>([]);
    const [processes, setProcesses] = useState<any[]>([]);
    const [scope, setScope] = useState<string>(risk?.scope || 'system');

    // Initialize state when risk prop changes or dialog opens
    useEffect(() => {
        if (open) {
            getCategoriesAction().then(setCategories);
            getAssetsAction().then(setAssets);
            getProcessesAction().then(setProcesses);
        }
    }, [open]);

    async function handleSubmit(formData: FormData) {
        let result;
        if (risk) {
            result = await updateRiskAction(risk.id, formData);
        } else {
            result = await createRiskAction(formData);
        }

        if (result?.error) {
            toast.error(result.error);
        } else {
            toast.success(risk ? 'Risk updated successfully' : 'Risk added successfully');
            setOpen(false);
            if (onSuccess) onSuccess();
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Risk
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <form action={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{risk ? 'Edit Risk' : 'Add New Risk'}</DialogTitle>
                        <DialogDescription>
                            {risk ? 'Modify the details of the identified risk.' : 'Identify and characterize a new risk to the organization.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">
                                Risk Title
                            </Label>
                            <Input
                                id="title"
                                name="title"
                                defaultValue={risk?.riskName || risk?.title || ''}
                                placeholder="e.g. Data Center Failure"
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">
                                Description
                            </Label>
                            <Textarea
                                id="description"
                                name="description"
                                defaultValue={risk?.description || ''}
                                placeholder="Detailed description of the risk scenario..."
                                className="col-span-3"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="scope" className="text-right">
                                Scope
                            </Label>
                            <Select name="scope" value={scope} onValueChange={setScope}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select Scope" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="system">System (Organization Wide)</SelectItem>
                                    <SelectItem value="asset">Specific Asset</SelectItem>
                                    <SelectItem value="process">Specific Business Process</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {scope === 'asset' && (
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="assetId" className="text-right">
                                    Asset
                                </Label>
                                <Select name="assetId" defaultValue={risk?.assetId?.toString()}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select Asset" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {assets.map((a) => (
                                            <SelectItem key={a.id} value={a.id.toString()}>
                                                {a.name} ({a.type})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {scope === 'process' && (
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="processId" className="text-right">
                                    Process
                                </Label>
                                <Select name="processId" defaultValue={risk?.processId?.toString()}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select Process" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {processes.map((p) => (
                                            <SelectItem key={p.id} value={p.id.toString()}>
                                                {p.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="categoryId" className="text-right">
                                Category
                            </Label>
                            <Select name="categoryId" defaultValue={risk?.categoryId?.toString()}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id.toString()}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="likelihood" className="text-right">
                                Likelihood
                            </Label>
                            <Select name="likelihood" required defaultValue={risk?.likelihood?.toString() || "1"}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select Likelihood" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">1 - Rare (&#60; 5%)</SelectItem>
                                    <SelectItem value="2">2 - Unlikely (5-20%)</SelectItem>
                                    <SelectItem value="3">3 - Possible (20-50%)</SelectItem>
                                    <SelectItem value="4">4 - Likely (50-80%)</SelectItem>
                                    <SelectItem value="5">5 - Almost Certain (&#62; 80%)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="impact" className="text-right">
                                Impact
                            </Label>
                            <Select name="impact" required defaultValue={risk?.impact?.toString() || "1"}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select Impact" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">1 - Insignificant</SelectItem>
                                    <SelectItem value="2">2 - Minor</SelectItem>
                                    <SelectItem value="3">3 - Moderate</SelectItem>
                                    <SelectItem value="4">4 - Major</SelectItem>
                                    <SelectItem value="5">5 - Severe</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="strategy" className="text-right">
                                Strategy
                            </Label>
                            <Select name="strategy" defaultValue={risk?.strategy || "mitigate"}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select Strategy" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="mitigate">Mitigate</SelectItem>
                                    <SelectItem value="avoid">Avoid</SelectItem>
                                    <SelectItem value="transfer">Transfer</SelectItem>
                                    <SelectItem value="accept">Accept</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right">
                                Status
                            </Label>
                            <Select name="status" defaultValue={risk?.status || "open"}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="open">Open</SelectItem>
                                    <SelectItem value="mitigated">Mitigated</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                    <SelectItem value="accepted">Accepted</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">{risk ? 'Save Changes' : 'Create Risk'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// Backwards compatibility alias if needed, or update import in Page
export const NewRiskDialog = RiskDialog;
