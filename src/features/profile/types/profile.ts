export interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  birthday?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  city?: string;
  job?: string;
  company?: string;
  tier?: 'FREE' | 'MEMBER' | 'VIP';
  tierExpiresAt?: string | null;
}
