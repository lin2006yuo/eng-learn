import type { Comment } from '@/features/comment/types';

export function flattenPages(pages: Comment[][]): Comment[] {
  if (!pages) return [];
  return pages.flat();
}

export function groupCommentsByRoot(comments: Comment[]): Map<string, Comment[]> {
  const map = new Map<string, Comment[]>();
  for (const comment of comments) {
    const existing = map.get(comment.rootId) || [];
    existing.push(comment);
    map.set(comment.rootId, existing);
  }
  return map;
}
