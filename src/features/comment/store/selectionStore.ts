import { create } from 'zustand';
import type { CreateCommentAnchorRequest } from '@/features/comment/types';

interface SelectionPosition {
  x: number;
  y: number;
}

interface SelectionState {
  anchor: CreateCommentAnchorRequest | null;
  position: SelectionPosition | null;
  composerAnchor: CreateCommentAnchorRequest | null;
  composerPosition: SelectionPosition | null;
  setSelection: (
    anchor: CreateCommentAnchorRequest,
    position: SelectionPosition,
    composerPosition: SelectionPosition
  ) => void;
  openComposer: () => void;
  clearSelection: () => void;
  closeComposer: () => void;
  handleDocumentClick: () => void;
}

export const useSelectionStore = create<SelectionState>((set, get) => ({
  anchor: null,
  position: null,
  composerAnchor: null,
  composerPosition: null,
  setSelection: (anchor, position, composerPosition) => set({
    anchor,
    position,
    composerAnchor: null,
    composerPosition,
  }),
  openComposer: () => {
    const { anchor, composerPosition } = get();
    if (!anchor || !composerPosition) return;
    set({
      anchor: null,
      position: null,
      composerAnchor: anchor,
      composerPosition,
    });
  },
  clearSelection: () => set({ anchor: null, position: null }),
  closeComposer: () => set({ composerAnchor: null, composerPosition: null }),
  handleDocumentClick: () => {
    const selection = window.getSelection();
    if (!selection || selection.toString().trim().length === 0) {
      set({ anchor: null, position: null });
    }
  },
}));
