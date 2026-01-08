'use client';

import useSWR from 'swr';
import type { AssessmentListItem, AssessmentDetail } from '@/types/assessment';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useAssessmentList() {
    const { data, error, isLoading, mutate } = useSWR<{ assessments: AssessmentListItem[] }>(
        '/api/assessments', // Updated API path
        fetcher
    );

    return {
        assessments: data?.assessments || [],
        isLoading,
        isError: error,
        mutate,
    };
}

export function useAssessment(id: number | null) {
    const { data, error, isLoading, mutate } = useSWR<AssessmentDetail>(
        id ? `/api/assessments/${id}` : null, // Assuming I implement detail route later or port it
        fetcher
    );

    return {
        assessment: data,
        isLoading,
        isError: error,
        mutate,
    };
}

export function useAssessmentProgress(id: number | null) {
    const { data, error, isLoading, mutate } = useSWR<any>( // Type as AssessmentProgress eventually
        id ? `/api/assessments/${id}/progress` : null,
        fetcher
    );

    return {
        progress: data,
        isLoading,
        isError: error,
        mutate,
    };
}

export function useAssessmentResults(id: number | null) {
    const { data, error, isLoading, mutate } = useSWR<any>(
        id ? `/api/assessments/${id}/results` : null,
        fetcher
    );

    return {
        results: data,
        isLoading,
        isError: error,
        mutate,
    };
}
