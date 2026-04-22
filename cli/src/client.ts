import { loadConfig, saveConfig } from './config.js';

export interface ApiResult<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

export class ApiClient {
  private baseUrl: string;

  constructor() {
    const config = loadConfig();
    this.baseUrl = config.baseUrl;
  }

  private getHeaders(): Record<string, string> {
    const config = loadConfig();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (config.sessionCookie) {
      headers['Cookie'] = config.sessionCookie;
    }
    return headers;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    options?: { skipAuth?: boolean }
  ): Promise<ApiResult<T>> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (!options?.skipAuth) {
      const config = loadConfig();
      if (config.sessionCookie) {
        headers['Cookie'] = config.sessionCookie;
      }
    }

    try {
      const res = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        redirect: 'manual',
      });

      if (res.status === 401 && !options?.skipAuth) {
        const refreshed = await this.refreshSession();
        if (refreshed) {
          return this.request(method, path, body, options);
        }
        return { ok: false, error: 'Unauthorized: session expired and re-login failed' };
      }

      const setCookie = res.headers.get('set-cookie');
      if (setCookie) {
        saveConfig({ sessionCookie: setCookie });
      }

      const text = await res.text();
      const data = text ? JSON.parse(text) : undefined;

      if (!res.ok) {
        return { ok: false, error: data?.error || data?.message || `HTTP ${res.status}` };
      }

      return { ok: true, data };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  private async refreshSession(): Promise<boolean> {
    const config = loadConfig();
    if (!config.agentKey) return false;

    const res = await fetch(`${this.baseUrl}/agent/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentKey: config.agentKey }),
    });

    if (!res.ok) return false;

    const setCookie = res.headers.get('set-cookie');
    if (setCookie) {
      saveConfig({ sessionCookie: setCookie });
      return true;
    }
    return false;
  }

  get<T>(path: string): Promise<ApiResult<T>> {
    return this.request<T>('GET', path);
  }

  post<T>(path: string, body: unknown, options?: { skipAuth?: boolean }): Promise<ApiResult<T>> {
    return this.request<T>('POST', path, body, options);
  }

  put<T>(path: string, body: unknown): Promise<ApiResult<T>> {
    return this.request<T>('PUT', path, body);
  }

  delete<T>(path: string): Promise<ApiResult<T>> {
    return this.request<T>('DELETE', path);
  }
}

export const client = new ApiClient();
