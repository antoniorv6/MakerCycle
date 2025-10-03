import React, { useState, useCallback } from 'react';
import { Plus, Trash2, Palette, Zap } from 'lucide-react';
import StickyNote from './StickyNote';

interface StickyNoteData {
  id: string;
  content: string;
  position: { x: number; y: number };
  color: string;
}

interface StickyNotesManagerProps {
  isVisible: boolean;
  onToggle: () => void;
}

const StickyNotesManager: React.FC<StickyNotesManagerProps> = ({ isVisible, onToggle }) => {
  const [notes, setNotes] = useState<StickyNoteData[]>([]);
  const [nextId, setNextId] = useState(1);

  const colors = ['yellow', 'pink', 'blue', 'green', 'purple', 'orange'];

  const addNote = useCallback(() => {
    const newNote: StickyNoteData = {
      id: `note-${nextId}`,
      content: '',
      position: {
        x: Math.random() * (window.innerWidth - 200) + 50,
        y: Math.random() * (window.innerHeight - 250) + 50
      },
      color: colors[Math.floor(Math.random() * colors.length)]
    };
    
    setNotes(prev => [...prev, newNote]);
    setNextId(prev => prev + 1);
  }, [nextId]);

  const updateNote = useCallback((id: string, content: string) => {
    setNotes(prev => prev.map(note => 
      note.id === id ? { ...note, content } : note
    ));
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  }, []);

  const moveNote = useCallback((id: string, position: { x: number; y: number }) => {
    setNotes(prev => prev.map(note => 
      note.id === id ? { ...note, position } : note
    ));
  }, []);

  const clearAllNotes = useCallback(() => {
    if (notes.length > 0 && window.confirm('¿Estás seguro de que quieres eliminar todas las notas?')) {
      setNotes([]);
    }
  }, [notes.length]);

  const changeNoteColor = useCallback((id: string) => {
    setNotes(prev => prev.map(note => 
      note.id === id 
        ? { ...note, color: colors[(colors.indexOf(note.color) + 1) % colors.length] }
        : note
    ));
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {/* Overlay para capturar clics fuera de las notas */}
      <div 
        className="fixed inset-0 z-10 pointer-events-none"
        style={{ pointerEvents: 'none' }}
      />
      
      {/* Panel de control flotante */}
      <div className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg border border-slate-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-5 h-5 text-orange-500" />
          <h3 className="font-semibold text-slate-900">Modo Desastre</h3>
          <button
            onClick={onToggle}
            className="ml-2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            ✕
          </button>
        </div>
        
        <div className="flex gap-2 mb-3">
          <button
            onClick={addNote}
            className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nueva nota
          </button>
          
          {notes.length > 0 && (
            <button
              onClick={clearAllNotes}
              className="flex items-center gap-2 px-3 py-2 bg-red-100 hover:bg-red-200 rounded-lg text-sm font-medium text-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Limpiar todo
            </button>
          )}
        </div>
        
        <div className="text-xs text-slate-500">
          {notes.length} nota{notes.length !== 1 ? 's' : ''} activa{notes.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Notas flotantes */}
      {notes.map(note => (
        <StickyNote
          key={note.id}
          id={note.id}
          content={note.content}
          position={note.position}
          color={note.color}
          onUpdate={updateNote}
          onDelete={deleteNote}
          onMove={moveNote}
          onChangeColor={changeNoteColor}
        />
      ))}
    </>
  );
};

export default StickyNotesManager;
