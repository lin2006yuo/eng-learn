import { useRef, forwardRef, useImperativeHandle, useLayoutEffect, useState, useCallback } from 'react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { PatternCard } from './PatternCard';
import type { Pattern } from '@/types';

interface VirtualPatternListProps {
  patterns: Pattern[];
  onActiveIndexChange?: (index: number) => void;
}

export interface VirtualPatternListRef {
  scrollToIndex: (index: number) => void;
}

/**
 * 虚拟滚动句型列表 (基于 window 滚动)
 * 支持动态高度，通过 measureElement 自动测量
 */
export const VirtualPatternList = forwardRef<VirtualPatternListRef, VirtualPatternListProps>(
  function VirtualPatternList({ patterns, onActiveIndexChange }, ref) {
    const listRef = useRef<HTMLDivElement>(null);
    const [scrollMargin, setScrollMargin] = useState(0);
    const [isReady, setIsReady] = useState(false);

    // 计算列表距离页面顶部的偏移
    useLayoutEffect(() => {
      if (listRef.current) {
        const offsetTop = listRef.current.offsetTop;
        setScrollMargin(offsetTop);
        setIsReady(true);
      }
    }, []);

    const virtualizer = useWindowVirtualizer({
      count: patterns.length,
      estimateSize: () => 280, // 预估高度，实际会通过 measureElement 调整
      overscan: 3, // 上下各多渲染3个作为缓冲
      scrollMargin,
      measureElement: (element) => {
        // 动态测量元素实际高度
        return element.getBoundingClientRect().height;
      },
      onChange: (instance) => {
        // 通知外部当前可见的第一个索引
        const items = instance.getVirtualItems();
        if (items.length > 0 && onActiveIndexChange) {
          onActiveIndexChange(items[0].index);
        }
      },
    });

    // 自定义滚动到指定索引，使卡片起始点对齐到屏幕中央
    const scrollToIndex = useCallback((index: number) => {
      // 1. 先滚动到 start 对齐，让虚拟列表完成测量
      virtualizer.scrollToIndex(index, {
        align: 'start',
        behavior: 'auto',
      });

      // 2. 等待虚拟列表同步完成测量
      requestAnimationFrame(() => {
        const items = virtualizer.getVirtualItems();
        const item = items.find((i) => i.index === index);
        if (!item) return;

        const viewportHeight = window.innerHeight;
        const finalTop = item.start - viewportHeight / 2;

        // 3. 直接一次滚动到位（居中）
        window.scrollTo({
          top: finalTop,
          behavior: 'auto',
        });
      });
    }, [virtualizer]);

    // 暴露方法给父组件
    useImperativeHandle(ref, () => ({
      scrollToIndex,
    }));

    const virtualItems = virtualizer.getVirtualItems();

    // 在 scrollMargin 计算完成前不渲染，避免位置计算错误
    if (!isReady) {
      return <div ref={listRef} className="px-5" style={{ height: '100vh' }} />;
    }

    return (
      <div
        ref={listRef}
        className="px-5"
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualItems.map((virtualItem) => (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              ref={virtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start - scrollMargin}px)`,
              }}
            >
              <PatternCard
                pattern={patterns[virtualItem.index]}
                index={virtualItem.index}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }
);
