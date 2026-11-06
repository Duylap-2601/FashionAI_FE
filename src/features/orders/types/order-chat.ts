export type OrderChatSenderRole = 'CUSTOMER' | 'ADMIN';

export interface OrderChatMessage {
  id: string;
  senderId?: string | null;
  senderRole: OrderChatSenderRole;
  senderName?: string | null;
  senderAvatarUrl?: string | null;
  content: string;
  attachments: string[];
  clientMessageId?: string | null;
  readByCustomerAt?: string | null;
  readByAdminAt?: string | null;
  createdAt: string;
}

export interface OrderChatThread {
  messages: OrderChatMessage[];
  nextCursor: string | null;
  hasMore: boolean;
  unreadForCustomer: number;
  unreadForAdmin: number;
  locked?: boolean;
}

export interface OrderChatThreadSummary {
  orderId: string;
  orderCode: number;
  orderStatus: string;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  unread: number;
}

export interface OrderChatOrderOption {
  orderId: string;
  orderCode: number;
  status: string;
}

export interface MyOrderChats {
  threads: OrderChatThreadSummary[];
  orders: OrderChatOrderOption[];
}
