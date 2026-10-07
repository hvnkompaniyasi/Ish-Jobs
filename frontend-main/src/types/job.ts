import type { User } from "./user";

export type EmploymentType =
  | "full-time"
  | "part-time"
  | "contract"
  | "internship"
  | "remote";

export type ExperienceLevel =
  | "intern"
  | "junior"
  | "middle"
  | "senior"
  | "lead";

export type JobStatus = "draft" | "active" | "closed" | "archived";

export interface SalaryInfo {
  min?: number | null;
  max?: number | null;
  currency?: string;
  isNegotiable?: boolean;
}

export interface LocationInfo {
  city?: string | null;
  country?: string;
  isRemote?: boolean;
}

export interface CompanyFullInfo {
  name?: string;
  logo?: string | null;
  website?: string | null;
}

export interface Job {
  _id: string;
  title: string;
  description: string;
  requirements?: string[];
  responsibilities?: string[];
  category?: string;
  skills?: string[];
  employmentType: EmploymentType;
  experienceLevel: ExperienceLevel;
  salary: SalaryInfo;
  location: LocationInfo;
  company: CompanyFullInfo;
  employer: User | string;
  deadline?: string | null;
  status: JobStatus;
  viewsCount?: number;
  applicationsCount?: number;
  publishedToTelegram?: boolean;
  isExpired?: boolean;
  salaryFormatted?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface JobFilters {
  search?: string;
  category?: string;
  employmentType?: EmploymentType | "";
  experienceLevel?: ExperienceLevel | "";
  city?: string;
  isRemote?: boolean;
  minSalary?: number;
  maxSalary?: number;
  page?: number;
  limit?: number;
}

export interface CreateJobPayload {
  title: string;
  description: string;
  requirements?: string[];
  responsibilities?: string[];
  category?: string;
  skills?: string[];
  employmentType?: EmploymentType;
  experienceLevel?: ExperienceLevel;
  salary?: SalaryInfo;
  location?: LocationInfo;
  company?: CompanyFullInfo;
  deadline?: string | null;
  status?: JobStatus;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface JobsResponse {
  jobs: Job[];
  pagination: Pagination;
}
