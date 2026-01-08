'use client';

import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { deleteAssetAction } from '@/app/(dashboard)/bia/actions';
import { useTransition } from 'react';
import { toast } from 'sonner';

export function DeleteAssetButton({ id }: { id: number }) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this asset?')) {
            startTransition(async () => {
                const result = await deleteAssetAction(id);
                if (result.success) {
                    toast.success('Asset deleted');
                } else {
                    toast.error('Failed to delete asset');
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
