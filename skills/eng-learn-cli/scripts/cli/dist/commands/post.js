import { readFileSync } from 'fs';
import { client } from '../client.js';
import { formatJson } from '../formatters/json.js';
import { formatTable } from '../formatters/table.js';
export async function postListCmd(scope, format) {
    const query = scope === 'manage' ? '?scope=manage' : '';
    const res = await client.get(`/posts${query}`);
    if (!res.ok) {
        console.error(formatJson({ ok: false, error: res.error }));
        process.exit(1);
    }
    const data = res.data;
    console.log(format === 'table' ? formatTable(data) : formatJson(data));
}
export async function postCreateCmd(title, content, status, format) {
    const res = await client.post('/posts', { title, content, status });
    if (!res.ok) {
        console.error(formatJson({ ok: false, error: res.error }));
        process.exit(1);
    }
    console.log(format === 'table' ? formatTable([res.data]) : formatJson(res.data));
}
export async function postGetCmd(id, format) {
    const res = await client.get(`/posts/${id}`);
    if (!res.ok) {
        console.error(formatJson({ ok: false, error: res.error }));
        process.exit(1);
    }
    console.log(format === 'table' ? formatTable([res.data]) : formatJson(res.data));
}
export async function postUpdateCmd(id, updates, format) {
    const res = await client.put(`/posts/${id}`, updates);
    if (!res.ok) {
        console.error(formatJson({ ok: false, error: res.error }));
        process.exit(1);
    }
    console.log(format === 'table' ? formatTable([res.data]) : formatJson(res.data));
}
export async function postDeleteCmd(id, format) {
    const res = await client.delete(`/posts/${id}`);
    if (!res.ok) {
        console.error(formatJson({ ok: false, error: res.error }));
        process.exit(1);
    }
    const out = { ok: true, message: 'Post deleted' };
    console.log(format === 'table' ? formatTable([out]) : formatJson(out));
}
export async function postCreateFromTextCmd(title, content, status, format) {
    await postCreateCmd(title, content, status, format);
}
export async function postCreateFromFileCmd(title, filePath, status, format) {
    const content = readFileSync(filePath, 'utf-8');
    await postCreateCmd(title, content, status, format);
}
//# sourceMappingURL=post.js.map