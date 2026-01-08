'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createAnalysisAction } from '@/app/(dashboard)/bia/actions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

export function NewAnalysisDialog({ processes }: { processes: any[] }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [processId, setProcessId] = useState("");
    const router = useRouter();

    async function onSubmit(formData: FormData) {
        setLoading(true);
        // Ensure processId is set
        if (!processId) {
            toast.error("Please select a target process");
            setLoading(false);
            return;
        }

        const result = await createAnalysisAction(formData);
        if (result.success && result.id) {
            setOpen(false);
            toast.success("Analysis workspace created");
            router.push(`/bia/analysis/${result.id}`);
        } else {
            toast.error(result.error);
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New Analysis
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>New Business Impact Analysis</DialogTitle>
                    <DialogDescription>
                        Create a workspace to model dependencies and calculate RTO gaps.
                    </DialogDescription>
                </DialogHeader>
                <form action={onSubmit} className="grid gap-4 py-4">
                    <input type="hidden" name="processId" value={processId} />
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input id="name" name="name" placeholder="e.g. Q1 Trading Review" className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="process" className="text-right">Target Process</Label>
                        <Select value={processId} onValueChange={setProcessId} required>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select process..." />
                            </SelectTrigger>
                            <SelectContent>
                                {processes.map(p => (
                                    <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="notes" className="text-right">Notes</Label>
                        <Input id="notes" name="notes" placeholder="Optional context..." className="col-span-3" />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Analysis"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
