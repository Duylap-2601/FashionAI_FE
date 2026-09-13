import { http } from '@/lib/http';

export function deleteChatSessionPayload(sessionId: string) {
  return http.delete(`/chat/sessions/${sessionId}`);
}

export function renameChatSessionPayload(sessionId: string, title: string) {
  return http.patch(`/chat/sessions/${sessionId}`, { title });
}
