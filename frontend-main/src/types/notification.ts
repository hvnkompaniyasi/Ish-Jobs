import type { User } from "./user";

export type NotificationType =
  | "application_received"
  | "application_status"
  | "job_closed"
  | "system";

export interface Notification {
  _id: string;
  recipient: string;
  type: NotificationType;
  title: string;
  message?: string;
  sender?: User | string | null;
  link?: string | null;
  read: boolean;
  readAt?: string | null;
  meta?: {
    jobId?: string;
    applicationId?: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
