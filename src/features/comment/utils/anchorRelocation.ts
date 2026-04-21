import type { CommentAnchor } from '@/features/comment/types';

interface ResolvedAnchorPosition {
  anchorStatus: CommentAnchor['anchorStatus'];
  endOffset: number;
  startOffset: number;
}

function findAllMatches(text: string, selectedText: string) {
  const indices: number[] = [];
  let fromIndex = 0;

  while (fromIndex < text.length) {
    const matchIndex = text.indexOf(selectedText, fromIndex);
    if (matchIndex === -1) break;
    indices.push(matchIndex);
    fromIndex = matchIndex + 1;
  }

  return indices;
}

export function resolveAnchorPosition(anchor: CommentAnchor, text: string): ResolvedAnchorPosition {
  const directMatch = text.slice(anchor.startOffset, anchor.endOffset) === anchor.selectedText;
  if (directMatch) {
    return {
      anchorStatus: 'active',
      startOffset: anchor.startOffset,
      endOffset: anchor.endOffset,
    };
  }

  const matches = findAllMatches(text, anchor.selectedText);
  if (matches.length === 0) {
    return {
      anchorStatus: 'orphaned',
      startOffset: anchor.startOffset,
      endOffset: anchor.endOffset,
    };
  }

  const preferredIndex = matches.find((matchIndex) => {
    const prefixMatched = !anchor.prefixText || text.slice(Math.max(0, matchIndex - anchor.prefixText.length), matchIndex) === anchor.prefixText;
    const suffixStart = matchIndex + anchor.selectedText.length;
    const suffixMatched = !anchor.suffixText || text.slice(suffixStart, suffixStart + anchor.suffixText.length) === anchor.suffixText;
    return prefixMatched || suffixMatched;
  }) ?? matches[0];

  return {
    anchorStatus: 'relocated',
    startOffset: preferredIndex,
    endOffset: preferredIndex + anchor.selectedText.length,
  };
}
