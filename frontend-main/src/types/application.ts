import type { Job } from "./job";
import type { Resume } from "./resume";
import type { User } from "./user";

export type ApplicationStatus =
  | "pending"
  | "reviewing"
  | "shortlisted"
  | "interview"
  | "accepted"
  | "rejected"
  | "withdrawn";

export interface Application {
  _id: string;
  applicant: User | string;
  job: Job | string;
  resume: Resume | string;
  coverLetter?: string | null;
  status: ApplicationStatus;
  matchScore?: number | null;
  employerNote?: string | null;
  viewedAt?: string | null;
  respondedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateApplicationPayload {
  jobId: string;
  resumeId: string;
  coverLetter?: string;
}

export interface JobApplicationsResponse {
  job: Job;
  applications: Application[];
}
