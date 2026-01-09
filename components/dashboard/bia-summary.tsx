import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Server } from 'lucide-react';

interface BiaSummaryProps {
    totalProcesses: number;
    criticalProcesses: number;
    totalAssets: number;
    criticalAssets: number;
}

export function BiaSummary({
    totalProcesses,
    criticalProcesses,
    totalAssets,
    criticalAssets,
}: BiaSummaryProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Business Processes</CardTitle>
                    <div className="bg-orange-500/10 p-2 rounded-lg border border-orange-500/20">
                        <Activity className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalProcesses}</div>
                    <p className="text-xs text-muted-foreground">
                        <span className="text-orange-600 dark:text-orange-400 font-medium">{criticalProcesses} Critical</span> (RTO &lt; 4h)
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Assets</CardTitle>
                    <div className="bg-orange-500/10 p-2 rounded-lg border border-orange-500/20">
                        <Server className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalAssets}</div>
                    <p className="text-xs text-muted-foreground">
                        <span className="text-orange-600 dark:text-orange-400 font-medium">{criticalAssets} Critical</span>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
