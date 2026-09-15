'use client';

import { useAuthStore } from '@/features/auth/store/authStore';
import { fetchLiveTryOnGarment } from '@/features/try-on/services/queries';
import { prepareLiveOutfitReference } from '@/features/try-on/services/live-outfit-reference';
import { createLiveTryOnSession, endLiveTryOnSession, pauseLiveTryOnSession, pauseLiveTryOnSessionKeepalive, resumeLiveTryOnSession } from '@/features/try-on/services/mutations';
import { connectDecartRealtime, getDecartRealtimeVideoConstraints, type LiveConnection } from '@/features/try-on/services/decart-realtime';
import type { LiveTryOnGarment, LiveTryOnSessionResponse, LiveTryOnStatus } from '@/features/try-on/types/live-try-on';
import { useCallback, useEffect, useRef, useState } from 'react';

export function useLiveTryOn() {
  const authStatus = useAuthStore((state) => state.status);
  const [status, setStatus] = useState<LiveTryOnStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [blockedUntil, setBlockedUntil] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [sdkState, setSdkState] = useState<string | null>(null);
  const [diagnostic, setDiagnostic] = useState<string | null>(null);
  const [appliedGarment, setAppliedGarment] = useState<LiveTryOnGarment | null>(null);
  const connectionRef = useRef<LiveConnection | null>(null);
  const cameraRef = useRef<MediaStream | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const epochRef = useRef(0);
  const countdownRef = useRef<number | null>(null);
  const firstFrameTimeoutRef = useRef<number | null>(null);
  const trackCleanupRef = useRef<(() => void) | null>(null);

  const clearCountdown = useCallback(() => {
    if (countdownRef.current != null) {
      window.clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, []);

  const clearFirstFrameTimeout = useCallback(() => {
    if (firstFrameTimeoutRef.current != null) {
      window.clearTimeout(firstFrameTimeoutRef.current);
      firstFrameTimeoutRef.current = null;
    }
  }, []);

  const disconnectLocal = useCallback(async () => {
    epochRef.current += 1;
    abortRef.current?.abort();
    abortRef.current = null;
    clearCountdown();
    clearFirstFrameTimeout();
    trackCleanupRef.current?.();
    trackCleanupRef.current = null;
    const connection = connectionRef.current;
    const stream = cameraRef.current;
    connectionRef.current = null;
    cameraRef.current = null;
    setRemoteStream(null);
    setCameraStream(null);
    setSdkState(null);

    try {
      await connection?.disconnect();
    } finally {
      stream?.getTracks().forEach((track) => track.stop());
    }
  }, [clearCountdown, clearFirstFrameTimeout]);

  const pause = useCallback(async (reason = 'page_pause') => {
    const activeSessionId = sessionIdRef.current;
    setStatus('pausing');
    await disconnectLocal();
    if (!activeSessionId) {
      setStatus('ended');
      return;
    }

    try {
      const paused = await pauseLiveTryOnSession(activeSessionId, reason);
      setSessionId(paused.sessionId);
      sessionIdRef.current = paused.sessionId;
      setBlockedUntil(paused.blockedUntil);
      setRemainingSeconds(paused.remainingSeconds);
      setAppliedGarment(paused.garment);
      setDiagnostic(`session paused on server: ${reason}`);
      setStatus('paused');
    } catch (err) {
      setError(readErrorMessage(err));
      setStatus('error');
    }
  }, [disconnectLocal]);

  const cleanup = useCallback(async (reason = 'client_stop', targetSessionId?: string) => {
    const activeSessionId = targetSessionId ?? sessionIdRef.current;
    setStatus('stopping');
    setDiagnostic(null);

    try {
      await disconnectLocal();
      if (activeSessionId) await endLiveTryOnSession(activeSessionId, reason);
      setError(null);
      sessionIdRef.current = null;
      setSessionId(null);
      setBlockedUntil(null);
      setAppliedGarment(null);
      setStatus('ended');
    } catch (err) {
      sessionIdRef.current = activeSessionId;
      setSessionId(activeSessionId);
      setError(readErrorMessage(err));
      setStatus('error');
    }
  }, [disconnectLocal]);

  const startCountdown = useCallback((durationSeconds: number) => {
    const startedAt = performance.now();
    setRemainingSeconds(durationSeconds);
    clearCountdown();
    countdownRef.current = window.setInterval(() => {
      const elapsed = Math.floor((performance.now() - startedAt) / 1000);
      const next = Math.max(0, durationSeconds - elapsed);
      setRemainingSeconds(next);
      if (next <= 0) void cleanup('duration_elapsed');
    }, 500);
  }, [cleanup, clearCountdown]);

  const start = useCallback(async (productId: string, resumeSessionId?: string, lowerProductId?: string) => {
    const epoch = epochRef.current + 1;
    epochRef.current = epoch;
    const abort = new AbortController();
    abortRef.current?.abort();
    abortRef.current = abort;
    setError(null);
    setAppliedGarment(null);
    setRemoteStream(null);
    setSdkState(null);
    setDiagnostic(null);
    setStatus('requesting-camera');

    try {
      const videoConstraints = await getDecartRealtimeVideoConstraints();
      const stream = await navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: false });
      if (epochRef.current !== epoch) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      cameraRef.current = stream;
      setCameraStream(stream);

      setStatus('preparing-garment');
      const outfitReference = lowerProductId
        ? await Promise.all([
          fetchLiveTryOnGarment(productId, abort.signal),
          fetchLiveTryOnGarment(lowerProductId, abort.signal),
        ]).then(([upper, lower]) => prepareLiveOutfitReference(upper, lower, abort.signal))
        : undefined;
      if (epochRef.current !== epoch) return;
      setStatus('connecting');
      const session = resumeSessionId
        ? await resumeLiveTryOnSession(resumeSessionId, productId)
        : await createLiveTryOnSession(productId, crypto.randomUUID(), abort.signal);
      setStatus('preparing-garment');
      await preloadImage(session.garment.imageUrl, abort.signal);
      setSessionId(session.sessionId);
      sessionIdRef.current = session.sessionId;
      setBlockedUntil(session.blockedUntil);
      startCountdown(session.remainingSeconds);

      setStatus('awaiting-first-frame');
      const connection = await withTimeout(
        connectDecartRealtime(session, stream, {
          onConnectionState: (state) => {
            setSdkState(state);
            if (state === 'reconnecting' || state === 'disconnected') void pause(`sdk_${state}`);
          },
          onError: (message) => setError(message),
          onGenerationTick: undefined,
          onDiagnostic: (message) => setDiagnostic(message),
        }, outfitReference),
        30000,
        'Không thể kết nối Decart trong thời gian cho phép.',
      );
      if (epochRef.current !== epoch) {
        await connection.disconnect();
        return;
      }
      connectionRef.current = connection;
      setRemoteStream(connection.remoteStream);
      setAppliedGarment(session.garment);
      trackCleanupRef.current = attachTrackEndedHandlers(connection.remoteStream, () => void cleanup('remote_track_ended'));
      clearFirstFrameTimeout();
      firstFrameTimeoutRef.current = window.setTimeout(() => {
        setError('Decart đã có video track nhưng không render frame trong 20 giây. Kiểm tra SDK state/diagnostic và thử lại với camera/sản phẩm khác.');
        void cleanup('first_frame_timeout');
      }, 20000);
    } catch (err) {
      if (abort.signal.aborted) return;
      cameraRef.current?.getTracks().forEach((track) => track.stop());
      cameraRef.current = null;
      setCameraStream(null);
      sessionIdRef.current = null;
      setStatus('error');
      setError(readErrorMessage(err));
    }
  }, [cleanup, clearFirstFrameTimeout, pause, startCountdown]);

  const updateGarment = useCallback(async (productId: string) => {
    void productId;
    setError('Không thể đổi sản phẩm trong phiên Live đang chạy. Hãy kết thúc Live rồi bắt đầu phiên mới.');
  }, []);

  const hasResumableSession = useCallback(() => Boolean(sessionIdRef.current), []);

  const markFirstFrame = useCallback(() => {
    clearFirstFrameTimeout();
    if (connectionRef.current) setStatus('live');
  }, [clearFirstFrameTimeout]);

  useEffect(() => {
    if (authStatus === 'unauthenticated') void cleanup('logout');
  }, [authStatus, cleanup]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && connectionRef.current) void pause('background');
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [pause]);

  useEffect(() => {
    const endOnPageHide = () => {
      if (sessionIdRef.current && connectionRef.current) pauseLiveTryOnSessionKeepalive(sessionIdRef.current, 'pagehide');
      connectionRef.current?.disconnect();
      cameraRef.current?.getTracks().forEach((track) => track.stop());
    };
    window.addEventListener('pagehide', endOnPageHide);
    window.addEventListener('beforeunload', endOnPageHide);
    return () => {
      window.removeEventListener('pagehide', endOnPageHide);
      window.removeEventListener('beforeunload', endOnPageHide);
    };
  }, []);

  useEffect(() => () => {
    epochRef.current += 1;
    abortRef.current?.abort();
    clearCountdown();
    clearFirstFrameTimeout();
    trackCleanupRef.current?.();
    connectionRef.current?.disconnect();
    cameraRef.current?.getTracks().forEach((track) => track.stop());
  }, [clearCountdown, clearFirstFrameTimeout]);

  return {
    status,
    error,
    cameraStream,
    remoteStream,
    sessionId,
    blockedUntil,
    remainingSeconds,
    sdkState,
    diagnostic,
    appliedGarment,
    start,
    stop: cleanup,
    pause,
    updateGarment,
    markFirstFrame,
    hasResumableSession,
  };
}

const LIVE_SESSION_STORAGE_KEY = 'fashionai.liveTryOn.session.v1';

function storeSession(session: LiveTryOnSessionResponse) {
  try {
    sessionStorage.setItem(LIVE_SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Session resume is best-effort only.
  }
}

function readStoredSession(productId?: string): LiveTryOnSessionResponse | null {
  try {
    const raw = sessionStorage.getItem(LIVE_SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LiveTryOnSessionResponse;
    if (productId && parsed.garment.productId !== productId) return null;
    if (new Date(parsed.connection.tokenExpiresAt).getTime() <= Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

function clearStoredSession() {
  try {
    sessionStorage.removeItem(LIVE_SESSION_STORAGE_KEY);
  } catch {
    // Ignore storage failures during cleanup.
  }
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string) {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(message)), timeoutMs);
    promise.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        window.clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function attachTrackEndedHandlers(stream: MediaStream, onEnded: () => void) {
  const tracks = stream.getTracks();
  for (const track of tracks) track.addEventListener('ended', onEnded, { once: true });
  return () => {
    for (const track of tracks) track.removeEventListener('ended', onEnded);
  };
}

function preloadImage(url: string, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    const image = new Image();
    const abort = () => reject(new DOMException('Aborted', 'AbortError'));
    signal.addEventListener('abort', abort, { once: true });
    image.onload = () => {
      signal.removeEventListener('abort', abort);
      resolve();
    };
    image.onerror = () => {
      signal.removeEventListener('abort', abort);
      reject(new Error('Không thể tải ảnh garment cho Live Try-On'));
    };
    image.src = url;
  });
}

function readErrorMessage(error: unknown) {
  if (error instanceof DOMException && error.name === 'NotAllowedError') return 'Bạn cần cấp quyền camera để bắt đầu Live Try-On.';
  if (error instanceof Error) return error.message;
  return 'Live Try-On gặp lỗi. Vui lòng thử lại sau.';
}
