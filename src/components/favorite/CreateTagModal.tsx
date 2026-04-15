import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface CreateTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, icon: string) => void;
}

const EMOJI_OPTIONS = ['😀', '😎', '🤓', '💡', '⭐', '🔥', '💎', '🎯', '🚀', '🌟', '💪', '👍', '🎉', '💖', '🌈'];

export function CreateTagModal({ isOpen, onClose, onCreate }: CreateTagModalProps) {
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(EMOJI_OPTIONS[0]);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!name.trim()) {
      setError('请输入标签名称');
      return;
    }
    
    onCreate(name.trim(), selectedIcon);
    setName('');
    setSelectedIcon(EMOJI_OPTIONS[0]);
    setError('');
    onClose();
  };

  const handleClose = () => {
    setName('');
    setSelectedIcon(EMOJI_OPTIONS[0]);
    setError('');
    onClose();
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[102]"
            onClick={handleClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl z-[103] w-[90%] max-w-sm p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-text-primary">新建收藏标签</h3>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-text-secondary mb-3">
                选择图标
              </label>
              <div className="grid grid-cols-5 gap-2">
                {EMOJI_OPTIONS.map((emoji) => (
                  <motion.button
                    key={emoji}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedIcon(emoji)}
                    className={`
                      aspect-square rounded-xl text-2xl flex items-center justify-center
                      transition-all duration-200
                      ${selectedIcon === emoji
                        ? 'bg-primary text-white ring-2 ring-primary ring-offset-2'
                        : 'bg-gray-50 hover:bg-gray-100'
                      }
                    `}
                  >
                    {emoji}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-text-secondary mb-2">
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
                className={`
                  w-full px-4 py-3 rounded-xl bg-gray-50 border-2
                  focus:outline-none focus:bg-white transition-colors
                  ${error ? 'border-red-400 focus:border-red-400' : 'border-transparent focus:border-primary/30'}
                `}
              />
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-500 mt-2"
                >
                  {error}
                </motion.p>
              )}
              <p className="text-xs text-text-secondary mt-2 text-right">
                {name.length}/10
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 py-3.5 rounded-xl bg-gray-100 text-text-primary font-semibold hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-3.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-colors"
              >
                创建
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
