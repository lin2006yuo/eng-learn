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
      className="relative py-3 px-4 bg-background"
    >
      <div
        ref={containerRef}
        className="flex gap-1.5 overflow-x-auto scrollbar-hide py-1 px-1"
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
                relative flex-shrink-0 w-16 h-8 rounded-full
                flex items-center justify-center
                text-xs font-bold
                transition-all duration-200
                ${
                  isActive
                    ? 'bg-primary text-white shadow-md scale-110'
                    : 'bg-white text-text-secondary hover:bg-gray-100'
                }
              `}
            >
              Day {day}
              {isActive && (
                <span className="absolute inset-0 rounded-full border-2 border-primary" />
              )}
            </button>
          );
        })}
      </div>

      <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-background to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-background to-transparent pointer-events-none" />
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
          className="absolute bottom-14 right-0 bg-white rounded-subtle-card shadow-float p-3 w-48"
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
                  w-10 h-8 rounded-list text-xs font-bold
                  transition-colors
                  ${
                    day === activeDay
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
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
        className="w-12 h-12 rounded-full bg-primary text-white shadow-lg
                   flex items-center justify-center text-sm font-bold active:scale-90 transition-transform"
      >
        {isOpen ? '✕' : `D${activeDay}`}
      </button>
    </div>
  );
}
