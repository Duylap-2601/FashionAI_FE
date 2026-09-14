import type { LiveTryOnGarment, LiveTryOnSessionResponse } from '@/features/try-on/types/live-try-on';

export interface LiveConnection {
  remoteStream: MediaStream;
  disconnect: () => void | Promise<void>;
  setGarment: (garment: LiveTryOnGarment) => Promise<void>;
}

export interface DecartRealtimeCallbacks {
  onConnectionState?: (state: string) => void;
  onError?: (message: string) => void;
  onGenerationTick?: (seconds: number) => void;
  onDiagnostic?: (message: string) => void;
}

interface DecartConnectionShape {
  disconnect?: () => void | Promise<void>;
  close?: () => void | Promise<void>;
  set?: (state: { prompt: string; image: Blob | string }) => void | Promise<void>;
  setImage?: (image: Blob | string) => void | Promise<void>;
  on?: (event: string, listener: (...args: unknown[]) => void) => void;
  off?: (event: string, listener: (...args: unknown[]) => void) => void;
}

interface DecartModuleShape {
  createDecartClient?: (options: { apiKey: string; telemetry?: boolean }) => {
    realtime: {
      connect: (stream: MediaStream, options: Record<string, unknown>) => Promise<unknown>;
    };
  };
  models?: {
    realtime: (model: string) => unknown;
  };
}

export async function connectDecartRealtime(
  session: LiveTryOnSessionResponse,
  cameraStream: MediaStream,
  callbacks: DecartRealtimeCallbacks = {},
): Promise<LiveConnection> {
  const sdk = await loadDecartSdk();
  if (!sdk.createDecartClient || !sdk.models?.realtime) throw new Error('Decart SDK realtime API is unavailable');

  const remoteStreamWaiter = createRemoteStreamWaiter(20000, callbacks);
  const client = sdk.createDecartClient({ apiKey: session.connection.clientToken });
  const rawConnection = await client.realtime.connect(cameraStream, {
    model: sdk.models.realtime(session.model),
    mirror: 'auto',
    resolution: '720p',
    onRemoteStream: (stream: MediaStream) => {
      remoteStreamWaiter.accept(stream);
    },
  });
  const connection = toConnectionShape(rawConnection);
  const offListeners = attachConnectionListeners(connection, callbacks);
  callbacks.onDiagnostic?.('connected; downloading garment image');
  const garmentImage = await fetchGarmentBlob(session.garment.imageUrl);
  callbacks.onDiagnostic?.(`garment downloaded ${Math.round(garmentImage.size / 1024)}KB`);
  if (connection.set) {
    await connection.set({ prompt: session.garment.prompt, image: garmentImage });
    callbacks.onDiagnostic?.('garment state applied');
  }
  const remoteStream = await remoteStreamWaiter.promise;

  return {
    remoteStream,
    disconnect: async () => {
      offListeners();
      await (connection.disconnect?.() ?? connection.close?.());
    },
    setGarment: async (garment) => {
      const garmentImage = await fetchGarmentBlob(garment.imageUrl);
      if (connection.set) {
        await connection.set({ prompt: garment.prompt, image: garmentImage });
        return;
      }
      if (connection.setImage) {
        await connection.setImage(garmentImage);
        return;
      }
      throw new Error('Decart SDK garment update API is unavailable');
    },
  };
}

function createRemoteStreamWaiter(timeoutMs: number, callbacks: DecartRealtimeCallbacks) {
  const cleanups: Array<() => void> = [];
  let settled = false;
  let resolvePromise: (stream: MediaStream) => void;
  let rejectPromise: (error: Error) => void;
  const promise = new Promise<MediaStream>((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  });

  const timer = window.setTimeout(() => {
    if (settled) return;
    settled = true;
    for (const cleanup of cleanups) cleanup();
    rejectPromise(new Error('Decart remote stream did not receive a video track.'));
  }, timeoutMs);

  const resolveWith = (stream: MediaStream) => {
    if (settled) return;
    settled = true;
    window.clearTimeout(timer);
    for (const cleanup of cleanups) cleanup();
    callbacks.onDiagnostic?.(`remote video track ready (${stream.getVideoTracks().length})`);
    resolvePromise(stream);
  };

  return {
    promise,
    accept: (stream: MediaStream) => {
      const tracks = stream.getVideoTracks();
      callbacks.onDiagnostic?.(`remote stream received tracks=${tracks.length}`);
      if (tracks.length > 0) {
        resolveWith(stream);
        return;
      }

      const handleAddTrack = (event: MediaStreamTrackEvent) => {
        if (event.track.kind === 'video') resolveWith(stream);
      };
      stream.addEventListener('addtrack', handleAddTrack);
      cleanups.push(() => stream.removeEventListener('addtrack', handleAddTrack));
    },
  };
}

async function fetchGarmentBlob(url: string) {
  const response = await fetch(url, { mode: 'cors', cache: 'no-store' });
  if (!response.ok) throw new Error(`Không tải được garment image (${response.status})`);
  const blob = await response.blob();
  if (!blob.type.startsWith('image/')) throw new Error(`Garment URL không trả về image content-type (${blob.type || 'unknown'})`);
  return blob;
}

export async function getDecartRealtimeVideoConstraints(modelName = 'lucy-vton-3.5'): Promise<MediaTrackConstraints> {
  const sdk = await loadDecartSdk();
  const model = sdk.models?.realtime(modelName);
  if (!model || typeof model !== 'object') return { facingMode: 'user' };
  const record = model as { fps?: unknown; width?: unknown; height?: unknown };
  return {
    facingMode: 'user',
    frameRate: typeof record.fps === 'number' ? record.fps : 25,
    width: typeof record.width === 'number' ? record.width : 1280,
    height: typeof record.height === 'number' ? record.height : 720,
  };
}

async function loadDecartSdk(): Promise<DecartModuleShape> {
  const mod = await import('@decartai/sdk');
  if (!mod || typeof mod !== 'object') throw new Error('Unable to load Decart SDK');
  return mod as unknown as DecartModuleShape;
}

function toConnectionShape(value: unknown): DecartConnectionShape {
  if (!value || typeof value !== 'object') throw new Error('Decart SDK returned an invalid connection');
  return value as DecartConnectionShape;
}

function attachConnectionListeners(connection: DecartConnectionShape, callbacks: DecartRealtimeCallbacks) {
  if (!connection.on) return () => undefined;
  const onConnectionChange = (state: unknown) => callbacks.onConnectionState?.(String(state));
  const onError = (error: unknown) => callbacks.onError?.(readSdkError(error));
  const onGenerationTick = (payload: unknown) => {
    const seconds = payload && typeof payload === 'object' && 'seconds' in payload ? (payload as { seconds?: unknown }).seconds : undefined;
    if (typeof seconds === 'number') callbacks.onGenerationTick?.(seconds);
  };
  const onDiagnostic = (payload: unknown) => callbacks.onDiagnostic?.(readDiagnostic(payload));
  const onStats = (payload: unknown) => callbacks.onDiagnostic?.(readStats(payload));
  connection.on('connectionChange', onConnectionChange);
  connection.on('error', onError);
  connection.on('generationTick', onGenerationTick);
  connection.on('diagnostic', onDiagnostic);
  connection.on('stats', onStats);
  return () => {
    connection.off?.('connectionChange', onConnectionChange);
    connection.off?.('error', onError);
    connection.off?.('generationTick', onGenerationTick);
    connection.off?.('diagnostic', onDiagnostic);
    connection.off?.('stats', onStats);
  };
}

function readSdkError(error: unknown) {
  if (!error || typeof error !== 'object') return 'Decart realtime error';
  const record = error as { code?: unknown; message?: unknown };
  const code = typeof record.code === 'string' ? `${record.code}: ` : '';
  const message = typeof record.message === 'string' ? record.message : 'Decart realtime error';
  return `${code}${message}`;
}

function readDiagnostic(payload: unknown) {
  if (!payload || typeof payload !== 'object') return 'diagnostic event';
  const record = payload as { name?: unknown; data?: unknown };
  const name = typeof record.name === 'string' ? record.name : 'diagnostic';
  return `diagnostic:${name}`;
}

function readStats(payload: unknown) {
  if (!payload || typeof payload !== 'object') return 'stats event';
  const record = payload as { glassToGlass?: { ttffMs?: unknown; medianMs?: unknown }; fps?: unknown };
  const ttff = typeof record.glassToGlass?.ttffMs === 'number' ? `ttff=${Math.round(record.glassToGlass.ttffMs)}ms` : '';
  const median = typeof record.glassToGlass?.medianMs === 'number' ? `median=${Math.round(record.glassToGlass.medianMs)}ms` : '';
  const fps = typeof record.fps === 'number' ? `fps=${Math.round(record.fps)}` : '';
  return ['stats', ttff, median, fps].filter(Boolean).join(' ');
}
