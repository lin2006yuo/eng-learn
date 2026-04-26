import { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface QuickNavProps {
  total: number;
  activeIndex: number;
  onSelect: (index: number) => void;
  patternNumbers?: number[];
}

export function QuickNav({ total, activeIndex, onSelect, patternNumbers }: QuickNavProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [displayActiveIndex, setDisplayActiveIndex] = useState(activeIndex);
  const isManualClickRef = useRef(false);

  useEffect(() => {
    if (isManualClickRef.current) {
      return;
    }
    setDisplayActiveIndex(activeIndex);
  }, [activeIndex]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const displayValue = patternNumbers?.[displayActiveIndex] ?? displayActiveIndex + 1;
    const button = container.querySelector(`[data-value="${displayValue}"]`) as HTMLElement;
    if (!button) return;

    const containerWidth = container.clientWidth;
    const buttonWidth = button.clientWidth;
    const buttonLeft = button.offsetLeft;
    const scrollLeft = buttonLeft - containerWidth / 2 + buttonWidth / 2;

    container.scrollTo({
      left: Math.max(0, scrollLeft),
      behavior: isManualClickRef.current ? 'auto' : 'smooth',
    });
  }, [displayActiveIndex, patternNumbers]);

  const handleClick = useCallback(
    (index: number) => {
      if (index === displayActiveIndex) return;

      isManualClickRef.current = true;
      setDisplayActiveIndex(index);
      onSelect(index);

      setTimeout(() => {
        isManualClickRef.current = false;
      }, 300);
    },
    [displayActiveIndex, onSelect]
  );

  const displayNumbers = patternNumbers ?? Array.from({ length: total }, (_, i) => i + 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative py-3 px-4 bg-[#FAFAFA]"
    >
      <div
        ref={containerRef}
        className="flex gap-1.5 overflow-x-auto scrollbar-hide py-1 px-1"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {displayNumbers.map((num, idx) => {
          const isActive = idx === displayActiveIndex;

          return (
            <button
              key={num}
              data-value={num}
              onClick={() => handleClick(idx)}
              className={`
                relative flex-shrink-0 w-8 h-8 rounded-full
                flex items-center justify-center
                text-sm font-medium
                transition-all duration-200
                ${
                  isActive
                    ? 'text-[#007AFF] bg-[#007AFF]/10'
                    : 'text-[#6E6E73] bg-transparent'
                }
              `}
            >
              {num}
            </button>
          );
        })}
      </div>

      <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-[#FAFAFA] to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-[#FAFAFA] to-transparent pointer-events-none" />
    </motion.div>
  );
}

export function QuickNavFab({
  total,
  activeIndex,
  onSelect,
  patternNumbers,
}: QuickNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  const displayNumbers = patternNumbers ?? Array.from({ length: total }, (_, i) => i + 1);

  return (
    <div className="fixed bottom-24 right-4 z-50">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          className="absolute bottom-14 right-0 bg-white rounded-[12px] shadow-lg p-3 w-48"
        >
          <div className="grid grid-cols-5 gap-2">
            {displayNumbers.map((num, idx) => (
              <button
                key={num}
                onClick={() => {
                  onSelect(idx);
                  setIsOpen(false);
                }}
                className={`
                  w-8 h-8 rounded-[8px] text-[12px] font-bold
                  transition-colors
                  ${
                    idx === activeIndex
                      ? 'bg-[#007AFF] text-white'
                      : 'bg-[#F5F5F7] text-[#6E6E73] active:bg-[#E5E5EA]'
                  }
                `}
              >
                {num}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full bg-[#007AFF] text-white shadow-lg
                   flex items-center justify-center text-lg font-bold active:scale-90 transition-transform"
      >
        {isOpen ? '✕' : (patternNumbers?.[activeIndex] ?? activeIndex)}
      </button>
    </div>
  );
}
