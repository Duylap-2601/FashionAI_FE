import { api } from '@/lib/api';

export async function changePassword({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) {
  // Endpoint: POST /auth/change-password (per Swagger UI)
  const res = await api.post('/auth/change-password', { currentPassword, newPassword });
  return res.data;
}
