import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import useSWR from 'swr';
import { apiGet } from '@/shared/utils/api';
import { VirtualPatternList, type VirtualPatternListRef } from '@/features/pattern';
import { CommentsModal } from '@/features/comment';
import { StudyDayNav, usePatternCommentModalContext } from '@/shared';
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

  const handleDaySelect = (day: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (selectedDay === day) {
      params.delete('day');
    } else {
      params.set('day', String(day));
    }

    router.push(`${pathname}?${params.toString()}`);

    requestAnimationFrame(() => {
      if (listRef.current) {
        listRef.current.scrollToIndex(0);
      }
      window.scrollTo({ top: 0 });
    });
  };

  const handleBackToSquare = () => {
    router.push('/');
  };

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#FAFAFA]/95 backdrop-blur-sm px-5 py-3 flex items-center gap-3">
        <button
          onClick={handleBackToSquare}
          className="w-10 h-10 flex items-center justify-center active:opacity-50 transition-opacity"
        >
          <ArrowLeft size={20} className="text-[#007AFF]" />
        </button>
        <h2 className="text-[17px] font-semibold text-[#1D1D1F]">
          Day {selectedDay}
        </h2>
      </div>

      {/* Day Nav */}
      {totalDays > 0 && (
        <div className="sticky top-[48px] z-30">
          <StudyDayNav
            totalDays={totalDays}
            activeDay={selectedDay}
            onSelect={handleDaySelect}
          />
        </div>
      )}

      {/* Pattern List */}
      {patternsList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#6E6E73]">
          <p className="text-[15px]">Day {selectedDay} 暂无句型安排</p>
        </div>
      ) : (
        <VirtualPatternList
          ref={listRef}
          patterns={patternsList}
        />
      )}

      {/* Comment Modal */}
      <AnimatePresence>
        {isModalOpen && targetId && (
          <CommentsModal targetId={targetId} />
        )}
      </AnimatePresence>
    </>
  );
}
