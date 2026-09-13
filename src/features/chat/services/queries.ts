import type { ChatMessage, ChatSession } from '@/features/chat/types/chat';
import { http } from '@/lib/http';

export function fetchChatSessionsPayload() {
  return http.get<ChatSession[]>('/chat/sessions');
}

export function fetchChatSessionPayload(sessionId: string) {
  return http.get<{ messages?: ChatMessage[] } | ChatMessage[]>(`/chat/sessions/${sessionId}`);
}
