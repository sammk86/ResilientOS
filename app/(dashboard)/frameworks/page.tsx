'use client';

import { useFrameworkList } from '@/lib/hooks/useFramework';
import { FrameworkCard } from '@/components/framework/FrameworkCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Download } from 'lucide-react';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function FrameworksPage() {
    const { frameworks, isLoading } = useFrameworkList();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isImporting, setIsImporting] = useState(false);

    const handleImportClick = () => {
        // fileInputRef.current?.click();
        console.log("Import not implemented yet");
    };

    if (isLoading) {
        return (
            <div className="flex-1 p-4 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-48 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 p-4 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Frameworks</h1>
                        <p className="text-muted-foreground mt-2">Browse available GRC frameworks</p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={handleImportClick}
                            disabled={isImporting}
                            variant="outline"
                        >
                            <Upload className="h-4 w-4 mr-2" />
                            Import Framework
                        </Button>
                    </div>
                </div>

                {frameworks && frameworks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {frameworks.map((framework: any) => (
                            <FrameworkCard key={framework.id || framework.framework_id} framework={framework} />
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="pt-6">
                            <p className="text-muted-foreground text-center">No frameworks available.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
