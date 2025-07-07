'use client';

import React from 'react';
import { ChevronDown, Users, User } from 'lucide-react';
import { useTeam } from './providers/TeamProvider';
import { motion, AnimatePresence } from 'framer-motion';

export default function TeamSelector() {
  const { currentTeam, userTeams, setCurrentTeam, loading } = useTeam();
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

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={handleToggle}
        className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
      >
        {currentTeam ? (
          <>
            <Users className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-900 truncate max-w-32">
              {currentTeam.name}
            </span>
          </>
        ) : (
          <>
            <User className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">Personal</span>
          </>
        )}
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`absolute top-full mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 ${
              popupPosition === 'left' ? 'right-0' : 'left-0'
            }`}
            style={{
              maxHeight: 'calc(100vh - 100px)',
              overflowY: 'auto'
            }}
          >
            <div className="p-2">
              {/* Personal View Option */}
              <button
                onClick={handlePersonalView}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors duration-200 ${
                  !currentTeam
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <User className="w-4 h-4" />
                <div>
                  <div className="text-sm font-medium">Vista Personal</div>
                  <div className="text-xs text-gray-500">Tus proyectos y datos</div>
                </div>
              </button>

              {/* Team Options */}
              {userTeams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => handleTeamSelect(team)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors duration-200 ${
                    currentTeam?.id === team.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <div>
                    <div className="text-sm font-medium">{team.name}</div>
                    <div className="text-xs text-gray-500">Equipo compartido</div>
                  </div>
                </button>
              ))}

              {/* Create Team Option */}
              {userTeams.length === 0 && (
                <div className="px-3 py-2 text-xs text-gray-500">
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