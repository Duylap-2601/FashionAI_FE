'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/** A single auto-captured frame from the live try-on stream. */
export interface LiveCapture {
  id: string;
  /** Data URL (JPEG) of the captured frame. */
  dataUrl: string;
  /** ISO timestamp when the frame was captured. */
  capturedAt: string;
  /** Session ID the capture belongs to. */
  sessionId: string;
}

/** Default interval (ms) between auto-captures once the stream is stable. */
const AUTO_CAPTURE_INTERVAL_MS = 5_000;

/** Delay (ms) after the stream first goes live before the first capture fires.
 *  Gives the user a moment to settle into frame. */
const INITIAL_STABILITY_DELAY_MS = 4_000;

/** Maximum captures kept in memory per session to avoid memory pressure. */
const MAX_CAPTURES = 20;

interface UseAutoCapture {
  captures: LiveCapture[];
  /** Whether auto-capture is currently active. */
  isAutoCapturing: boolean;
  /** Toggle auto-capture on/off. */
  setAutoCapture: (enabled: boolean) => void;
  /** Manually trigger a capture right now. */
  captureNow: () => void;
  /** Remove a specific capture by id. */
  removeCapture: (id: string) => void;
  /** Clear all captures. */
  clearCaptures: () => void;
  /** Download a capture as JPEG. */
  downloadCapture: (capture: LiveCapture) => void;
}

/**
 * Auto-captures still frames from the live try-on remote video at a regular
 * interval (~5 s) once the stream is stable.  This lets the user review how
 * they looked without having to walk up to the device to pause/screenshot.
 *
 * @param videoRef  Ref to the `<video>` element rendering the remote stream.
 * @param isLive    Whether the live try-on stream is currently active.
 * @param sessionId Current session id (captures are tagged with it).
 */
export function useAutoCapture(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  isLive: boolean,
  sessionId: string | null,
): UseAutoCapture {
  const [captures, setCaptures] = useState<LiveCapture[]>([]);
  const [enabled, setEnabled] = useState(true);
  const intervalRef = useRef<number | null>(null);
  const stabilityRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Lazily create an offscreen canvas for drawing video frames.
  const getCanvas = useCallback(() => {
    if (!canvasRef.current) canvasRef.current = document.createElement('canvas');
    return canvasRef.current;
  }, []);

  /** Capture a single frame from the video element. Returns null if not ready. */
  const captureFrame = useCallback((): LiveCapture | null => {
    const video = videoRef.current;
    if (!video || video.readyState < 2 || video.videoWidth === 0) return null;
    if (!sessionId) return null;

    const canvas = getCanvas();
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    return {
      id: crypto.randomUUID(),
      dataUrl,
      capturedAt: new Date().toISOString(),
      sessionId,
    };
  }, [getCanvas, sessionId, videoRef]);

  /** Append a captured frame to the gallery. */
  const appendCapture = useCallback((frame: LiveCapture) => {
    setCaptures((prev) => {
      const next = [...prev, frame];
      // Keep only the most recent MAX_CAPTURES.
      return next.length > MAX_CAPTURES ? next.slice(next.length - MAX_CAPTURES) : next;
    });
  }, []);

  const captureNow = useCallback(() => {
    const frame = captureFrame();
    if (frame) appendCapture(frame);
  }, [captureFrame, appendCapture]);

  const removeCapture = useCallback((id: string) => {
    setCaptures((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const clearCaptures = useCallback(() => setCaptures([]), []);

  const downloadCapture = useCallback((capture: LiveCapture) => {
    const a = document.createElement('a');
    a.href = capture.dataUrl;
    const date = new Date(capture.capturedAt);
    const ts = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}_${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}${String(date.getSeconds()).padStart(2, '0')}`;
    a.download = `tryon_capture_${ts}.jpg`;
    a.click();
  }, []);

  // Clear captures when session changes.
  useEffect(() => {
    if (!sessionId) return;
    setCaptures([]);
  }, [sessionId]);

  // Start/stop interval based on isLive + enabled.
  useEffect(() => {
    const clearTimers = () => {
      if (stabilityRef.current != null) {
        window.clearTimeout(stabilityRef.current);
        stabilityRef.current = null;
      }
      if (intervalRef.current != null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    if (!isLive || !enabled) {
      clearTimers();
      return;
    }

    // Wait for the initial stability delay before starting captures.
    stabilityRef.current = window.setTimeout(() => {
      // Capture the first frame immediately after stability delay.
      const firstFrame = captureFrame();
      if (firstFrame) appendCapture(firstFrame);

      // Then capture periodically.
      intervalRef.current = window.setInterval(() => {
        const frame = captureFrame();
        if (frame) appendCapture(frame);
      }, AUTO_CAPTURE_INTERVAL_MS);
    }, INITIAL_STABILITY_DELAY_MS);

    return clearTimers;
  }, [isLive, enabled, captureFrame, appendCapture]);

  return {
    captures,
    isAutoCapturing: isLive && enabled,
    setAutoCapture: setEnabled,
    captureNow,
    removeCapture,
    clearCaptures,
    downloadCapture,
  };
}
