'use client';
import { useState, useEffect, useCallback, useRef } from 'react';

interface UseScrollSpyOptions {
  threshold?: number;
  rootMargin?: string;
}

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

    const mostVisible = entries.reduce((max, current) =>
      current[1] > max[1] ? current : max
    );

    if (mostVisible[1] > 0) {
      setActiveId(mostVisible[0]);
    }
  }, []);

  useEffect(() => {
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

export function scrollToElement(elementId: string, offset: number = 80) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const elementPosition = element.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.pageYOffset - offset;

  window.scrollTo({
    top: offsetPosition,
    behavior: 'auto',
  });
}
