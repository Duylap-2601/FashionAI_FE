import { api, publicApi } from '@/lib/api';
import type { HttpOptions, QueryParams, UploadProgress } from '@/lib/http-types';
import type { AxiosInstance, AxiosRequestConfig, AxiosProgressEvent } from 'axios';

type DeleteOptions<TBody, TQuery> = HttpOptions<TQuery> & { body?: TBody };
type PayloadWithMeta = object & { __meta?: unknown };

function selectClient(auth: HttpOptions['auth'] | undefined): AxiosInstance {
  return auth === 'public' ? publicApi : api;
}

function toAxiosConfig<TQuery>(options?: HttpOptions<TQuery>, controller?: AbortController): AxiosRequestConfig {
  if (!options && !controller) return {};

  const { auth, onUploadProgress, ...rest } = options || {};
  void auth;
  return {
    ...rest,
    signal: controller?.signal || options?.signal,
    onUploadProgress: onUploadProgress ? (event) => onUploadProgress(toUploadProgress(event)) : undefined,
  };
}

function withBodyConfig<TQuery>(body: unknown, options?: HttpOptions<TQuery>, controller?: AbortController): AxiosRequestConfig {
  const config = toAxiosConfig(options, controller);
  if (body instanceof FormData && config.headers) {
    const headers = { ...config.headers } as Record<string, string>;
    for (const key of Object.keys(headers)) {
      if (key.toLowerCase() === 'content-type') delete headers[key];
    }
    config.headers = headers;
  }
  return config;
}

function toUploadProgress(event: AxiosProgressEvent): UploadProgress {
  const total = typeof event.total === 'number' ? event.total : undefined;
  return {
    loaded: event.loaded,
    total,
    percent: total && total > 0 ? Math.round((event.loaded / total) * 100) : undefined,
  };
}

function normalizeResponse<TResponse>(data: TResponse, status: number, meta?: unknown): TResponse {
  if (status === 204) return undefined as TResponse;
  if (meta && data && typeof data === 'object') {
    (data as PayloadWithMeta).__meta = meta;
  }
  return data;
}

function getResponseMeta(response: unknown) {
  return response && typeof response === 'object' && 'meta' in response
    ? (response as { meta?: unknown }).meta
    : undefined;
}

export async function get<TResponse = unknown, TQuery = QueryParams>(
  url: string,
  options?: HttpOptions<TQuery>,
  controller?: AbortController,
): Promise<TResponse> {
  const response = await selectClient(options?.auth).get<TResponse>(url, toAxiosConfig(options, controller));
  return normalizeResponse(response.data, response.status, getResponseMeta(response));
}

export async function post<TResponse = unknown, TBody = unknown, TQuery = QueryParams>(
  url: string,
  body?: TBody,
  options?: HttpOptions<TQuery>,
  controller?: AbortController,
): Promise<TResponse> {
  const response = await selectClient(options?.auth).post<TResponse>(url, body, withBodyConfig(body, options, controller));
  return normalizeResponse(response.data, response.status, getResponseMeta(response));
}

export async function patch<TResponse = unknown, TBody = unknown, TQuery = QueryParams>(
  url: string,
  body?: TBody,
  options?: HttpOptions<TQuery>,
  controller?: AbortController,
): Promise<TResponse> {
  const response = await selectClient(options?.auth).patch<TResponse>(url, body, withBodyConfig(body, options, controller));
  return normalizeResponse(response.data, response.status, getResponseMeta(response));
}

async function del<TResponse = unknown, TBody = unknown, TQuery = QueryParams>(
  url: string,
  options?: DeleteOptions<TBody, TQuery>,
  controller?: AbortController,
): Promise<TResponse> {
  const { body, ...rest } = options || {};
  const response = await selectClient(options?.auth).delete<TResponse>(url, {
    ...withBodyConfig(body, rest, controller),
    data: body,
  });
  return normalizeResponse(response.data, response.status, getResponseMeta(response));
}

export { del as delete };
export const http = { get, post, patch, delete: del };
export type { HttpOptions, QueryParams, QueryValue, UploadProgress } from '@/lib/http-types';
