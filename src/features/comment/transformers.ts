import { Comment } from './types';

interface CommentRow {
  id: string;
  targetType: string;
  targetId: string;
  rootType: string;
  rootId: string;
  userId: string;
  userName: string | null;
  userAvatar: string | null;
  nickname: string | null;
  content: string;
  createdAt: Date;
  parentUserName?: string | null;
}

export function buildComment(
  row: CommentRow,
  likesCountMap: Map<string, number>,
  likedByCurrentUserMap: Map<string, boolean>,
): Comment {
  return {
    id: row.id,
    targetType: row.targetType as Comment['targetType'],
    targetId: row.targetId,
    rootType: row.rootType as Comment['rootType'],
    rootId: row.rootId,
    userId: row.userId,
    userName: row.nickname || row.userName || '未知用户',
    userAvatar: row.userAvatar || undefined,
    content: row.content,
    createdAt: row.createdAt.toISOString(),
    likes: likesCountMap.get(row.id) || 0,
    isLiked: !!likedByCurrentUserMap.get(row.id),
    replyToUserName: row.targetType === 'comment' ? (row.parentUserName || undefined) : undefined,
  };
}

export function buildNestedComments(
  rootComments: CommentRow[],
  replies: CommentRow[],
  likesCountMap: Map<string, number>,
  likedByCurrentUserMap: Map<string, boolean>,
  replyCountByParent: Map<string, number>,
): Comment[] {
  const repliesByParent = new Map<string, CommentRow[]>();

  replies.forEach(reply => {
    if (!repliesByParent.has(reply.targetId)) {
      repliesByParent.set(reply.targetId, []);
    }
    repliesByParent.get(reply.targetId)!.push(reply);
  });

  const buildCommentTree = (commentId: string): Comment[] => {
    const children = repliesByParent.get(commentId) || [];
    return children.map(child => ({
      ...buildComment(child, likesCountMap, likedByCurrentUserMap),
      replies: buildCommentTree(child.id),
    }));
  };

  return rootComments.map(rc => {
    const nestedReplies = buildCommentTree(rc.id);

    return {
      ...buildComment(rc, likesCountMap, likedByCurrentUserMap),
      replies: nestedReplies,
      replyCount: replyCountByParent.get(rc.id) || nestedReplies.length,
    };
  });
}

export function buildFlatComments(
  comments: CommentRow[],
  likesCountMap: Map<string, number>,
  likedByCurrentUserMap: Map<string, boolean>,
): Comment[] {
  return comments.map(comment =>
    buildComment(comment, likesCountMap, likedByCurrentUserMap),
  );
}
