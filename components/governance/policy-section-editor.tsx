'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Bot, Save, Sparkles } from 'lucide-react';
import { updatePolicySectionAction, generateSectionContentAction } from '@/app/(dashboard)/governance/actions';
import { toast } from 'sonner';

interface PolicySectionEditorProps {
    section: any;
    policyContext: string;
}

export function PolicySectionEditor({ section, policyContext }: PolicySectionEditorProps) {
    const [content, setContent] = useState(section.content || '');
    const [isSaving, setIsSaving] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    // Update local state when section changes
    useEffect(() => {
        setContent(section.content || '');
    }, [section.id, section.content]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updatePolicySectionAction(section.id, content);
            toast.success('Saved');
        } catch (e) {
            toast.error('Failed to save');
        } finally {
            setIsSaving(false);
        }
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const result = await generateSectionContentAction(section.id, undefined, content);
            if (result.success && result.content) {
                setContent(result.content);
                toast.success('Generated content');
            } else {
                toast.error('Failed to generate content');
            }
        } catch (e) {
            toast.error('Failed to generate');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full">
            <CardHeader className="flex flex-row items-center justify-between py-4 border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                    {section.title}
                </CardTitle>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleGenerate} disabled={isGenerating}>
                        <Sparkles className="h-4 w-4 mr-2 text-purple-500" />
                        AI Generate
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={isSaving}>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="flex-1 p-0">
                <Textarea
                    className="w-full h-full resize-none border-0 focus-visible:ring-0 p-4 font-mono text-sm leading-relaxed"
                    placeholder="Write policy content here or use AI to generate..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
            </CardContent>
        </div>
    );
}
