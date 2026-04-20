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
    <div className="flex bg-gray-100 rounded-input p-1 mb-6">
      <button
        onClick={() => onTabChange('my')}
        className={`flex-1 py-2.5 text-sm font-medium rounded-input relative transition-colors ${
          activeTab === 'my'
            ? 'text-primary'
            : 'text-text-tertiary hover:text-text-secondary'
        }`}
      >
        {activeTab === 'my' && (
          <div className="absolute inset-0 bg-white rounded-input shadow-sm" />
        )}
        <span className="relative z-10">我的评论</span>
      </button>

      <button
        onClick={() => onTabChange('replies')}
        className={`flex-1 py-2.5 text-sm font-medium rounded-input relative transition-colors ${
          activeTab === 'replies'
            ? 'text-primary'
            : 'text-text-tertiary hover:text-text-secondary'
        }`}
      >
        {activeTab === 'replies' && (
          <div className="absolute inset-0 bg-white rounded-input shadow-sm" />
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
