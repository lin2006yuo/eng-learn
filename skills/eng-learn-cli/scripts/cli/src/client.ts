import { loadConfig, saveConfig } from './config.js';

export interface ApiResult<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

function deriveOrigin(baseUrl: string): string {
  try {
    return new URL(baseUrl).origin;
  } catch {
    return '';
  }
}

export class ApiClient {
  private getHeaders(skipAuth = false): Record<string, string> {
    const config = loadConfig();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (!skipAuth && config.sessionCookie) {
      headers['Cookie'] = config.sessionCookie;
    }
    const origin = deriveOrigin(config.baseUrl);
    if (origin) {
      headers['Origin'] = origin;
    }
    return headers;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    options?: { skipAuth?: boolean }
  ): Promise<ApiResult<T>> {
    const config = loadConfig();
    const url = `${config.baseUrl}${path}`;
    const headers = this.getHeaders(options?.skipAuth);

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

      if (!res.ok) {
        let errorMsg = `HTTP ${res.status}`;
        try {
          const body = text ? JSON.parse(text) : undefined;
          errorMsg = body?.error || body?.message || errorMsg;
        } catch {
          // response is not JSON (e.g. HTML redirect)
        }
        return { ok: false, error: errorMsg };
      }

      const data = text ? JSON.parse(text) : undefined;
      return { ok: true, data };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  private async refreshSession(): Promise<boolean> {
    const config = loadConfig();
    if (!config.agentKey) return false;

    const res = await fetch(`${config.baseUrl}/agent/login`, {
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
