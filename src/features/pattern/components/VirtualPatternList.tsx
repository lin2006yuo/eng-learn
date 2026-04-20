import { useRef, forwardRef, useImperativeHandle, useLayoutEffect, useState, useCallback } from 'react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { PatternCard } from './PatternCard';
import type { Pattern } from '@/shared/types';

interface VirtualPatternListProps {
  patterns: Pattern[];
  onActiveIndexChange?: (index: number) => void;
}

export interface VirtualPatternListRef {
  scrollToIndex: (index: number) => void;
}

export const VirtualPatternList = forwardRef<VirtualPatternListRef, VirtualPatternListProps>(
  function VirtualPatternList({ patterns, onActiveIndexChange }, ref) {
    const listRef = useRef<HTMLDivElement>(null);
    const [scrollMargin, setScrollMargin] = useState(0);
    const [isReady, setIsReady] = useState(false);

    useLayoutEffect(() => {
      if (listRef.current) {
        const offsetTop = listRef.current.offsetTop;
        setScrollMargin(offsetTop);
        setIsReady(true);
      }
    }, []);

    const virtualizer = useWindowVirtualizer({
      count: patterns.length,
      estimateSize: () => 280,
      overscan: 3,
      scrollMargin,
      measureElement: (element) => {
        return element.getBoundingClientRect().height;
      },
      onChange: (instance) => {
        const items = instance.getVirtualItems();
        if (items.length > 0 && onActiveIndexChange) {
          onActiveIndexChange(items[0].index);
        }
      },
    });

    const scrollToIndex = useCallback((index: number) => {
      virtualizer.scrollToIndex(index, {
        align: 'start',
        behavior: 'auto',
      });

      requestAnimationFrame(() => {
        const items = virtualizer.getVirtualItems();
        const item = items.find((i) => i.index === index);
        if (!item) return;

        const viewportHeight = window.innerHeight;
        const finalTop = item.start - viewportHeight / 2;

        window.scrollTo({
          top: finalTop,
          behavior: 'auto',
        });
      });
    }, [virtualizer]);

    useImperativeHandle(ref, () => ({
      scrollToIndex,
    }));

    const virtualItems = virtualizer.getVirtualItems();

    if (!isReady) {
      return <div ref={listRef} className="px-5" style={{ height: '100vh' }} />;
    }

    return (
      <div ref={listRef} className="px-5">
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
