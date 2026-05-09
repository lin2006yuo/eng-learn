import { client } from '../client.js';
import { formatJson } from '../formatters/json.js';
import { formatTable } from '../formatters/table.js';
import { getCurrentUserId } from './auth.js';
import { computeAnchorOffset } from '../utils/anchorOffset.js';

export async function commentListCmd(
  rootType: string,
  rootId: string,
  format: 'json' | 'table'
): Promise<void> {
  const res = await client.get(`/comments?rootType=${rootType}&rootId=${rootId}`);
  if (!res.ok) {
    console.error(formatJson({ ok: false, error: res.error }));
    process.exit(1);
  }
  const data = res.data as Record<string, unknown>[];
  console.log(format === 'table' ? formatTable(data) : formatJson(data));
}

export async function commentListMineCmd(format: 'json' | 'table'): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) {
    console.error(formatJson({ ok: false, error: 'Not logged in' }));
    process.exit(1);
  }
  const res = await client.get(`/comments?userId=${userId}`);
  if (!res.ok) {
    console.error(formatJson({ ok: false, error: res.error }));
    process.exit(1);
  }
  const data = res.data as Record<string, unknown>[];
  console.log(format === 'table' ? formatTable(data) : formatJson(data));
}

export interface AnchorOptions {
  dataPath: string;
  selectedText: string;
  prefixText: string;
  suffixText: string;
}

export async function commentCreateCmd(
  targetType: string,
  targetId: string,
  rootType: string,
  rootId: string,
  content: string,
  replyToUserId: string | undefined,
  anchor: AnchorOptions | undefined,
  format: 'json' | 'table'
): Promise<void> {
  const body: Record<string, unknown> = { targetType, targetId, rootType, rootId, content };
  if (replyToUserId) body.replyToUserId = replyToUserId;
  if (anchor) {
    const { startOffset, endOffset } = await computeAnchorOffset(
      anchor.dataPath,
      rootType,
      rootId,
      anchor.selectedText,
      anchor.prefixText,
      anchor.suffixText,
    );

    body.anchor = {
      rootType,
      rootId,
      selectedText: anchor.selectedText,
      startOffset,
      endOffset,
      prefixText: anchor.prefixText,
      suffixText: anchor.suffixText,
      extra: { blockId: anchor.dataPath },
    };
  }
  const res = await client.post('/comments', body);
  if (!res.ok) {
    console.error(formatJson({ ok: false, error: res.error }));
    process.exit(1);
  }
  console.log(format === 'table' ? formatTable([res.data as Record<string, unknown>]) : formatJson(res.data));
}

export async function commentDeleteCmd(commentId: string, format: 'json' | 'table'): Promise<void> {
  const res = await client.delete(`/comments/${commentId}`);
  if (!res.ok) {
    console.error(formatJson({ ok: false, error: res.error }));
    process.exit(1);
  }
  const out = { ok: true, message: 'Comment deleted' };
  console.log(format === 'table' ? formatTable([out]) : formatJson(out));
}

export async function commentLikeCmd(commentId: string, format: 'json' | 'table'): Promise<void> {
  const res = await client.post(`/comments/${commentId}/like`, {});
  if (!res.ok) {
    console.error(formatJson({ ok: false, error: res.error }));
    process.exit(1);
  }
  const out = { ok: true, message: 'Like toggled' };
  console.log(format === 'table' ? formatTable([out]) : formatJson(out));
}
