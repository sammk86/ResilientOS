import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from '@/lib/utils';
import Link from 'next/link';


interface Risk {
    id: number;
    riskName: string;
    likelihood: number | null;
    impact: number | null;
    description: string | null;
    status: string | null;
    ownerName: string | null;
    categoryName: string | null;
}

interface RiskHeatmapProps {
    risks: Risk[];
}

export function RiskHeatmap({ risks }: RiskHeatmapProps) {
    // 5x5 Grid
    // Y-axis: Likelihood (5 down to 1)
    // X-axis: Impact (1 to 5)

    const getRisksForCell = (likelihood: number, impact: number) => {
        return risks.filter(
            (r) => (r.likelihood || 1) === likelihood && (r.impact || 1) === impact
        );
    };

    const getCellColor = (likelihood: number, impact: number) => {
        const score = likelihood * impact;
        if (score >= 15) return 'bg-red-500 text-white hover:bg-red-600';
        if (score >= 8) return 'bg-orange-400 text-white hover:bg-orange-500';
        if (score >= 4) return 'bg-yellow-300 text-black hover:bg-yellow-400';
        return 'bg-green-200 text-green-900 hover:bg-green-300';
    };

    const rows = [5, 4, 3, 2, 1];
    const cols = [1, 2, 3, 4, 5];

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Risk Heatmap</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col h-full">
                    <div className="flex flex-1">
                        {/* Y-axis Label */}
                        <div className="flex items-center justify-center w-8 -rotate-90 text-sm font-medium text-muted-foreground">
                            Likelihood
                        </div>

                        <div className="flex-1 grid grid-cols-5 gap-1">
                            {rows.map((row) => (
                                cols.map((col) => {
                                    const cellRisks = getRisksForCell(row, col);
                                    const count = cellRisks.length;

                                    // If no risks, just show the empty cell (optional: disable click)
                                    if (count === 0) {
                                        return (
                                            <div
                                                key={`${row}-${col}`}
                                                className={cn(
                                                    "flex items-center justify-center rounded-md font-bold text-lg aspect-square cursor-default transition-all opacity-50",
                                                    getCellColor(row, col).split(' ')[0] // Use base color without hover effect
                                                )}
                                            />
                                        );
                                    }

                                    return (
                                        <Dialog key={`${row}-${col}`}>
                                            <DialogTrigger asChild>
                                                <div
                                                    className={cn(
                                                        "flex items-center justify-center rounded-md font-bold text-lg aspect-square cursor-pointer transition-all shadow-sm",
                                                        getCellColor(row, col)
                                                    )}
                                                >
                                                    {count}
                                                </div>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-2xl">
                                                <DialogHeader>
                                                    <DialogTitle>Risks (Likelihood: {row}, Impact: {col})</DialogTitle>
                                                </DialogHeader>
                                                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                                                    {cellRisks.map((risk) => (
                                                        <div key={risk.id} className="p-4 border rounded-md hover:bg-gray-50 space-y-2">
                                                            <div className="flex justify-between items-start">
                                                                <div className="font-semibold text-lg">{risk.riskName}</div>
                                                                <div className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded capitalize">{risk.status}</div>
                                                            </div>

                                                            <div className="text-sm text-gray-700">
                                                                {risk.description || "No description provided."}
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-2 text-sm text-gray-500 mt-2">
                                                                <div><span className="font-medium">Category:</span> {risk.categoryName || 'N/A'}</div>
                                                                <div><span className="font-medium">Owner:</span> {risk.ownerName || 'Unassigned'}</div>
                                                                <div><span className="font-medium">ID:</span> {risk.id}</div>
                                                            </div>

                                                            <Link href={`/risk?id=${risk.id}`} className="text-sm text-blue-600 hover:underline mt-2 inline-block">
                                                                View Full Details
                                                            </Link>
                                                        </div>
                                                    ))}
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    );
                                })
                            ))}
                        </div>
                    </div>
                    {/* X-axis Label */}
                    <div className="mt-2 text-center text-sm font-medium text-muted-foreground ml-8">
                        Impact
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
