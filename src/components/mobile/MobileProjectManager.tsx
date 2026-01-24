'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { 
  Plus, Search, Calendar, Euro, FileText, Clock, Package, 
  Trash2, ChevronRight, Filter, X, Layers, AlertCircle
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/components/providers/AuthProvider'
import { useTeam } from '@/components/providers/TeamProvider'
import { useFormatCurrency } from '@/hooks/useFormatCurrency'
import { useHaptics } from '@/hooks/useCapacitor'
import { toast } from 'react-hot-toast'
import type { DatabaseProject, DatabasePiece, PieceMaterial } from '@/types'
import MobileCard from './MobileCard'

interface MobileProjectManagerProps {
  onLoadProject: (project: DatabaseProject & { pieces?: DatabasePiece[] }) => void
}

// Process pieces helper
async function processPieces(
  pieces: (DatabasePiece & { piece_materials?: PieceMaterial[] })[], 
  supabase: any
): Promise<DatabasePiece[]> {
  return pieces.map(piece => ({
    ...piece,
    materials: piece.piece_materials || []
  }))
}

export default function MobileProjectManager({ onLoadProject }: MobileProjectManagerProps) {
  const { user } = useAuth()
  const { currentTeam } = useTeam()
  const { formatCurrency } = useFormatCurrency()
  const { triggerHaptic } = useHaptics()
  const supabase = createClient()
  
  const [projects, setProjects] = useState<(DatabaseProject & { pieces?: DatabasePiece[] })[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [swipedProjectId, setSwipedProjectId] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchProjects()
    }
  }, [user, currentTeam])

  const fetchProjects = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      let query = supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (currentTeam) {
        query = query.eq('team_id', currentTeam.id)
      } else {
        query = query.is('team_id', null)
      }

      const { data, error } = await query

      if (error) {
        toast.error('Error al cargar proyectos')
        return
      }

      const projectsWithPieces = await Promise.all(
        (data || []).map(async (project: DatabaseProject) => {
          const { data: pieces } = await supabase
            .from('pieces')
            .select('*, piece_materials (*)')
            .eq('project_id', project.id)
          
          const processedPieces = await processPieces(pieces || [], supabase)
          return { ...project, pieces: processedPieces }
        })
      )

      setProjects(projectsWithPieces)
    } finally {
      setLoading(false)
    }
  }

  const handleLoadProject = async (project: DatabaseProject) => {
    triggerHaptic('light')
    try {
      const { data: pieces } = await supabase
        .from('pieces')
        .select('*, piece_materials (*)')
        .eq('project_id', project.id)

      const processedPieces = await processPieces(pieces || [], supabase)
      onLoadProject({ ...project, pieces: processedPieces })
    } catch (error) {
      toast.error('Error al cargar proyecto')
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    triggerHaptic('medium')
    try {
      await supabase.from('pieces').delete().eq('project_id', projectId)
      await supabase.from('projects').delete().eq('id', projectId)
      
      setProjects(projects.filter(p => p.id !== projectId))
      setShowDeleteConfirm(null)
      toast.success('Proyecto eliminado')
    } catch (error) {
      toast.error('Error al eliminar')
    }
  }

  const handleSwipe = (projectId: string, info: PanInfo) => {
    if (info.offset.x < -80) {
      setSwipedProjectId(projectId)
      triggerHaptic('light')
    } else if (info.offset.x > 20) {
      setSwipedProjectId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; label: string }> = {
      draft: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Borrador' },
      calculated: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Calculado' },
      completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completado' },
    }
    return styles[status] || styles.draft
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || project.status === filterStatus
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="space-y-4 px-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
            <div className="h-5 bg-slate-200 rounded w-2/3 mb-3" />
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-2" />
            <div className="flex gap-2 mt-4">
              <div className="h-8 bg-slate-200 rounded flex-1" />
              <div className="h-8 bg-slate-200 rounded flex-1" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="px-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-slate-900">Proyectos</h1>
          <span className="text-sm text-slate-500">{filteredProjects.length} proyectos</span>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar proyectos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-base focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
            style={{ fontSize: '16px' }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {['all', 'draft', 'calculated', 'completed'].map(status => (
            <button
              key={status}
              onClick={() => {
                setFilterStatus(status)
                triggerHaptic('selection')
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                filterStatus === status
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {status === 'all' ? 'Todos' : 
               status === 'draft' ? 'Borradores' :
               status === 'calculated' ? 'Calculados' : 'Completados'}
            </button>
          ))}
        </div>
      </div>

      {/* Projects List */}
      <div className="px-4 space-y-3">
        {filteredProjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 text-center border border-slate-100"
          >
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-900 mb-1">Sin proyectos</h3>
            <p className="text-sm text-slate-500">
              {searchTerm || filterStatus !== 'all' 
                ? 'No hay proyectos con estos filtros'
                : 'Crea tu primer proyecto'
              }
            </p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, index) => {
              const statusBadge = getStatusBadge(project.status)
              const isSwiped = swipedProjectId === project.id
              
              // Calculate total weight and hours
              const totalWeight = project.pieces?.reduce((sum, piece) => {
                if (piece.materials?.length) {
                  const pieceWeight = piece.materials.reduce((mSum, m) => {
                    return mSum + (m.unit === 'kg' ? m.weight * 1000 : m.weight)
                  }, 0)
                  return sum + (pieceWeight * piece.quantity)
                }
                return sum + (piece.filament_weight * piece.quantity)
              }, 0) || 0

              const totalHours = project.pieces?.reduce((sum, p) => sum + (p.print_hours * p.quantity), 0) || project.print_hours

              return (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative overflow-hidden"
                >
                  {/* Delete action background */}
                  <div className="absolute right-0 top-0 bottom-0 w-20 bg-red-500 rounded-r-2xl flex items-center justify-center">
                    <button
                      onClick={() => setShowDeleteConfirm(project.id)}
                      className="p-3"
                    >
                      <Trash2 className="w-6 h-6 text-white" />
                    </button>
                  </div>

                  {/* Project Card */}
                  <motion.div
                    drag="x"
                    dragConstraints={{ left: -80, right: 0 }}
                    dragElastic={0.1}
                    onDragEnd={(_, info) => handleSwipe(project.id, info)}
                    animate={{ x: isSwiped ? -80 : 0 }}
                    className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm relative cursor-grab active:cursor-grabbing"
                    onClick={() => !isSwiped && handleLoadProject(project)}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 truncate pr-2">{project.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-xs text-slate-500">
                            {new Date(project.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                          {statusBadge.label}
                        </span>
                        <ChevronRight className="w-5 h-5 text-slate-300" />
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-2">
                      <div className="bg-slate-50 rounded-lg p-2 text-center">
                        <Package className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                        <p className="text-xs font-semibold text-slate-700">
                          {totalWeight >= 1000 ? `${(totalWeight/1000).toFixed(1)}kg` : `${totalWeight.toFixed(0)}g`}
                        </p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-2 text-center">
                        <Clock className="w-4 h-4 text-green-500 mx-auto mb-1" />
                        <p className="text-xs font-semibold text-slate-700">{totalHours.toFixed(1)}h</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-2 text-center">
                        <Layers className="w-4 h-4 text-purple-500 mx-auto mb-1" />
                        <p className="text-xs font-semibold text-slate-700">{project.pieces?.length || 0}</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-2 text-center">
                        <Euro className="w-4 h-4 text-orange-500 mx-auto mb-1" />
                        <p className="text-xs font-semibold text-slate-700">{formatCurrency(project.total_cost)}</p>
                      </div>
                    </div>

                    {/* Swipe hint */}
                    {!isSwiped && (
                      <p className="text-[10px] text-slate-400 text-center mt-2">
                        ← Desliza para eliminar
                      </p>
                    )}
                  </motion.div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center p-4"
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-md safe-area-bottom"
            >
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-7 h-7 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  ¿Eliminar proyecto?
                </h3>
                <p className="text-sm text-slate-500">
                  Esta acción no se puede deshacer. Se eliminarán todas las piezas asociadas.
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 rounded-xl font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDeleteProject(showDeleteConfirm)}
                  className="flex-1 py-3 px-4 bg-red-500 text-white rounded-xl font-medium"
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
