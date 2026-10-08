import type { User } from "./user";

export type DashboardPeriod = "7d" | "30d" | "all";

export interface DashboardStats {
  activeJobs: number;
  totalJobs: number;
  totalViews: number;
  totalApplications: number;
  newApplications: number;
  accepted: number;
  acceptanceRate: number;
}

export interface HiringFunnelData {
  views: number;
  applications: number;
  shortlisted: number;
  accepted: number;
}

export interface StatusDistribution {
  pending: number;
  reviewing: number;
  shortlisted: number;
  interview: number;
  accepted: number;
  rejected: number;
  withdrawn: number;
}

export interface ApplicationByDay {
  date: string;
  count: number;
}

export interface TopJob {
  jobId: string;
  title: string;
  status: string;
  applications: number;
}

export interface RecentApplication {
  _id: string;
  applicant: User | string;
  job: { _id: string; title: string } | string;
  resume?: { _id: string; title: string } | string;
  status: string;
  createdAt: string;
}

export interface DashboardData {
  stats: DashboardStats;
  funnel: HiringFunnelData;
  statusDistribution: StatusDistribution;
  applicationsByDay: ApplicationByDay[];
  topJobs: TopJob[];
  recentApplications: RecentApplication[];
  period: DashboardPeriod;
}
