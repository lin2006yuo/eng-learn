import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Plus, X, Check, Heart, Star, Bookmark, Briefcase, Lightbulb, Flag } from 'lucide-react';
import { useFavoriteStore } from '@/features/favorite/store/favoriteStore';
import { CreateTagModal } from './CreateTagModal';
import type { FavoriteTag } from '../types';

const TAG_ICONS: Record<string, React.ReactNode> = {
  heart: <Heart size={20} />,
  star: <Star size={20} />,
  bookmark: <Bookmark size={20} />,
  briefcase: <Briefcase size={20} />,
  lightbulb: <Lightbulb size={20} />,
  flag: <Flag size={20} />,
};

const TAG_ICON_COLORS: Record<string, string> = {
  heart: '#FF3B30',
  star: '#FF9500',
  bookmark: '#007AFF',
  briefcase: '#5856D6',
  lightbulb: '#FFCC00',
  flag: '#34C759',
};

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
    <>
      {isOpen && (
        <>
          <div
            className="tag-select-modal-overlay fixed inset-0 bg-black/50 z-[100]"
            onClick={onClose}
          />

          <div className="tag-select-modal fixed bottom-0 left-0 right-0 bg-[#FFFFFF] z-[101] overflow-hidden">
            <div className="flex justify-center px-4 pt-3">
              <span className="tag-select-modal-handle h-1 w-10 rounded-full bg-[#E5E5EA]" />
            </div>

            <div className="border-b border-[#E5E5EA] px-5 pb-3 pt-3">
              <div className="flex items-center justify-between">
                <h3 className="tag-select-title text-[17px] font-semibold text-[#1D1D1F]">选择收藏标签</h3>
                <button
                  onClick={onClose}
                  className="tag-select-close flex h-8 w-8 items-center justify-center rounded-full active:bg-[#F5F5F7]"
                >
                  <X size={20} className="text-[#6E6E73]" />
                </button>
              </div>
            </div>

            <div className="max-h-[320px] overflow-y-auto">
              {tags.map((tag) => (
                <TagListItem
                  key={tag.id}
                  tag={tag}
                  isSelected={selectedTagIds.includes(tag.id)}
                  onClick={() => handleTagToggle(tag.id)}
                />
              ))}

              <button
                onClick={() => setShowCreateModal(true)}
                className="tag-select-create w-full px-5 py-4 flex items-center gap-3 active:bg-[#F5F5F7]"
              >
                <div className="tag-select-create-icon w-8 h-8 rounded-[8px] bg-[#F5F5F7] flex items-center justify-center">
                  <Plus size={18} className="text-[#6E6E73]" />
                </div>
                <span className="tag-select-create-label text-[16px] text-[#007AFF]">新建标签</span>
              </button>
            </div>

            <div className="border-t border-[#E5E5EA] px-5 py-4 flex gap-3">
              <button
                onClick={onClose}
                className="tag-select-cancel flex-1 py-3.5 rounded-[12px] bg-[#F5F5F7] text-[#1D1D1F] text-[17px] font-semibold active:opacity-50"
              >
                取消
              </button>
              <button
                onClick={handleConfirm}
                className="tag-select-confirm flex-1 py-3.5 rounded-[12px] bg-[#007AFF] text-[#FFFFFF] text-[17px] font-semibold active:opacity-50"
              >
                确定
              </button>
            </div>
          </div>
        </>
      )}
    </>
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

interface TagListItemProps {
  tag: FavoriteTag;
  isSelected: boolean;
  onClick: () => void;
}

function TagListItem({ tag, isSelected, onClick }: TagListItemProps) {
  const iconColor = TAG_ICON_COLORS[tag.icon] || '#6E6E73';
  const icon = TAG_ICONS[tag.icon] || <Bookmark size={20} />;

  return (
    <button
      onClick={onClick}
      className="tag-select-item w-full px-5 py-4 flex items-center justify-between border-b border-[#E5E5EA] active:bg-[#F5F5F7]"
    >
      <div className="flex items-center gap-3">
        <span className="tag-select-item-icon" style={{ color: iconColor }}>
          {icon}
        </span>
        <span className="tag-select-item-name text-[16px] text-[#1D1D1F]">{tag.name}</span>
      </div>
      {isSelected && (
        <Check size={20} className="tag-select-item-check text-[#007AFF]" />
      )}
    </button>
  );
}
