import React, { useState, useRef, useEffect } from 'react';
import { X, GripVertical } from 'lucide-react';

interface StickyNoteProps {
  id: string;
  content: string;
  position: { x: number; y: number };
  color: string;
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, position: { x: number; y: number }) => void;
  onChangeColor?: (id: string) => void;
}

const StickyNote: React.FC<StickyNoteProps> = ({
  id,
  content,
  position,
  color,
  onUpdate,
  onDelete,
  onMove,
  onChangeColor
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const noteRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  // Focus textarea when editing starts
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate(id, e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      setIsEditing(false);
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onChangeColor) {
      onChangeColor(id);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isTextarea = target.tagName === 'TEXTAREA';
    const isButton = target.tagName === 'BUTTON' || target.closest('button');
    
    // No permitir arrastrar si estamos en el textarea o en botones
    if (isTextarea || isButton) return;
    
    // Permitir arrastrar desde cualquier parte de la nota
    setIsDragging(true);
    const rect = noteRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      // Calcular la nueva posición directamente, sin requestAnimationFrame
      const newPosition = {
        x: Math.max(0, Math.min(e.clientX - dragOffset.x, window.innerWidth - 200)),
        y: Math.max(0, Math.min(e.clientY - dragOffset.y, window.innerHeight - 250))
      };
      onMove(id, newPosition);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const colorClasses = {
    yellow: 'bg-yellow-200 border-yellow-300',
    pink: 'bg-pink-200 border-pink-300',
    blue: 'bg-blue-200 border-blue-300',
    green: 'bg-green-200 border-green-300',
    purple: 'bg-purple-200 border-purple-300',
    orange: 'bg-orange-200 border-orange-300'
  };

  return (
    <div
      ref={noteRef}
      className={`absolute w-48 h-48 p-3 rounded-lg border-2 shadow-lg select-none ${
        isDragging 
          ? 'cursor-grabbing shadow-2xl' 
          : 'cursor-move hover:shadow-xl'
      } ${colorClasses[color as keyof typeof colorClasses] || colorClasses.yellow}`}
      style={{
        left: position.x,
        top: position.y,
        zIndex: isDragging ? 1000 : 10
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
    >
      {/* Header with drag handle and delete button */}
      <div className="flex items-center justify-between mb-2">
        <div 
          data-drag-handle
          className="flex-1 flex items-center"
        >
          <GripVertical className="w-4 h-4 text-slate-500" />
        </div>
        <button
          onClick={() => onDelete(id)}
          className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-red-200 transition-colors z-10 relative"
        >
          <X className="w-3 h-3 text-slate-600" />
        </button>
      </div>

      {/* Content area */}
      <div className="flex-1">
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className="w-full h-32 resize-none bg-transparent border-none outline-none text-sm text-slate-800 placeholder-slate-500"
            placeholder="Escribe tu nota aquí..."
            autoFocus
          />
        ) : (
          <div 
            className="w-full h-32 text-sm text-slate-800 whitespace-pre-wrap break-words overflow-hidden"
            style={{ wordBreak: 'break-word' }}
          >
            {content || 'Haz doble clic para editar...'}
          </div>
        )}
      </div>

      {/* Footer with instructions */}
      {!isEditing && (
        <div className="text-xs text-slate-500 mt-2 text-center">
          Doble clic para editar • Clic derecho para cambiar color
        </div>
      )}
    </div>
  );
};

export default StickyNote;
