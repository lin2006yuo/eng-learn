import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface NoteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (content: string) => void;
  initialContent?: string;
}

export function NoteFormModal({ isOpen, onClose, onSave, initialContent = '' }: NoteFormModalProps) {
  const [content, setContent] = useState(initialContent);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setContent(initialContent);
      setError('');
    }
  }, [isOpen, initialContent]);

  const handleSave = () => {
    const trimmed = content.trim();
    if (!trimmed) {
      setError('请输入内容');
      return;
    }
    onSave(trimmed);
    setContent('');
    onClose();
  };

  const handleClose = () => {
    setContent('');
    setError('');
    onClose();
  };

  const isEditing = !!initialContent;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
            onClick={handleClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative bg-[#FAFAFA] w-full max-w-xl h-[80vh] flex flex-col rounded-[8px]"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E5EA] flex-shrink-0">
              <h3 className="text-[17px] font-semibold text-[#1D1D1F]">
                {isEditing ? '编辑笔记' : '新增笔记'}
              </h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleSave}
                  className="text-[15px] font-medium text-[#007AFF] active:opacity-50 transition-opacity disabled:text-[#C7C7CC]"
                  disabled={!content.trim()}
                >
                  保存
                </button>
                <button
                  onClick={handleClose}
                  className="w-9 h-9 flex items-center justify-center text-[#C7C7CC] active:opacity-50 transition-opacity"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            <div className="flex-1 p-5 min-h-0">
              <textarea
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  setError('');
                }}
                placeholder="想写什么就写什么..."
                className="w-full h-full p-0 bg-transparent border-0 resize-none outline-none text-[16px] text-[#1D1D1F] placeholder:text-[#C7C7CC] leading-snug"
                autoFocus
              />
            </div>

            {error && (
              <div className="px-5 pb-3">
                <span className="text-[13px] text-[#FF3B30]">{error}</span>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
