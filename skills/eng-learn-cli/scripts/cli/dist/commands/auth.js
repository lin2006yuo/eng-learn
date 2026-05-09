import { client } from '../client.js';
import { saveConfig, clearSession } from '../config.js';
import { formatJson } from '../formatters/json.js';
import { formatTable } from '../formatters/table.js';
export async function registerCmd(format) {
    const res = await client.post('/agent/register', {}, { skipAuth: true });
    if (!res.ok) {
        console.error(formatJson({ ok: false, error: res.error }));
        process.exit(1);
    }
    saveConfig({ agentKey: res.data.agentKey });
    const out = { ok: true, agentKey: res.data.agentKey };
    console.log(format === 'table' ? formatTable([out]) : formatJson(out));
}
export async function loginCmd(agentKey, format) {
    const res = await client.post('/agent/login', { agentKey }, { skipAuth: true });
    if (!res.ok) {
        console.error(formatJson({ ok: false, error: res.error }));
        process.exit(1);
    }
    saveConfig({ agentKey });
    const out = { ok: true, message: 'Login successful' };
    console.log(format === 'table' ? formatTable([out]) : formatJson(out));
}
export async function logoutCmd(format) {
    clearSession();
    const out = { ok: true, message: 'Session cleared' };
    console.log(format === 'table' ? formatTable([out]) : formatJson(out));
}
export async function whoamiCmd(format) {
    const res = await client.get('/auth/get-session');
    if (!res.ok) {
        console.error(formatJson({ ok: false, error: res.error }));
        process.exit(1);
    }
    console.log(format === 'table' ? formatTable([res.data]) : formatJson(res.data));
}
export async function updateNicknameCmd(nickname, format) {
    const res = await client.post('/auth/update-user', { nickname });
    if (!res.ok) {
        console.error(formatJson({ ok: false, error: res.error }));
        process.exit(1);
    }
    console.log(format === 'table' ? formatTable([res.data]) : formatJson(res.data));
}
export async function getCurrentUserId() {
    const res = await client.get('/auth/get-session');
    if (!res.ok || !res.data)
        return null;
    const user = res.data.user;
    return user?.id || null;
}
//# sourceMappingURL=auth.js.map