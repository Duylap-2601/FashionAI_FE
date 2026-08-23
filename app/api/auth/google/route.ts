import { NextRequest, NextResponse } from 'next/server';

const BACKEND_ORIGIN = (process.env.BACKEND_ORIGIN ?? 'http://localhost:3002').replace(/\/+$/, '');

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
      `/api/backend/auth/google/callback`
    );
    return NextResponse.redirect(proxyLocation, res.status);
  }

  const response = new NextResponse(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: res.headers,
  });

  const setCookie = res.headers.get('set-cookie');
  if (setCookie) {
    response.headers.set('set-cookie', setCookie);
  }

  return response;
}