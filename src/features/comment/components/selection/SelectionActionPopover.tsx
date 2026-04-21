'use client';

interface SelectionActionPopoverProps {
  x: number;
  y: number;
  isAuthenticated: boolean;
  onComment: () => void;
  onLogin: () => void;
}

export function SelectionActionPopover(props: SelectionActionPopoverProps) {
  const { x, y, isAuthenticated, onComment, onLogin } = props;

  return (
    <div
      className="comment-selection-popover fixed z-[120] -translate-x-1/2 -translate-y-full"
      style={{ left: x, top: y }}
    >
      <button
        type="button"
        onClick={isAuthenticated ? onComment : onLogin}
        className="comment-selection-popover-button rounded-full bg-text-primary px-4 py-2 text-sm font-medium text-white shadow-card"
      >
        {isAuthenticated ? '评论这段' : '登录后评论'}
      </button>
    </div>
  );
}
