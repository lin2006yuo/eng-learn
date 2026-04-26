import { Trash2 } from 'lucide-react';
import type { Note } from '../types';

interface NoteCardProps {
  note: Note;
  isLast?: boolean;
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

export function NoteCard({ note, isLast, onClick, onDelete }: NoteCardProps) {
  return (
    <div className={`py-4 ${!isLast ? 'border-b border-[#E5E5EA]' : ''}`}>
      <div
        onClick={onClick}
        className="cursor-pointer active:opacity-60 transition-opacity"
      >
        <p className="text-[16px] text-[#1D1D1F] whitespace-pre-wrap leading-snug">
          {note.content}
        </p>

        <div className="flex items-center justify-between mt-3">
          <span className="text-[13px] text-[#6E6E73]">
            {formatTime(note.createdAt)}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="w-8 h-8 flex items-center justify-center text-[#FF3B30] active:opacity-50 transition-opacity"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
