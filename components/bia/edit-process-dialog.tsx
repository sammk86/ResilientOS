'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
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
import { updateProcessAction } from '@/app/(dashboard)/bia/actions';
import { toast } from 'sonner';
import { Pencil } from 'lucide-react';

interface Props {
    process: any;
}

export function EditProcessDialog({ process }: Props) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    async function onSubmit(formData: FormData) {
        startTransition(async () => {
            const result = await updateProcessAction(process.id, formData);
            if (result.success) {
                toast.success('Process updated');
                setOpen(false);
            } else {
                toast.error(result.error);
            }
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit Details
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Process Details</DialogTitle>
                </DialogHeader>
                <form action={onSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Process Name</Label>
                        <Input id="name" name="name" defaultValue={process.name} required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="rto">RTO</Label>
                            <Input id="rto" name="rto" placeholder="e.g. 4h" defaultValue={process.rto} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="rpo">RPO</Label>
                            <Input id="rpo" name="rpo" placeholder="e.g. 1h" defaultValue={process.rpo} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="downtimeCostPerHour">Downtime Cost/Hr ($)</Label>
                            <Input id="downtimeCostPerHour" name="downtimeCostPerHour" type="number" defaultValue={process.downtimeCostPerHour} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="recoveryCostFixed">Fixed Recovery Cost ($)</Label>
                            <Input id="recoveryCostFixed" name="recoveryCostFixed" type="number" defaultValue={process.recoveryCostFixed} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="priority">Priority</Label>
                            <Select name="priority" defaultValue={process.priority}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Critical">Critical</SelectItem>
                                    <SelectItem value="High">High</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="Low">Low</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dataClassification">Data Class</Label>
                            <Select name="dataClassification" defaultValue={process.dataClassification}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select class" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="public">Public</SelectItem>
                                    <SelectItem value="internal">Internal</SelectItem>
                                    <SelectItem value="confidential">Confidential</SelectItem>
                                    <SelectItem value="restricted">Restricted</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Impact)</Label>
                        <Textarea id="description" name="description" defaultValue={process.description} />
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
