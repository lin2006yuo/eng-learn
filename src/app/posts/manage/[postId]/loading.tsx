import { SkeletonDetail } from '@/shared/components/Skeleton';

export default function ManagePostDetailLoading() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="sticky top-0 z-40 flex items-center justify-between bg-[#FAFAFA]/95 px-5 py-3 backdrop-blur-sm">
        <div className="h-10 w-10 animate-pulse rounded-lg bg-[#E5E5EA]" />
        <div className="h-5 w-16 animate-pulse rounded-lg bg-[#E5E5EA]" />
        <div className="h-10 w-10" />
      </div>
      <SkeletonDetail />
    </div>
  );
}
