import { readFileSync } from 'fs';
import { client } from '../client.js';
import { formatJson } from '../formatters/json.js';
import { formatTable } from '../formatters/table.js';

export async function postListCmd(scope: string, format: 'json' | 'table'): Promise<void> {
  const query = scope === 'manage' ? '?scope=manage' : '';
  const res = await client.get(`/posts${query}`);
  if (!res.ok) {
    console.error(formatJson({ ok: false, error: res.error }));
    process.exit(1);
  }
  const data = res.data as Record<string, unknown>[];
  console.log(format === 'table' ? formatTable(data) : formatJson(data));
}

export async function postCreateCmd(
  title: string,
  content: string,
  status: string,
  format: 'json' | 'table'
): Promise<void> {
  const res = await client.post('/posts', { title, content, status });
  if (!res.ok) {
    console.error(formatJson({ ok: false, error: res.error }));
    process.exit(1);
  }
  console.log(format === 'table' ? formatTable([res.data as Record<string, unknown>]) : formatJson(res.data));
}

export async function postGetCmd(id: string, format: 'json' | 'table'): Promise<void> {
  const res = await client.get(`/posts/${id}`);
  if (!res.ok) {
    console.error(formatJson({ ok: false, error: res.error }));
    process.exit(1);
  }
  console.log(format === 'table' ? formatTable([res.data as Record<string, unknown>]) : formatJson(res.data));
}

export async function postUpdateCmd(
  id: string,
  updates: Record<string, unknown>,
  format: 'json' | 'table'
): Promise<void> {
  const res = await client.put(`/posts/${id}`, updates);
  if (!res.ok) {
    console.error(formatJson({ ok: false, error: res.error }));
    process.exit(1);
  }
  console.log(format === 'table' ? formatTable([res.data as Record<string, unknown>]) : formatJson(res.data));
}

export async function postDeleteCmd(id: string, format: 'json' | 'table'): Promise<void> {
  const res = await client.delete(`/posts/${id}`);
  if (!res.ok) {
    console.error(formatJson({ ok: false, error: res.error }));
    process.exit(1);
  }
  const out = { ok: true, message: 'Post deleted' };
  console.log(format === 'table' ? formatTable([out]) : formatJson(out));
}

export async function postCreateFromTextCmd(
  title: string,
  content: string,
  status: string,
  format: 'json' | 'table'
): Promise<void> {
  await postCreateCmd(title, content, status, format);
}

export async function postCreateFromFileCmd(
  title: string,
  filePath: string,
  status: string,
  format: 'json' | 'table'
): Promise<void> {
  const content = readFileSync(filePath, 'utf-8');
  await postCreateCmd(title, content, status, format);
}
