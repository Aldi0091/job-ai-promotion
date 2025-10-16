export type UpworkJob = {
    id: number;
    job_title?: string | null;
    description?: string | null;
    source_url?: string | null;
    scraped_at?: string | null; // ISO-строка
    client_payment_method_verified?: boolean | null;
    client_phone_verified?: boolean | null;
    client_rating?: string | null;
    client_reviews?: string | null;
    client_country?: string | null;
    client_city?: string | null;
    client_local_time?: string | null;
    client_jobs_posted?: string | null;
    client_hiring_stats?: string | null;
    client_total_spent?: string | null;
    client_hires_active?: string | null;
    client_avg_hourly_rate?: string | null;
    client_hours?: string | null;
    client_company_size?: string | null;
    client_member_since?: string | null;
    job_featured?: boolean | null;
    job_hours_per_week?: string | null;
    job_rate_type?: string | null;
    job_duration?: string | null;
    job_experience_level?: string | null;
    job_hourly_min?: number | null;
    job_hourly_max?: number | null;
    job_budget_min?: number | null;
    job_budget_max?: number | null;
    ai_review?: {
    summary_md?: string;
    submission_md?: string;
  };
}
