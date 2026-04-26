'use client';

import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = '确认',
  cancelText = '取消',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="confirm-modal-overlay fixed inset-0 bg-black/40 z-[300]"
            onClick={onCancel}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="confirm-modal-container fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[301] w-[85%] max-w-[300px]"
          >
            <div className="confirm-modal-content bg-white rounded-[16px] overflow-hidden">
              <div className="confirm-modal-body px-5 py-5 text-center">
                {title && (
                  <h3 className="confirm-modal-title text-[18px] font-semibold text-[#1D1D1F] mb-2">
                    {title}
                  </h3>
                )}
                <p className="confirm-modal-message text-[16px] text-[#3A3A3C] leading-snug">
                  {message}
                </p>
              </div>

              <div className="confirm-modal-actions flex border-t border-[#E5E5EA]">
                <button
                  onClick={onCancel}
                  className="confirm-modal-cancel flex-1 py-3.5 text-[17px] font-medium text-[#007AFF] bg-white active:bg-[#F5F5F7] transition-colors"
                >
                  {cancelText}
                </button>
                <div className="w-[1px] bg-[#E5E5EA]" />
                <button
                  onClick={onConfirm}
                  className="confirm-modal-confirm flex-1 py-3.5 text-[17px] font-semibold text-[#FF3B30] bg-white active:bg-[#F5F5F7] transition-colors"
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
