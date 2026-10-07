import api from "./api";
import type { CreateJobPayload, Job, JobFilters, JobsResponse } from "@/types";

export const jobsService = {
  async getJobs(filters: JobFilters = {}): Promise<JobsResponse> {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== undefined && v !== null && v !== "")
    );
    const { data } = await api.get<JobsResponse>("/jobs", { params });
    return data;
  },

  /**
   * Bitta vakansiya.
   * @param uniqueView — agar true bo'lsa, backend viewsCount oshiradi.
   */
  async getJob(id: string, uniqueView = false): Promise<Job> {
    const { data } = await api.get<Job>(`/jobs/${id}`, {
      headers: uniqueView ? { "X-View-Unique": "1" } : {},
    });
    return data;
  },

  async createJob(payload: CreateJobPayload): Promise<Job> {
    const { data } = await api.post<Job>("/jobs", payload);
    return data;
  },

  async updateJob(id: string, payload: Partial<CreateJobPayload>): Promise<Job> {
    const { data } = await api.patch<Job>(`/jobs/${id}`, payload);
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
