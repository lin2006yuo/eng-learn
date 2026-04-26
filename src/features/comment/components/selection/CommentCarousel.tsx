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
        className="comment-carousel-prev p-1 rounded-full active:bg-[#F5F5F7] transition-colors"
      >
        <ChevronLeft size={16} className="text-[#6E6E73]" />
      </button>

      <span className="comment-carousel-indicator text-[13px] text-[#6E6E73]">
        {currentIndex + 1} / {totalCount}
      </span>

      <button
        type="button"
        onClick={onNext}
        className="comment-carousel-next p-1 rounded-full active:bg-[#F5F5F7] transition-colors"
      >
        <ChevronRight size={16} className="text-[#6E6E73]" />
      </button>
    </div>
  );
}
