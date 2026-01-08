'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
// import { FrameworkDetail } from '@/types/framework';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'; // You might need to adjust imports if shadcn components vary
import { ArrowLeft, CheckCircle2, XCircle, FileText, Search } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function FrameworkDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { data: framework, error, isLoading } = useSWR(`/api/frameworks/${id}`, fetcher);

    const [searchTerm, setSearchTerm] = useState('');

    // For Create Assessment Modal logic (simplified)
    const isCreating = false;

    if (isLoading) {
        return (
            <div className="flex-1 p-8 text-center">
                <p>Loading framework details...</p>
            </div>
        );
    }

    if (error || !framework) {
        return (
            <div className="flex-1 p-8 text-center">
                <p className="text-red-500">Error loading framework. {error?.message}</p>
                <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
            </div>
        );
    }

    // Filter controls
    const filteredControls = framework.controls?.filter((control: any) => {
        const term = searchTerm.toLowerCase();
        return (
            control.control_code.toLowerCase().includes(term) ||
            control.control_name.toLowerCase().includes(term) ||
            (control.description && control.description.toLowerCase().includes(term))
        );
    });

    return (
        <div className="flex-1 p-4 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            {framework.framework_name}
                            <Badge variant={framework.status === 'active' ? 'default' : 'secondary'}>
                                {framework.status}
                            </Badge>
                        </h1>
                        <p className="text-muted-foreground">{framework.description}</p>
                    </div>
                    <div className="ml-auto">
                        <Button onClick={() => router.push(`/assessments/create?framework=${framework.framework_id}`)}>
                            Create Assessment
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-1 space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div>
                                    <span className="font-semibold">Type:</span> {framework.framework_type}
                                </div>
                                <div>
                                    <span className="font-semibold">Version:</span> {framework.version || 'N/A'}
                                </div>
                                <div>
                                    <span className="font-semibold">Controls:</span> {framework.controls?.length || 0}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-3 space-y-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Controls</CardTitle>
                                <div className="relative w-64">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search controls..."
                                        className="pl-8"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {filteredControls && filteredControls.length > 0 ? (
                                        filteredControls.map((control: any) => (
                                            <div key={control.control_id} className="border rounded-lg p-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="font-mono">{control.control_code}</Badge>
                                                        <h3 className="font-semibold">{control.control_name}</h3>
                                                    </div>
                                                    {control.domain_name && (
                                                        <Badge variant="secondary" className="text-xs">{control.domain_name}</Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground">{control.description}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-muted-foreground text-center py-4">No controls found matching your search.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
