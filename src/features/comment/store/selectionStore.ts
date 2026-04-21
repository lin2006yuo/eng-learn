import { create } from 'zustand';
import type { CreateCommentAnchorRequest } from '@/features/comment/types';

interface SelectionPosition {
  x: number;
  y: number;
}

interface SelectionState {
  anchor: CreateCommentAnchorRequest | null;
  position: SelectionPosition | null;
  onSelectCallback: ((anchor: CreateCommentAnchorRequest) => void) | null;
  setSelection: (
    anchor: CreateCommentAnchorRequest,
    position: SelectionPosition,
    onSelect?: (anchor: CreateCommentAnchorRequest) => void
  ) => void;
  handleComment: () => void;
  clearSelection: () => void;
}

export const useSelectionStore = create<SelectionState>((set, get) => ({
  anchor: null,
  position: null,
  onSelectCallback: null,
  setSelection: (anchor, position, onSelect) => set({
    anchor,
    position,
    onSelectCallback: onSelect || null,
  }),
  handleComment: () => {
    const { anchor, onSelectCallback } = get();
    if (!anchor) return;
    onSelectCallback?.(anchor);
    set({ anchor: null, position: null, onSelectCallback: null });
  },
  clearSelection: () => set({ anchor: null, position: null, onSelectCallback: null }),
  handleDocumentClick: () => {
    const selection = window.getSelection();
    if (!selection || selection.toString().trim().length === 0) {
      set({ anchor: null, position: null, onSelectCallback: null });
    }
  },
}));
