import type { OutfitSuggestion, SuggestedProduct } from '@/features/stylist/types/outfit-suggestion';

export type ChatRole = 'user' | 'assistant' | 'system';

/** Gợi ý từ catalog kèm câu trả lời của AI Chat (BE đã hydrate, đã tách khỏi text). */
export interface ChatSuggestions {
  outfits: OutfitSuggestion[];
  /** Món lẻ. */
  products: SuggestedProduct[];
}

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
  /** Id tin nhắn trên server (từ event done); tin tải từ server thì trùng `id`. */
  messageId?: string;
  suggestions?: ChatSuggestions | null;
}

export interface ChatSession {
  id: string;
  title?: string;
  updatedAt: string;
  createdAt?: string;
  lastMessage?: string;
  lastRole?: 'user' | 'assistant';
}

/** Payload `done` (WS `chat:done`, SSE `{ type: 'done', data }`). */
export interface ChatDonePayload {
  sessionId?: string;
  messageId?: string;
  suggestions: ChatSuggestions | null;
}

export interface SSEEvent {
  type: 'token' | 'done' | 'error';
  data: string | ChatDonePayload;
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
