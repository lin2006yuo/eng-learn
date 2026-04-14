import { useState, useCallback } from 'react';
import { useAppStore } from '@/stores/appStore';
import { useStatsStore } from '@/stores/statsStore';
import { copyToClipboard } from '@/utils/copy';

export function useCopy() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const showToast = useAppStore((state) => state.showToast);
  const incrementCopyCount = useStatsStore((state) => state.incrementCopyCount);

  const copy = useCallback(
    async (text: string, id: string) => {
      const success = await copyToClipboard(text);
      
      if (success) {
        setCopiedId(id);
        incrementCopyCount();
        showToast('已复制 ✨');
        
        // 1秒后清除复制状态
        setTimeout(() => {
          setCopiedId((current) => (current === id ? null : current));
        }, 1000);
      } else {
        showToast('复制失败，请重试');
      }
      
      return success;
    },
    [showToast, incrementCopyCount]
  );

  const isCopied = useCallback(
    (id: string) => copiedId === id,
    [copiedId]
  );

  return { copy, isCopied };
}
