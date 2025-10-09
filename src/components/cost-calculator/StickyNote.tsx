import React, { useState, useRef, useEffect } from 'react';
import { X, GripVertical } from 'lucide-react';

interface StickyNoteProps {
  id: string;
  title: string;
  content: string;
  position: { x: number; y: number };
  color: string;
  size: 'small' | 'medium' | 'large';
  onUpdate: (id: string, field: 'title' | 'content', value: string) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, position: { x: number; y: number }) => void;
  onChangeColor?: (id: string) => void;
  onChangeSize?: (id: string) => void;
}

const StickyNote: React.FC<StickyNoteProps> = ({
  id,
  title,
  content,
  position,
  color,
  size,
  onUpdate,
  onDelete,
  onMove,
  onChangeColor,
  onChangeSize
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
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

  // Focus title input when editing starts
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditingTitle]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleTitleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingTitle(true);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate(id, 'content', e.target.value);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(id, 'title', e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      setIsEditing(false);
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditingTitle(false);
    }
    if (e.key === 'Escape') {
      setIsEditingTitle(false);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
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

  const getSizeClasses = () => {
    const sizeMap = {
      small: 'w-32 h-32',
      medium: 'w-48 h-48',
      large: 'w-64 h-64'
    };
    return sizeMap[size];
  };

  const getContentHeight = () => {
    const sizeMap = {
      small: 'h-16',
      medium: 'h-32',
      large: 'h-48'
    };
    return sizeMap[size];
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const noteWidth = size === 'small' ? 128 : size === 'medium' ? 192 : 256;
      const noteHeight = size === 'small' ? 128 : size === 'medium' ? 192 : 256;
      
      const newPosition = {
        x: Math.max(0, Math.min(e.clientX - dragOffset.x, window.innerWidth - noteWidth)),
        y: Math.max(0, Math.min(e.clientY - dragOffset.y, window.innerHeight - noteHeight))
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
      className={`absolute ${getSizeClasses()} p-3 rounded-lg border-2 shadow-lg select-none ${
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
      {/* Header with drag handle and controls */}
      <div className="flex items-center justify-between mb-2">
        <div 
          data-drag-handle
          className="flex-1 flex items-center"
        >
          <GripVertical className="w-4 h-4 text-slate-500" />
        </div>
        <div className="flex items-center gap-1">
          {onChangeSize && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onChangeSize(id);
              }}
              className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-slate-200 transition-colors text-xs font-bold"
              title={`Tamaño: ${size}`}
            >
              {size === 'small' ? 'S' : size === 'medium' ? 'M' : 'L'}
            </button>
          )}
          <button
            onClick={() => onDelete(id)}
            className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-red-200 transition-colors z-10 relative"
          >
            <X className="w-3 h-3 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Title area */}
      <div className="mb-2">
        {isEditingTitle ? (
          <input
            ref={titleInputRef}
            value={title}
            onChange={handleTitleChange}
            onKeyDown={handleTitleKeyDown}
            onBlur={handleTitleBlur}
            className="w-full bg-transparent border-none outline-none text-sm font-semibold text-slate-800 placeholder-slate-500"
            placeholder="Título..."
            autoFocus
          />
        ) : (
          <div 
            className="text-sm font-semibold text-slate-800 cursor-pointer hover:bg-slate-100 rounded px-1 py-0.5 -mx-1"
            onDoubleClick={handleTitleDoubleClick}
          >
            {title || 'Haz doble clic para añadir título...'}
          </div>
        )}
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
            className={`w-full ${getContentHeight()} resize-none bg-transparent border-none outline-none text-sm text-slate-800 placeholder-slate-500`}
            placeholder="Escribe tu nota aquí..."
            autoFocus
          />
        ) : (
          <div 
            className={`w-full ${getContentHeight()} text-sm text-slate-800 whitespace-pre-wrap break-words overflow-hidden`}
            style={{ wordBreak: 'break-word' }}
          >
            {content || 'Haz doble clic para editar...'}
          </div>
        )}
      </div>

      {/* Footer with instructions */}
      {!isEditing && !isEditingTitle && (
        <div className="text-xs text-slate-500 mt-2 text-center">
          Doble clic para editar • Clic derecho para cambiar color • Botón S/M/L para tamaño
        </div>
      )}
    </div>
  );
};

export default StickyNote;
