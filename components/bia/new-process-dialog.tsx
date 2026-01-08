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
import { createProcessAction } from '@/app/(dashboard)/bia/actions';

export function NewProcessDialog() {
    const [open, setOpen] = useState(false);

    async function handleSubmit(formData: FormData) {
        await createProcessAction(formData);
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Analysis
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form action={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>New Business Process</DialogTitle>
                        <DialogDescription>
                            Define a critical business function for analysis.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="e.g. Payroll Processing"
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="priority" className="text-right">
                                Priority
                            </Label>
                            <Select name="priority" defaultValue="Medium">
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select Priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Critical">Critical</SelectItem>
                                    <SelectItem value="High">High</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="Low">Low</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="rto" className="text-right">
                                Target RTO
                            </Label>
                            <Input
                                id="rto"
                                name="rto"
                                placeholder="e.g. 4h"
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="rpo" className="text-right">
                                Target RPO
                            </Label>
                            <Input
                                id="rpo"
                                name="rpo"
                                placeholder="e.g. 1h"
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="downtimeCostPerHour" className="text-right">
                                Downtime Cost
                            </Label>
                            <div className="col-span-3 flex items-center space-x-2">
                                <span className="text-sm font-semibold">$</span>
                                <Input
                                    id="downtimeCostPerHour"
                                    name="downtimeCostPerHour"
                                    type="number"
                                    placeholder="Cost per hour (e.g. 1000)"
                                />
                                <span className="text-sm text-muted-foreground">/hr</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="recoveryCostFixed" className="text-right">
                                Fixed Recovery
                            </Label>
                            <div className="col-span-3 flex items-center space-x-2">
                                <span className="text-sm font-semibold">$</span>
                                <Input
                                    id="recoveryCostFixed"
                                    name="recoveryCostFixed"
                                    type="number"
                                    placeholder="One-time cost (e.g. 5000)"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="dataClassification" className="text-right">
                                Data Class
                            </Label>
                            <Select name="dataClassification" defaultValue="confidential">
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select Classification" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="public">Public</SelectItem>
                                    <SelectItem value="internal">Internal</SelectItem>
                                    <SelectItem value="confidential">Confidential</SelectItem>
                                    <SelectItem value="restricted">Restricted</SelectItem>
                                    <SelectItem value="financial">Financial</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">
                                Description
                            </Label>
                            <Input
                                id="description"
                                name="description"
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Start BIA</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
