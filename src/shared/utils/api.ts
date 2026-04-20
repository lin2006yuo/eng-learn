import { HttpCode, HttpCodeMessage } from '@/shared/types/http-code';
import { useAppStore } from '@/shared/store/appStore';
import type { ToastType } from '@/shared/types';

const statusCodeToToastType: Record<number, ToastType> = {
  [HttpCode.BAD_REQUEST]: 'warning',
  [HttpCode.UNAUTHORIZED]: 'warning',
  [HttpCode.FORBIDDEN]: 'error',
  [HttpCode.NOT_FOUND]: 'error',
  [HttpCode.INTERNAL_SERVER_ERROR]: 'error',
};

type FetchErrorToastMode = 'auto' | 'none' | 'always';

interface ApiFetchOptions extends RequestInit {
  showErrorToast?: FetchErrorToastMode;
}

async function processResponse<T>(
  response: Response,
  showErrorToast: FetchErrorToastMode = 'auto'
): Promise<T | undefined> {
  if (response.ok) {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    return null as T;
  }

  const body = await response.json().catch(() => ({ error: null }));
  const statusCode = response.status as HttpCode;
  const errorMessage = body.error || HttpCodeMessage[statusCode] || '操作失败';

  const shouldShowToast =
    showErrorToast === 'always' ||
    (showErrorToast === 'auto' && !response.ok);

  if (shouldShowToast) {
    const toastType = statusCodeToToastType[statusCode] || 'error';
    useAppStore.getState().showToast(errorMessage, toastType);
  }
}

interface ApiFetchResult<T> {
  data: T | undefined;
  ok: boolean;
}

export function apiFetch<T = unknown>(
  url: string,
  options?: ApiFetchOptions
): Promise<ApiFetchResult<T>> {
  const { showErrorToast = 'auto', ...fetchOptions } = options || {};

  return fetch(url, fetchOptions)
    .then((res) => processResponse<T>(res, showErrorToast))
    .then((data) => ({ data, ok: data !== undefined }));
}

export function apiGet<T = unknown>(
  url: string,
  params?: Record<string, string>,
  options?: ApiFetchOptions
): Promise<ApiFetchResult<T>> {
  const query = params
    ? '?' + new URLSearchParams(params).toString()
    : '';
  return apiFetch<T>(url + query, { method: 'GET', ...options });
}

export function apiPost<T = unknown>(
  url: string,
  body?: unknown,
  options?: ApiFetchOptions
): Promise<ApiFetchResult<T>> {
  return apiFetch<T>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    ...options,
  });
}

export function apiDelete<T = unknown>(
  url: string,
  options?: ApiFetchOptions
): Promise<ApiFetchResult<T>> {
  return apiFetch<T>(url, { method: 'DELETE', ...options });
}

export function apiPut<T = unknown>(
  url: string,
  body?: unknown,
  options?: ApiFetchOptions
): Promise<ApiFetchResult<T>> {
  return apiFetch<T>(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    ...options,
  });
}
