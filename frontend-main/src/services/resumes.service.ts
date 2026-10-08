import api from "./api";
import type { CreateResumePayload, Resume } from "@/types";

export const resumesService = {
  async createResume(payload: CreateResumePayload): Promise<Resume> {
    const { data } = await api.post<Resume>("/resumes", payload);
    return data;
  },

  async getPublicResumes(filters: { search?: string; location?: string; page?: number; limit?: number } = {}): Promise<{ resumes: Resume[]; pagination: { page: number; limit: number; total: number; pages: number } }> {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== undefined && v !== null && v !== '')
    );
    const { data } = await api.get('/resumes', { params });
    return data;
  },

  async getMyResumes(): Promise<Resume[]> {
    const { data } = await api.get<Resume[]>("/resumes/my");
    return data;
  },

  async getResume(id: string): Promise<Resume> {
    const { data } = await api.get<Resume>(`/resumes/${id}`);
    return data;
  },

  async updateResume(id: string, payload: Partial<CreateResumePayload>): Promise<Resume> {
    const { data } = await api.patch<Resume>(`/resumes/${id}`, payload);
    return data;
  },

  async deleteResume(id: string): Promise<void> {
    await api.delete(`/resumes/${id}`);
  },
};
