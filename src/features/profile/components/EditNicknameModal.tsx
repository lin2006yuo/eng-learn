'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { useAppStore } from '@/shared/store/appStore';

interface EditNicknameModalProps {
  open: boolean;
  onClose: () => void;
  initialNickname: string;
  onSuccess: () => void;
}

export function EditNicknameModal({ open, onClose, initialNickname, onSuccess }: EditNicknameModalProps) {
  const { showToast } = useAppStore();
  const [nickname, setNickname] = useState(initialNickname);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const maxLen = 20;
  const charCount = nickname.length;

  const handleSave = async () => {
    if (!nickname.trim()) {
      showToast('昵称不能为空');
      return;
    }
    if (charCount > maxLen) {
      showToast(`昵称不能超过 ${maxLen} 个字符`);
      return;
    }

    setLoading(true);
    try {
      await authClient.updateUser({ nickname: nickname.trim() });
      showToast('昵称已更新');
      onSuccess();
      onClose();
    } catch {
      showToast('更新失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[104] bg-black/50"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
            className="fixed bottom-0 left-0 right-0 z-[105] max-w-[430px] mx-auto"
          >
            <div className="bg-white rounded-t-[16px] px-6 pt-6 pb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[18px] font-bold text-[#1D1D1F]">修改昵称</h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-[#F5F5F7] flex items-center justify-center active:opacity-50 transition-opacity"
                >
                  <X size={16} className="text-[#6E6E73]" />
                </button>
              </div>

              <div className="mb-2">
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  maxLength={maxLen}
                  className="w-full px-4 py-3 bg-[#F5F5F7] rounded-[12px]
                           text-[#1D1D1F] placeholder:text-[#C7C7CC]
                           focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30
                           transition-all duration-200"
                  placeholder="请输入昵称"
                  autoFocus
                />
              </div>

              <div className="text-right text-[13px] text-[#6E6E73] mb-6">
                {charCount}/{maxLen} 字符
              </div>

              <button
                onClick={handleSave}
                disabled={loading || !nickname.trim()}
                className="w-full py-3.5 bg-[#007AFF] text-white rounded-[12px] text-[17px] font-semibold
                         disabled:opacity-50 disabled:cursor-not-allowed
                         active:opacity-80 transition-opacity
                         flex items-center justify-center gap-2"
              >
                <Check size={18} />
                {loading ? '保存中...' : '保存修改'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  if (!mounted) return null;
  return createPortal(modalContent, document.body);
}
