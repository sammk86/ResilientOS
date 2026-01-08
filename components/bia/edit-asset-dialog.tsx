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
import { updateAssetAction } from '@/app/(dashboard)/bia/actions';
import { toast } from 'sonner';
import { Pencil } from 'lucide-react';

interface Props {
    asset: any;
}

export function EditAssetDialog({ asset }: Props) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    async function onSubmit(formData: FormData) {
        startTransition(async () => {
            const result = await updateAssetAction(asset.id, formData);
            if (result.success) {
                toast.success('Asset updated');
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
                    <DialogTitle>Edit Asset Details</DialogTitle>
                </DialogHeader>
                <form action={onSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Asset Name</Label>
                        <Input id="name" name="name" defaultValue={asset.name} required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="type">Type</Label>
                            <Select name="type" defaultValue={asset.type}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Server">Server</SelectItem>
                                    <SelectItem value="Application">Application</SelectItem>
                                    <SelectItem value="Database">Database</SelectItem>
                                    <SelectItem value="Data">Data</SelectItem>
                                    <SelectItem value="People">People</SelectItem>
                                    <SelectItem value="Facility">Facility</SelectItem>
                                    <SelectItem value="Vendor">Vendor</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="recoveryTimeObjective">Recovery Time (RTO)</Label>
                            <Input id="recoveryTimeObjective" name="recoveryTimeObjective" placeholder="e.g. 24h" defaultValue={asset.recoveryTimeObjective} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="criticality">Criticality</Label>
                            <Select name="criticality" defaultValue={asset.criticality}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select criticality" />
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
                            <Label htmlFor="owner">Owner</Label>
                            <Input id="owner" name="owner" defaultValue={asset.owner} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" defaultValue={asset.description} />
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
