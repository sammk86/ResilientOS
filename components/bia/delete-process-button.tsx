'use client';

import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { deleteProcessAction } from '@/app/(dashboard)/bia/actions';
import { useTransition } from 'react';
import { toast } from 'sonner';

export function DeleteProcessButton({ id }: { id: number }) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this process? It will remove all dependencies.')) {
            startTransition(async () => {
                const result = await deleteProcessAction(id);
                if (result.success) {
                    toast.success('Process deleted');
                } else {
                    toast.error('Failed to delete process');
                }
            });
        }
    };

    return (
        <Button variant="ghost" size="icon" onClick={handleDelete} disabled={isPending}>
            <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
    );
}
