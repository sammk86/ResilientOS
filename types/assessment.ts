export interface AssessmentListItem {
    assessment_id: number;
    assessment_name: string;
    type?: string;
    description?: string;
    framework_id: number;
    framework_name: string;
    status: 'created' | 'pending' | 'in_progress' | 'completed' | 'overdue';
    progress: number;
    assigned_date: string;
    created_at?: string;
    due_date?: string;
}

export interface AssessmentDetail {
    assessment_id: number;
    assessment_name: string;
    type?: string;
    framework_id: number;
    framework_name: string;
    status: string;
    progress: {
        overall: number;
        domains: {
            domain_id: number;
            domain_name: string;
            progress: number;
            controls_total: number;
            controls_completed: number;
        }[];
    };
    assigned_date: string;
    due_date?: string;
}

export interface AssessmentProgress {
    assessment_id: number;
    assessment_name: string;
    overall_progress: number;
    domains: any[];
}

export interface AssessmentResults {
    assessment_id: number;
    assessment_name: string;
    overall_score: number;
    overall_compliance: number;
}

export interface Risk {
    risk_id: number;
    control_id: number;
    control_name: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
    domain_id?: number;
}

export interface Remediation {
    remediation_id: number;
    risk_id: number;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    control_id?: number; // Used for matching during analysis
}

export interface AssessmentControl {
    control_id: number;
    control_code: string;
    control_name: string;
    description?: string;
    status?: string;
    notes?: string;
}
