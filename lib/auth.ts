import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { formatUserName } from './utils';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      id: 'backend-session',
      name: 'Backend Session',
      credentials: {
        accessToken: { label: 'Access Token', type: 'text' },
        accessTokenExpiresAt: { label: 'Access Token Expires At', type: 'text' },
        user: { label: 'User', type: 'text' },
      },
      async authorize(credentials) {
        const accessToken = credentials?.accessToken as string | undefined;
        const accessTokenExpiresAt = credentials?.accessTokenExpiresAt as string | undefined;
        const rawUser = credentials?.user as string | undefined;

        if (!accessToken || !rawUser) return null;

        try {
          const user = JSON.parse(rawUser);
          const id = user.id || user._id;
          if (!id || !user.email) return null;

          return {
            id,
            name: formatUserName(user.name || user.fullName || ''),
            email: user.email,
            image: user.avatarUrl,
            accessToken,
            accessTokenExpiresAt: accessTokenExpiresAt || user.accessTokenExpiresAt,
            tier: user.tier || 'FREE',
            tierExpiresAt: user.tierExpiresAt || null,
            role: user.role || 'USER',
          };
        } catch (error) {
          console.error('Backend session authorize error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      const anyToken = token as any;
      if (user) {
        anyToken.accessToken = user.accessToken;
        anyToken.accessTokenExpiresAt = user.accessTokenExpiresAt;
        anyToken.tier = user.tier;
        anyToken.tierExpiresAt = (user as any).tierExpiresAt || null;
        anyToken.role = user.role;
        anyToken.id = user.id;
        if (user.name) {
          token.name = formatUserName(user.name);
        }
      }

      return token;
    },
    session({ session, token }) {
      const anyToken = token as any;
      if (session.user) {
        session.user.accessToken = anyToken.accessToken || '';
        session.user.accessTokenExpiresAt = anyToken.accessTokenExpiresAt || '';
        session.user.tier = (anyToken.tier || 'FREE') as 'FREE' | 'MEMBER' | 'VIP';
        session.user.tierExpiresAt = anyToken.tierExpiresAt || null;
        session.user.role = anyToken.role || 'USER';
        session.user.id = anyToken.id || '';
        if (session.user.name) {
          session.user.name = formatUserName(session.user.name);
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
});
