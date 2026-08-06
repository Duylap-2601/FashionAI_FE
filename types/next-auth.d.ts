import NextAuth, { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      accessToken: string;
      accessTokenExpiresAt: string;
      tier: 'FREE' | 'MEMBER' | 'VIP';
      role: 'USER' | 'ADMIN';
    } & DefaultSession['user']
  }

  interface User {
    id: string;
    accessToken: string;
    accessTokenExpiresAt?: string;
    tier: 'FREE' | 'MEMBER' | 'VIP';
    role: 'USER' | 'ADMIN';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    accessTokenExpiresAt?: string;
    error?: string;
    tier?: 'FREE' | 'MEMBER' | 'VIP';
    role?: 'USER' | 'ADMIN';
    id?: string;
  }
}
