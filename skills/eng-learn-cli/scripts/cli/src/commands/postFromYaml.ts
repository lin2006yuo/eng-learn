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

interface YamlPost {
  title: string;
  status: string;
  content: string;
  comments?: YamlComment[];
}

interface YamlFile {
  post: YamlPost;
}

export async function postCreateFromYamlCmd(filePath: string, format: 'json' | 'table'): Promise<void> {
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

  const { title, status, content, comments } = parsed.post;
  if (!title || !content || !status) {
    console.error(formatJson({ ok: false, error: 'Missing required fields: title, content, status' }));
    process.exit(1);
  }

  const res = await client.post('/posts', { title, content, status });
  if (!res.ok) {
    console.error(formatJson({ ok: false, error: res.error }));
    process.exit(1);
  }

  const postId = (res.data as { data: { id: string } })?.data?.id || (res.data as { id: string })?.id;
  console.log(formatJson({ ok: true, message: 'Post created', postId }));

  if (comments && comments.length > 0) {
    const results = await createFragmentComments('post', postId, content, comments, format);
    console.log(formatJson({
      ok: true,
      message: `Created ${results.success}/${results.total} comments`,
      failed: results.failed,
    }));
  }
}
