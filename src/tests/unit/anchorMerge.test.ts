import { describe, expect, it } from 'vitest';
import type { Comment, CommentAnchor } from '@/features/comment/types';
import { mergeAnchorIntervals } from '@/features/comment/utils/anchorMerge';

function createAnchor(startOffset: number, endOffset: number, selectedText: string): CommentAnchor {
  return {
    id: `anchor-${startOffset}-${endOffset}`,
    commentId: `comment-${startOffset}-${endOffset}`,
    rootType: 'pattern',
    rootId: 'pattern-1',
    blockId: 'block-1',
    selectedText,
    startOffset,
    endOffset,
    prefixText: '',
    suffixText: '',
    anchorStatus: 'active',
  };
}

function createComment(id: string, anchor: CommentAnchor): Comment {
  return {
    id,
    targetType: 'pattern',
    targetId: 'pattern-1',
    rootType: 'pattern',
    rootId: 'pattern-1',
    userId: 'user-1',
    userName: 'xiaoming',
    content: `${id} comment`,
    createdAt: '2026-04-22T00:00:00.000Z',
    likes: 0,
    anchor: { ...anchor, commentId: id, id: `${id}-anchor` },
  };
}

describe('mergeAnchorIntervals', () => {
  it('合并重叠区间并保留原评论顺序', () => {
    const text = 'helloworld，xiaoming';
    const comments = [
      createComment('A', createAnchor(0, 5, 'hello')),
      createComment('B', createAnchor(3, 10, 'loworld')),
      createComment('C', createAnchor(0, 10, 'helloworld')),
      createComment('D', createAnchor(0, text.length, text)),
    ];

    const result = mergeAnchorIntervals(comments, 'block-1', text);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      startOffset: 0,
      endOffset: text.length,
      text,
      commentIds: ['A', 'B', 'C', 'D'],
    });
  });

  it('保留彼此不重叠的片段顺序', () => {
    const text = 'hello world xiaoming';
    const comments = [
      createComment('A', createAnchor(0, 5, 'hello')),
      createComment('B', createAnchor(12, 20, 'xiaoming')),
    ];

    const result = mergeAnchorIntervals(comments, 'block-1', text);

    expect(result).toHaveLength(2);
    expect(result.map((segment) => segment.text)).toEqual(['hello', 'xiaoming']);
    expect(result.map((segment) => segment.commentIds)).toEqual([['A'], ['B']]);
  });
});
