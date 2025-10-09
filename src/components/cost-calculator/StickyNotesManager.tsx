import React, { useState, useCallback } from 'react';
import { Plus, Trash2, Palette, Zap } from 'lucide-react';
import StickyNote from './StickyNote';

interface StickyNoteData {
  id: string;
  title: string;
  content: string;
  position: { x: number; y: number };
  color: string;
  size: 'small' | 'medium' | 'large';
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
      title: '',
      content: '',
      position: {
        x: Math.random() * (window.innerWidth - 200) + 50,
        y: Math.random() * (window.innerHeight - 250) + 50
      },
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 'medium'
    };
    
    setNotes(prev => [...prev, newNote]);
    setNextId(prev => prev + 1);
  }, [nextId]);

  const updateNote = useCallback((id: string, field: 'title' | 'content', value: string) => {
    setNotes(prev => prev.map(note => 
      note.id === id ? { ...note, [field]: value } : note
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

  const changeNoteSize = useCallback((id: string) => {
    setNotes(prev => prev.map(note => 
      note.id === id 
        ? { ...note, size: note.size === 'small' ? 'medium' : note.size === 'medium' ? 'large' : 'small' }
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
      
      {/* Notas flotantes */}
      {notes.map(note => (
        <StickyNote
          key={note.id}
          id={note.id}
          title={note.title}
          content={note.content}
          position={note.position}
          color={note.color}
          size={note.size}
          onUpdate={updateNote}
          onDelete={deleteNote}
          onMove={moveNote}
          onChangeColor={changeNoteColor}
          onChangeSize={changeNoteSize}
        />
      ))}
    </>
  );
};

export default StickyNotesManager;
