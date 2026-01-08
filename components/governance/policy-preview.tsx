'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Printer } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface PolicyPreviewProps {
    policy: any;
}

export function PolicyPreview({ policy }: PolicyPreviewProps) {
    const handlePrint = () => {
        window.print();
    };

    const sortedSections = policy.sections.sort((a: any, b: any) => a.order - b.order);

    return (
        <div className="flex flex-col h-full space-y-4">
            <div className="flex justify-end">
                <Button onClick={handlePrint} variant="outline">
                    <Printer className="mr-2 h-4 w-4" />
                    Print / Save PDF
                </Button>
            </div>
            <Card className="flex-1 overflow-auto bg-white">
                <CardContent className="p-8 max-w-4xl mx-auto print:shadow-none print:p-0">
                    <div className="prose prose-slate max-w-none print:prose-sm">
                        <div className="mb-8 border-b pb-4">
                            <h1 className="text-3xl font-bold mb-2">{policy.title}</h1>
                            <p className="text-lg text-muted-foreground">{policy.description}</p>
                            <div className="flex gap-4 text-sm text-gray-500 mt-4">
                                <span>Version: {policy.version}</span>
                                <span>Status: {policy.status}</span>
                                <span>Last Updated: {new Date(policy.updatedAt).toLocaleDateString()}</span>
                            </div>
                        </div>

                        {sortedSections.map((section: any) => (
                            <div key={section.id} className="mb-8 break-inside-avoid">
                                <h2 className="text-xl font-bold mb-4">{section.title}</h2>
                                {section.content ? (
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{section.content}</ReactMarkdown>
                                ) : (
                                    <p className="italic text-gray-400">No content.</p>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .prose, .prose * {
                        visibility: visible;
                    }
                    .prose {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    );
}
