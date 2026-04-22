import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useRef, useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import useSWR from 'swr';
import { apiGet } from '@/shared/utils/api';
import { VirtualPatternList, type VirtualPatternListRef } from '@/features/pattern';
import { CommentsModal } from '@/features/comment';
import { QuickNav, QuickNavFab, StudyDayNav, usePatternCommentModalContext } from '@/shared';
import { useScrollSpy } from '@/shared/hooks/useScrollSpy';
import { commentBus } from '@/shared/utils/eventBus';
import type { Pattern } from '@/shared/types';

function fetcher<T>(url: string): Promise<T> {
  return apiGet<T>(url, undefined, { showErrorToast: 'none' }).then(
    (res) => res.data as T
  );
}

export function PatternLearnPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const listRef = useRef<VirtualPatternListRef>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showFab, setShowFab] = useState(true);

  const urlDay = parseInt(searchParams.get('day') ?? '', 10);
  const selectedDay = Number.isFinite(urlDay) ? urlDay : 1;

  const { isModalOpen, targetId } = usePatternCommentModalContext();

  const { data: dayData } = useSWR<{ days: { dayNumber: number }[] }>(
    '/api/study-days',
    fetcher
  );

  const swrKey = `/api/patterns?day=${selectedDay}`;
  const { data: patterns, mutate } = useSWR<Pattern[]>(
    swrKey,
    fetcher,
    { revalidateOnFocus: false }
  );

  const totalDays = dayData?.days.length ?? 0;

  const patternsList = patterns ?? [];

  useEffect(() => {
    const unsubscribe = commentBus.on('commentChange', (key: string) => {
      const [, rootId] = key.split('-');
      if (rootId && patternsList.some(p => p.id === rootId)) {
        mutate();
      }
    });
    return unsubscribe;
  }, [mutate, patternsList]);
  const patternNumbers = patternsList.map((p) =>
    parseInt(p.id.replace('pattern-', ''), 10)
  );
  const elementIds = patternsList.map((_, idx) => `pattern-idx-${idx}`);
  const activeId = useScrollSpy(elementIds, {
    rootMargin: '-40% 0px -40% 0px',
    threshold: 0,
  });

  useEffect(() => {
    if (activeId) {
      const index = parseInt(activeId.replace('pattern-idx-', ''), 10);
      setActiveIndex(index);
      setShowFab(false);
    }
  }, [activeId]);

  const handleActiveIndexChange = (index: number) => {
    setActiveIndex(index);
    setShowFab(false);
  };

  const handleSelect = (index: number) => {
    if (listRef.current) {
      listRef.current.scrollToIndex(index);
    }
  };

  const handleBackToSquare = () => {
    router.push('/');
  };

  const handleDaySelect = (day: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (selectedDay === day) {
      params.delete('day');
    } else {
      params.set('day', String(day));
    }
    setActiveIndex(0);
    setShowFab(true);

    router.push(`${pathname}?${params.toString()}`);

    requestAnimationFrame(() => {
      if (listRef.current) {
        listRef.current.scrollToIndex(0);
      }
      window.scrollTo({ top: 0 });
    });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm px-5 py-3 flex items-center gap-3"
      >
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleBackToSquare}
          className="w-10 h-10 rounded-full bg-white shadow-card flex items-center justify-center text-text-primary hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={22} />
        </motion.button>
        <h2 className="text-xl font-bold text-text-primary">
          Day {selectedDay}
        </h2>
      </motion.div>

      {totalDays > 0 && (
        <div className="sticky top-[64px] z-30">
          <StudyDayNav
            totalDays={totalDays}
            activeDay={selectedDay}
            onSelect={handleDaySelect}
          />
        </div>
      )}

      {showFab && (
        <QuickNavFab
          total={patternsList.length}
          activeIndex={activeIndex}
          onSelect={handleSelect}
          patternNumbers={patternNumbers}
        />
      )}
      <div className="sticky top-[128px] z-30">
        <QuickNav
          total={patternsList.length}
          activeIndex={activeIndex}
          onSelect={handleSelect}
          patternNumbers={patternNumbers}
        />
      </div>

      {patternsList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-text-secondary">
          <span className="text-6xl mb-4">📚</span>
          <p className="text-lg">Day {selectedDay} 暂无句型安排</p>
        </div>
      ) : (
        <VirtualPatternList
          ref={listRef}
          patterns={patternsList}
          onActiveIndexChange={handleActiveIndexChange}
        />
      )}

      <AnimatePresence>
        {isModalOpen && targetId && (
          <CommentsModal targetId={targetId} />
        )}
      </AnimatePresence>
    </>
  );
}
