export type NotificationType = 'ORDER_STATUS' | 'PAYMENT' | 'PROMOTION' | 'SYSTEM' | 'REVIEW';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: {
    orderId?: string;
    orderCode?: string;
    status?: string;
    reviewId?: string;
    productId?: string;
    replyId?: string;
    type?: 'NEW_REVIEW' | 'REVIEW_REPLY' | string;
    [key: string]: unknown;
  };
  isRead: boolean;
  createdAt: string; // ISO timestamp
}

export interface NotificationMeta {
  total: number;
  unread: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface NotificationListResponse {
  items: AppNotification[];
  meta: NotificationMeta;
}
