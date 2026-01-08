'use client';

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useState, useTransition } from "react";
import { addDependencyAction } from "@/app/(dashboard)/bia/actions";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AddDependencyDialogProps {
    processId: number;
    availableAssets: { id: number; name: string }[];
    availableProcesses: { id: number; name: string }[];
}

export function AddDependencyDialog({ processId, availableAssets, availableProcesses }: AddDependencyDialogProps) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [type, setType] = useState<'asset' | 'process'>('asset');

    async function onSubmit(formData: FormData) {
        formData.append('processId', processId.toString());
        formData.append('targetType', type);

        startTransition(async () => {
            const result = await addDependencyAction(formData);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success('Dependency added');
                setOpen(false);
            }
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                    <Plus className="mr-2 h-4 w-4" /> Add Dependency
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Dependency</DialogTitle>
                </DialogHeader>
                <form action={onSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Type</Label>
                        <Select onValueChange={(v: any) => setType(v)} defaultValue="asset">
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="asset">Asset (Server, Data, etc.)</SelectItem>
                                <SelectItem value="process">Business Process</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Target</Label>
                        <Select name="targetId">
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder={`Select ${type}`} />
                            </SelectTrigger>
                            <SelectContent>
                                {type === 'asset' ? (
                                    availableAssets.map(a => (
                                        <SelectItem key={a.id} value={a.id.toString()}>{a.name}</SelectItem>
                                    ))
                                ) : (
                                    availableProcesses.filter(p => p.id !== processId).map(p => (
                                        <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="notes" className="text-right">Notes</Label>
                        <Input id="notes" name="notes" className="col-span-3" />
                    </div>

                    <Button type="submit" disabled={isPending} className="ml-auto">
                        {isPending ? "Adding..." : "Add Dependency"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
