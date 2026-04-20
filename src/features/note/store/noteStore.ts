import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Note } from '../types';

interface NoteState {
  notes: Note[];
}

interface NoteActions {
  addNote: (content: string) => Note;
  updateNote: (id: string, content: string) => void;
  deleteNote: (id: string) => void;
  getNoteById: (id: string) => Note | undefined;
}

const generateId = () => `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const initialState: NoteState = {
  notes: [],
};

export const useNoteStore = create<NoteState & NoteActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      addNote: (content: string) => {
        const now = Date.now();
        const newNote: Note = {
          id: generateId(),
          content,
          createdAt: now,
        };
        set((state) => ({
          notes: [newNote, ...state.notes],
        }));
        return newNote;
      },

      updateNote: (id: string, content: string) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, content } : note
          ),
        }));
      },

      deleteNote: (id: string) => {
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
        }));
      },

      getNoteById: (id: string) => {
        return get().notes.find((note) => note.id === id);
      },
    }),
    {
      name: 'note-storage',
    }
  )
);
