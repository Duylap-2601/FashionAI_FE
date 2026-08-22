export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatProductContext {
  id: string;
  name: string;
  price?: string | number;
  image?: string;
  category?: string;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  streaming?: boolean;
  sessionId: string;
  createdAt?: string;
  productId?: string;
  product?: ChatProductContext;
  isError?: boolean;
}

export interface ChatSession {
  id: string;
  title?: string;
  updatedAt: string;
  createdAt?: string;
  lastMessage?: string;
  lastRole?: 'user' | 'assistant';
}

export interface SSEEvent {
  type: 'token' | 'done' | 'error';
  data: string | { sessionId?: string; [key: string]: unknown };
}

export interface ChatMeasurementsContext {
  height?: number;
  weight?: number;
  chest?: number;
  waist?: number;
  hip?: number;
  shoulder?: number;
  neck?: number;
  underbust?: number;
  bodyLength?: number;
  sleeveLength?: number;
  wrist?: number;
  thigh?: number;
  inseam?: number;
  knee?: number;
  calf?: number;
  trouserLength?: number;
}

export interface ChatContextPayload {
  measurements?: ChatMeasurementsContext;
  tier?: string;
  gender?: string;
}

export interface SendMessageOptions {
  sessionId?: string;
  productId?: string;
  retryMessageId?: string;
  customContext?: ChatContextPayload;
}
