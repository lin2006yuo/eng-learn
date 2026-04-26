import type { Comment } from '../types';

interface CommentPreviewProps {
  comments: Comment[];
  onClick?: () => void;
}

export function CommentPreview({ comments, onClick }: CommentPreviewProps) {
  if (comments.length === 0) return null;

  return (
    <div
      className="px-3 py-2.5 bg-[#F5F5F7] rounded-[12px] space-y-1.5 cursor-pointer"
      onClick={onClick}
    >
      {comments.map((comment) => (
        <p
          key={comment.id}
          className="text-[13px] text-[#6E6E73] leading-snug truncate"
        >
          <span className="text-[#1D1D1F] font-medium">
            {comment.userName}
          </span>
          ：{truncateContent(comment.content)}
        </p>
      ))}
    </div>
  );
}

function truncateContent(content: string, maxLength: number = 30): string {
  if (content.length <= maxLength) return content;
  return content.slice(0, maxLength) + '...';
}
