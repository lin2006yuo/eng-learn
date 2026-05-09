import { cn } from '@/shared/utils/cn';

interface SkeletonBlockProps {
  className?: string;
}

export function SkeletonBlock({ className }: SkeletonBlockProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-[#E5E5EA]',
        className
      )}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-[16px] bg-white p-5 shadow-sm">
      <SkeletonBlock className="mb-3 h-5 w-3/4" />
      <SkeletonBlock className="mb-2 h-4 w-full" />
      <SkeletonBlock className="mb-4 h-4 w-2/3" />
      <div className="flex items-center gap-3">
        <SkeletonBlock className="h-8 w-8 rounded-full" />
        <SkeletonBlock className="h-3 w-20" />
        <SkeletonBlock className="h-3 w-16" />
      </div>
    </div>
  );
}

export function SkeletonDetail() {
  return (
    <div className="px-5 pt-4">
      <SkeletonBlock className="mb-4 h-7 w-2/3" />
      <div className="mb-6 flex items-center gap-3">
        <SkeletonBlock className="h-6 w-6 rounded-full" />
        <SkeletonBlock className="h-4 w-16" />
        <SkeletonBlock className="h-4 w-24" />
      </div>
      <SkeletonBlock className="mb-3 h-4 w-full" />
      <SkeletonBlock className="mb-3 h-4 w-full" />
      <SkeletonBlock className="mb-3 h-4 w-5/6" />
      <SkeletonBlock className="mb-3 h-4 w-full" />
      <SkeletonBlock className="mb-3 h-4 w-3/4" />
      <SkeletonBlock className="mb-6 h-4 w-2/3" />
      <SkeletonBlock className="h-36 w-full rounded-[16px]" />
    </div>
  );
}

export function SkeletonList() {
  return (
    <div className="space-y-4">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}

export function SkeletonManageList() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 rounded-[14px] bg-white p-4 shadow-sm">
          <SkeletonBlock className="h-5 flex-1" />
          <SkeletonBlock className="h-5 w-5 rounded" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonFavorites() {
  return (
    <div className="space-y-0">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-4 py-4">
          <SkeletonBlock className="h-[44px] w-[44px] rounded-[12px]" />
          <div className="flex-1">
            <SkeletonBlock className="mb-1 h-5 w-28" />
            <SkeletonBlock className="h-4 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}
