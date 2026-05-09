import { client } from '../client.js';
import { formatJson } from '../formatters/json.js';
import { formatTable } from '../formatters/table.js';

export async function articleListCmd(scope: string, format: 'json' | 'table'): Promise<void> {
  const query = scope === 'manage' ? '?scope=manage' : '';
  const res = await client.get(`/articles${query}`);
  if (!res.ok) {
    console.error(formatJson({ ok: false, error: res.error }));
    process.exit(1);
  }
  const data = res.data as Record<string, unknown>[];
  console.log(format === 'table' ? formatTable(data) : formatJson(data));
}

export async function articleCreateCmd(
  title: string,
  summary: string,
  content: string,
  status: string,
  format: 'json' | 'table'
): Promise<void> {
  const res = await client.post('/articles', { title, summary, content, status });
  if (!res.ok) {
    console.error(formatJson({ ok: false, error: res.error }));
    process.exit(1);
  }
  console.log(format === 'table' ? formatTable([res.data as Record<string, unknown>]) : formatJson(res.data));
}

export async function articleGetCmd(id: string, format: 'json' | 'table'): Promise<void> {
  const res = await client.get(`/articles/${id}`);
  if (!res.ok) {
    console.error(formatJson({ ok: false, error: res.error }));
    process.exit(1);
  }
  console.log(format === 'table' ? formatTable([res.data as Record<string, unknown>]) : formatJson(res.data));
}

export async function articleUpdateCmd(
  id: string,
  updates: Record<string, unknown>,
  format: 'json' | 'table'
): Promise<void> {
  const res = await client.put(`/articles/${id}`, updates);
  if (!res.ok) {
    console.error(formatJson({ ok: false, error: res.error }));
    process.exit(1);
  }
  console.log(format === 'table' ? formatTable([res.data as Record<string, unknown>]) : formatJson(res.data));
}

export async function articleDeleteCmd(id: string, format: 'json' | 'table'): Promise<void> {
  const res = await client.delete(`/articles/${id}`);
  if (!res.ok) {
    console.error(formatJson({ ok: false, error: res.error }));
    process.exit(1);
  }
  const out = { ok: true, message: 'Article deleted' };
  console.log(format === 'table' ? formatTable([out]) : formatJson(out));
}
