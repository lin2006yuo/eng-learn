'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Trash2, BookOpen } from 'lucide-react';
import { useFavoriteStore } from '@/features/favorite/store/favoriteStore';
import { CreateTagModal } from '@/features/favorite/components/CreateTagModal';
import { ConfirmModal } from '@/shared/components/ConfirmModal';
import type { FavoriteTag } from '@/features/favorite/types';

import { useEffect } from 'react';

export const dynamic = 'force-dynamic';

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
    <div className="min-h-screen bg-background">
      {!mounted ? (
        <div className="px-5 py-4">Loading...</div>
      ) : (
        <>
      <header className="sticky top-0 bg-background z-10 px-5 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-text-primary hover:text-primary transition-colors"
          >
            <ArrowLeft size={24} />
            <span className="font-semibold">返回</span>
          </button>

          <h1 className="text-xl font-bold text-text-primary">收藏管理</h1>

          {tags.length > 0 && (
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
            >
              {isEditMode ? '完成' : '编辑'}
            </button>
          )}
        </div>
      </header>

      <div className="px-5 py-4">
        {tags.length === 0 ? (
          <EmptyState onCreate={() => setShowCreateModal(true)} />
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-text-secondary">
                我的标签 <span className="text-text-primary font-semibold">({tags.length}个)</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {tags.map((tag, index) => (
                <TagCard
                  key={tag.id}
                  tag={tag}
                  count={statsMap.get(tag.id) || 0}
                  isEditMode={isEditMode}
                  delay={index * 0.05}
                  onClick={() => handleTagClick(tag.id)}
                  onDelete={() => handleDeleteTag(tag)}
                />
              ))}

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: tags.length * 0.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className="aspect-square rounded-subtle-card border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center">
                  <Plus size={28} className="text-gray-400" />
                </div>
                <span className="text-sm text-gray-500 font-medium">新建标签</span>
              </motion.button>
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

interface TagCardProps {
  tag: FavoriteTag;
  count: number;
  isEditMode: boolean;
  delay: number;
  onClick: () => void;
  onDelete: () => void;
}

function TagCard({ tag, count, isEditMode, delay, onClick, onDelete }: TagCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 300, damping: 30 }}
      className={`
        bg-white rounded-subtle-card p-5 shadow-card relative
        ${isEditMode ? '' : 'cursor-pointer hover:shadow-lg transition-shadow'}
      `}
      onClick={isEditMode ? undefined : onClick}
    >
      {isEditMode && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg"
        >
          <Trash2 size={14} />
        </motion.button>
      )}

      <div className="flex flex-col items-center text-center">
        <span className="text-4xl mb-3">{tag.icon}</span>
        <h3 className="text-lg font-bold text-text-primary mb-1">{tag.name}</h3>
        <p className="text-sm text-text-secondary mb-4">{count}个句型</p>

        {!isEditMode && (
          <div className="flex items-center gap-1 text-primary text-sm font-medium">
            <BookOpen size={16} />
            <span>进入学习</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6"
      >
        <span className="text-5xl">📚</span>
      </motion.div>

      <h3 className="text-xl font-bold text-text-primary mb-2">
        还没有收藏标签
      </h3>
      <p className="text-text-secondary mb-8 text-center">
        创建你的第一个收藏标签吧！
      </p>

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onCreate}
        className="flex items-center gap-2 px-6 py-3.5 bg-primary text-white rounded-subtle-card font-semibold hover:bg-primary-dark transition-colors"
      >
        <Plus size={20} />
        创建标签
      </motion.button>
    </div>
  );
}
