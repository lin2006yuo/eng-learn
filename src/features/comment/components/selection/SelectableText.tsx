'use client';

import { useMemo, useRef } from 'react';
import type { RootType } from '@/features/comment/types';
import { buildSelectionAnchor } from '@/features/comment/utils';
import { useSelectionStore } from '@/features/comment/store/selectionStore';

interface SelectableTextProps {
  blockId: string;
  rootId: string;
  rootType: RootType;
  text: string;
  className: string;
  renderText?: (text: string) => React.ReactNode;
}

export function SelectableText(props: SelectableTextProps) {
  const { blockId, rootId, rootType, text, className, renderText } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const { setSelection } = useSelectionStore();

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
      return;
    }

    const range = selection!.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    setSelection(
      nextAnchor,
      {
        x: centerX,
        y: rect.top - 12,
      },
      {
        x: centerX,
        y: rect.bottom + 12,
      },
    );
  };

  return (
    <div
      ref={containerRef}
      onMouseUp={handleSelection}
      onTouchEnd={handleSelection}
      className={className}
    >
      {content}
    </div>
  );
}
