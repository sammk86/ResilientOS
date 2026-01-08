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
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalProcesses}</div>
                    <p className="text-xs text-muted-foreground">
                        <span className="text-red-500 font-medium">{criticalProcesses} Critical</span> (RTO &lt; 4h)
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Assets</CardTitle>
                    <Server className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalAssets}</div>
                    <p className="text-xs text-muted-foreground">
                        <span className="text-red-500 font-medium">{criticalAssets} Critical</span>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
