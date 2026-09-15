const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { createSourceLoader } = require('./load-source.cjs');

function renderLiveWorkspace({ status = 'idle', combo = false, remaining = 42, dailyRemaining = 240, serverStatus, localSession = true } = {}) {
  const noop = () => {};
  const active = Boolean(serverStatus) || (status !== 'idle' && status !== 'ended');
  const load = createSourceLoader({ mocks: {
    react: { ...React, useState: () => [combo, noop] },
    '@/features/try-on/hooks/use-live-try-on': { useLiveTryOn: () => ({
      status, remainingSeconds: remaining, sessionId: active && localSession ? 'session-1' : null,
      cameraStream: null, remoteStream: null, markFirstFrame: noop, pause: noop, start: noop, stop: noop,
    }) },
    '@/features/subscription/hooks/useQuota': { useLiveTryOnQuota: () => ({
      quota: { enabled: true, eligible: true, limit: 300, remaining: dailyRemaining, allocated: 18, reserved: active ? 60 : 0, maxDurationSeconds: 60,
        activeSession: active ? { sessionId: 'session-1', status: serverStatus ?? (status === 'paused' ? 'PAUSED' : 'ACTIVE'), remainingSeconds: remaining } : null },
      isLoading: false, isError: false, refetch: noop,
    }) },
  } });
  const { LiveTryOnWorkspace } = load('@/features/try-on/components/live-try-on-workspace');
  const product = { id: '11111111-1111-4111-8111-111111111111', name: 'Áo sơ mi linen', image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3C/svg%3E' };
  return renderToStaticMarkup(React.createElement(LiveTryOnWorkspace, {
    selectedProduct: product, upperProduct: product, lowerProduct: { ...product, id: '22222222-2222-4222-8222-222222222222', name: 'Quần suông kem' },
    onOpenCatalog: noop, onOpenUpperCatalog: noop, onOpenLowerCatalog: noop, onSwitchToPhoto: noop,
  }));
}

module.exports = { renderLiveWorkspace };
