import React, { useState } from 'react';
import { FileText, Clock, Trash2, ChevronDown, ChevronUp, Edit3, Package, AlertCircle } from 'lucide-react';
import { getTimeAgo, type ProjectDraft } from './hooks/useProjectDraft';

interface PendingDraftsPanelProps {
  drafts: ProjectDraft[];
  onLoadDraft: (draft: ProjectDraft) => void;
  onDeleteDraft: (draftId: string) => void;
  currentDraftId?: string | null;
}

const PendingDraftsPanel: React.FC<PendingDraftsPanelProps> = ({
  drafts,
  onLoadDraft,
  onDeleteDraft,
  currentDraftId
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter out the current draft being edited
  const otherDrafts = drafts.filter(draft => draft.draftId !== currentDraftId);

  if (otherDrafts.length === 0) {
    return null;
  }

  const handleDelete = (e: React.MouseEvent, draftId: string) => {
    e.stopPropagation();
    setDeletingId(draftId);
  };

  const confirmDelete = (draftId: string) => {
    onDeleteDraft(draftId);
    setDeletingId(null);
  };

  const cancelDelete = () => {
    setDeletingId(null);
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-amber-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-200 rounded-lg flex items-center justify-center">
            <AlertCircle className="w-4 h-4 text-amber-700" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-amber-900">
              Proyectos pendientes ({otherDrafts.length})
            </h3>
            <p className="text-xs text-amber-700">
              Tienes proyectos sin guardar
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-amber-600" />
        ) : (
          <ChevronDown className="w-5 h-5 text-amber-600" />
        )}
      </button>

      {/* Draft List */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-2">
          {otherDrafts.map((draft) => {
            const isDeleting = deletingId === draft.draftId;
            const isEditing = !!draft.editingProjectId;
            const savedDate = new Date(draft.savedAt);
            const timeAgo = getTimeAgo(savedDate);
            const piecesCount = draft.pieces?.length || 0;

            return (
              <div
                key={draft.draftId}
                className={`bg-white rounded-lg border transition-all ${
                  isDeleting
                    ? 'border-red-300 shadow-md'
                    : 'border-amber-200 hover:border-amber-300 hover:shadow-sm'
                }`}
              >
                {isDeleting ? (
                  // Delete confirmation
                  <div className="p-4">
                    <p className="text-sm text-slate-700 mb-3">
                      ¿Eliminar este borrador? Esta acción no se puede deshacer.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => confirmDelete(draft.draftId)}
                        className="flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        Eliminar
                      </button>
                      <button
                        onClick={cancelDelete}
                        className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  // Draft card
                  <div
                    onClick={() => onLoadDraft(draft)}
                    className="p-3 cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {isEditing ? (
                            <Edit3 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          ) : (
                            <FileText className="w-4 h-4 text-amber-500 flex-shrink-0" />
                          )}
                          <span className="font-medium text-slate-900 truncate">
                            {draft.projectName || 'Sin nombre'}
                          </span>
                          {isEditing && (
                            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                              Editando
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Package className="w-3 h-3" />
                            {piecesCount} pieza{piecesCount !== 1 ? 's' : ''}
                          </span>
                          <span className="capitalize">
                            {draft.projectType === 'resin' ? 'Resina' : 'Filamento'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {timeAgo}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDelete(e, draft.draftId)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                        title="Eliminar borrador"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PendingDraftsPanel;
