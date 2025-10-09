import React from 'react';
import { StickyNote, Plus, Trash2 } from 'lucide-react';

interface DisasterModeButtonProps {
  isActive: boolean;
  onToggle: () => void;
  onAddNote: () => void;
  onClearAll: () => void;
  noteCount: number;
}

const DisasterModeButton: React.FC<DisasterModeButtonProps> = ({
  isActive,
  onToggle,
  onAddNote,
  onClearAll,
  noteCount
}) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Botón principal de modo desastre */}
      <button
        onClick={onToggle}
        className={`group relative w-14 h-14 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 ${
          isActive
            ? 'bg-orange-500 text-white shadow-orange-500/25'
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 shadow-slate-200/25'
        }`}
        title={isActive ? 'Desactivar Modo Desastre' : 'Activar Modo Desastre'}
      >
        <StickyNote className={`w-7 h-7 mx-auto transition-transform duration-200 ${isActive ? 'animate-bounce' : 'group-hover:rotate-12'}`} />
        
        {/* Indicador de notas activas */}
        {noteCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {noteCount}
          </div>
        )}
      </button>

      {/* Botón de añadir nota (solo visible cuando el modo está activo) */}
      {isActive && (
        <button
          onClick={onAddNote}
          className="group w-12 h-12 bg-white text-slate-700 rounded-full shadow-lg hover:bg-slate-50 transition-all duration-200 transform hover:scale-110 border border-slate-200"
          title="Añadir nueva nota"
        >
          <Plus className="w-6 h-6 mx-auto group-hover:rotate-90 transition-transform duration-200" />
        </button>
      )}

      {/* Botón de limpiar todo (solo visible cuando hay notas) */}
      {isActive && noteCount > 0 && (
        <button
          onClick={onClearAll}
          className="group w-12 h-12 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-all duration-200 transform hover:scale-110"
          title="Limpiar todas las notas"
        >
          <Trash2 className="w-6 h-6 mx-auto group-hover:scale-110 transition-transform duration-200" />
        </button>
      )}
    </div>
  );
};

export default DisasterModeButton;
