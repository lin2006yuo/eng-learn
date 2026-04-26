import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Heart, Star, Bookmark, Briefcase, Lightbulb, Flag, Hash } from 'lucide-react';

interface CreateTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, icon: string) => void;
}

const ICON_OPTIONS = [
  { id: 'heart', icon: Heart, color: '#FF3B30' },
  { id: 'star', icon: Star, color: '#FF9500' },
  { id: 'bookmark', icon: Bookmark, color: '#007AFF' },
  { id: 'briefcase', icon: Briefcase, color: '#5856D6' },
  { id: 'lightbulb', icon: Lightbulb, color: '#FFCC00' },
  { id: 'flag', icon: Flag, color: '#34C759' },
  { id: 'hash', icon: Hash, color: '#8E8E93' },
];

export function CreateTagModal({ isOpen, onClose, onCreate }: CreateTagModalProps) {
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(ICON_OPTIONS[0].id);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!name.trim()) {
      setError('请输入标签名称');
      return;
    }

    onCreate(name.trim(), selectedIcon);
    resetForm();
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setName('');
    setSelectedIcon(ICON_OPTIONS[0].id);
    setError('');
  };

  const modalContent = (
    <>
      {isOpen && (
        <>
          <div
            className="create-tag-modal-overlay fixed inset-0 bg-black/50 z-[102]"
            onClick={handleClose}
          />

          <div className="create-tag-modal fixed bottom-0 left-0 right-0 bg-[#FFFFFF] z-[103] overflow-hidden">
            <div className="flex justify-center px-4 pt-3">
              <span className="create-tag-modal-handle h-1 w-10 rounded-full bg-[#E5E5EA]" />
            </div>

            <div className="border-b border-[#E5E5EA] px-5 pb-3 pt-3">
              <div className="flex items-center justify-between">
                <h3 className="create-tag-title text-[17px] font-semibold text-[#1D1D1F]">新建收藏标签</h3>
                <button
                  onClick={handleClose}
                  className="create-tag-close flex h-8 w-8 items-center justify-center rounded-full active:bg-[#F5F5F7]"
                >
                  <X size={20} className="text-[#6E6E73]" />
                </button>
              </div>
            </div>

            <div className="px-5 py-4">
              <div className="create-tag-name-section mb-5">
                <label className="create-tag-name-label block text-[14px] text-[#6E6E73] mb-2">
                  标签名称
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError('');
                  }}
                  placeholder="输入标签名称"
                  maxLength={10}
                  className="create-tag-name-input w-full px-4 py-3 rounded-[12px] bg-[#F5F5F7] text-[16px] text-[#1D1D1F] placeholder:text-[#C7C7CC] focus:outline-none focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#007AFF]/20"
                />
                {error && (
                  <p className="create-tag-error text-[13px] text-[#FF3B30] mt-2">
                    {error}
                  </p>
                )}
              </div>

              <div className="create-tag-icon-section mb-6">
                <label className="create-tag-icon-label block text-[14px] text-[#6E6E73] mb-3">
                  选择图标
                </label>
                <div className="create-tag-icon-list flex flex-wrap gap-3">
                  {ICON_OPTIONS.map((option) => {
                    const IconComponent = option.icon;
                    const isSelected = selectedIcon === option.id;
                    return (
                      <button
                        key={option.id}
                        onClick={() => setSelectedIcon(option.id)}
                        className={`
                          create-tag-icon-item w-12 h-12 rounded-[12px] flex items-center justify-center
                          transition-all duration-200
                          ${isSelected
                            ? 'bg-[#007AFF]/10 ring-2 ring-[#007AFF]'
                            : 'bg-[#F5F5F7] active:bg-[#E5E5EA]'
                          }
                        `}
                      >
                        <IconComponent
                          size={22}
                          style={{ color: option.color }}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="create-tag-actions flex gap-3">
                <button
                  onClick={handleClose}
                  className="create-tag-cancel flex-1 py-3.5 rounded-[12px] bg-[#F5F5F7] text-[#1D1D1F] text-[17px] font-semibold active:opacity-50"
                >
                  取消
                </button>
                <button
                  onClick={handleSubmit}
                  className="create-tag-submit flex-1 py-3.5 rounded-[12px] bg-[#007AFF] text-[#FFFFFF] text-[17px] font-semibold active:opacity-50"
                >
                  创建
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );

  return createPortal(modalContent, document.body);
}
