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
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative bg-white rounded-modal w-full max-w-xl h-[80vh] flex flex-col"
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
              <h3 className="text-xl font-bold text-text-primary">
                {isEditing ? '编辑笔记' : '新增笔记'}
              </h3>
              <button
                onClick={handleClose}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 p-5 min-h-0">
              <textarea
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  setError('');
                }}
                placeholder="想写什么就写什么..."
                className="w-full h-full p-4 rounded-subtle-card bg-gray-50 border-2 border-transparent focus:border-[#58CC71] focus:bg-white resize-none outline-none transition-colors text-text-primary placeholder:text-gray-400 text-lg leading-relaxed"
                autoFocus
              />
            </div>

            <div className="p-5 border-t border-gray-100 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <span className={`text-sm ${error ? 'text-red-500' : 'text-transparent'}`}>
                  {error}
                </span>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                className="w-full py-4 rounded-subtle-card font-bold text-lg transition-colors bg-[#58CC71] text-white hover:bg-[#4BB563]"
              >
                保存笔记
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
