import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getSession, signIn } from 'next-auth/react';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

type RetriableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

export const api = axios.create({
  baseURL,
  timeout: 30000,
  withCredentials: true,
});

api.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session?.user?.accessToken) {
    config.headers.Authorization = `Bearer ${session.user.accessToken}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use((response) => {
  unwrapApiResponse(response);
  return response;
}, async (error: AxiosError) => {
  const originalRequest = error.config as RetriableRequestConfig | undefined;
  const status = error.response?.status;
  const url = originalRequest?.url || '';

  if (!originalRequest || status !== 401 || originalRequest._retry || url.includes('/auth/refresh')) {
    return Promise.reject(error);
  }

  originalRequest._retry = true;

  try {
    const refreshResponse = await axios.post(`${baseURL.replace(/\/$/, '')}/auth/refresh`, null, {
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' },
    });

    const payload = refreshResponse.data?.data ?? refreshResponse.data;
    if (!payload?.accessToken || !payload?.user) {
      return Promise.reject(error);
    }

    await signIn('backend-session', {
      accessToken: payload.accessToken,
      accessTokenExpiresAt: payload.accessTokenExpiresAt,
      user: JSON.stringify(payload.user),
      redirect: false,
    });

    originalRequest.headers.Authorization = `Bearer ${payload.accessToken}`;
    return api(originalRequest);
  } catch (refreshError) {
    return Promise.reject(refreshError);
  }
});

function unwrapApiResponse(response: any) {
  const body = response.data;
  if (body && typeof body === 'object' && 'data' in body) {
    response.data = body.data;
    if (body.meta && response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
      response.data.__meta = body.meta;
    }
  }
}
