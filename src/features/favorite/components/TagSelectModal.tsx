import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Check } from 'lucide-react';
import { useFavoriteStore } from '@/features/favorite/store/favoriteStore';
import { CreateTagModal } from './CreateTagModal';
import type { FavoriteTag } from '../types';

interface TagSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  patternId: string;
  initialSelectedTags: string[];
}

export function TagSelectModal({ isOpen, onClose, patternId, initialSelectedTags }: TagSelectModalProps) {
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(initialSelectedTags);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const tags = useFavoriteStore((state) => state.tags);
  const addFavorite = useFavoriteStore((state) => state.addFavorite);
  const updateFavoriteTags = useFavoriteStore((state) => state.updateFavoriteTags);
  const removeFavorite = useFavoriteStore((state) => state.removeFavorite);

  const handleTagToggle = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleConfirm = () => {
    if (selectedTagIds.length > 0) {
      if (initialSelectedTags.length > 0) {
        updateFavoriteTags(patternId, selectedTagIds);
      } else {
        addFavorite(patternId, selectedTagIds);
      }
    } else {
      removeFavorite(patternId);
    }
    onClose();
  };

  const handleCreateTag = (name: string, icon: string) => {
    const newTag = useFavoriteStore.getState().addTag(name, icon);
    setSelectedTagIds((prev) => [...prev, newTag.id]);
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[100]"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-modal z-[101] max-h-[80vh] overflow-hidden"
          >
            <div className="p-5">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-text-primary">选择收藏标签</h3>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <X size={18} className="text-gray-500" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6 max-h-[50vh] overflow-y-auto">
                {tags.map((tag) => (
                  <TagCard
                    key={tag.id}
                    tag={tag}
                    isSelected={selectedTagIds.includes(tag.id)}
                    onClick={() => handleTagToggle(tag.id)}
                  />
                ))}
                
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCreateModal(true)}
                  className="aspect-[5/6] rounded-subtle-card border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
                    <Plus size={24} className="text-gray-400" />
                  </div>
                  <span className="text-sm text-gray-500 font-medium">新建标签</span>
                </motion.button>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3.5 rounded-subtle-card bg-gray-100 text-text-primary font-semibold hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 py-3.5 rounded-subtle-card bg-primary text-white font-semibold hover:bg-primary-dark transition-colors"
                >
                  确定
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {createPortal(modalContent, document.body)}
      <CreateTagModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateTag}
      />
    </>
  );
}

interface TagCardProps {
  tag: FavoriteTag;
  isSelected: boolean;
  onClick: () => void;
}

function TagCard({ tag, isSelected, onClick }: TagCardProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        aspect-[5/6] rounded-subtle-card flex flex-col items-center justify-center gap-2 relative
        transition-all duration-200
        ${isSelected 
          ? 'bg-primary text-white' 
          : 'bg-white border-2 border-gray-100 text-text-primary hover:border-gray-200'
        }
      `}
    >
      <span className="text-3xl">{tag.icon}</span>
      <span className="text-sm font-medium">{tag.name}</span>
      
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center"
        >
          <Check size={12} className="text-primary" />
        </motion.div>
      )}
    </motion.button>
  );
}
