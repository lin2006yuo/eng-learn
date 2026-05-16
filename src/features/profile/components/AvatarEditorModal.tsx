'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Check } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { useAvatarUpload } from '../hooks/useAvatarUpload';
import { useAppStore } from '@/shared/store/appStore';

interface AvatarEditorModalProps {
  open: boolean;
  onClose: () => void;
  currentImage: string | null;
  username: string;
  onSuccess: () => void;
}

export function AvatarEditorModal({
  open,
  onClose,
  currentImage,
  username,
  onSuccess,
}: AvatarEditorModalProps) {
  const { showToast } = useAppStore();
  const { upload, uploading } = useAvatarUpload();
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      setPreviewUrl(currentImage);
      setSelectedFile(null);
    }
  }, [open, currentImage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('请选择图片文件', 'warning');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('图片不能超过 5MB', 'warning');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handlePickImage = () => {
    inputRef.current?.click();
  };

  const handleSave = async () => {
    if (!selectedFile) {
      showToast('请先选择图片', 'warning');
      return;
    }

    setSaving(true);
    const url = await upload(selectedFile);
    if (!url) {
      setSaving(false);
      return;
    }

    try {
      await authClient.updateUser({ image: url });
      showToast('头像已更新');
      onSuccess();
      onClose();
    } catch {
      showToast('更新失败，请重试', 'error');
    } finally {
      setSaving(false);
    }
  };

  const initial = username.charAt(0).toUpperCase();
  const hasPreview = previewUrl && previewUrl !== currentImage;
  const isLoading = uploading || saving;

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
                <h2 className="text-[18px] font-bold text-[#1D1D1F]">
                  设置头像
                </h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-[#F5F5F7] flex items-center justify-center active:opacity-50 transition-opacity"
                >
                  <X size={16} className="text-[#6E6E73]" />
                </button>
              </div>

              <div className="flex flex-col items-center mb-6">
                <button
                  onClick={handlePickImage}
                  className="avatar-editor-preview relative w-24 h-24 rounded-full overflow-hidden mb-4 active:opacity-80 transition-opacity"
                >
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="头像预览"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#1D1D1F] flex items-center justify-center">
                      <span className="text-[32px] font-semibold text-white">
                        {initial}
                      </span>
                    </div>
                  )}
                  <div className="avatar-editor-preview-overlay absolute inset-0 bg-black/30 flex items-center justify-center">
                    <Camera size={24} className="text-white" />
                  </div>
                </button>

                <p className="text-[13px] text-[#6E6E73]">
                  点击头像从相册选择或拍照
                </p>
              </div>

              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {hasPreview && (
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="w-full py-3.5 bg-[#007AFF] text-white rounded-[12px] text-[17px] font-semibold
                           disabled:opacity-50 disabled:cursor-not-allowed
                           active:opacity-80 transition-opacity
                           flex items-center justify-center gap-2"
                >
                  <Check size={18} />
                  {isLoading ? '上传中...' : '保存头像'}
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  if (!mounted) return null;
  return createPortal(modalContent, document.body);
}
