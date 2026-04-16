import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import type { Note } from '@/types/note';

interface NoteCardProps {
  note: Note;
  index: number;
  onClick: () => void;
  onDelete: () => void;
}

function formatTime(timestamp: number): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();

  if (diffDays === 0) {
    return `今天 ${hours}:${minutes}`;
  } else if (diffDays === 1) {
    return `昨天 ${hours}:${minutes}`;
  } else if (year === now.getFullYear()) {
    return `${month}-${day} ${hours}:${minutes}`;
  } else {
    return `${year}-${month}-${day}`;
  }
}

export function NoteCard({ note, index, onClick, onDelete }: NoteCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.05,
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-white rounded-2xl p-5 shadow-card relative cursor-pointer hover:shadow-lg transition-shadow border-2 border-transparent hover:border-[#58CC71]/20"
    >
      <div className="pr-16">
        <p className="text-text-primary whitespace-pre-wrap leading-relaxed">
          {note.content}
        </p>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
        <span className="text-sm text-text-secondary">
          {formatTime(note.createdAt)}
        </span>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors"
        >
          <Trash2 size={16} />
        </motion.button>
      </div>
    </motion.div>
  );
}
