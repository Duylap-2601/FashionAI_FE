import { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

type RetriableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };
type ApiEnvelope = { data?: unknown; meta?: unknown };

interface SetupApiInterceptorsOptions {
  api: AxiosInstance;
  publicApi: AxiosInstance;
  getValidAccessToken: () => Promise<string | null>;
  refreshAccessToken: () => Promise<string | null>;
  invalidateSessionCache: () => void;
}

export function setupApiInterceptors({
  api,
  publicApi,
  getValidAccessToken,
  refreshAccessToken,
  invalidateSessionCache,
}: SetupApiInterceptorsOptions) {
  publicApi.interceptors.response.use((response) => {
    unwrapApiResponse(response);
    return response;
  });

  api.interceptors.request.use(
    async (config) => {
      const accessToken = await getValidAccessToken();
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  api.interceptors.response.use(
    (response) => {
      unwrapApiResponse(response);
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as RetriableRequestConfig | undefined;
      const status = error.response?.status;
      const url = originalRequest?.url || '';

      if (
        !originalRequest ||
        status !== 401 ||
        originalRequest._retry ||
        url.includes('/auth/refresh') ||
        url.includes('/auth/login')
      ) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const newAccessToken = await refreshAccessToken();
        if (!newAccessToken) {
          return Promise.reject(error);
        }

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        invalidateSessionCache();
        return Promise.reject(refreshError);
      }
    }
  );
}

function unwrapApiResponse(response: AxiosResponse<unknown>) {
  const body = response.data;
  if (!isApiEnvelope(body) || !('data' in body)) return;

  response.data = body.data;

  if (body.meta && response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
    (response.data as Record<string, unknown>).__meta = body.meta;
  }
}

function isApiEnvelope(value: unknown): value is ApiEnvelope {
  return Boolean(value && typeof value === 'object');
}
