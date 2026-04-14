import { useState, useEffect, useCallback, useRef } from 'react';

interface UseScrollSpyOptions {
  // 触发阈值，元素进入视口多少比例时触发 (0-1)
  threshold?: number;
  // 根元素的 margin，用于调整视口范围
  rootMargin?: string;
}

/**
 * 监听元素在视口中的可见性
 * 返回当前最可见的元素 ID
 */
export function useScrollSpy(
  elementIds: string[],
  options: UseScrollSpyOptions = {}
) {
  const { threshold = 0.5, rootMargin = '-100px 0px -50% 0px' } = options;
  const [activeId, setActiveId] = useState<string>('');
  const observersRef = useRef<IntersectionObserver[]>([]);
  const visibilityMapRef = useRef<Map<string, number>>(new Map());

  const updateActiveId = useCallback(() => {
    const entries = Array.from(visibilityMapRef.current.entries());
    if (entries.length === 0) return;

    // 找到可见比例最高的元素
    const mostVisible = entries.reduce((max, current) =>
      current[1] > max[1] ? current : max
    );

    if (mostVisible[1] > 0) {
      setActiveId(mostVisible[0]);
    }
  }, []);

  useEffect(() => {
    // 清理之前的 observers
    observersRef.current.forEach((observer) => observer.disconnect());
    observersRef.current = [];
    visibilityMapRef.current.clear();

    const observers: IntersectionObserver[] = [];

    elementIds.forEach((id) => {
      const element = document.getElementById(id);
      if (!element) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            visibilityMapRef.current.set(id, entry.intersectionRatio);
          });
          updateActiveId();
        },
        {
          threshold: [0, 0.25, 0.5, 0.75, 1],
          rootMargin,
        }
      );

      observer.observe(element);
      observers.push(observer);
    });

    observersRef.current = observers;

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [elementIds, threshold, rootMargin, updateActiveId]);

  return activeId;
}

/**
 * 平滑滚动到指定元素
 */
export function scrollToElement(elementId: string, offset: number = 80) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const elementPosition = element.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.pageYOffset - offset;

  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth',
  });
}
