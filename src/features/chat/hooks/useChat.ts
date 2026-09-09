'use client';

import { LOCAL_STORAGE_SESSIONS_KEY, LOCAL_STORAGE_MESSAGES_PREFIX } from '@/features/chat/constants/storage';
import { deleteChatSession, renameChatSession } from '@/features/chat/services/mutations';
import { fetchChatSessions, fetchChatSession } from '@/features/chat/services/queries';
import { isUuid, simulateAssistantStream } from '@/features/chat/services/chat-utils';
import type { UseChatOptions } from '@/features/chat/types/chat-hook';
import { useAuthStore } from '@/features/auth/store/authStore';
import {
  ChatContextPayload,
  ChatMessage,
  ChatProductContext,
  ChatSession,
  SendMessageOptions,
} from '@/features/chat/types/chat';
import { useMeasurements } from '@/features/measurements/hooks/useMeasurements';
import { PRODUCTS } from '@/features/products/constants/products';
import { useProducts } from '@/features/products/hooks/useProducts';
import { useUserProfile } from '@/features/profile/hooks/use-profile';
import { useQuota } from '@/features/subscription/hooks/useQuota';
import { getValidAccessToken } from '@/lib/api';
import { initChatSocket } from '@/lib/realtimeSocket';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { toast } from 'sonner';

export function useChat(options: UseChatOptions = {}) {
  const { initialSessionId, initialProductId, onSessionCreated } = options;
  const authStatus = useAuthStore((state) => state.status);
  const accessToken = useAuthStore((state) => state.accessToken);
  const userTier = useAuthStore((state) => state.user?.tier || 'FREE');
  // Chỉ dùng để biết "đã đăng nhập" và làm dependency cho effect. Token thật phải
  // lấy qua getValidAccessToken() ngay trước từng request: access token sống 15
  // phút còn refresh cookie sống lâu hơn, nên token runtime có thể cần refresh.
  const hasSession = authStatus === 'authenticated' && Boolean(accessToken);

  const { measurements } = useMeasurements();
  const { profile } = useUserProfile();
  const { quota, refetch: refetchQuota } = useQuota('CHATBOT');
  const { products: apiProducts } = useProducts();

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  // Only accept initialSessionId if it is a valid UUID
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(
    isUuid(initialSessionId) ? (initialSessionId as string) : null
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeProduct, setActiveProduct] = useState<ChatProductContext | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const chatSocketRef = useRef<Socket | null>(null);
  const currentSessionIdRef = useRef<string | null>(currentSessionId);
  currentSessionIdRef.current = currentSessionId;

  // Helper to find product details
  const findProduct = useCallback(
    (productId?: string): ChatProductContext | undefined => {
      if (!productId) return undefined;
      const allProducts = apiProducts.length > 0 ? apiProducts : PRODUCTS;
      const found = allProducts.find((p) => p.id === productId);
      if (found) {
        return {
          id: found.id,
          name: found.name,
          price: found.price,
          image: found.image,
          category: found.category,
        };
      }
      return undefined;
    },
    [apiProducts]
  );

  // Set initial product if provided
  useEffect(() => {
    if (initialProductId) {
      const prod = findProduct(initialProductId);
      if (prod) setActiveProduct(prod);
    }
  }, [initialProductId, findProduct]);

  // Load sessions on mount or when auth state changes (waits for hydration)
  useEffect(() => {
    let isMounted = true;

    if (authStatus === 'loading') {
      return;
    }

    async function loadSessions() {
      setIsLoadingSessions(true);
      try {
        // First try loading from backend if authenticated
        const token = hasSession ? await getValidAccessToken() : null;
        if (token) {
          try {
            const res = await fetchChatSessions(token);
            if (res.ok) {
              const body = await res.json().catch(() => null);
              const data = body?.data ?? body;
              if (Array.isArray(data)) {
                // Filter out non-UUID session objects
                const validSessions = data.filter((s: ChatSession) => isUuid(s.id));
                if (isMounted) {
                  setSessions(validSessions);
                  try {
                    localStorage.setItem(LOCAL_STORAGE_SESSIONS_KEY, JSON.stringify(validSessions));
                  } catch (e) {
                    console.warn(e);
                  }
                  setIsLoadingSessions(false);
                  return;
                }
              }
            }
          } catch (e) {
            console.warn('Could not fetch sessions from backend, loading local cache:', e);
          }
        }

        // Fallback: localStorage (filter out any non-UUID IDs)
        const cached = localStorage.getItem(LOCAL_STORAGE_SESSIONS_KEY);
        if (cached && isMounted) {
          try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed)) {
              const validCached = parsed.filter((s: ChatSession) => isUuid(s.id));
              setSessions(validCached);
            }
          } catch (e) {
            console.error('Error parsing cached sessions', e);
          }
        }
      } finally {
        if (isMounted) setIsLoadingSessions(false);
      }
    }

    loadSessions();

    return () => {
      isMounted = false;
    };
  }, [authStatus, hasSession]);

  // Load messages when currentSessionId changes (waits for hydration)
  useEffect(() => {
    let isMounted = true;

    if (!currentSessionId || !isUuid(currentSessionId)) {
      setMessages([]);
      return;
    }

    if (authStatus === 'loading') {
      return;
    }

    async function loadMessages() {
      setIsLoadingSession(true);
      setError(null);

      // Try local storage first for instant render
      const localCacheKey = `${LOCAL_STORAGE_MESSAGES_PREFIX}${currentSessionId}`;
      const cached = localStorage.getItem(localCacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && isMounted) {
            setMessages(parsed);
          }
        } catch (e) {
          console.error('Failed to parse cached messages', e);
        }
      }

      // If online, has token, and is valid UUID, sync from server
      const token =
        hasSession && isUuid(currentSessionId) ? await getValidAccessToken() : null;
      if (token) {
        try {
          const res = await fetchChatSession(currentSessionId, token);

          if (res.ok) {
            const body = await res.json().catch(() => null);
            const data = body?.data ?? body;
            const serverMessages = Array.isArray(data?.messages) ? data.messages : Array.isArray(data) ? data : null;
            if (serverMessages && isMounted) {
              setMessages(serverMessages);
              try {
                localStorage.setItem(localCacheKey, JSON.stringify(serverMessages));
              } catch (e) {
                console.warn(e);
              }
            }
          }
        } catch (e) {
          console.warn('Failed to fetch session messages from server, using local data', e);
        }
      }

      if (isMounted) setIsLoadingSession(false);
    }

    loadMessages();

    return () => {
      isMounted = false;
    };
  }, [currentSessionId, hasSession, authStatus]);

  // Helper to save messages to local storage
  const saveMessagesLocally = useCallback((sessionId: string, msgs: ChatMessage[]) => {
    if (!sessionId || !isUuid(sessionId)) return;
    try {
      localStorage.setItem(`${LOCAL_STORAGE_MESSAGES_PREFIX}${sessionId}`, JSON.stringify(msgs));
    } catch (e) {
      console.warn('Failed to save messages in localStorage', e);
    }
  }, []);

  // Helper to save sessions to local storage
  const saveSessionsLocally = useCallback((newSessions: ChatSession[]) => {
    try {
      const validOnly = newSessions.filter((s) => isUuid(s.id));
      localStorage.setItem(LOCAL_STORAGE_SESSIONS_KEY, JSON.stringify(validOnly));
    } catch (e) {
      console.warn('Failed to save sessions in localStorage', e);
    }
  }, []);

  // Start a new chat (resets currentSessionId to null so backend generates UUID on first message)
  const createSession = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsStreaming(false);
    setCurrentSessionId(null);
    setMessages([]);
    setError(null);
  }, []);

  // Switch active session
  const switchSession = useCallback((sessionId: string) => {
    if (!isUuid(sessionId)) return;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsStreaming(false);
    setCurrentSessionId(sessionId);
  }, []);

  // Delete a session
  const deleteSession = useCallback(
    async (sessionId: string) => {
      if (abortControllerRef.current && currentSessionId === sessionId) {
        abortControllerRef.current.abort();
        setIsStreaming(false);
      }

      // Optimistic update
      setSessions((prev) => {
        const next = prev.filter((s) => s.id !== sessionId);
        saveSessionsLocally(next);
        return next;
      });

      try {
        localStorage.removeItem(`${LOCAL_STORAGE_MESSAGES_PREFIX}${sessionId}`);
      } catch (e) {
        console.warn(e);
      }

      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
        setMessages([]);
      }

      // Sync with server if token available and is valid UUID
      const token = hasSession && isUuid(sessionId) ? await getValidAccessToken() : null;
      if (token) {
        try {
          await deleteChatSession(sessionId, token);
        } catch (e) {
          console.warn('Failed to delete session on server', e);
        }
      }

      toast.success('Đã xóa đoạn chat');
    },
    [currentSessionId, hasSession, saveSessionsLocally]
  );

  // Rename a session
  const renameSession = useCallback(
    async (sessionId: string, newTitle: string) => {
      setSessions((prev) => {
        const next = prev.map((s) => (s.id === sessionId ? { ...s, title: newTitle } : s));
        saveSessionsLocally(next);
        return next;
      });

      const token = hasSession && isUuid(sessionId) ? await getValidAccessToken() : null;
      if (token) {
        try {
          await renameChatSession(sessionId, newTitle, token);
        } catch (e) {
          console.warn('Failed to rename session on server', e);
        }
      }
    },
    [hasSession, saveSessionsLocally]
  );

  // Stop current streaming
  const stopStreaming = useCallback(() => {
    if (chatSocketRef.current) {
      chatSocketRef.current.off('chat:token');
      chatSocketRef.current.off('chat:done');
      chatSocketRef.current.off('chat:error');
      chatSocketRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setMessages((prev) =>
      prev.map((msg) => (msg.streaming ? { ...msg, streaming: false } : msg))
    );
  }, []);

  // Clear messages in current session
  const clearCurrentChat = useCallback(() => {
    stopStreaming();
    if (currentSessionId) {
      setMessages([]);
      saveMessagesLocally(currentSessionId, []);
    }
  }, [currentSessionId, stopStreaming, saveMessagesLocally]);

  // Send message and stream response
  const sendMessage = useCallback(
    async (content: string, sendOptions: SendMessageOptions = {}) => {
      const trimmed = content.trim();
      if (!trimmed || isStreaming) return;

      // Abort any ongoing stream
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      // Determine session ID: only pass to backend if it is a valid UUID, otherwise null
      const requestedId = sendOptions.sessionId || currentSessionIdRef.current;
      const backendSessionIdToSend: string | null = isUuid(requestedId) ? (requestedId as string) : null;

      const attachedProd = sendOptions.productId
        ? findProduct(sendOptions.productId)
        : activeProduct;

      // Create user message
      const userMessageId = `user_${Date.now()}`;
      const userMessage: ChatMessage = {
        id: userMessageId,
        role: 'user',
        content: trimmed,
        sessionId: backendSessionIdToSend || '',
        createdAt: new Date().toISOString(),
        productId: attachedProd?.id,
        product: attachedProd || undefined,
      };

      // Create initial assistant placeholder
      const assistantMessageId = `assistant_${Date.now() + 1}`;
      const initialAssistantMessage: ChatMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        streaming: true,
        sessionId: backendSessionIdToSend || '',
        createdAt: new Date().toISOString(),
      };

      const updatedMessagesWithUser = [...messages, userMessage, initialAssistantMessage];
      setMessages(updatedMessagesWithUser);
      setIsStreaming(true);
      setError(null);

      // Build context payload from profile & measurements
      const contextPayload: ChatContextPayload = sendOptions.customContext || {
        measurements: measurements || undefined,
        tier: String(userTier),
        gender: profile?.gender,
      };

      let accumulatedContent = '';
      let resolvedBackendUuid: string | null = backendSessionIdToSend;

      try {
        const token = await getValidAccessToken();
        let usedWs = false;

        try {
          const socket = initChatSocket(token || '');
          chatSocketRef.current = socket;

          await new Promise<void>((resolve, reject) => {
            const timeoutId = setTimeout(() => {
              cleanup();
              reject(new Error('WS_TIMEOUT'));
            }, 12000);

            const onToken = ({ data }: { data: string }) => {
              clearTimeout(timeoutId);
              usedWs = true;
              if (typeof data === 'string') {
                accumulatedContent += data;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: accumulatedContent, streaming: true }
                      : msg
                  )
                );
              }
            };

            const onDone = ({ sessionId }: { sessionId?: string }) => {
              clearTimeout(timeoutId);
              cleanup();
              usedWs = true;

              const returnedUuid = sessionId && isUuid(sessionId) ? sessionId : null;
              if (returnedUuid) {
                resolvedBackendUuid = returnedUuid;
                setCurrentSessionId(returnedUuid);

                const sessionTitle = trimmed.length > 30 ? `${trimmed.substring(0, 30)}...` : trimmed;
                const newSessionObj: ChatSession = {
                  id: returnedUuid,
                  title: sessionTitle,
                  updatedAt: new Date().toISOString(),
                  createdAt: new Date().toISOString(),
                  lastMessage: trimmed,
                  lastRole: 'user',
                };

                setSessions((prev) => {
                  const existingIdx = prev.findIndex((s) => s.id === returnedUuid);
                  let next: ChatSession[];
                  if (existingIdx >= 0) {
                    next = [...prev];
                    next[existingIdx] = {
                      ...next[existingIdx],
                      lastMessage: trimmed,
                      updatedAt: new Date().toISOString(),
                    };
                  } else {
                    next = [newSessionObj, ...prev];
                  }
                  saveSessionsLocally(next);
                  return next;
                });

                if (onSessionCreated) {
                  onSessionCreated(newSessionObj);
                }
              }
              resolve();
            };

            const onError = ({ code, message }: { code: string; message: string }) => {
              clearTimeout(timeoutId);
              cleanup();
              usedWs = true;
              if (code === 'QUOTA_EXCEEDED') {
                toast.error('Bạn đã dùng hết lượt Chatbot hôm nay', {
                  description: message || 'Vui lòng quay lại vào ngày mai hoặc nâng cấp tài khoản.',
                });
              } else if (code === 'BUSY') {
                toast.warning('Tin nhắn trước vẫn đang được xử lý...');
              }
              reject(new Error(message || `Lỗi phản hồi chatbot [${code}]`));
            };

            const onConnectError = (err: Error) => {
              clearTimeout(timeoutId);
              cleanup();
              if (err.message === 'UNAUTHORIZED') {
                toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                reject(new Error('UNAUTHORIZED'));
              } else {
                reject(new Error('WS_CONNECT_FAILED'));
              }
            };

            function cleanup() {
              socket.off('chat:token', onToken);
              socket.off('chat:done', onDone);
              socket.off('chat:error', onError);
              socket.off('connect_error', onConnectError);
            }

            socket.on('chat:token', onToken);
            socket.on('chat:done', onDone);
            socket.on('chat:error', onError);
            socket.once('connect_error', onConnectError);

            // Gửi tin nhắn qua Socket.IO (/chat namespace)
            socket.emit('chat:send', {
              message: trimmed,
              sessionId: backendSessionIdToSend || undefined,
              productId: attachedProd?.id,
              context: contextPayload,
            });
          });
        } catch (wsErr: unknown) {
          // Fallback simulation nếu socket chưa sẵn sàng hoặc kết nối lỗi trước khi nhận token
          const wsMessage = wsErr instanceof Error ? wsErr.message : undefined;
          if (!usedWs && (wsMessage === 'WS_TIMEOUT' || wsMessage === 'WS_CONNECT_FAILED')) {
            console.warn('[Chat] WebSocket fallback triggered:', wsMessage);
            await simulateAssistantStream(
              trimmed,
              attachedProd,
              contextPayload,
              controller.signal,
              (token) => {
                accumulatedContent += token;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: accumulatedContent, streaming: true }
                      : msg
                  )
                );
              }
            );
          } else {
            throw wsErr;
          }
        }

        // Finalize message
        const finalSessionId = resolvedBackendUuid || '';
        const finalMessages = updatedMessagesWithUser.map((msg) =>
          msg.id === assistantMessageId
            ? {
              ...msg,
              content: accumulatedContent || 'Tôi đã tiếp nhận câu hỏi của bạn. Hãy cho tôi biết thêm chi tiết để hỗ trợ tốt nhất nhé!',
              streaming: false,
              sessionId: finalSessionId,
            }
            : {
              ...msg,
              sessionId: finalSessionId,
            }
        );

        setMessages(finalMessages);
        if (finalSessionId && isUuid(finalSessionId)) {
          saveMessagesLocally(finalSessionId, finalMessages);
        }

        // Refresh quota after message
        refetchQuota();
      } catch (err: unknown) {
        const errorObj = err as { name?: string; message?: string };
        if (errorObj?.name === 'AbortError') {
          // User deliberately cancelled stream
          return;
        }

        console.error('Chat error:', err);
        const errMsg = errorObj?.message || 'Đã có lỗi xảy ra trong quá trình phản hồi.';
        setError(errMsg);

        // Update assistant message with error state
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? {
                ...msg,
                content: accumulatedContent
                  ? `${accumulatedContent}\n\n*(Đã dừng do gián đoạn kết nối)*`
                  : 'Rất tiếc, đã có lỗi xảy ra khi kết nối với máy chủ AI. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau.',
                streaming: false,
                isError: true,
              }
              : msg
          )
        );

        toast.error('Lỗi phản hồi chatbot', {
          description: errMsg,
        });
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [
      isStreaming,
      findProduct,
      activeProduct,
      messages,
      measurements,
      userTier,
      profile?.gender,
      saveSessionsLocally,
      refetchQuota,
      saveMessagesLocally,
      onSessionCreated,
    ]
  );

  return {
    sessions,
    currentSessionId,
    messages,
    isStreaming,
    isLoadingSession,
    isLoadingSessions,
    error,
    quota,
    activeProduct,
    setActiveProduct,
    sendMessage,
    stopStreaming,
    createSession,
    switchSession,
    deleteSession,
    renameSession,
    clearCurrentChat,
    refetchQuota,
  };
}
