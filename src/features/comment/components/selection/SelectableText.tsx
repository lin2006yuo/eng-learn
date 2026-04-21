'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { CreateCommentAnchorRequest, RootType } from '@/features/comment/types';
import { buildSelectionAnchor, clearBrowserSelection } from '@/features/comment/utils';
import { SelectionActionPopover } from './SelectionActionPopover';

interface SelectableTextProps {
  blockId: string;
  rootId: string;
  rootType: RootType;
  text: string;
  className: string;
  renderText?: (text: string) => React.ReactNode;
  onSelect?: (anchor: CreateCommentAnchorRequest) => void;
}

interface SelectionPosition {
  x: number;
  y: number;
}

export function SelectableText(props: SelectableTextProps) {
  const { blockId, rootId, rootType, text, className, renderText, onSelect } = props;
  const router = useRouter();
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [anchor, setAnchor] = useState<CreateCommentAnchorRequest | null>(null);
  const [position, setPosition] = useState<SelectionPosition | null>(null);

  const content = useMemo(() => (renderText ? renderText(text) : text), [renderText, text]);

  const handleSelection = () => {
    const container = containerRef.current;
    if (!container) return;

    const selection = window.getSelection();
    const nextAnchor = buildSelectionAnchor({
      blockId,
      rootId,
      rootType,
      text,
      container,
      selection,
    });

    if (!nextAnchor) {
      setAnchor(null);
      setPosition(null);
      return;
    }

    const range = selection!.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    setAnchor(nextAnchor);
    setPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 12,
    });
  };

  const handleComment = () => {
    if (!anchor) return;
    onSelect?.(anchor);
    setAnchor(null);
    setPosition(null);
    clearBrowserSelection();
  };

  const handleLogin = () => {
    router.push(`/login?from=${encodeURIComponent(window.location.pathname + window.location.search)}`);
    setAnchor(null);
    setPosition(null);
    clearBrowserSelection();
  };

  return (
    <>
      <div
        ref={containerRef}
        onMouseUp={handleSelection}
        onTouchEnd={handleSelection}
        className={className}
      >
        {content}
      </div>

      {anchor && position ? (
        <SelectionActionPopover
          x={position.x}
          y={position.y}
          isAuthenticated={!!user}
          onComment={handleComment}
          onLogin={handleLogin}
        />
      ) : null}
    </>
  );
}
