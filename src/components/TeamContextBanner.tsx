'use client';

import React from 'react';
import { Edit, Users, User } from 'lucide-react';
import { useTeam } from './providers/TeamProvider';
import { motion } from 'framer-motion';

export default function TeamContextBanner() {
  const { isEditingMode, editingTeam, getEffectiveTeam } = useTeam();

  const effectiveTeam = getEffectiveTeam();
  const isInEditingMode = isEditingMode && editingTeam !== null;

  if (!isInEditingMode) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6"
    >
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <Edit className="w-5 h-5 text-orange-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-orange-800">
              Modo de edición activo
            </span>
            {editingTeam && (
              <>
                <span className="text-orange-600">•</span>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4 text-orange-600" />
                  <span className="text-sm text-orange-700">
                    Editando proyecto del equipo: {editingTeam.name}
                  </span>
                </div>
              </>
            )}
          </div>
          <p className="text-xs text-orange-600 mt-1">
            Los cambios se guardarán en el contexto original del proyecto
          </p>
        </div>
      </div>
    </motion.div>
  );
} 