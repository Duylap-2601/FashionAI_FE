const assert = require('node:assert/strict');
const test = require('node:test');
const { AxiosError } = require('axios');
const { createSourceLoader } = require('./helpers/load-source.cjs');

const user = { id: 'user-1', name: 'Test User', email: 'test@example.com', role: 'USER', tier: 'MEMBER' };
const later = () => new Date(Date.now() + 3_600_000).toISOString();

test('concurrent 401 responses share one refresh and preserve the user when refresh returns only a token', async () => {
  let refreshCalls = 0;
  let releaseRefresh;
  const refreshReady = new Promise((resolve) => { releaseRefresh = resolve; });
  const load = createSourceLoader({ globals: {
    fetch: async (url, init) => {
      assert.equal(url, '/api/backend/auth/refresh');
      assert.equal(init.method, 'POST');
      assert.equal(init.credentials, 'include');
      refreshCalls++;
      await refreshReady;
      return Response.json({ data: { accessToken: 'fresh-token', accessTokenExpiresAt: later() } });
    },
  } });
  const { useAuthStore } = load('@/features/auth/store/authStore');
  const { api, getValidAccessToken } = load('@/lib/api');
  useAuthStore.getState().setSession({ user, accessToken: 'old-token', accessTokenExpiresAt: later() });
  const attempts = [];
  api.defaults.adapter = async (config) => {
    const token = config.headers.Authorization;
    attempts.push(token);
    if (token === 'Bearer old-token') {
      throw new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, null, {
        status: 401, statusText: 'Unauthorized', headers: {}, config, data: {},
      });
    }
    assert.equal(token, 'Bearer fresh-token');
    return { status: 200, statusText: 'OK', headers: {}, config, data: { data: { id: 'ok' } } };
  };
  const requests = [api.get('/products'), api.get('/users/me'), api.get('/orders')];
  await new Promise((resolve) => setTimeout(resolve, 20));
  releaseRefresh();
  const responses = await Promise.all(requests);
  assert.equal(refreshCalls, 1);
  assert.equal(attempts.filter((value) => value === 'Bearer old-token').length, 3);
  assert.equal(attempts.filter((value) => value === 'Bearer fresh-token').length, 3);
  assert.ok(responses.every((response) => response.data.id === 'ok'));
  assert.equal(useAuthStore.getState().user.id, user.id);
  assert.equal(useAuthStore.getState().status, 'authenticated');
  // Streaming/socket callers use the same refreshed cache as Axios.
  assert.equal(await getValidAccessToken(), 'fresh-token');
  assert.equal(refreshCalls, 1);
});

test('an expiring token is refreshed once before parallel requests and raw auth never recurses through Axios', async () => {
  let refreshCalls = 0;
  const load = createSourceLoader({ globals: {
    fetch: async (url) => {
      assert.equal(url, '/api/backend/auth/refresh');
      refreshCalls++;
      await new Promise((resolve) => setTimeout(resolve, 5));
      return Response.json({ accessToken: 'renewed', accessTokenExpiresAt: later() });
    },
  } });
  const { useAuthStore } = load('@/features/auth/store/authStore');
  const { getValidAccessToken } = load('@/lib/api');
  useAuthStore.getState().setSession({ user, accessToken: 'expiring', accessTokenExpiresAt: new Date().toISOString() });
  assert.deepEqual(await Promise.all([getValidAccessToken(), getValidAccessToken()]), ['renewed', 'renewed']);
  assert.equal(refreshCalls, 1);
});

test('refresh rejection emits auth invalidation and does not retry indefinitely', async () => {
  let refreshCalls = 0;
  const load = createSourceLoader({ globals: {
    window: {},
    fetch: async () => {
      refreshCalls++;
      return Response.json({ message: 'Session expired' }, { status: 401 });
    },
  } });
  const events = [];
  load('@/features/auth/services/auth-events').subscribeAuthInvalidated((event) => events.push(event));
  const { useAuthStore } = load('@/features/auth/store/authStore');
  const { api } = load('@/lib/api');
  useAuthStore.getState().setSession({ user, accessToken: 'old', accessTokenExpiresAt: later() });
  api.defaults.adapter = async (config) => {
    throw new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, null, {
      status: 401, headers: {}, config, data: {},
    });
  };
  await assert.rejects(api.get('/products'), /Unauthorized/);
  assert.equal(refreshCalls, 1);
  assert.equal(events.length, 1);
  assert.equal(events[0].redirectTo, '/login');
});
