import { io, Socket } from 'socket.io-client';
import { getValidAccessToken } from '@/lib/api';

let realtimeSocket: Socket | null = null;
let chatSocket: Socket | null = null;

/**
 * Lấy WebSocket URL (backend origin KHÔNG có prefix /api)
 */
export function getWebSocketUrl(): string {
  let url = process.env.NEXT_PUBLIC_WS_URL || '';

  // Nếu người dùng vô tình truyền URL có /api ở đuôi, tự động loại bỏ
  if (url) {
    url = url.replace(/\/$/, '').replace(/\/api$/, '');
    return url;
  }

  // Fallback theo hostname trình duyệt
  if (typeof window !== 'undefined') {
    const isLocalhost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';
    if (isLocalhost) {
      return 'http://localhost:3002';
    }
  }

  return 'https://api.yourfashionai.com';
}

/**
 * Khởi tạo kết nối Socket.IO tới root namespace ('/') cho notifications & events
 */
export function initRealtimeSocket(token: string): Socket {
  if (realtimeSocket && realtimeSocket.connected) {
    realtimeSocket.auth = { token };
    return realtimeSocket;
  }

  if (realtimeSocket) {
    realtimeSocket.disconnect();
  }

  const wsUrl = getWebSocketUrl();

  realtimeSocket = io(wsUrl, {
    transports: ['websocket'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    auth: {
      token,
    },
  });

  realtimeSocket.on('connect', () => {
    console.log('[Realtime] Connected to notification server (/)');
  });

  realtimeSocket.on('connect_error', (error: any) => {
    console.warn('[Realtime] Notification socket connect_error:', error?.message || error);
  });

  realtimeSocket.on('token:expiring', async ({ expiresInMs }: { expiresInMs: number }) => {
    console.warn(`[Realtime] Token expiring in ${expiresInMs}ms, refreshing...`);
    try {
      const newToken = await getValidAccessToken();
      if (newToken) {
        if (realtimeSocket?.connected) {
          realtimeSocket.emit('auth:refresh', { token: newToken });
        }
        if (chatSocket?.connected) {
          chatSocket.emit('auth:refresh', { token: newToken });
        }
      }
    } catch (err) {
      console.error('[Realtime] Failed to refresh token for socket:', err);
    }
  });

  realtimeSocket.on('token:expired', () => {
    console.error('[Realtime] Token expired, disconnecting sockets.');
    disconnectAllSockets();
  });

  realtimeSocket.on('disconnect', (reason) => {
    console.log('[Realtime] Notification socket disconnected:', reason);
  });

  return realtimeSocket;
}

/**
 * Khởi tạo kết nối Socket.IO tới namespace '/chat' cho AI Chatbot
 */
export function initChatSocket(token: string): Socket {
  if (chatSocket && chatSocket.connected) {
    chatSocket.auth = { token };
    return chatSocket;
  }

  if (chatSocket) {
    chatSocket.disconnect();
  }

  const wsUrl = getWebSocketUrl();

  chatSocket = io(`${wsUrl}/chat`, {
    transports: ['websocket'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    auth: {
      token,
    },
  });

  chatSocket.on('connect', () => {
    console.log('[Realtime] Connected to chat server (/chat)');
  });

  chatSocket.on('connect_error', (error: any) => {
    console.warn('[Realtime] Chat socket connect_error:', error?.message || error);
  });

  chatSocket.on('disconnect', (reason) => {
    console.log('[Realtime] Chat socket disconnected:', reason);
  });

  return chatSocket;
}

export function getRealtimeSocket(): Socket | null {
  return realtimeSocket;
}

export function getChatSocket(): Socket | null {
  return chatSocket;
}

export function disconnectRealtimeSocket() {
  if (realtimeSocket) {
    realtimeSocket.removeAllListeners();
    realtimeSocket.disconnect();
    realtimeSocket = null;
  }
}

export function disconnectChatSocket() {
  if (chatSocket) {
    chatSocket.removeAllListeners();
    chatSocket.disconnect();
    chatSocket = null;
  }
}

export function disconnectAllSockets() {
  disconnectRealtimeSocket();
  disconnectChatSocket();
}
