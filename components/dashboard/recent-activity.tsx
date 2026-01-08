import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, BookOpen, Activity, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export interface ActivityItem {
    id: string; // Composite ID or just the DB ID
    type: 'policy' | 'plan' | 'bia';
    title: string;
    date: Date | null;
    link: string;
}

interface RecentActivityWidgetProps {
    activities: ActivityItem[];
}

export function RecentActivityWidget({ activities }: RecentActivityWidgetProps) {

    const getIcon = (type: string) => {
        switch (type) {
            case 'policy': return <FileText className="h-4 w-4 text-blue-500" />;
            case 'plan': return <BookOpen className="h-4 w-4 text-green-500" />;
            case 'bia': return <Activity className="h-4 w-4 text-orange-500" />;
            default: return <Clock className="h-4 w-4 text-gray-500" />;
        }
    };

    const getLabel = (type: string) => {
        switch (type) {
            case 'policy': return 'Policy Created';
            case 'plan': return 'Plan Updated';
            case 'bia': return 'BIA Run';
            default: return 'Activity';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
                {activities.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No recent activity.</p>
                ) : (
                    <div className="space-y-4">
                        {activities.map((item, index) => (
                            <div key={`${item.type}-${item.id}-${index}`} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-gray-50 rounded-full">
                                        {getIcon(item.type)}
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-sm font-medium leading-none">
                                            <Link href={item.link} className="hover:underline">
                                                {item.title}
                                            </Link>
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {getLabel(item.type)}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {item.date ? formatDistanceToNow(item.date, { addSuffix: true }) : 'N/A'}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
