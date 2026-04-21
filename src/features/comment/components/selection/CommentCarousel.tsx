'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CommentCarouselProps {
  currentIndex: number;
  totalCount: number;
  onPrev: () => void;
  onNext: () => void;
}

export function CommentCarousel(props: CommentCarouselProps) {
  const { currentIndex, totalCount, onPrev, onNext } = props;

  if (totalCount <= 1) return null;

  return (
    <div className="comment-carousel flex items-center justify-between mb-3">
      <button
        type="button"
        onClick={onPrev}
        className="comment-carousel-prev p-1 rounded-full hover:bg-primary/10 transition-colors"
      >
        <ChevronLeft size={16} className="text-text-secondary" />
      </button>

      <span className="comment-carousel-indicator text-xs text-text-tertiary">
        {currentIndex + 1} / {totalCount}
      </span>

      <button
        type="button"
        onClick={onNext}
        className="comment-carousel-next p-1 rounded-full hover:bg-primary/10 transition-colors"
      >
        <ChevronRight size={16} className="text-text-secondary" />
      </button>
    </div>
  );
}
