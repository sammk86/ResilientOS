'use client';

import useSWR from 'swr';
import type { FrameworkCard, ControlListResponse } from '@/types/framework';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useFrameworkList() {
    const { data, error, isLoading, mutate } = useSWR<{ frameworks: FrameworkCard[] }>(
        '/api/frameworks', // Updated API path
        fetcher
    );

    return {
        frameworks: data?.frameworks || [],
        isLoading,
        isError: error,
        mutate,
    };
}
