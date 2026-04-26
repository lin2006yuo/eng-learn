'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Heart, Star, Bookmark, Briefcase, Lightbulb, Flag, Hash } from 'lucide-react';
import { useFavoriteStore } from '@/features/favorite/store/favoriteStore';
import { CreateTagModal } from '@/features/favorite/components/CreateTagModal';
import { ConfirmModal } from '@/shared/components/ConfirmModal';
import type { FavoriteTag } from '@/features/favorite/types';

import { useEffect } from 'react';

export const dynamic = 'force-dynamic';

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>> = {
  heart: Heart,
  star: Star,
  bookmark: Bookmark,
  briefcase: Briefcase,
  lightbulb: Lightbulb,
  flag: Flag,
  hash: Hash,
};

const ICON_COLORS: Record<string, string> = {
  heart: '#FF3B30',
  star: '#FF9500',
  bookmark: '#007AFF',
  briefcase: '#5856D6',
  lightbulb: '#FFCC00',
  flag: '#34C759',
  hash: '#8E8E93',
};

export default function FavoritesPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<FavoriteTag | null>(null);

  const tags = useFavoriteStore((state) => state.tags);
  const getTagStats = useFavoriteStore((state) => state.getTagStats);
  const deleteTag = useFavoriteStore((state) => state.deleteTag);
  const addTag = useFavoriteStore((state) => state.addTag);
  const setFilterTag = useFavoriteStore((state) => state.setFilterTag);

  useEffect(() => {
    setMounted(true);
  }, []);

  const tagStats = getTagStats();
  const statsMap = new Map(tagStats.map((s) => [s.tagId, s.count]));

  const handleTagClick = (tagId: string) => {
    if (isEditMode) return;
    setFilterTag(tagId);
    router.push('/pattern-learn');
  };

  const handleCreateTag = (name: string, icon: string) => {
    addTag(name, icon);
  };

  const handleDeleteTag = (tag: FavoriteTag) => {
    const count = statsMap.get(tag.id) || 0;
    if (count > 0) {
      setTagToDelete(tag);
    } else {
      deleteTag(tag.id);
    }
  };

  const confirmDelete = () => {
    if (tagToDelete) {
      deleteTag(tagToDelete.id);
      setTagToDelete(null);
    }
  };

  return (
    <div className="favorites-page min-h-screen bg-[#FAFAFA]">
      {!mounted ? (
        <div className="px-5 py-4">Loading...</div>
      ) : (
        <>
          <header className="favorites-header sticky top-0 bg-[#FAFAFA]/95 backdrop-blur-sm z-10 px-5 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => router.push('/')}
                className="favorites-back flex items-center gap-2 text-[#007AFF] active:opacity-50 transition-opacity"
              >
                <ArrowLeft size={20} />
                <span className="text-[17px] font-semibold">返回</span>
              </button>

              <h1 className="favorites-title text-[17px] font-semibold text-[#1D1D1F]">收藏管理</h1>

              {tags.length > 0 && (
                <button
                  onClick={() => setIsEditMode(!isEditMode)}
                  className="favorites-edit text-[14px] font-medium text-[#007AFF] active:opacity-50 transition-opacity"
                >
                  {isEditMode ? '完成' : '编辑'}
                </button>
              )}
            </div>
          </header>

          <div className="favorites-content px-5 py-4">
            {tags.length === 0 ? (
              <EmptyState onCreate={() => setShowCreateModal(true)} />
            ) : (
              <>
                <div className="favorites-stats mb-4">
                  <p className="text-[14px] text-[#6E6E73]">
                    我的标签 <span className="text-[#1D1D1F] font-semibold">({tags.length}个)</span>
                  </p>
                </div>

                <div className="favorites-list">
                  {tags.map((tag) => (
                    <TagListItem
                      key={tag.id}
                      tag={tag}
                      count={statsMap.get(tag.id) || 0}
                      isEditMode={isEditMode}
                      onClick={() => handleTagClick(tag.id)}
                      onDelete={() => handleDeleteTag(tag)}
                    />
                  ))}

                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="favorites-add-btn w-full flex items-center gap-4 py-4 active:opacity-50 transition-opacity text-left"
                  >
                    <div className="w-[44px] h-[44px] rounded-[12px] bg-[#F5F5F7] flex items-center justify-center flex-shrink-0">
                      <Plus size={20} className="text-[#6E6E73]" />
                    </div>
                    <span className="flex-1 text-[16px] font-semibold text-[#1D1D1F]">新建标签</span>
                    <ArrowLeft size={16} className="text-[#C7C7CC] flex-shrink-0 rotate-180" />
                  </button>
                </div>
              </>
            )}
          </div>

          <CreateTagModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreateTag}
          />

          {tagToDelete && (
            <ConfirmModal
              isOpen={!!tagToDelete}
              title="删除标签"
              message={`「${tagToDelete.name}」标签下有 ${statsMap.get(tagToDelete.id) || 0} 个句型，删除后这些句型将移出此标签。`}
              confirmText="删除"
              onConfirm={confirmDelete}
              onCancel={() => setTagToDelete(null)}
            />
          )}
        </>
      )}
    </div>
  );
}

interface TagListItemProps {
  tag: FavoriteTag;
  count: number;
  isEditMode: boolean;
  onClick: () => void;
  onDelete: () => void;
}

function TagListItem({ tag, count, isEditMode, onClick, onDelete }: TagListItemProps) {
  const Icon = ICON_MAP[tag.icon] || Heart;
  const iconColor = ICON_COLORS[tag.icon] || '#FF3B30';

  return (
    <div className="favorites-tag-item">
      <div className="w-full flex items-center gap-4 py-4">
        <button
          onClick={onClick}
          disabled={isEditMode}
          className="flex-1 flex items-center gap-4 text-left disabled:opacity-50"
        >
          <div
            className="w-[44px] h-[44px] rounded-[12px] flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${iconColor}15` }}
          >
            <Icon size={20} style={{ color: iconColor }} />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-[16px] font-semibold text-[#1D1D1F] tracking-tight">{tag.name}</h3>
            <p className="text-[13px] text-[#6E6E73] mt-0.5">{count}个句型</p>
          </div>
        </button>

        {isEditMode ? (
          <button
            onClick={onDelete}
            className="text-[14px] font-medium text-[#FF3B30] active:opacity-50 transition-opacity px-2"
          >
            删除
          </button>
        ) : (
          <ArrowLeft size={16} className="text-[#C7C7CC] flex-shrink-0 rotate-180" />
        )}
      </div>

      <div className="h-px bg-[#E5E5EA] ml-[60px]" />
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="favorites-empty flex flex-col items-center justify-center py-16">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="w-20 h-20 rounded-full bg-[#E8F0FE] flex items-center justify-center mb-6"
      >
        <Heart size={32} className="text-[#1A73E8]" />
      </motion.div>

      <h3 className="favorites-empty-title text-[18px] font-semibold text-[#1D1D1F] mb-2">
        还没有收藏标签
      </h3>
      <p className="favorites-empty-desc text-[14px] text-[#6E6E73] mb-8 text-center">
        创建你的第一个收藏标签吧！
      </p>

      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={onCreate}
        className="favorites-empty-btn flex items-center gap-2 px-6 py-3.5 bg-[#007AFF] text-white rounded-[12px] text-[17px] font-semibold active:opacity-50 transition-opacity"
      >
        <Plus size={20} />
        创建标签
      </motion.button>
    </div>
  );
}
