import { NextRequest, NextResponse } from 'next/server';

const BACKEND_ORIGIN = (process.env.BACKEND_ORIGIN ?? 'http://localhost:3002')
  .replace(/\/+$/, '')
  .replace(/\/api$/, '');

export async function GET(req: NextRequest) {
  const url = new URL(`${BACKEND_ORIGIN}/api/auth/google`);
  url.search = req.nextUrl.search;

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      cookie: req.headers.get('cookie') || '',
    },
    credentials: 'include',
    redirect: 'manual',
  });

  const location = res.headers.get('location');
  if (location) {
    const proxyLocation = location.replace(
      `${BACKEND_ORIGIN}/api/auth/google/callback`,
      `/api/auth/google/callback`
    );
    const response = NextResponse.redirect(proxyLocation, res.status);
    copySetCookieHeaders(res.headers, response.headers);
    return response;
  }

  const response = new NextResponse(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: res.headers,
  });

  copySetCookieHeaders(res.headers, response.headers);

  return response;
}

function copySetCookieHeaders(source: Headers, target: Headers) {
  const withGetSetCookie = source as Headers & { getSetCookie?: () => string[] };
  const cookies = withGetSetCookie.getSetCookie?.() ?? [];
  if (cookies.length > 0) {
    cookies.forEach((cookie) => target.append('set-cookie', cookie));
    return;
  }

  const setCookie = source.get('set-cookie');
  if (setCookie) target.set('set-cookie', setCookie);
}
