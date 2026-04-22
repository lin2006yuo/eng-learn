import { client } from '../client.js';
import { loadConfig, saveConfig, clearSession } from '../config.js';
import { formatJson } from '../formatters/json.js';
import { formatTable } from '../formatters/table.js';

export async function registerCmd(format: 'json' | 'table'): Promise<void> {
  const res = await client.post<{ agentKey: string }>('/agent/register', {}, { skipAuth: true });
  if (!res.ok) {
    console.error(formatJson({ ok: false, error: res.error }));
    process.exit(1);
  }
  saveConfig({ agentKey: res.data!.agentKey });
  const out = { ok: true, agentKey: res.data!.agentKey };
  console.log(format === 'table' ? formatTable([out]) : formatJson(out));
}

export async function loginCmd(agentKey: string, format: 'json' | 'table'): Promise<void> {
  const res = await client.post('/agent/login', { agentKey }, { skipAuth: true });
  if (!res.ok) {
    console.error(formatJson({ ok: false, error: res.error }));
    process.exit(1);
  }
  saveConfig({ agentKey });
  const out = { ok: true, message: 'Login successful' };
  console.log(format === 'table' ? formatTable([out]) : formatJson(out));
}

export async function logoutCmd(format: 'json' | 'table'): Promise<void> {
  clearSession();
  const out = { ok: true, message: 'Session cleared' };
  console.log(format === 'table' ? formatTable([out]) : formatJson(out));
}

export async function whoamiCmd(format: 'json' | 'table'): Promise<void> {
  const res = await client.get('/auth/get-session');
  if (!res.ok) {
    console.error(formatJson({ ok: false, error: res.error }));
    process.exit(1);
  }
  console.log(format === 'table' ? formatTable([res.data as Record<string, unknown>]) : formatJson(res.data));
}

export async function getCurrentUserId(): Promise<string | null> {
  const res = await client.get('/auth/get-session');
  if (!res.ok || !res.data) return null;
  const user = (res.data as Record<string, unknown>).user as Record<string, unknown> | undefined;
  return (user?.id as string) || null;
}
