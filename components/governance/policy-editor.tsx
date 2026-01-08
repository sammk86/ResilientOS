'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Save, FileText, CheckCircle, AlertCircle, Bot, Sparkles, Printer } from 'lucide-react';
import { createPolicySectionAction, requestPolicyReviewAction, submitPolicyReviewAction, generatePolicyOutlineAction } from '@/app/(dashboard)/governance/actions';
import { PolicySectionEditor } from './policy-section-editor';
import { PolicyPreview } from './policy-preview';
import { toast } from 'sonner';

interface PolicyEditorProps {
    policy: any;
    potentialReviewers: any[];
}

export function PolicyEditor({ policy, potentialReviewers }: PolicyEditorProps) {
    const router = useRouter();
    const [selectedSectionId, setSelectedSectionId] = useState<number | null>(policy.sections?.[0]?.id || null);
    const [isCreatingSection, setIsCreatingSection] = useState(false);
    const [newSectionTitle, setNewSectionTitle] = useState('');

    const handleCreateSection = async () => {
        if (!newSectionTitle) return;
        setIsCreatingSection(true);
        try {
            await createPolicySectionAction(policy.id, newSectionTitle);
            toast.success('Section created');
            setNewSectionTitle('');
            router.refresh(); // Refresh to get new ID, simplified
        } catch (e) {
            toast.error('Failed to create section');
        } finally {
            setIsCreatingSection(false);
        }
    };

    const handleGenerateOutline = async () => {
        setIsCreatingSection(true); // reusing state for loading
        try {
            await generatePolicyOutlineAction(policy.id);
            toast.success('Outline generated');
            router.refresh();
        } catch (e) {
            toast.error('Failed to generate outline');
        } finally {
            setIsCreatingSection(false);
        }
    };

    const handleRequestReview = async () => {
        // Simple selection of first reviewer for demo or modal
        // For now, just pick the first available reviewer that isn't the author if possible
        const reviewerId = potentialReviewers[0]?.id;
        if (!reviewerId) return toast.error("No reviewers available");

        try {
            await requestPolicyReviewAction(policy.id, [reviewerId]);
            toast.success('Review requested');
            router.refresh();
        } catch (e) {
            toast.error('Failed to request review');
        }
    };

    const handleApprove = async () => {
        try {
            await submitPolicyReviewAction(policy.id, 'approved', 'Looks good');
            toast.success('Policy approved');
            router.refresh();
        } catch (e) {
            toast.error('Failed to approve');
        }
    };

    const sortedSections = policy.sections.sort((a: any, b: any) => a.order - b.order);
    const activeSection = sortedSections.find((s: any) => s.id === selectedSectionId);

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">{policy.title}</h1>
                    <p className="text-muted-foreground">{policy.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="capitalize">{policy.status}</Badge>
                    {policy.status === 'draft' && (
                        <Button onClick={handleRequestReview}>
                            Request Review
                        </Button>
                    )}
                    {policy.status === 'review' && (
                        <div className="flex space-x-2">
                            <Button variant="outline" onClick={() => submitPolicyReviewAction(policy.id, 'rejected')}>Reject</Button>
                            <Button onClick={handleApprove}>Approve</Button>
                        </div>
                    )}
                </div>
            </div>

            <Tabs defaultValue="draft" className="flex-1 flex flex-col">
                <TabsList>
                    <TabsTrigger value="draft">Drafting</TabsTrigger>
                    <TabsTrigger value="review">Review</TabsTrigger>
                    <TabsTrigger value="preview">Preview & Export</TabsTrigger>
                </TabsList>

                <TabsContent value="draft" className="flex-1 flex gap-4 min-h-0">
                    {/* Sidebar / Outline */}
                    <Card className="w-1/4 flex flex-col min-h-0">
                        <CardHeader className="py-4 flex flex-row items-center justify-between">
                            <CardTitle className="text-lg">Outline</CardTitle>
                            <Button variant="ghost" size="icon" title="AI Generate Outline" onClick={handleGenerateOutline} disabled={isCreatingSection}>
                                <Sparkles className="h-4 w-4 text-purple-500" />
                            </Button>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-auto space-y-2">
                            {sortedSections.map((section: any) => (
                                <button
                                    key={section.id}
                                    onClick={() => setSelectedSectionId(section.id)}
                                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${selectedSectionId === section.id
                                        ? 'bg-secondary font-medium'
                                        : 'hover:bg-muted'
                                        }`}
                                >
                                    {section.title}
                                </button>
                            ))}

                            <div className="pt-2 flex gap-2">
                                <Input
                                    placeholder="New Section..."
                                    value={newSectionTitle}
                                    onChange={(e) => setNewSectionTitle(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleCreateSection()}
                                />
                                <Button size="icon" onClick={handleCreateSection} disabled={isCreatingSection}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Main Editor Area */}
                    <Card className="flex-1 flex flex-col min-h-0">
                        {activeSection ? (
                            <PolicySectionEditor section={activeSection} policyContext={policy.title} />
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-muted-foreground flex-col gap-4">
                                <p>Select a section to edit</p>
                                {policy.sections.length === 0 && (
                                    <Button variant="outline" onClick={handleGenerateOutline}>
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        Generate Outline with AI
                                    </Button>
                                )}
                            </div>
                        )}
                    </Card>
                </TabsContent>

                <TabsContent value="review">
                    <Card>
                        <CardHeader><CardTitle>Review Status</CardTitle></CardHeader>
                        <CardContent>
                            {policy.reviews.length === 0 ? "No reviews requested." : (
                                <div className="space-y-4">
                                    {policy.reviews.map((r: any) => (
                                        <div key={r.id} className="flex items-center justify-between border p-4 rounded">
                                            <div className="flex items-center gap-2">
                                                <div className="font-medium">{r.reviewer.name}</div>
                                                <div className="text-sm text-muted-foreground">({r.reviewer.email})</div>
                                            </div>
                                            <Badge variant={r.status === 'approved' ? 'default' : r.status === 'rejected' ? 'destructive' : 'secondary'}>
                                                {r.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="preview" className="flex-1 min-h-0 overflow-auto">
                    <PolicyPreview policy={policy} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
