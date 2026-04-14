import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface QuickNavProps {
  // 总数量
  total: number;
  // 当前活跃的序号 (1-based)
  activeIndex: number;
  // 点击回调
  onSelect: (index: number) => void;
  // 可见范围 (用于大数据量时显示局部)
  visibleRange?: number;
}

/**
 * 快速导航条组件
 * 多邻国风格：胶囊按钮横向滚动
 */
export function QuickNav({
  total,
  activeIndex,
  onSelect,
  visibleRange = 10,
}: QuickNavProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeButtonRef = useRef<HTMLButtonElement>(null);
  const [isSticky, setIsSticky] = useState(false);

  // 滚动到活跃按钮
  useEffect(() => {
    if (activeButtonRef.current && containerRef.current) {
      const container = containerRef.current;
      const button = activeButtonRef.current;
      const containerRect = container.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();

      const scrollLeft =
        button.offsetLeft -
        containerRect.width / 2 +
        buttonRect.width / 2;

      container.scrollTo({
        left: scrollLeft,
        behavior: 'smooth',
      });
    }
  }, [activeIndex]);

  // 监听滚动实现 sticky 效果
  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const numbers = Array.from({ length: total }, (_, i) => i + 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        sticky top-[60px] z-30 py-2 px-4
        transition-all duration-300
        ${isSticky ? 'bg-background/95 backdrop-blur-sm shadow-sm' : ''}
      `}
    >
      <div
        ref={containerRef}
        className="flex gap-1.5 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {numbers.map((num) => {
          const isActive = num === activeIndex;

          return (
            <motion.button
              key={num}
              ref={isActive ? activeButtonRef : null}
              onClick={() => onSelect(num)}
              whileTap={{ scale: 0.9 }}
              className={`
                relative flex-shrink-0 w-9 h-9 rounded-full
                flex items-center justify-center
                text-sm font-bold snap-center
                transition-all duration-200
                ${
                  isActive
                    ? 'bg-primary text-white shadow-md scale-110'
                    : 'bg-white text-text-secondary hover:bg-gray-100'
                }
              `}
            >
              {num}

              {/* 活跃指示器动画 */}
              {isActive && (
                <motion.div
                  layoutId="activeNavIndicator"
                  className="absolute inset-0 rounded-full border-2 border-primary"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </motion.button>
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
 * 点击展开数字网格
 */
export function QuickNavFab({
  total,
  activeIndex,
  onSelect,
}: QuickNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-24 right-4 z-50">
      {/* 展开的网格 */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          className="absolute bottom-14 right-0 bg-white rounded-2xl shadow-float p-3 w-48"
        >
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: total }, (_, i) => i + 1).map((num) => (
              <motion.button
                key={num}
                onClick={() => {
                  onSelect(num);
                  setIsOpen(false);
                }}
                whileTap={{ scale: 0.9 }}
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
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* 触发按钮 */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileTap={{ scale: 0.9 }}
        className="w-12 h-12 rounded-full bg-primary text-white shadow-lg
                   flex items-center justify-center text-lg font-bold"
      >
        {isOpen ? '✕' : activeIndex}
      </motion.button>
    </div>
  );
}
