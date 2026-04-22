'use client';

import { useState } from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import { useCommentStore, formatRelativeTime } from '@/features/comment/store/commentStore';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ConfirmModal } from '@/shared/components/ConfirmModal';
import { CommentInput } from './CommentInput';
import { CommentAnchorSummary } from './CommentAnchorSummary';
import { ReplyItem } from './ReplyItem';
import type { Comment, RootType } from '@/features/comment/types';

interface CommentItemProps {
  comment: Comment;
  targetId: string;
  rootType: RootType;
  isFocused?: boolean;
  hideAnchorSummary?: boolean;
}

export function CommentItem({
  comment,
  targetId,
  rootType,
  isFocused = false,
  hideAnchorSummary = false,
}: CommentItemProps) {
  const { toggleLike, deleteComment } = useCommentStore();
  const { user } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);

  const isOwnComment = user?.id === comment.userId;

  const handleLike = async () => {
    await toggleLike(comment.id, rootType, targetId);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const success = await deleteComment(comment.id, rootType, targetId);
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
        className={`py-4 border-b border-gray-50 last:border-b-0 ${
          isDeleting ? 'opacity-50' : ''
        } ${isFocused ? 'rounded-subtle-card bg-primary/5 px-2' : ''}`}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            {comment.userAvatar ? (
              <img
                src={comment.userAvatar}
                alt={comment.userName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-sm font-medium text-primary">
                {comment.userName.charAt(0)}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-text-primary text-sm">
                {comment.userName}
              </span>
              {isOwnComment && (
                <span className="text-xs px-1.5 py-0.5 bg-primary/10 text-primary rounded">
                  我
                </span>
              )}
              <span className="text-xs text-text-tertiary">
                {formatRelativeTime(comment.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {!hideAnchorSummary ? <CommentAnchorSummary comment={comment} /> : null}

        <p className="text-text-primary text-sm leading-relaxed pl-12">
          {comment.content}
        </p>

        <div className="flex items-center gap-4 mt-3 pl-12">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 text-xs transition-colors ${
              comment.isLiked
                ? 'text-red-500'
                : 'text-text-tertiary hover:text-text-secondary'
            }`}
          >
            <Heart
              size={14}
              fill={comment.isLiked ? 'currentColor' : 'none'}
              className={comment.isLiked ? 'scale-110' : ''}
            />
            <span>{comment.likes > 0 ? comment.likes : '点赞'}</span>
          </button>

          {!isOwnComment && (
            <button
              onClick={handleReplyClick}
              className="flex items-center gap-1 text-xs text-text-tertiary hover:text-text-secondary transition-colors"
            >
              <MessageCircle size={14} />
              <span>回复</span>
            </button>
          )}

          {isOwnComment && (
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
          <div className="mt-3 pl-12">
            <CommentInput
              rootId={targetId}
              rootType={rootType}
              replyToCommentId={comment.id}
              replyToUserId={comment.userId}
              onReplySuccess={handleReplySuccess}
            />
          </div>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 pl-12 space-y-3">
            {comment.replies.map((reply) => (
              <ReplyItem
                key={reply.id}
                reply={reply}
                targetId={targetId}
                rootType={rootType}
                parentCommentId={comment.id}
                depth={1}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        title="删除评论"
        message="确定要删除这条评论吗？此操作无法撤销。"
        confirmText="删除"
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}
