import api from "./api";
import type { Notification, NotificationsResponse } from "@/types";

export const notificationsService = {
  async getMy(filters: { page?: number; limit?: number } = {}): Promise<NotificationsResponse> {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== undefined && v !== null)
    );
    const { data } = await api.get<NotificationsResponse>("/notifications", { params });
    return data;
  },

  async getUnreadCount(): Promise<{ count: number }> {
    const { data } = await api.get<{ count: number }>("/notifications/unread-count");
    return data;
  },

  async markAsRead(id: string): Promise<Notification> {
    const { data } = await api.patch<Notification>(`/notifications/${id}/read`);
    return data;
  },

  async markAllAsRead(): Promise<void> {
    await api.patch("/notifications/read-all");
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`);
  },
};
