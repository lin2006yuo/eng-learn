import { readFileSync } from 'fs';
import { client } from '../client.js';
import { formatJson } from '../formatters/json.js';
import { formatTable } from '../formatters/table.js';

function pickFields(rows: Record<string, unknown>[]) {
  return rows.map(({ id, title, summary, authorId }) => ({ id, title, summary, authorId }));
}

export async function articleListCmd(
  scope: string,
  status: string | undefined,
  format: 'json' | 'table'
): Promise<void> {
  const params = new URLSearchParams();
  if (scope === 'manage') params.set('scope', 'manage');
  if (status) params.set('status', status);
  const qs = params.toString();
  const res = await client.get(`/articles${qs ? '?' + qs : ''}`);
  if (!res.ok) {
    console.error(formatJson({ ok: false, error: res.error }));
    process.exit(1);
  }
  const body = res.data as { data: Record<string, unknown>[] };
  const rows = pickFields(body.data);
  console.log(format === 'table' ? formatTable(rows) : formatJson(rows));
}

export async function articleCreateCmd(
  title: string,
  summary: string,
  content: string,
  status: string,
  contentType: string,
  format: 'json' | 'table'
): Promise<void> {
  const res = await client.post('/articles', { title, summary, content, status, contentType });
  if (!res.ok) {
    console.error(formatJson({ ok: false, error: res.error }));
    process.exit(1);
  }
  console.log(format === 'table' ? formatTable([res.data as Record<string, unknown>]) : formatJson(res.data));
}

export async function articleCreateFromContentFileCmd(
  title: string,
  summary: string,
  filePath: string,
  status: string,
  contentType: string,
  format: 'json' | 'table'
): Promise<void> {
  let content: string;
  try {
    content = readFileSync(filePath, 'utf-8');
  } catch {
    console.error(formatJson({ ok: false, error: `Cannot read file: ${filePath}` }));
    process.exit(1);
  }
  await articleCreateCmd(title, summary, content, status, contentType, format);
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
