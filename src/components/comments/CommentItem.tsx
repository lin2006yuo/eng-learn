import { useState } from 'react';
import { Heart } from 'lucide-react';
import { useCommentStore, formatRelativeTime } from '@/stores/commentStore';
import type { Comment } from '@/types/comment';

interface CommentItemProps {
  comment: Comment;
  patternId: string;
}

/**
 * 单个评论项组件
 * 功能：
 * 1. 显示用户头像、昵称、时间
 * 2. 显示评论内容
 * 3. 点赞/取消点赞
 * 4. 删除自己的评论
 */
export function CommentItem({ comment, patternId }: CommentItemProps) {
  const { currentUser, toggleLike, deleteComment } = useCommentStore();
  const [isDeleting, setIsDeleting] = useState(false);

  // 是否是自己的评论
  const isOwnComment = comment.userId === currentUser.id;

  // 处理点赞
  const handleLike = async () => {
    try {
      await toggleLike(comment.id, patternId);
    } catch (error) {
      console.error('点赞失败:', error);
    }
  };

  // 处理删除
  const handleDelete = async () => {
    if (!confirm('确定要删除这条评论吗？')) return;

    setIsDeleting(true);
    try {
      await deleteComment(comment.id, patternId);
    } catch (error) {
      console.error('删除失败:', error);
      setIsDeleting(false);
    }
  };

  return (
    <div
      className={`py-4 border-b border-gray-50 last:border-b-0 ${
        isDeleting ? 'opacity-50' : ''
      }`}
    >
      {/* 头部：头像 + 昵称 + 时间 */}
      <div className="flex items-center gap-3 mb-2">
        {/* 头像 */}
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

        {/* 昵称和时间 */}
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
          </div>
          <span className="text-xs text-text-tertiary">
            {formatRelativeTime(comment.createdAt)}
          </span>
        </div>
      </div>

      {/* 评论内容 */}
      <p className="text-text-primary text-sm leading-relaxed pl-12">
        {comment.content}
      </p>

      {/* 底部操作栏 */}
      <div className="flex items-center gap-4 mt-3 pl-12">
        {/* 点赞按钮 */}
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

        {/* 删除按钮（仅自己的评论） */}
        {isOwnComment && (
          <>
            <span className="text-text-tertiary">·</span>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-xs text-text-tertiary hover:text-red-500 transition-colors"
            >
              删除
            </button>
          </>
        )}
      </div>
    </div>
  );
}
