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
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { createRunbookAction } from '@/app/(dashboard)/plan/actions';

export function NewRunbookDialog({ processes = [] }: { processes?: { id: number; name: string }[] }) {
    const [open, setOpen] = useState(false);

    async function handleSubmit(formData: FormData) {
        await createRunbookAction(formData);
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Runbook
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form action={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create Digital Runbook</DialogTitle>
                        <DialogDescription>
                            Create a new response plan linked to a business process.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="processId" className="text-right">
                                Target Process
                            </Label>
                            <Select name="processId">
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select process (Optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">None (General Plan)</SelectItem>
                                    {processes.map((p) => (
                                        <SelectItem key={p.id} value={p.id.toString()}>
                                            {p.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">
                                Title
                            </Label>
                            <Input
                                id="title"
                                name="title"
                                placeholder="e.g. Ransomware Response"
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="type" className="text-right">
                                Type
                            </Label>
                            <Select name="type" defaultValue="General">
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select context" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Cyber">Cyber Security</SelectItem>
                                    <SelectItem value="Physical">Physical Security</SelectItem>
                                    <SelectItem value="Operational">Operational</SelectItem>
                                    <SelectItem value="General">General</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Create Draft</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
