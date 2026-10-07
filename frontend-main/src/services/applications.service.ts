import api from "./api";
import type {
  Application,
  ApplicationStatus,
  CreateApplicationPayload,
  JobApplicationsResponse,
} from "@/types";

export const applicationsService = {
  async apply(payload: CreateApplicationPayload): Promise<Application> {
    const { data } = await api.post<Application>("/applications", payload);
    return data;
  },

  async getMyApplications(): Promise<Application[]> {
    const { data } = await api.get<Application[]>("/applications/my");
    return data;
  },

  async getForJob(jobId: string): Promise<JobApplicationsResponse> {
    const { data } = await api.get<JobApplicationsResponse>(
      `/applications/job/${jobId}`
    );
    return data;
  },

  async updateStatus(
    id: string,
    status: ApplicationStatus
  ): Promise<Application> {
    const { data } = await api.patch<Application>(
      `/applications/${id}/status`,
      { status }
    );
    return data;
  },

  async withdraw(id: string): Promise<Application> {
    const { data } = await api.patch<Application>(
      `/applications/${id}/withdraw`
    );
    return data;
  },
};
