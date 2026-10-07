import type { User } from "./user";

export interface ResumeExperience {
  company: string;
  position: string;
  startDate: string;
  endDate?: string | null;
  current?: boolean;
  description?: string;
}

export interface ResumeEducation {
  institution: string;
  degree?: string;
  field?: string;
  startDate: string;
  endDate?: string | null;
}

export interface ResumeSalary {
  min?: number | null;
  max?: number | null;
  currency?: string;
}

export interface Resume {
  _id: string;
  user: User | string;
  title: string;
  about?: string;
  audioUrl?: string | null;
  audioTranscript?: string | null;
  skills?: string[];
  experience?: ResumeExperience[];
  education?: ResumeEducation[];
  languages?: string[];
  expectedSalary?: ResumeSalary;
  location?: string | null;
  isPublic?: boolean;
  isPrimary?: boolean;
  experienceYears?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateResumePayload {
  title: string;
  about?: string;
  skills?: string[];
  experience?: ResumeExperience[];
  education?: ResumeEducation[];
  languages?: string[];
  expectedSalary?: ResumeSalary;
  location?: string;
  isPublic?: boolean;
  isPrimary?: boolean;
}
