'use client';

import { TabBarBadge } from '@/shared/components/TabBarBadge';

export type CommentTab = 'my' | 'replies';

interface CommentTabsProps {
  activeTab: CommentTab;
  onTabChange: (tab: CommentTab) => void;
  myCount?: number;
  repliesCount?: number;
}

export function CommentTabs({
  activeTab,
  onTabChange,
  myCount,
  repliesCount,
}: CommentTabsProps) {
  return (
    <div className="flex bg-[#F5F5F7] rounded-[12px] p-1 mb-6">
      <button
        onClick={() => onTabChange('my')}
        className={`flex-1 py-2.5 text-[14px] font-medium rounded-[10px] relative transition-colors ${
          activeTab === 'my'
            ? 'text-[#007AFF]'
            : 'text-[#6E6E73] active:text-[#3A3A3C]'
        }`}
      >
        {activeTab === 'my' && (
          <div className="absolute inset-0 bg-white rounded-[10px] shadow-sm" />
        )}
        <span className="relative z-10">我的评论</span>
      </button>

      <button
        onClick={() => onTabChange('replies')}
        className={`flex-1 py-2.5 text-[14px] font-medium rounded-[10px] relative transition-colors ${
          activeTab === 'replies'
            ? 'text-[#007AFF]'
            : 'text-[#6E6E73] active:text-[#3A3A3C]'
        }`}
      >
        {activeTab === 'replies' && (
          <div className="absolute inset-0 bg-white rounded-[10px] shadow-sm" />
        )}
        <span className="relative z-10 flex items-center justify-center gap-1">
          回复我的
          {repliesCount !== undefined && repliesCount > 0 && (
            <TabBarBadge count={repliesCount} />
          )}
        </span>
      </button>
    </div>
  );
}
