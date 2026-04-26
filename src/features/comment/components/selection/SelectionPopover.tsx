'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useSelectionStore } from '@/features/comment/store/selectionStore';
import { clearBrowserSelection } from '@/features/comment/utils';

export function SelectionPopover() {
  const router = useRouter();
  const { user } = useAuth();
  const { anchor, position, openComposer, clearSelection, handleDocumentClick } = useSelectionStore();
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (popoverRef.current && !popoverRef.current.contains(target)) {
        handleDocumentClick();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleDocumentClick]);

  const handleLogin = () => {
    router.push(`/login?from=${encodeURIComponent(window.location.pathname + window.location.search)}`);
    clearSelection();
    clearBrowserSelection();
  };

  const handleCommentClick = () => {
    openComposer();
    clearBrowserSelection();
  };

  if (!anchor || !position) return null;

  return (
    <div
      ref={popoverRef}
      className="comment-selection-popover fixed z-[120] -translate-x-1/2 -translate-y-full"
      style={{ left: position.x, top: position.y }}
    >
      <button
        type="button"
        onClick={user ? handleCommentClick : handleLogin}
        onMouseDown={(e) => e.preventDefault()}
        className="comment-selection-popover-button rounded-full bg-[#007AFF] px-4 py-2 text-[14px] font-medium text-white shadow-md"
      >
        {user ? '评论这段' : '登录后评论'}
      </button>
    </div>
  );
}
