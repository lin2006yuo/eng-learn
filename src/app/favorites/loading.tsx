import { SkeletonFavorites } from '@/shared/components/Skeleton';

export default function FavoritesLoading() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="sticky top-0 z-10 bg-[#FAFAFA]/95 px-5 py-4 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="h-5 w-14 animate-pulse rounded-lg bg-[#E5E5EA]" />
          <div className="h-5 w-20 animate-pulse rounded-lg bg-[#E5E5EA]" />
          <div className="h-5 w-10" />
        </div>
      </div>
      <div className="px-5 py-4">
        <SkeletonFavorites />
      </div>
    </div>
  );
}
