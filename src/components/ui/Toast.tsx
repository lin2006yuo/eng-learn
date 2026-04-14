import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/stores/appStore';

export function Toast() {
  const { toast } = useAppStore();

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
          <div className="bg-gray-800 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
            <span className="text-lg">✨</span>
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
