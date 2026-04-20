import type { Comment } from '../types';

interface CommentPreviewProps {
  comments: Comment[];
  onClick?: () => void;
}

export function CommentPreview({ comments, onClick }: CommentPreviewProps) {
  if (comments.length === 0) return null;

  return (
    <div 
      className="mt-3 space-y-2 cursor-pointer"
      onClick={onClick}
    >
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="flex items-start gap-2 text-sm hover:bg-gray-50 -mx-2 px-2 py-1 rounded-list transition-colors"
        >
          <span className="text-text-tertiary flex-shrink-0">💬</span>
          <p className="text-text-secondary truncate">
            <span className="font-medium text-text-primary">
              {comment.userName}:
            </span>{' '}
            {truncateContent(comment.content)}
          </p>
        </div>
      ))}
    </div>
  );
}

function truncateContent(content: string, maxLength: number = 30): string {
  if (content.length <= maxLength) return content;
  return content.slice(0, maxLength) + '...';
}
