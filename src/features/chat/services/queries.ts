import { API_BASE_URL } from '@/features/auth/services/session';

export function fetchChatSessions(token: string) {
  return fetch(`${API_BASE_URL}/chat/sessions`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function fetchChatSession(sessionId: string | null, token: string) {
  return fetch(`${API_BASE_URL}/chat/sessions/${sessionId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
