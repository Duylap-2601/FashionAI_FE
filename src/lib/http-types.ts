export type QueryValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryValue | readonly QueryValue[]>;

export interface UploadProgress {
  loaded: number;
  total?: number;
  percent?: number;
}

export interface HttpOptions<TQuery = QueryParams> {
  params?: TQuery;
  headers?: Record<string, string>;
  timeout?: number;
  signal?: AbortSignal;
  auth?: 'required' | 'public';
  onUploadProgress?: (progress: UploadProgress) => void;
}
