// Framework Types
export interface FrameworkCard {
    framework_id: number;
    framework_name: string;
    framework_type: string;
    description?: string;
    logo?: string;
    status: 'active' | 'inactive';
    controls_count: number;
    is_active: boolean;
    version?: string;
    last_updated?: string;
}

export interface FrameworkCustom {
    id: number;
    organisationId: number;
    name: string;
    description?: string;
    version?: string;
    type: 'standard' | 'custom';
    createdAt: Date;
    updatedAt: Date;
}

export interface FrameworkList {
    frameworks: FrameworkCard[];
    active_framework_id?: number;
}

export interface Control {
    control_id: number;
    control_code: string;
    control_name: string;
    category: string;
    description?: string;
    status: string;
    framework_id: number;
    domain_id?: number;
    domain_name?: string;
}

export interface ControlListResponse {
    data: Control[];
    pagination: {
        page: number;
        per_page: number;
        total: number;
        total_pages: number;
    };
}

export interface FrameworkDetail {
    framework_id: number;
    framework_name: string;
    framework_type: string;
    description: string;
    logo?: string;
    status: 'active' | 'inactive';
    version?: string;
    last_updated: string;
    controls: Control[];
    domains?: any[];
}
