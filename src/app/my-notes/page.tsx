'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useNoteStore } from '@/features/note/store/noteStore';
import { NoteCard } from '@/features/note/components/NoteCard';
import { NoteFormModal } from '@/features/note/components/NoteFormModal';
import { useAppStore } from '@/shared/store/appStore';
import { ConfirmModal } from '@/shared/components/ConfirmModal';
import type { Note } from '@/features/note/types';

export default function MyNotesPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [deletingNote, setDeletingNote] = useState<Note | null>(null);

  const notes = useNoteStore((state) => state.notes);
  const addNote = useNoteStore((state) => state.addNote);
  const updateNote = useNoteStore((state) => state.updateNote);
  const deleteNote = useNoteStore((state) => state.deleteNote);
  const showToast = useAppStore((state) => state.showToast);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

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
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 bg-background z-10 px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => router.back()}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </motion.button>
            <h1 className="text-xl font-bold text-text-primary">我的笔记</h1>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleAdd}
            className="w-10 h-10 rounded-full bg-[#58CC71] text-white flex items-center justify-center shadow-lg hover:bg-[#4BB563] transition-colors"
          >
            <Plus size={24} />
          </motion.button>
        </div>
      </header>

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
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="w-24 h-24 rounded-full bg-[#58CC71]/10 flex items-center justify-center mb-6"
      >
        <FileText size={48} className="text-[#58CC71]" />
      </motion.div>
      <h3 className="text-xl font-bold text-text-primary mb-2">
        还没有笔记
      </h3>
      <p className="text-text-secondary mb-8 text-center">
        点击右上角 + 按钮添加你的第一条笔记
      </p>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onAdd}
        className="flex items-center gap-2 px-6 py-3.5 bg-[#58CC71] text-white rounded-subtle-card font-semibold hover:bg-[#4BB563] transition-colors"
      >
        <Plus size={20} />
        新增笔记
      </motion.button>
    </div>
  );
}
