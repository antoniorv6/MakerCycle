'use client';

import React from 'react';
import { Users, User, ChevronDown, Edit } from 'lucide-react';
import { useTeam } from './providers/TeamProvider';
import { motion, AnimatePresence } from 'framer-motion';

export default function TeamContextIndicator() {
  const { currentTeam, userTeams, setCurrentTeam, loading, isEditingMode, editingTeam, getEffectiveTeam } = useTeam();
  const [isOpen, setIsOpen] = React.useState(false);
  const [popupPosition, setPopupPosition] = React.useState<'left' | 'right'>('right');
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleTeamSelect = (team: any) => {
    setCurrentTeam(team);
    setIsOpen(false);
  };

  const handlePersonalView = () => {
    setCurrentTeam(null);
    setIsOpen(false);
  };

  const handleToggle = (event: React.MouseEvent) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    
    // Determine if popup should appear on left or right
    const spaceOnRight = viewportWidth - rect.right;
    const spaceOnLeft = rect.left;
    
    if (spaceOnRight < 300 && spaceOnLeft > 300) {
      setPopupPosition('left');
    } else {
      setPopupPosition('right');
    }
    
    setIsOpen(!isOpen);
  };

  // Handle click outside to close popup
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen]);

  if (loading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg animate-pulse">
        <div className="w-4 h-4 bg-gray-300 rounded"></div>
        <div className="w-24 h-4 bg-gray-300 rounded"></div>
      </div>
    );
  }

  const effectiveTeam = getEffectiveTeam();
  const isInEditingMode = isEditingMode && editingTeam !== null;

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={handleToggle}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 border ${
          isInEditingMode
            ? 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100'
            : effectiveTeam 
              ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100' 
              : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
        }`}
      >
        {isInEditingMode ? (
          <>
            <Edit className="w-4 h-4" />
            <span className="text-sm font-medium truncate max-w-32">
              Editando: {editingTeam?.name}
            </span>
          </>
        ) : effectiveTeam ? (
          <>
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium truncate max-w-32">
              {effectiveTeam.name}
            </span>
          </>
        ) : (
          <>
            <User className="w-4 h-4" />
            <span className="text-sm font-medium">Personal</span>
          </>
        )}
        <ChevronDown className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className={`absolute top-full mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-xl z-50 ${
              popupPosition === 'left' ? 'right-0' : 'left-0'
            }`}
            style={{
              maxHeight: 'calc(100vh - 100px)',
              overflowY: 'auto'
            }}
          >
            <div className="p-3">
              {isInEditingMode && (
                <div className="mb-3 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Edit className="w-4 h-4 text-orange-600" />
                    <span className="text-xs font-medium text-orange-700">
                      Modo de edición activo
                    </span>
                  </div>
                  <div className="text-xs text-orange-600 mt-1">
                    Editando proyecto del equipo: {editingTeam?.name}
                  </div>
                </div>
              )}
              
              <div className="text-xs font-medium text-gray-500 mb-2 px-2">CONTEXTO ACTUAL</div>
              
              {/* Personal View Option */}
              <button
                onClick={handlePersonalView}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors duration-200 ${
                  !effectiveTeam
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <User className="w-4 h-4" />
                <div>
                  <div className="text-sm font-medium">Vista Personal</div>
                  <div className="text-xs text-gray-500">Tus proyectos y datos privados</div>
                </div>
              </button>

              {/* Team Options */}
              {userTeams.length > 0 && (
                <>
                  <div className="text-xs font-medium text-gray-500 mt-3 mb-2 px-2">EQUIPOS</div>
                  {userTeams.map((team) => (
                    <button
                      key={team.id}
                      onClick={() => handleTeamSelect(team)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors duration-200 ${
                        effectiveTeam?.id === team.id
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      <div>
                        <div className="text-sm font-medium">{team.name}</div>
                        <div className="text-xs text-gray-500">Datos compartidos del equipo</div>
                      </div>
                    </button>
                  ))}
                </>
              )}

              {/* Create Team Option */}
              {userTeams.length === 0 && (
                <div className="px-3 py-2 text-xs text-gray-500 border-t border-gray-100 mt-2 pt-2">
                  No tienes equipos. Ve a Configuración → Equipos para crear uno.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 