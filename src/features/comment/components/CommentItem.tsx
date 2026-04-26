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
        className={`comment-item py-4 ${
          isDeleting ? 'opacity-50' : ''
        } ${isFocused ? 'bg-[#007AFF]/5' : ''}`}
      >
        <div className="comment-item-header flex items-center gap-2 mb-2">
          <span className="comment-item-user-name text-[15px] font-medium text-[#1D1D1F]">
            {comment.userName}
          </span>
          {isOwnComment && (
            <span className="comment-item-own-badge text-[12px] text-[#007AFF]">
              我
            </span>
          )}
          <span className="text-[#C7C7CC]">·</span>
          <span className="comment-item-time text-[13px] text-[#6E6E73]">
            {formatRelativeTime(comment.createdAt)}
          </span>
        </div>

        {!hideAnchorSummary ? <CommentAnchorSummary comment={comment} /> : null}

        <p className="comment-item-content text-[#1D1D1F] text-[15px] leading-snug">
          {comment.content}
        </p>

        <div className="comment-item-actions flex items-center gap-4 mt-2">
          <button
            onClick={handleLike}
            className={`comment-item-like-button text-[13px] font-medium transition-colors ${
              comment.isLiked ? 'text-[#FF3B30]' : 'text-[#6E6E73]'
            }`}
          >
            {comment.isLiked ? '♥' : '♡'} {comment.likes > 0 ? comment.likes : '点赞'}
          </button>

          {!isOwnComment && (
            <button
              onClick={handleReplyClick}
              className="comment-item-reply-button text-[13px] font-medium text-[#6E6E73] active:opacity-50 transition-opacity"
            >
              回复
            </button>
          )}

          {isOwnComment && (
            <>
              <span className="text-[#C7C7CC]">·</span>
              <button
                onClick={() => setShowConfirm(true)}
                disabled={isDeleting}
                className="comment-item-delete-button text-[13px] font-medium text-[#6E6E73] active:opacity-50 transition-opacity"
              >
                删除
              </button>
            </>
          )}
        </div>

        {showReplyInput && (
          <div className="comment-item-reply-input mt-3">
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
          <div className="comment-item-replies mt-3 space-y-3">
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
