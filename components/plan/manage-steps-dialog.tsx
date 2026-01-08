'use client';

import { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, List, Sparkles } from 'lucide-react';
import { addRunbookStep, deleteRunbookStep } from '@/app/(dashboard)/plan/actions';
import { toast } from 'sonner';

interface Step {
    id: string;
    title: string;
    description: string | null;
    estimatedTime: string;
}

export function ManageStepsDialog({ runbookId, steps = [], runbookName, description, biaContext, risks }: {
    runbookId: number | string,
    steps: Step[],
    runbookName: string,
    description?: string,
    biaContext?: { rto?: string, criticality?: string },
    risks?: string[]
}) {
    const [open, setOpen] = useState(false);
    const [activeSteps, setActiveSteps] = useState(steps);
    const [newStep, setNewStep] = useState({ title: '', description: '', estimatedTime: '15m' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerateAI = async () => {
        setIsGenerating(true);
        try {
            const res = await fetch('/api/ai/plan/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    runbookName,
                    description,
                    biaContext,
                    risks
                })
            });

            if (!res.ok) throw new Error('Generation failed');
            const data = await res.json();

            // Add generated steps
            for (const step of data.steps) {
                // We add them one by one to DB? Or just to UI? 
                // Better to add to DB via action.
                // For speed, let's call addRunbookStep for each (sequentially or parallel).
                // Or better: pass all to a bulk action?
                // Existing action is single step. I'll use it in loop for now.
                const added = await addRunbookStep(runbookId.toString(), step);
                setActiveSteps(prev => [...prev, added]);
            }
            toast.success('Runbook steps generated via AI');
        } catch (error) {
            console.error(error);
            toast.error('Failed to generate steps');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAddStep = async () => {
        setIsSubmitting(true);
        try {
            const addedStep = await addRunbookStep(runbookId, newStep);
            setActiveSteps([...activeSteps, addedStep]);
            setNewStep({ title: '', description: '', estimatedTime: '15m' });
        } catch (error) {
            console.error('Failed to add step:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteStep = async (stepId: string) => {
        try {
            await deleteRunbookStep(stepId);
            setActiveSteps(activeSteps.filter(s => s.id !== stepId));
        } catch (error) {
            console.error('Failed to delete step:', error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" className="w-full text-left justify-start">
                    <List className="h-4 w-4 mr-2" />
                    Manage Steps ({activeSteps.length})
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Manage Runbook Steps</DialogTitle>
                    <DialogDescription>
                        Add, remove, or reorder steps for this runbook.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 my-4 max-h-[60vh] overflow-y-auto pr-2">
                    {/* List Existing Steps */}
                    <div className="space-y-2">
                        {activeSteps.length === 0 ? (
                            <p className="text-sm text-gray-500 italic">No steps defined yet.</p>
                        ) : (
                            activeSteps.map((step, index) => (
                                <div key={step.id} className="flex items-center justify-between p-3 border rounded-md bg-white">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-gray-100 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium">{step.title}</h4>
                                            <p className="text-xs text-muted-foreground">{step.estimatedTime}</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => handleDeleteStep(step.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Add New Step Form */}
                    <div className="border-t pt-4 mt-4">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-medium">Add New Step</h4>
                            <Button
                                size="sm"
                                variant="outline"
                                className="text-purple-600 border-purple-200 hover:bg-purple-50"
                                onClick={handleGenerateAI}
                                disabled={isGenerating}
                            >
                                <Sparkles className="w-3 h-3 mr-1" />
                                {isGenerating ? 'Drafting...' : 'Auto-Generate'}
                            </Button>
                        </div>
                        <div className="grid gap-4 py-2">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="title" className="text-right">
                                    Title
                                </Label>
                                <Input
                                    id="title"
                                    value={newStep.title}
                                    onChange={(e) => setNewStep({ ...newStep, title: e.target.value })}
                                    className="col-span-3"
                                    placeholder="e.g., Shutdown Primary Server"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="time" className="text-right">
                                    Est. Time
                                </Label>
                                <Input
                                    id="time"
                                    value={newStep.estimatedTime}
                                    onChange={(e) => setNewStep({ ...newStep, estimatedTime: e.target.value })}
                                    className="col-span-3"
                                    placeholder="e.g., 15m"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-start gap-4">
                                <Label htmlFor="desc" className="text-right pt-2">
                                    Details
                                </Label>
                                <Textarea
                                    id="desc"
                                    value={newStep.description}
                                    onChange={(e) => setNewStep({ ...newStep, description: e.target.value })}
                                    className="col-span-3"
                                    rows={2}
                                    placeholder="Additional instructions..."
                                />
                            </div>
                        </div>
                        <div className="flex justify-end mt-2">
                            <Button
                                onClick={handleAddStep}
                                disabled={!newStep.title || isSubmitting}
                                size="sm"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Step
                            </Button>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
