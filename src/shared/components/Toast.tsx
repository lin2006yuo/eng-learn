'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/shared/store/appStore';

export function Toast() {
  const { toast } = useAppStore();

  return (
    <AnimatePresence>
      {toast.visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100]"
        >
          <div className="bg-[#1D1D1F]/90 backdrop-blur-sm text-white px-5 py-2.5 rounded-[12px] text-[14px] font-medium">
            {toast.message}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
