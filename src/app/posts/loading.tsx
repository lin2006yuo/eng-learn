import { SkeletonList } from '@/shared/components/Skeleton';

export default function PostsLoading() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="sticky top-0 z-40 bg-[#FAFAFA]/95 px-5 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10" />
          <div className="h-5 w-20 animate-pulse rounded-lg bg-[#E5E5EA]" />
        </div>
      </div>
      <div className="px-5 pb-10 pt-4">
        <SkeletonList />
      </div>
    </div>
  );
}
