'use client';

import { useState } from 'react';
import { useAppStore } from '@/shared/store/appStore';

export function useAvatarUpload() {
  const { showToast } = useAppStore();
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File): Promise<string | null> => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: '上传失败' }));
        showToast(body.error || '上传失败', 'error');
        return null;
      }

      const data = await res.json();
      return data.url as string;
    } catch {
      showToast('网络错误，请重试', 'error');
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { upload, uploading };
}
