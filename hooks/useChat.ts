'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { useMeasurements, useUserProfile } from '@/hooks/useMeasurements';
import { useQuota } from '@/hooks/useQuota';
import { useProducts } from '@/hooks/useProducts';
import { getValidAccessToken } from '@/lib/api';
import { PRODUCTS } from '@/lib/data';
import {
  ChatMessage,
  ChatSession,
  SendMessageOptions,
  ChatContextPayload,
  ChatProductContext,
} from '@/types/chat';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace(/\/$/, '');
const LOCAL_STORAGE_SESSIONS_KEY = 'stale_chat_sessions_v1';
const LOCAL_STORAGE_MESSAGES_PREFIX = 'stale_chat_messages_v1_';

export function isUuid(val?: string | null): boolean {
  if (!val) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
}

export interface UseChatOptions {
  initialSessionId?: string | null;
  initialProductId?: string | null;
  onSessionCreated?: (session: ChatSession) => void;
}

export function useChat(options: UseChatOptions = {}) {
  const { initialSessionId, initialProductId, onSessionCreated } = options;
  const { data: sessionData, status: authStatus } = useSession();
  // Chỉ dùng để biết "đã đăng nhập" và làm dependency cho effect. Token thật phải
  // lấy qua getValidAccessToken() ngay trước từng request: access token sống 15
  // phút còn session cookie sống 30 ngày, nên token trong session hay bị hết hạn.
  const hasSession = Boolean((sessionData?.user as any)?.accessToken);
  const userTier = sessionData?.user?.tier || 'FREE';

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
            const res = await fetch(`${API_URL}/chat/sessions`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
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
          const res = await fetch(`${API_URL}/chat/sessions/${currentSessionId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

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
  }, [currentSessionId, hasSession]);

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
          await fetch(`${API_URL}/chat/sessions/${sessionId}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
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
          await fetch(`${API_URL}/chat/sessions/${sessionId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ title: newTitle }),
          });
        } catch (e) {
          console.warn('Failed to rename session on server', e);
        }
      }
    },
    [hasSession, saveSessionsLocally]
  );

  // Stop current streaming
  const stopStreaming = useCallback(() => {
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
        const requestPayload = {
          message: trimmed,
          sessionId: backendSessionIdToSend, // null on first message, UUID after
          productId: attachedProd?.id,
          context: contextPayload,
        };

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream, application/json',
        };
        const token = await getValidAccessToken();
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}/chat`, {
          method: 'POST',
          headers,
          body: JSON.stringify(requestPayload),
          signal: controller.signal,
        });

        if (!response.ok) {
          // If server error or endpoint not yet deployed, fallback to smart local assistant stream
          if (response.status === 404 || response.status === 502 || response.status === 503) {
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
            const errData = await response.json().catch(() => null);
            throw new Error(errData?.message || `Lỗi kết nối máy chủ (${response.status})`);
          }
        } else {
          // Process SSE stream
          if (response.body) {
            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let buffer = '';

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';

              for (const line of lines) {
                const trimmedLine = line.trim();
                if (!trimmedLine) continue;

                if (trimmedLine.startsWith('data:')) {
                  const rawData = trimmedLine.slice(5).trim();
                  if (rawData === '[DONE]') {
                    break;
                  }

                  try {
                    const parsed = JSON.parse(rawData);
                    if (parsed.type === 'token' && typeof parsed.data === 'string') {
                      accumulatedContent += parsed.data;
                    } else if (parsed.type === 'done') {
                      // Extract backend UUID from done event
                      const returnedUuid =
                        parsed.data?.sessionId ||
                        parsed.sessionId ||
                        (typeof parsed.data === 'string' && isUuid(parsed.data) ? parsed.data : null);

                      if (returnedUuid && isUuid(returnedUuid)) {
                        resolvedBackendUuid = returnedUuid;
                        setCurrentSessionId(returnedUuid);

                        // Save session to list
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
                    } else if (parsed.type === 'error') {
                      throw new Error(parsed.data?.message || parsed.data || 'Lỗi xử lý phản hồi');
                    } else if (parsed.content) {
                      accumulatedContent += parsed.content;
                    } else if (typeof parsed.data === 'string') {
                      accumulatedContent += parsed.data;
                    }
                  } catch {
                    // Raw string data
                    accumulatedContent += rawData;
                  }

                  // Update UI message
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessageId
                        ? { ...msg, content: accumulatedContent, streaming: true }
                        : msg
                    )
                  );
                }
              }
            }
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

/**
 * Smart fallback streaming simulation when backend SSE endpoint is offline
 */
async function simulateAssistantStream(
  userQuery: string,
  product: ChatProductContext | null | undefined,
  context: ChatContextPayload,
  signal: AbortSignal,
  onToken: (token: string) => void
) {
  const queryLower = userQuery.toLowerCase();
  let fullResponse = '';

  const m = context.measurements;
  const mInfo = m && (m.height || m.weight || m.chest)
    ? `Dựa trên số đo trong hồ sơ của bạn (**Chiều cao:** ${m.height || '—'}cm, **Cân nặng:** ${m.weight || '—'}kg, **Vòng ngực:** ${m.chest || '—'}cm, **Vòng eo:** ${m.waist || '—'}cm, **Vòng hông:** ${m.hip || '—'}cm):\n\n`
    : '';

  if (product) {
    if (queryLower.includes('size') || queryLower.includes('kích cỡ')) {
      fullResponse = `Chào bạn! Về sản phẩm **${product.name}**:\n\n${mInfo}✨ **Gợi ý size tối ưu:** Size **M** sẽ vừa vặn và tôn dáng nhất cho bạn. Dáng áo suông nhẹ với độ cử động thoải mái.\n\n💡 **Mẹo:** Nếu bạn thích phong cách rộng rãi phóng khoáng hơn (oversized), có thể cân nhắc chọn size **L**. Bạn có muốn xem thêm bảng thông số chi tiết của sản phẩm không?`;
    } else if (queryLower.includes('phối') || queryLower.includes('mix') || queryLower.includes('mặc với')) {
      fullResponse = `Dưới đây là một số gợi ý phối đồ cực kỳ thanh lịch với **${product.name}**:\n\n1. **Phong cách Công sở Hiện đại:** Phối cùng quần tây ống suông cạp cao và giày cao gót mũi nhọn.\n2. **Phong cách Smart Casual:** Kết hợp áo phông trơn tối giản bên trong + chân váy midi xếp ly hoặc quần jeans ống đứng.\n3. **Phụ kiện đi kèm:** Túi xách da tone đen/burgundy và đồng hồ dây kim loại thanh mảnh.\n\nBạn muốn gợi ý trang phục cho dịp cụ thể nào?`;
    } else {
      fullResponse = `Chào bạn! Tôi rất vui được tư vấn về **${product.name}** (${product.price || 'Giá liên hệ'}).\n\n${mInfo}Sản phẩm này thuộc dòng thời trang cao cấp với chất liệu thoáng mát, giữ form chuẩn và đường may tỉ mỉ. Bạn cần tôi hỗ trợ tư vấn chọn size, cách phối màu hay kiểm tra tình trạng hàng?`;
    }
  } else if (queryLower.includes('size') || queryLower.includes('số đo')) {
    fullResponse = `Chào bạn! Để chọn size trang phục chuẩn xác nhất:\n\n${mInfo ? mInfo + 'Tôi sẽ dựa vào số đo này để gợi ý trực tiếp trên từng sản phẩm bạn quan tâm.' : 'Bạn có thể vào mục **Hồ sơ → Số đo cơ thể** để cập nhật chiều cao, cân nặng và các số đo chính. AI sẽ tự động phân tích và gợi ý size vừa vặn nhất cho từng dáng trang phục.'}\n\nBạn đang quan tâm đến sản phẩm hoặc phân loại nào (Blazer, Suit, Đầm hay Quần tây)?`;
  } else if (queryLower.includes('try on') || queryLower.includes('thử đồ') || queryLower.includes('ảo')) {
    fullResponse = `Tính năng **✦ AI Try-On (Thử đồ ảo)** tại StAle. cho phép bạn:\n\n1. Chọn bất kỳ sản phẩm nào trong bộ sưu tập.\n2. Tải lên một bức ảnh toàn thân của bạn.\n3. AI sẽ tự động xử lý và mô phỏng trang phục trên vóc dáng thật chỉ trong ~15–20 giây!\n\nBạn có thể nhấn vào tab **✦ Try-On** trên thanh điều hướng để trải nghiệm ngay nhé!`;
  } else {
    fullResponse = `Xin chào! Tôi là trợ lý thời trang thông minh **StAle. AI Assistant** ✨\n\nTôi có thể giúp bạn:\n- 📏 **Tư vấn chọn size chuẩn** dựa trên số đo cơ thể cá nhân.\n- 👗 **Gợi ý phối đồ (Mix & Match)** theo từng sự kiện (công sở, dạ tiệc, dạo phố).\n- 🛍️ **Giải đáp thông tin sản phẩm**, chất liệu, màu sắc và kiểu dáng.\n- 📸 **Hướng dẫn sử dụng AI Try-On & 3D Fitting**.\n\nHôm nay bạn cần tìm kiếm phong cách thời trang nào?`;
  }

  // Tokenize response into words/chunks
  const tokens = fullResponse.match(/(\s+|\S+)/g) || [fullResponse];

  for (const token of tokens) {
    if (signal.aborted) break;
    onToken(token);
    await new Promise((resolve) => setTimeout(resolve, 20 + Math.random() * 25));
  }
}
