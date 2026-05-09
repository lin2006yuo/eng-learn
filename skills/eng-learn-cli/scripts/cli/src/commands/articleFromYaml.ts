import { readFileSync } from 'fs';
import { parse } from 'yaml';
import { client } from '../client.js';
import { formatJson } from '../formatters/json.js';

interface YamlComment {
  selectedText: string;
  prefixText: string;
  suffixText: string;
  content: string;
}

interface YamlArticle {
  title: string;
  summary: string;
  status: string;
  content: string;
  comments?: YamlComment[];
}

interface YamlFile {
  article: YamlArticle;
}

export async function articleCreateFromYamlCmd(filePath: string, format: 'json' | 'table'): Promise<void> {
  let yamlContent: string;
  try {
    yamlContent = readFileSync(filePath, 'utf-8');
  } catch {
    console.error(formatJson({ ok: false, error: `Cannot read file: ${filePath}` }));
    process.exit(1);
  }

  let parsed: YamlFile;
  try {
    parsed = parse(yamlContent);
  } catch {
    console.error(formatJson({ ok: false, error: 'Invalid YAML syntax' }));
    process.exit(1);
  }

  const { title, summary, status, content, comments } = parsed.article;
  if (!title || !summary || !content || !status) {
    console.error(formatJson({ ok: false, error: 'Missing required fields: title, summary, content, status' }));
    process.exit(1);
  }

  const res = await client.post('/articles', { title, summary, content, status });
  if (!res.ok) {
    console.error(formatJson({ ok: false, error: res.error }));
    process.exit(1);
  }

  const articleId = (res.data as { data: { id: string } })?.data?.id || (res.data as { id: string })?.id;
  console.log(formatJson({ ok: true, message: 'Article created', articleId }));

  if (comments && comments.length > 0) {
    const results = await createComments(articleId, content, comments, format);
    console.log(formatJson({
      ok: true,
      message: `Created ${results.success}/${results.total} comments`,
      failed: results.failed,
    }));
  }
}

interface CreateCommentsResult {
  success: number;
  total: number;
  failed: Array<{ index: number; selectedText: string; error: string }>;
}

async function createComments(
  articleId: string,
  content: string,
  comments: YamlComment[],
  format: 'json' | 'table'
): Promise<CreateCommentsResult> {
  const result: CreateCommentsResult = { success: 0, total: comments.length, failed: [] };

  for (let i = 0; i < comments.length; i++) {
    const comment = comments[i];
    const startOffset = content.indexOf(comment.selectedText);
    if (startOffset === -1) {
      result.failed.push({ index: i + 1, selectedText: comment.selectedText, error: 'Text not found in article' });
      continue;
    }

    const prefixStart = Math.max(0, startOffset - comment.prefixText.length);
    const actualPrefix = content.slice(prefixStart, startOffset);
    if (comment.prefixText && actualPrefix !== comment.prefixText) {
      result.failed.push({ index: i + 1, selectedText: comment.selectedText, error: `Prefix mismatch: expected "${comment.prefixText}", got "${actualPrefix}"` });
      continue;
    }

    const endOffset = startOffset + comment.selectedText.length;
    const actualSuffix = content.slice(endOffset, endOffset + comment.suffixText.length);
    if (comment.suffixText && actualSuffix !== comment.suffixText) {
      result.failed.push({ index: i + 1, selectedText: comment.selectedText, error: `Suffix mismatch: expected "${comment.suffixText}", got "${actualSuffix}"` });
      continue;
    }

    const anchor = {
      rootType: 'article',
      rootId: articleId,
      selectedText: comment.selectedText,
      startOffset,
      endOffset,
      prefixText: comment.prefixText,
      suffixText: comment.suffixText,
      extra: { blockId: 'article:content' },
    };

    const body = {
      targetType: 'article',
      targetId: articleId,
      rootType: 'article',
      rootId: articleId,
      content: comment.content.trim(),
      anchor,
    };

    const res = await client.post('/comments', body);
    if (!res.ok) {
      result.failed.push({ index: i + 1, selectedText: comment.selectedText, error: `${res.error} (content length: ${comment.content.trim().length})` });
      continue;
    }

    result.success++;
    if (format === 'json') {
      console.log(formatJson({ ok: true, comment: (res.data as Record<string, unknown>).anchor }));
    }
  }

  return result;
}
