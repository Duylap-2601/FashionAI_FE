import { http } from '@/lib/http';

export async function changePassword({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) {
  // Endpoint: POST /auth/change-password (per Swagger UI)
  return http.post('/auth/change-password', { currentPassword, newPassword });
}
