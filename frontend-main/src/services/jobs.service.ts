import api from "./api";
import type {
  CreateJobPayload,
  Job,
  JobFilters,
  JobsResponse,
} from "@/types";

/**
 * Payload'ni FormData'ga aylantirish (logo yuborish uchun).
 * Object/Array maydonlar JSON.stringify bilan string'ga o'giriladi.
 */
function buildFormData(
  payload: Partial<CreateJobPayload>,
  logoFile: File | null
): FormData {
  const fd = new FormData();

  const jsonFields = [
    'salary', 'location', 'company', 'skills', 'requirements', 'responsibilities',
  ];

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;

    if (jsonFields.includes(key)) {
      fd.append(key, JSON.stringify(value));
    } else if (Array.isArray(value)) {
      fd.append(key, JSON.stringify(value));
    } else {
      fd.append(key, String(value));
    }
  });

  if (logoFile) {
    fd.append('companyLogo', logoFile);
  }

  return fd;
}

export const jobsService = {
  async getJobs(filters: JobFilters = {}): Promise<JobsResponse> {
    const params = Object.fromEntries(
      Object.entries(filters).filter(
        ([, v]) => v !== undefined && v !== null && v !== ""
      )
    );
    const { data } = await api.get<JobsResponse>("/jobs", { params });
    return data;
  },

  async getJob(id: string, uniqueView = false): Promise<Job> {
    const { data } = await api.get<Job>(`/jobs/${id}`, {
      headers: uniqueView ? { "X-View-Unique": "1" } : {},
    });
    return data;
  },

  async createJob(
    payload: CreateJobPayload,
    logoFile: File | null = null
  ): Promise<Job> {
    const fd = buildFormData(payload, logoFile);
    const { data } = await api.post<Job>("/jobs", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  async updateJob(
    id: string,
    payload: Partial<CreateJobPayload>,
    logoFile: File | null = null
  ): Promise<Job> {
    const fd = buildFormData(payload, logoFile);
    const { data } = await api.patch<Job>(`/jobs/${id}`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  async updateJobStatus(id: string, status: string): Promise<Job> {
    const { data } = await api.patch<Job>(`/jobs/${id}/status`, { status });
    return data;
  },

  async deleteJob(id: string): Promise<void> {
    await api.delete(`/jobs/${id}`);
  },

  async getMyJobs(): Promise<JobsResponse> {
    const { data } = await api.get<JobsResponse>("/jobs/my");
    return data;
  },
};
