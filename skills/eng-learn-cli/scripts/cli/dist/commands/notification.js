import { client } from '../client.js';
import { formatJson } from '../formatters/json.js';
import { formatTable } from '../formatters/table.js';
function extractDataArray(resData) {
    const record = resData;
    if (record?.data && Array.isArray(record.data))
        return record.data;
    return [];
}
export async function notificationListCmd(format) {
    const res = await client.get('/notifications');
    if (!res.ok) {
        console.error(formatJson({ ok: false, error: res.error }));
        process.exit(1);
    }
    const data = extractDataArray(res.data);
    console.log(format === 'table' ? formatTable(data) : formatJson(data));
}
export async function notificationUnreadCmd(format) {
    const countRes = await client.get('/notifications/unread-count');
    if (!countRes.ok) {
        console.error(formatJson({ ok: false, error: countRes.error }));
        process.exit(1);
    }
    const countData = countRes.data?.data;
    const total = countData?.total ?? 0;
    if (total === 0) {
        const out = { ok: true, total: 0, message: 'No unread notifications' };
        console.log(format === 'table' ? formatTable([out]) : formatJson(out));
        return;
    }
    const listRes = await client.get('/notifications');
    if (!listRes.ok) {
        console.error(formatJson({ ok: false, error: listRes.error }));
        process.exit(1);
    }
    const data = extractDataArray(listRes.data);
    const unreadIds = data
        .filter((n) => n.isRead === false)
        .map((n) => n.id);
    if (unreadIds.length > 0) {
        const markRes = await client.post('/notifications/mark-read', { targetIds: unreadIds });
        if (!markRes.ok) {
            console.error(formatJson({ ok: false, error: markRes.error }));
            process.exit(1);
        }
    }
    const out = { ok: true, total, markedRead: unreadIds.length, data };
    console.log(format === 'table' ? formatTable([out]) : formatJson(out));
}
//# sourceMappingURL=notification.js.map