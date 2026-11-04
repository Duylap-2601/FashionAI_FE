const assert = require('node:assert/strict');
const test = require('node:test');
const { createSourceLoader } = require('./helpers/load-source.cjs');

class NextResponse extends Response {
  static json(body, init) {
    return new NextResponse(JSON.stringify(body), { ...init, headers: { 'content-type': 'application/json' } });
  }
}

test('try-on proxy drops the encoding headers of a body fetch already decompressed', async () => {
  // BE production trả br qua Cloudflare; fetch giải nén body nhưng header vẫn còn.
  const fetch = async () => new Response('{"resultUrl":"https://cdn/x.png"}', {
    status: 200,
    headers: { 'content-type': 'application/json', 'content-encoding': 'br', 'content-length': '31', 'x-request-id': 'abc' },
  });
  const load = createSourceLoader({ mocks: { 'next/server': { NextResponse } }, globals: { fetch } });
  const { POST } = load('@/app/api/try-on/route');

  const res = await POST({ headers: new Headers({ authorization: 'Bearer t' }), body: null, signal: new AbortController().signal });

  assert.equal(res.status, 200);
  assert.equal(res.headers.get('content-encoding'), null);
  assert.equal(res.headers.get('content-length'), null);
  assert.equal(res.headers.get('x-request-id'), 'abc');
  assert.deepEqual(await res.json(), { resultUrl: 'https://cdn/x.png' });
});
