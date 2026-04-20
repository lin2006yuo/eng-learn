'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/shared/store/appStore';
import type { ToastType } from '@/shared/types';

const toastConfig: Record<ToastType, { bg: string; icon: string }> = {
  success: { bg: 'bg-green-600', icon: '✅' },
  error: { bg: 'bg-red-600', icon: '❌' },
  warning: { bg: 'bg-yellow-600', icon: '⚠️' },
  info: { bg: 'bg-gray-800', icon: 'ℹ️' },
};

export function Toast() {
  const { toast } = useAppStore();
  const config = toastConfig[toast.type] || toastConfig.info;

  return (
    <AnimatePresence>
      {toast.visible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100]"
        >
          <div className={`${config.bg} text-white px-6 py-3 rounded-badge shadow-lg flex items-center gap-2`}>
            <span className="text-lg">{config.icon}</span>
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
