import { API_BASE_URL } from '@/features/auth/services/session';

export function deleteChatSession(sessionId: string, token: string) {
  return fetch(`${API_BASE_URL}/chat/sessions/${sessionId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function renameChatSession(sessionId: string, title: string, token: string) {
  return fetch(`${API_BASE_URL}/chat/sessions/${sessionId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ title }),
  });
}
