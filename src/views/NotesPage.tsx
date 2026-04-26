import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, FileText } from 'lucide-react';
import { useNoteStore } from '@/features/note/store/noteStore';
import { NoteCard } from '@/features/note/components/NoteCard';
import { NoteFormModal } from '@/features/note/components/NoteFormModal';
import { useAppStore } from '@/shared/store/appStore';
import { ConfirmModal } from '@/shared/components/ConfirmModal';
import type { Note } from '@/features/note/types';

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
    <div className="min-h-full bg-[#FAFAFA] pb-20">
      <header className="sticky top-0 bg-[#FAFAFA]/95 backdrop-blur-sm z-10 px-5 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-[17px] font-semibold text-[#1D1D1F]">我的笔记</h1>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleAdd}
            className="w-9 h-9 rounded-full bg-[#007AFF] text-white flex items-center justify-center active:opacity-50 transition-opacity"
          >
            <Plus size={22} />
          </motion.button>
        </div>
      </header>

      <div className="px-5">
        {notes.length === 0 ? (
          <EmptyState onAdd={handleAdd} />
        ) : (
          <div>
            {notes.map((note, index) => (
              <NoteCard
                key={note.id}
                note={note}
                index={index}
                isLast={index === notes.length - 1}
                onClick={() => handleEdit(note)}
                onDelete={() => handleDelete(note)}
              />
            ))}
          </div>
        )}
      </div>

      <NoteFormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        initialContent={editingNote?.content}
      />

      <ConfirmModal
        isOpen={!!deletingNote}
        title="删除笔记"
        message="这条笔记将被永久删除，无法恢复"
        confirmText="删除"
        onConfirm={confirmDelete}
        onCancel={() => setDeletingNote(null)}
      />
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-16 h-16 rounded-[12px] bg-[#E8F0FE] flex items-center justify-center mb-4">
        <FileText size={28} className="text-[#1A73E8]" />
      </div>
      <h3 className="text-[18px] font-semibold text-[#1D1D1F] mb-1">
        还没有笔记
      </h3>
      <p className="text-[14px] text-[#6E6E73] mb-6 text-center">
        点击右上角 + 按钮添加你的第一条笔记
      </p>
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={onAdd}
        className="flex items-center gap-2 px-5 py-3 bg-[#007AFF] text-white rounded-[12px] text-[15px] font-semibold active:opacity-50 transition-opacity"
      >
        <Plus size={18} />
        新增笔记
      </motion.button>
    </div>
  );
}
