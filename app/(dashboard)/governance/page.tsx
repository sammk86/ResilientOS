import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, CheckCircle, AlertCircle, FileText, Shield } from 'lucide-react';
import { db } from '@/lib/db/drizzle';
import { policies, controls } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { formatDistanceToNow } from 'date-fns';
import { NewPolicyDialog } from '@/components/governance/new-policy-dialog';
import { ControlMapping } from '@/components/governance/control-mapping';

async function getPolicies() {
    return await db.query.policies.findMany({
        orderBy: [desc(policies.updatedAt)],
    });
}

async function getControls() {
    return await db.query.controls.findMany({
        where: eq(controls.framework, 'ISO 22301'),
        with: {
            policies: {
                with: {
                    policy: true
                }
            }
        },
        orderBy: [controls.code]
    });
}

function formatDate(date: Date | null) {
    if (!date) return 'Never';
    return formatDistanceToNow(date, { addSuffix: true });
}

export default async function GovernancePage() {
    const policyList = await getPolicies();
    const rawIsoControls = await getControls();

    // Natural sort for "4.1", "4.10", etc.
    const isoControls = rawIsoControls.sort((a: any, b: any) =>
        a.code.localeCompare(b.code, undefined, { numeric: true, sensitivity: 'base' })
    );

    const totalPolicies = policyList.length;
    const publishedPolicies = policyList.filter((p: any) => p.status === 'published').length;
    const underReviewPolicies = policyList.filter((p: any) => p.status !== 'published').length;

    // Simplify policies for the client component
    const availablePolicies = policyList.map((p: any) => ({ id: p.id, title: p.title }));

    const mappedControlsCount = isoControls.filter((c: any) => c.policies.length > 0).length;
    const coveragePercentage = isoControls.length > 0 ? Math.round((mappedControlsCount / isoControls.length) * 100) : 0;

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Governance</h2>
                <div className="flex items-center space-x-2">
                    <NewPolicyDialog />
                </div>
            </div>
            <Tabs defaultValue="policies" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="policies">Policies</TabsTrigger>
                    <TabsTrigger value="compliance">Compliance Mapper</TabsTrigger>
                    <TabsTrigger value="controls">Controls Library</TabsTrigger>
                </TabsList>
                <TabsContent value="policies" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Policies
                                </CardTitle>
                                <FileText className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalPolicies}</div>
                                <p className="text-xs text-muted-foreground">
                                    Across organization
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Published
                                </CardTitle>
                                <CheckCircle className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{publishedPolicies}</div>
                                <p className="text-xs text-muted-foreground">
                                    Active in production
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Under Review</CardTitle>
                                <AlertCircle className="h-4 w-4 text-yellow-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{underReviewPolicies}</div>
                                <p className="text-xs text-muted-foreground">
                                    Requires approval
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Policy Repository</CardTitle>
                                <CardDescription>
                                    Manage your organization's policies and procedures.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border">
                                    {policyList.length === 0 ? (
                                        <div className="p-8 text-center text-muted-foreground">
                                            No policies found. Create one to get started.
                                        </div>
                                    ) : (
                                        policyList.map((policy: any) => (
                                            <Link key={policy.id} href={`/governance/policies/${policy.id}`} className="block">
                                                <div className="p-4 flex items-center justify-between border-b last:border-0 hover:bg-slate-50 transition-colors">
                                                    <div className="flex items-center space-x-4">
                                                        <FileText className="h-5 w-5 text-blue-500" />
                                                        <div>
                                                            <p className="font-medium">{policy.title}</p>
                                                            <p className="text-sm text-gray-500">Last updated {formatDate(policy.updatedAt)}</p>
                                                        </div>
                                                    </div>
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            policy.status === 'published'
                                                                ? "bg-green-50 text-green-700 border-green-200"
                                                                : "bg-yellow-50 text-yellow-700 border-yellow-200"
                                                        }
                                                    >
                                                        {policy.status ? policy.status.charAt(0).toUpperCase() + policy.status.slice(1) : 'Draft'}
                                                    </Badge>
                                                </div>
                                            </Link>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="compliance">
                    <Card>
                        <CardHeader>
                            <CardTitle>Compliance Mapper</CardTitle>
                            <CardDescription>
                                Map your controls against industry standards (ISO 22301, SOC 2).
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-8">
                                <div className="border rounded-lg p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-semibold text-lg flex items-center">
                                            <Shield className="mr-2 h-5 w-5 text-indigo-500" /> ISO 22301:2019
                                        </h3>
                                        <Badge className={coveragePercentage > 80 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                                            {coveragePercentage}% Coverage
                                        </Badge>
                                    </div>
                                    <div className="space-y-4">
                                        {isoControls.length === 0 ? (
                                            <div className="text-center text-muted-foreground py-8">
                                                ISO Controls not loaded. Please run seed script.
                                            </div>
                                        ) : (
                                            isoControls.map((control: any) => (
                                                <div key={control.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded hover:bg-slate-50">
                                                    <div className="mb-2 sm:mb-0 sm:w-1/2">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            <span className="font-mono font-bold mr-2 text-primary">{control.code}</span>
                                                            {control.name}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground mt-1 pr-4 leading-relaxed">
                                                            {control.description}
                                                        </div>
                                                    </div>
                                                    <div className="sm:w-1/2">
                                                        <ControlMapping
                                                            controlId={control.id}
                                                            mappedPolicies={control.policies.map((p: any) => p.policy).filter(Boolean)}
                                                            availablePolicies={availablePolicies}
                                                        />
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="controls">
                    <Card>
                        <CardHeader>
                            <CardTitle>Controls Library</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="p-4 text-center text-muted-foreground">
                                {isoControls.length} Controls defined.
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
