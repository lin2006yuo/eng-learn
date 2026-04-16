import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FileText } from 'lucide-react';
import { useNoteStore } from '@/stores/noteStore';
import { useAppStore } from '@/stores/appStore';
import { NoteCard, NoteFormModal } from '@/components/note';
import type { Note } from '@/types/note';

export function NotesPage() {
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [deletingNote, setDeletingNote] = useState<Note | null>(null);

  const notes = useNoteStore((state) => state.notes);
  const addNote = useNoteStore((state) => state.addNote);
  const updateNote = useNoteStore((state) => state.updateNote);
  const deleteNote = useNoteStore((state) => state.deleteNote);
  const showToast = useAppStore((state) => state.showToast);

  const handleAdd = () => {
    setEditingNote(null);
    setShowModal(true);
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setShowModal(true);
  };

  const handleSave = (content: string) => {
    if (editingNote) {
      updateNote(editingNote.id, content);
      showToast('已更新');
    } else {
      addNote(content);
      showToast('已保存');
    }
  };

  const handleDelete = (note: Note) => {
    setDeletingNote(note);
  };

  const confirmDelete = () => {
    if (deletingNote) {
      deleteNote(deletingNote.id);
      showToast('已删除');
      setDeletingNote(null);
    }
  };

  return (
    <div className="min-h-full bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 bg-background z-10 px-5 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-text-primary">我的记录</h1>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleAdd}
            className="w-10 h-10 rounded-full bg-[#58CC71] text-white flex items-center justify-center shadow-lg hover:bg-[#4BB563] transition-colors"
          >
            <Plus size={24} />
          </motion.button>
        </div>
      </header>

      {/* Content */}
      <div className="px-5 py-4">
        {notes.length === 0 ? (
          <EmptyState onAdd={handleAdd} />
        ) : (
          <div className="space-y-4">
            {notes.map((note, index) => (
              <NoteCard
                key={note.id}
                note={note}
                index={index}
                onClick={() => handleEdit(note)}
                onDelete={() => handleDelete(note)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <NoteFormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        initialContent={editingNote?.content}
      />

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deletingNote && (
          <DeleteConfirmModal
            onConfirm={confirmDelete}
            onCancel={() => setDeletingNote(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

interface EmptyStateProps {
  onAdd: () => void;
}

function EmptyState({ onAdd }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="w-24 h-24 rounded-full bg-[#58CC71]/10 flex items-center justify-center mb-6"
      >
        <FileText size={48} className="text-[#58CC71]" />
      </motion.div>

      <h3 className="text-xl font-bold text-text-primary mb-2">
        还没有记录
      </h3>
      <p className="text-text-secondary mb-8 text-center">
        点击右上角 + 按钮添加你的第一条记录
      </p>

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onAdd}
        className="flex items-center gap-2 px-6 py-3.5 bg-[#58CC71] text-white rounded-xl font-semibold hover:bg-[#4BB563] transition-colors"
      >
        <Plus size={20} />
        新增记录
      </motion.button>
    </div>
  );
}

interface DeleteConfirmModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteConfirmModal({ onConfirm, onCancel }: DeleteConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-[300]">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 w-[85%] max-w-sm"
      >
        <h3 className="text-xl font-bold text-text-primary mb-3">确认删除</h3>
        <p className="text-text-secondary mb-6">
          这条记录将被永久删除，无法恢复
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl bg-gray-100 text-text-primary font-semibold hover:bg-gray-200 transition-colors"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors"
          >
            删除
          </button>
        </div>
      </motion.div>
    </div>
  );
}
