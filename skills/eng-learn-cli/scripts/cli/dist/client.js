import { loadConfig, saveConfig } from './config.js';
function deriveOrigin(baseUrl) {
    try {
        return new URL(baseUrl).origin;
    }
    catch {
        return '';
    }
}
export class ApiClient {
    getHeaders(skipAuth = false) {
        const config = loadConfig();
        const headers = {
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
    async request(method, path, body, options) {
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
                }
                catch {
                    // response is not JSON (e.g. HTML redirect)
                }
                return { ok: false, error: errorMsg };
            }
            const data = text ? JSON.parse(text) : undefined;
            return { ok: true, data };
        }
        catch (err) {
            return { ok: false, error: err instanceof Error ? err.message : String(err) };
        }
    }
    async refreshSession() {
        const config = loadConfig();
        if (!config.agentKey)
            return false;
        const res = await fetch(`${config.baseUrl}/agent/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ agentKey: config.agentKey }),
        });
        if (!res.ok)
            return false;
        const setCookie = res.headers.get('set-cookie');
        if (setCookie) {
            saveConfig({ sessionCookie: setCookie });
            return true;
        }
        return false;
    }
    get(path) {
        return this.request('GET', path);
    }
    post(path, body, options) {
        return this.request('POST', path, body, options);
    }
    put(path, body) {
        return this.request('PUT', path, body);
    }
    delete(path) {
        return this.request('DELETE', path);
    }
}
export const client = new ApiClient();
//# sourceMappingURL=client.js.map