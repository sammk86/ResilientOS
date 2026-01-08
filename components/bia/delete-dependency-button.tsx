'use client';

import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { removeDependencyAction } from '@/app/(dashboard)/bia/actions';
import { useTransition } from 'react';
import { toast } from 'sonner';

export function DeleteDependencyButton({ id, processId }: { id: number, processId: number }) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        if (confirm('Remove this dependency?')) {
            startTransition(async () => {
                const result = await removeDependencyAction(id, processId);
                if (result.success) {
                    toast.success('Dependency removed');
                } else {
                    toast.error('Failed to remove dependency');
                }
            });
        }
    };

    return (
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500" onClick={handleDelete} disabled={isPending}>
            <Trash2 className="h-4 w-4" />
        </Button>
    );
}
