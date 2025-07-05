'use client'

import React, { useState } from 'react'
import { Settings } from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'

// Import existing components
import Sidebar from './Sidebar'
import Accounting from './Accounting'
import ProjectManager from './ProjectManager'
import CostCalculator, { type Project } from './cost-calculator'
import DashboardHome from './DashboardHome'
import ProjectInfoView from './ProjectInfoView'
import type { DatabaseProject, DatabasePiece } from './cost-calculator/types'
import TeamManager from './TeamManager'

export default function Dashboard({ initialPage }: { initialPage?: string } = {}) {
  const [currentPage, setCurrentPage] = useState(initialPage || 'home')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loadedProject, setLoadedProject] = useState<Project | null>(null)
  const { user } = useAuth()

  // Helper to convert DatabaseProject to Project
  function dbProjectToProject(db: DatabaseProject & { pieces?: DatabasePiece[] }): Project {
    return {
      id: db.id,
      name: db.name,
      filamentWeight: db.filament_weight,
      filamentPrice: db.filament_price,
      printHours: db.print_hours,
      electricityCost: db.electricity_cost,
      materials: db.materials,
      totalCost: db.total_cost,
      vatPercentage: db.vat_percentage,
      profitMargin: db.profit_margin,
      recommendedPrice: db.recommended_price,
      createdAt: db.created_at,
      status: db.status,
      pieces: db.pieces?.map(piece => ({
        id: piece.id,
        name: piece.name,
        filamentWeight: piece.filament_weight,
        filamentPrice: piece.filament_price,
        printHours: piece.print_hours,
        quantity: piece.quantity,
        notes: piece.notes || ''
      }))
    }
  }

  // Helper to convert Project back to DatabaseProject for CostCalculator
  function projectToDbProject(project: Project): DatabaseProject {
    return {
      id: project.id,
      user_id: '', // Not available in Project, but not used in CostCalculator
      name: project.name,
      filament_weight: project.filamentWeight,
      filament_price: project.filamentPrice,
      print_hours: project.printHours,
      electricity_cost: project.electricityCost,
      materials: project.materials,
      total_cost: project.totalCost,
      vat_percentage: project.vatPercentage,
      profit_margin: project.profitMargin,
      recommended_price: project.recommendedPrice,
      status: project.status,
      created_at: project.createdAt,
      updated_at: '', // Not available in Project
      // pieces is not part of DatabaseProject, handled separately
    };
  }

  // New: go to project-info view first
  const handleLoadProject = (dbProject: DatabaseProject & { pieces?: DatabasePiece[] }) => {
    const project = dbProjectToProject(dbProject);
    setLoadedProject(project)
    setCurrentPage('project-info')
  }

  const handleProjectSaved = () => {
    setLoadedProject(null)
  }

  const renderContent = () => {
    switch (currentPage) {
      case 'home':
        return <DashboardHome />
      case 'project-info':
        return loadedProject ? (
          <ProjectInfoView
            project={loadedProject}
            onEdit={() => setCurrentPage('calculator')}
          />
        ) : null;
      case 'calculator':
        return (
          <CostCalculator 
            loadedProject={loadedProject ? projectToDbProject(loadedProject) : undefined} 
            onProjectSaved={handleProjectSaved}
          />
        )
      case 'accounting':
        return <Accounting />
      case 'projects':
        return <ProjectManager onLoadProject={handleLoadProject} />
      case 'settings':
        return (
          <div className="max-w-4xl mx-auto p-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-full mb-4">
                <Settings className="w-8 h-8 text-gray-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Configuración</h1>
              <p className="text-gray-600">Personaliza tu experiencia de gestión 3D</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Perfil de Usuario</h3>
                  <p className="text-gray-600 text-sm">Información de tu cuenta</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Email</label>
                    <input 
                      type="email" 
                      value={user?.email || ''} 
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Nombre completo</label>
                    <input 
                      type="text" 
                      placeholder="Tu nombre completo" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Valores por Defecto</h3>
                  <p className="text-gray-600 text-sm">Configura los valores predeterminados para nuevos proyectos</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Filamento</h4>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Precio por kg (€)</label>
                      <input 
                        type="number" 
                        placeholder="25" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Electricidad</h4>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Coste por kWh (€)</label>
                      <input 
                        type="number" 
                        placeholder="0.12" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Precios</h4>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">IVA por defecto (%)</label>
                      <input 
                        type="number" 
                        placeholder="21" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Margen</h4>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Beneficio por defecto (%)</label>
                      <input 
                        type="number" 
                        placeholder="15" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200">
                    Guardar Configuración
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      case 'teams':
        return <TeamManager />
      default:
        return (
          <CostCalculator 
            loadedProject={loadedProject} 
            onProjectSaved={handleProjectSaved} 
          />
        )
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <main className="flex-1 overflow-auto transition-all duration-300 mx-auto">
        <div className="py-8 px-4 lg:px-8">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}