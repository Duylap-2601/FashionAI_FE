import { NextRequest, NextResponse } from 'next/server';

// Allow this route to run for up to 5 minutes (AI try-on can be slow)
export const maxDuration = 300;
export const dynamic = 'force-dynamic';

const BACKEND_ORIGIN = (process.env.BACKEND_ORIGIN ?? 'http://localhost:3002')
  .replace(/\/+$/, '')
  .replace(/\/api$/, '');

/**
 * Proxy handler for POST /api/try-on → backend /api/try-on
 *
 * We use a dedicated route handler instead of next.config rewrites because:
 * - Next.js rewrite proxy has no configurable timeout (defaults ~30s)
 * - AI try-on can take 2–3 minutes
 * - We need to stream the multipart/form-data body without buffering
 */
export async function POST(req: NextRequest) {
  const targetUrl = `${BACKEND_ORIGIN}/api/try-on`;

  // Forward auth + content-type headers; do NOT buffer the body — pipe it directly
  const forwardHeaders = new Headers();

  const authHeader = req.headers.get('authorization');
  if (authHeader) forwardHeaders.set('authorization', authHeader);

  const contentType = req.headers.get('content-type');
  if (contentType) forwardHeaders.set('content-type', contentType);

  const cookie = req.headers.get('cookie');
  if (cookie) forwardHeaders.set('cookie', cookie);

  // AbortController tied to request cancellation (e.g. user navigates away)
  const ac = new AbortController();
  req.signal.addEventListener('abort', () => ac.abort());

  // 5-minute timeout safety net (matches maxDuration above)
  const timeoutId = setTimeout(() => ac.abort(new Error('try-on timeout')), 295_000);

  try {
    const backendRes = await fetch(targetUrl, {
      method: 'POST',
      headers: forwardHeaders,
      body: req.body,
      // @ts-expect-error: Node.js fetch supports duplex streaming
      duplex: 'half',
      signal: ac.signal,
    });

    clearTimeout(timeoutId);

    // Stream the response back; copy status + headers
    const responseHeaders = new Headers();
    backendRes.headers.forEach((value, key) => {
      // Skip hop-by-hop headers that must not be forwarded
      if (!['transfer-encoding', 'connection', 'keep-alive'].includes(key.toLowerCase())) {
        responseHeaders.set(key, value);
      }
    });

    return new NextResponse(backendRes.body, {
      status: backendRes.status,
      statusText: backendRes.statusText,
      headers: responseHeaders,
    });
  } catch (err) {
    clearTimeout(timeoutId);

    const isAbort =
      err instanceof Error && (err.name === 'AbortError' || err.message.includes('timeout'));

    return NextResponse.json(
      {
        message: isAbort
          ? 'Try-on request timed out. The AI server may be busy — please try again.'
          : 'Failed to reach the try-on service.',
        error: err instanceof Error ? err.message : String(err),
      },
      { status: isAbort ? 504 : 502 },
    );
  }
}
