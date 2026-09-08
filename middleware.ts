import { NextResponse, type NextRequest } from 'next/server';

const AUTH_MARKER_COOKIE_NAME = 'auth_marker';

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasAuthMarker = Boolean(req.cookies.get(AUTH_MARKER_COOKIE_NAME)?.value);

  const protectedRoutes = ['/try-on', '/profile', '/ai-stylist', '/chat', '/checkout', '/admin'];
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtected && !hasAuthMarker) {
    return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|manifest.json|icons|screenshots|images).*)'],
};
