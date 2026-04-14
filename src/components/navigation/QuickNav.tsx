import { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface QuickNavProps {
  total: number;
  activeIndex: number;
  onSelect: (index: number) => void;
}

/**
 * 快速导航条组件
 * 点击数字时，该数字会居中显示在导航条中
 */
export function QuickNav({ total, activeIndex, onSelect }: QuickNavProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);
  const [displayActiveIndex, setDisplayActiveIndex] = useState(activeIndex);
  const isManualClickRef = useRef(false);

  // 同步外部 activeIndex，但如果是手动点击则延迟同步
  useEffect(() => {
    if (isManualClickRef.current) {
      // 手动点击期间，不同步外部的 activeIndex
      return;
    }
    setDisplayActiveIndex(activeIndex);
  }, [activeIndex]);

  // 当 displayActiveIndex 变化时，滚动到对应按钮
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const button = container.querySelector(`[data-index="${displayActiveIndex}"]`) as HTMLElement;
    if (!button) return;

    const containerWidth = container.clientWidth;
    const buttonWidth = button.clientWidth;
    const buttonLeft = button.offsetLeft;

    // 计算滚动位置，使按钮居中
    const scrollLeft = buttonLeft - containerWidth / 2 + buttonWidth / 2;

    container.scrollTo({
      left: Math.max(0, scrollLeft),
      behavior: isManualClickRef.current ? 'auto' : 'smooth',
    });
  }, [displayActiveIndex]);

  // 监听窗口滚动实现 sticky 效果
  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 150);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 处理点击
  const handleClick = useCallback(
    (index: number) => {
      if (index === displayActiveIndex) return;

      isManualClickRef.current = true;
      setDisplayActiveIndex(index);
      onSelect(index);

      // 300ms 后恢复自动同步
      setTimeout(() => {
        isManualClickRef.current = false;
      }, 300);
    },
    [displayActiveIndex, onSelect]
  );

  const numbers = Array.from({ length: total }, (_, i) => i + 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        sticky top-[72px] z-30 py-3 px-4
        transition-all duration-300
        ${isSticky ? 'bg-background/95 backdrop-blur-sm shadow-sm' : ''}
      `}
    >
      <div
        ref={containerRef}
        className="flex gap-1.5 overflow-x-auto scrollbar-hide py-1 px-1"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {numbers.map((num) => {
          const isActive = num === displayActiveIndex;

          return (
            <button
              key={num}
              data-index={num}
              onClick={() => handleClick(num)}
              className={`
                relative flex-shrink-0 w-8 h-8 rounded-full
                flex items-center justify-center
                text-sm font-bold
                transition-all duration-200
                ${
                  isActive
                    ? 'bg-primary text-white shadow-md scale-110'
                    : 'bg-white text-text-secondary hover:bg-gray-100'
                }
              `}
            >
              {num}
              {isActive && (
                <span className="absolute inset-0 rounded-full border-2 border-primary" />
              )}
            </button>
          );
        })}
      </div>

      {/* 左右渐变遮罩 */}
      <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-background to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-background to-transparent pointer-events-none" />
    </motion.div>
  );
}

/**
 * 快速跳转浮球 (备选方案)
 */
export function QuickNavFab({
  total,
  activeIndex,
  onSelect,
}: QuickNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-24 right-4 z-50">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          className="absolute bottom-14 right-0 bg-white rounded-2xl shadow-float p-3 w-48"
        >
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: total }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => {
                  onSelect(num);
                  setIsOpen(false);
                }}
                className={`
                  w-8 h-8 rounded-lg text-xs font-bold
                  transition-colors
                  ${
                    num === activeIndex
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
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
        className="w-12 h-12 rounded-full bg-primary text-white shadow-lg
                   flex items-center justify-center text-lg font-bold active:scale-90 transition-transform"
      >
        {isOpen ? '✕' : activeIndex}
      </button>
    </div>
  );
}
