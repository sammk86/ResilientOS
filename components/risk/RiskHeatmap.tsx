'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function RiskHeatmap({ risks }: { risks: any[] }) {
    // 5x5 Matrix (Likelihood x Impact)
    // Likelihood (Y): 5 (Almost Certain) down to 1 (Rare)
    // Impact (X): 1 (Insignificant) to 5 (Severe)

    const matrix = Array.from({ length: 5 }, (_, row) =>
        Array.from({ length: 5 }, (_, col) => {
            const likelihood = 5 - row; // 5, 4, 3, 2, 1
            const impact = col + 1;     // 1, 2, 3, 4, 5
            return { likelihood, impact, risks: [] as any[] };
        })
    );

    // Group risks into buckets
    risks.forEach(risk => {
        const l = risk.likelihood || 1;
        const i = risk.impact || 1;

        // Find cell
        const rowIndex = 5 - l; // Matrix is 0-indexed from top (L=5 is row 0)
        const colIndex = i - 1; // Impact 1 is col 0

        if (matrix[rowIndex] && matrix[rowIndex][colIndex]) {
            matrix[rowIndex][colIndex].risks.push(risk);
        }
    });

    const getCellColor = (l: number, i: number) => {
        const score = l * i;
        // Simple heatmap logic
        if (score >= 15) return 'bg-red-500 hover:bg-red-600'; // Extreme
        if (score >= 10) return 'bg-orange-500 hover:bg-orange-600'; // High
        if (score >= 5) return 'bg-yellow-400 hover:bg-yellow-500'; // Medium
        return 'bg-green-500 hover:bg-green-600'; // Low
    };

    const getScoreLabel = (l: number, i: number) => {
        const score = l * i;
        if (score >= 15) return 'Extreme';
        if (score >= 10) return 'High';
        if (score >= 5) return 'Medium';
        return 'Low';
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Risk Heatmap</CardTitle>
                <CardDescription>Visual distribution of risks by Likelihood and Impact</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center">
                    <div className="flex">
                        {/* Y-Axis Label */}
                        <div className="flex items-center -rotate-90 mr-4">
                            <span className="font-bold text-sm text-gray-500 tracking-wider">LIKELIHOOD</span>
                        </div>

                        {/* Grid */}
                        <div className="grid grid-rows-5 gap-1">
                            {matrix.map((row, rIndex) => (
                                <div key={rIndex} className="grid grid-cols-5 gap-1">
                                    {row.map((cell, cIndex) => (
                                        <TooltipProvider key={cIndex}>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className={cn(
                                                        "w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center rounded text-white font-bold cursor-pointer transition-colors text-sm sm:text-base shadow-sm",
                                                        getCellColor(cell.likelihood, cell.impact),
                                                        cell.risks.length === 0 && "opacity-30 hover:opacity-100" // Dim empty cells
                                                    )}>
                                                        {cell.risks.length > 0 ? cell.risks.length : ''}
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <div className="text-xs">
                                                        <p className="font-semibold">{getScoreLabel(cell.likelihood, cell.impact)} Risk (Score: {cell.likelihood * cell.impact})</p>
                                                        <p>Likelihood: {cell.likelihood}</p>
                                                        <p>Impact: {cell.impact}</p>
                                                        <p className="mt-1">{cell.risks.length} Risks Identified</p>
                                                    </div>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* X-Axis Label */}
                    <div className="mt-4">
                        <span className="font-bold text-sm text-gray-500 tracking-wider">IMPACT</span>
                    </div>
                </div>

                <div className="flex gap-4 justify-center mt-6 text-xs text-gray-500">
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-green-500"></div> Low (1-4)</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-yellow-400"></div> Medium (5-9)</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-orange-500"></div> High (10-14)</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-red-500"></div> Extreme (15-25)</div>
                </div>
            </CardContent>
        </Card>
    );
}
