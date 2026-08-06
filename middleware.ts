import { NextResponse, type NextRequest } from 'next/server';

const SESSION_COOKIE_NAMES = [
  'authjs.session-token',
  '__Secure-authjs.session-token',
  'next-auth.session-token',
  '__Secure-next-auth.session-token',
];

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = SESSION_COOKIE_NAMES.some((name) => Boolean(req.cookies.get(name)?.value));

  const protectedRoutes = ['/try-on', '/profile', '/ai-stylist', '/checkout'];
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtected && !hasSession) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|manifest.json|icons|screenshots|images).*)'],
};
