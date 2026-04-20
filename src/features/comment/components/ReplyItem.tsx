'use client';

import { useState } from 'react';
import { Heart, MessageCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { useCommentStore, formatRelativeTime } from '@/features/comment/store/commentStore';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ConfirmModal } from '@/shared/components/ConfirmModal';
import { CommentInput } from './CommentInput';
import type { Comment, RootType } from '@/features/comment/types';

interface ReplyItemProps {
  reply: Comment;
  targetId: string;
  rootType: RootType;
  parentCommentId: string;
  depth?: number;
}

function countNestedReplies(comment: Comment): number {
  if (!comment.replies || comment.replies.length === 0) return 0;
  let count = comment.replies.length;
  for (const reply of comment.replies) {
    count += countNestedReplies(reply);
  }
  return count;
}

export function ReplyItem({ reply, targetId, rootType, parentCommentId, depth = 1 }: ReplyItemProps) {
  const { toggleLike, deleteComment } = useCommentStore();
  const { user } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const isOwnReply = user?.id === reply.userId;

  const hasNestedReplies = reply.replies && reply.replies.length > 0;
  const nestedReplyCount = hasNestedReplies ? countNestedReplies(reply) : 0;

  const handleLike = async () => {
    await toggleLike(reply.id, rootType, targetId);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const success = await deleteComment(reply.id, rootType, targetId);
    if (!success) setIsDeleting(false);
    setShowConfirm(false);
  };

  const handleReplyClick = () => {
    setShowReplyInput(!showReplyInput);
  };

  const handleReplySuccess = () => {
    setShowReplyInput(false);
  };

  return (
    <>
      <div
        className={`bg-gray-50 rounded-subtle-card p-3 ${
          isDeleting ? 'opacity-50' : ''
        }`}
      >
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            {reply.userAvatar ? (
              <img
                src={reply.userAvatar}
                alt={reply.userName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-xs font-medium text-primary">
                {reply.userName.charAt(0)}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-medium text-text-primary text-xs">
                {reply.userName}
              </span>
              {isOwnReply && (
                <span className="text-xs px-1 py-0.5 bg-primary/10 text-primary rounded">
                  我
                </span>
              )}
              {reply.replyToUserName && (
                <span className="text-xs text-text-secondary">
                  回复 <span className="text-primary">@{reply.replyToUserName}</span>
                </span>
              )}
            </div>
          </div>

          <span className="text-xs text-text-tertiary">
            {formatRelativeTime(reply.createdAt)}
          </span>
        </div>

        <p className="text-text-primary text-xs leading-relaxed pl-8 mb-2">
          {reply.content}
        </p>

        <div className="flex items-center gap-3 pl-8">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 text-xs transition-colors ${
              reply.isLiked
                ? 'text-red-500'
                : 'text-text-tertiary hover:text-text-secondary'
            }`}
          >
            <Heart
              size={12}
              fill={reply.isLiked ? 'currentColor' : 'none'}
              className={reply.isLiked ? 'scale-110' : ''}
            />
            <span>{reply.likes > 0 ? reply.likes : '点赞'}</span>
          </button>

          {!isOwnReply && (
            <button
              onClick={handleReplyClick}
              className="flex items-center gap-1 text-xs text-text-tertiary hover:text-text-secondary transition-colors"
            >
              <MessageCircle size={12} />
              <span>回复</span>
            </button>
          )}

          {isOwnReply && (
            <>
              <span className="text-text-tertiary">·</span>
              <button
                onClick={() => setShowConfirm(true)}
                disabled={isDeleting}
                className="text-xs text-text-tertiary hover:text-red-500 transition-colors"
              >
                删除
              </button>
            </>
          )}
        </div>

        {showReplyInput && (
          <div className="mt-2 pl-8">
            <CommentInput
              rootId={targetId}
              rootType={rootType}
              replyToCommentId={reply.id}
              replyToUserId={reply.userId}
              onReplySuccess={handleReplySuccess}
            />
          </div>
        )}

        {hasNestedReplies && depth >= 3 && (
          <div className="mt-2">
            {!isExpanded && nestedReplyCount > 0 && (
              <button
                onClick={() => setIsExpanded(true)}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
              >
                <ChevronRight size={12} />
                <span>展开 {nestedReplyCount} 条回复</span>
              </button>
            )}

            {isExpanded && (
              <>
                <div className="space-y-2">
                  {reply.replies!.map((nestedReply) => (
                    <ReplyItem
                      key={nestedReply.id}
                      reply={nestedReply}
                      targetId={targetId}
                      rootType={rootType}
                      parentCommentId={parentCommentId}
                      depth={depth}
                    />
                  ))}
                </div>

                <button
                  onClick={() => setIsExpanded(false)}
                  className="flex items-center gap-1 text-xs text-text-tertiary hover:text-text-secondary transition-colors mt-2"
                >
                  <ChevronDown size={12} />
                  <span>收起回复</span>
                </button>
              </>
            )}
          </div>
        )}

        {hasNestedReplies && depth < 3 && (
          <div className="mt-2 pl-4 space-y-2">
            {reply.replies!.map((nestedReply) => (
              <ReplyItem
                key={nestedReply.id}
                reply={nestedReply}
                targetId={targetId}
                rootType={rootType}
                parentCommentId={parentCommentId}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        title="删除回复"
        message="确定要删除这条回复吗？此操作无法撤销。"
        confirmText="删除"
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}
