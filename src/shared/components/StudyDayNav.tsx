import { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface StudyDayNavProps {
  totalDays: number;
  activeDay: number;
  onSelect: (day: number) => void;
}

export function StudyDayNav({ totalDays, activeDay, onSelect }: StudyDayNavProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [displayActiveDay, setDisplayActiveDay] = useState(activeDay);
  const isManualClickRef = useRef(false);

  useEffect(() => {
    if (isManualClickRef.current) return;
    setDisplayActiveDay(activeDay);
  }, [activeDay]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const button = container.querySelector(`[data-day="${displayActiveDay}"]`) as HTMLElement;
    if (!button) return;

    const containerWidth = container.clientWidth;
    const buttonWidth = button.clientWidth;
    const buttonLeft = button.offsetLeft;
    const scrollLeft = buttonLeft - containerWidth / 2 + buttonWidth / 2;

    container.scrollTo({
      left: Math.max(0, scrollLeft),
      behavior: isManualClickRef.current ? 'auto' : 'smooth',
    });
  }, [displayActiveDay]);

  const handleClick = useCallback(
    (day: number) => {
      if (day === displayActiveDay) return;

      isManualClickRef.current = true;
      setDisplayActiveDay(day);
      onSelect(day);

      setTimeout(() => {
        isManualClickRef.current = false;
      }, 300);
    },
    [displayActiveDay, onSelect]
  );

  const days = Array.from({ length: totalDays }, (_, i) => i + 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative py-2 px-5 bg-[#FAFAFA]"
    >
      <div
        ref={containerRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide py-1"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {days.map((day) => {
          const isActive = day === displayActiveDay;

          return (
            <button
              key={day}
              data-day={day}
              onClick={() => handleClick(day)}
              className={`
                flex-shrink-0 text-[15px] font-medium
                transition-colors duration-200
                ${
                  isActive
                    ? 'text-[#1D1D1F]'
                    : 'text-[#6E6E73]'
                }
              `}
            >
              Day {day}
            </button>
          );
        })}
      </div>

      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#FAFAFA] to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#FAFAFA] to-transparent pointer-events-none" />
    </motion.div>
  );
}

export function StudyDayFab({
  totalDays,
  activeDay,
  onSelect,
}: StudyDayNavProps) {
  const [isOpen, setIsOpen] = useState(false);

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
            {Array.from({ length: totalDays }, (_, i) => i + 1).map((day) => (
              <button
                key={day}
                onClick={() => {
                  onSelect(day);
                  setIsOpen(false);
                }}
                className={`
                  w-10 h-8 rounded-[8px] text-[12px] font-bold
                  transition-colors
                  ${
                    day === activeDay
                      ? 'bg-[#007AFF] text-white'
                      : 'bg-[#F5F5F7] text-[#6E6E73] active:bg-[#E5E5EA]'
                  }
                `}
              >
                D{day}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full bg-[#007AFF] text-white shadow-lg
                   flex items-center justify-center text-sm font-bold active:scale-90 transition-transform"
      >
        {isOpen ? '✕' : `D${activeDay}`}
      </button>
    </div>
  );
}
