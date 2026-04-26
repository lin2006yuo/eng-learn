'use client';

import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

interface AnchorHighlightState {
  activeBlockId: string | null;
  activeSegmentIndex: number | null;
}

interface AnchorHighlightContextValue extends AnchorHighlightState {
  setActiveAnchor: (blockId: string | null, segmentIndex: number | null) => void;
  clearActiveAnchor: () => void;
}

const AnchorHighlightContext = createContext<AnchorHighlightContextValue | null>(null);

export function AnchorHighlightProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AnchorHighlightState>({
    activeBlockId: null,
    activeSegmentIndex: null,
  });

  const setActiveAnchor = useCallback((blockId: string | null, segmentIndex: number | null) => {
    setState({ activeBlockId: blockId, activeSegmentIndex: segmentIndex });
  }, []);

  const clearActiveAnchor = useCallback(() => {
    setState({ activeBlockId: null, activeSegmentIndex: null });
  }, []);

  return (
    <AnchorHighlightContext.Provider
      value={{
        ...state,
        setActiveAnchor,
        clearActiveAnchor,
      }}
    >
      {children}
    </AnchorHighlightContext.Provider>
  );
}

export function useAnchorHighlight() {
  const context = useContext(AnchorHighlightContext);
  if (!context) {
    throw new Error('useAnchorHighlight must be used within AnchorHighlightProvider');
  }
  return context;
}

export function useScrollToActiveAnchor(enabled: boolean = true) {
  const { activeBlockId, activeSegmentIndex } = useAnchorHighlight();
  const prevStateRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    if (!activeBlockId || activeSegmentIndex === null) {
      prevStateRef.current = null;
      return;
    }

    const stateKey = `${activeBlockId}-${activeSegmentIndex}`;
    if (prevStateRef.current === stateKey) return;
    prevStateRef.current = stateKey;

    const scrollToAnchor = () => {
      const element = document.querySelector(
        `[data-anchor-block="${activeBlockId}"] [data-anchor-index="${activeSegmentIndex}"]`
      );

      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest',
        });
      }
    };

    const timer = setTimeout(scrollToAnchor, 100);
    return () => clearTimeout(timer);
  }, [activeBlockId, activeSegmentIndex, enabled]);
}
