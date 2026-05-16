import { readFileSync } from 'fs';
import { parse } from 'yaml';
import { client } from '../client.js';
import { formatJson } from '../formatters/json.js';
import { createFragmentComments } from './fragmentComments.js';

interface YamlComment {
  selectedText: string;
  prefixText?: string;
  suffixText?: string;
  content: string;
}

interface YamlArticle {
  title: string;
  summary: string;
  status: string;
  content?: string;
  contentFile?: string;
  contentType?: string;
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

  const { title, summary, status, content: inlineContent, contentFile, contentType: yamlContentType, comments } = parsed.article;
  const contentType = yamlContentType || 'text';

  if (!title || !summary || !status) {
    console.error(formatJson({ ok: false, error: 'Missing required fields: title, summary, status' }));
    process.exit(1);
  }

  let content: string;
  if (contentType === 'html') {
    if (!contentFile) {
      console.error(formatJson({ ok: false, error: 'contentFile is required when contentType is html' }));
      process.exit(1);
    }
    try {
      content = readFileSync(contentFile, 'utf-8');
    } catch {
      console.error(formatJson({ ok: false, error: `Cannot read contentFile: ${contentFile}` }));
      process.exit(1);
    }
  } else {
    if (!inlineContent) {
      console.error(formatJson({ ok: false, error: 'content is required' }));
      process.exit(1);
    }
    content = inlineContent;
  }

  const res = await client.post('/articles', { title, summary, content, status, contentType });
  if (!res.ok) {
    console.error(formatJson({ ok: false, error: res.error }));
    process.exit(1);
  }

  const articleId = (res.data as { data: { id: string } })?.data?.id || (res.data as { id: string })?.id;
  console.log(formatJson({ ok: true, message: 'Article created', articleId }));

  if (contentType === 'text' && comments && comments.length > 0) {
    const results = await createFragmentComments('article', articleId, content, comments, format);
    console.log(formatJson({
      ok: true,
      message: `Created ${results.success}/${results.total} comments`,
      failed: results.failed,
    }));
  }
}
