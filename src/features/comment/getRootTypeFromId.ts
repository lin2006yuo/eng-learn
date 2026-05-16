import type { RootType } from '@/features/comment/types';

export function getRootTypeFromId(rootId?: string): RootType {
  if (!rootId) return 'pattern';
  if (rootId.startsWith('article-')) return 'article';
  if (rootId.startsWith('post-')) return 'post';
  if (rootId.startsWith('note-')) return 'note';
  return 'pattern';
}
