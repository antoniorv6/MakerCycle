'use client'

import React, { useState, Suspense } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { useDashboardData } from '@/hooks/useDashboardData'
import BottomNavigation from './BottomNavigation'
import MobileHeader from './MobileHeader'
import MobileDrawer from './MobileDrawer'
import MobileDashboardHome from './MobileDashboardHome'
import MobileProjectManager from './MobileProjectManager'
import MobileCostCalculator from './MobileCostCalculator'
import ProjectInfoView from '../ProjectInfoView'
import TeamManager from '../TeamManager'
import SettingsPage from '../settings/SettingsPage'
import { ClientsManager } from '../accounting/ClientsManager'
import dynamic from 'next/dynamic'
import { KanbanBoardSkeleton, DashboardSkeleton } from '../skeletons'
import type { DatabaseProject, DatabasePiece, AppProject } from '@/types'

// Lazy load heavy components
const KanbanBoard = dynamic(() => import('../kanban/KanbanBoard'), { ssr: false })
import { LazyAccounting } from '../LazyComponent'

interface MobileLayoutProps {
  initialPage?: string
}

export default function MobileLayout({ initialPage }: MobileLayoutProps) {
  const [currentPage, setCurrentPage] = useState(initialPage || 'home')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [loadedProject, setLoadedProject] = useState<AppProject | null>(null)
  const [settingsTab, setSettingsTab] = useState<string>('company')
  const { user } = useAuth()
  const { stats } = useDashboardData()

  // Helper to convert DatabaseProject to AppProject
  function dbProjectToProject(db: DatabaseProject & { pieces?: DatabasePiece[] }): AppProject {
    return {
      id: db.id,
      name: db.name,
      filamentWeight: db.filament_weight,
      filamentPrice: db.filament_price,
      printHours: db.print_hours,
      electricityCost: db.electricity_cost,
      printerPower: 0.35,
      materials: db.materials,
      postprocessingItems: db.postprocessing_items,
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
        notes: piece.notes || '',
        materials: (piece as any).materials || []
      }))
    }
  }

  // Helper to convert AppProject back to DatabaseProject
  function projectToDbProject(project: AppProject): DatabaseProject & { pieces?: DatabasePiece[] } {
    return {
      id: project.id,
      user_id: '',
      name: project.name,
      filament_weight: project.filamentWeight,
      filament_price: project.filamentPrice,
      print_hours: project.printHours,
      electricity_cost: project.electricityCost,
      materials: project.materials,
      postprocessing_items: project.postprocessingItems,
      total_cost: project.totalCost,
      vat_percentage: project.vatPercentage,
      profit_margin: project.profitMargin,
      recommended_price: project.recommendedPrice,
      status: project.status,
      created_at: project.createdAt,
      updated_at: '',
      pieces: project.pieces?.map(piece => ({
        id: piece.id,
        project_id: project.id,
        name: piece.name,
        filament_weight: piece.filamentWeight,
        filament_price: piece.filamentPrice,
        print_hours: piece.printHours,
        quantity: piece.quantity,
        notes: piece.notes || '',
        materials: (piece as any).materials?.map((material: any) => ({
          id: material.id,
          material_name: material.materialName || material.material_name,
          material_type: material.materialType || material.material_type,
          weight: material.weight,
          price_per_kg: material.pricePerKg || material.price_per_kg,
          unit: material.unit,
          category: material.category,
          color: material.color,
          brand: material.brand,
          notes: material.notes
        })) || [],
        created_at: '',
        updated_at: '',
      }))
    }
  }

  const handleLoadProject = (dbProject: DatabaseProject & { pieces?: DatabasePiece[] }) => {
    const project = dbProjectToProject(dbProject)
    setLoadedProject(project)
    setCurrentPage('project-info')
  }

  const handleEditProject = (dbProject: DatabaseProject & { pieces?: DatabasePiece[] }) => {
    const project = dbProjectToProject(dbProject)
    setLoadedProject(project)
    setCurrentPage('calculator')
  }

  const handleProjectSaved = (savedProject: DatabaseProject) => {
    const updatedProject = dbProjectToProject(savedProject)
    setLoadedProject(updatedProject)
  }

  // Callback cuando se termina de editar un proyecto
  const handleEditingComplete = () => {
    setLoadedProject(null)
  }

  const handlePageChange = (page: string, tab?: string) => {
    // Clear loadedProject when navigating away from calculator
    // The draft system will preserve unsaved changes
    if (currentPage === 'calculator' && page !== 'calculator') {
      setLoadedProject(null);
    }

    setCurrentPage(page)
    if (page === 'settings' && tab) {
      setSettingsTab(tab)
    } else if (page === 'settings') {
      setSettingsTab('company')
    }
  }

  const getPageTitle = () => {
    switch (currentPage) {
      case 'home': return 'MakerCycle'
      case 'calculator': return 'Calculadora'
      case 'accounting': return 'Contabilidad'
      case 'projects': return 'Proyectos'
      case 'kanban': return 'Organización'
      case 'settings': return 'Configuración'
      case 'teams': return 'Equipos'
      case 'clients': return 'Clientes'
      case 'project-info': return loadedProject?.name || 'Proyecto'
      default: return 'MakerCycle'
    }
  }

  const showBackButton = ['project-info', 'settings', 'teams', 'clients', 'kanban'].includes(currentPage)

  const handleBack = () => {
    if (currentPage === 'project-info') {
      setCurrentPage('projects')
    } else {
      setCurrentPage('home')
    }
  }

  const renderContent = () => {
    switch (currentPage) {
      case 'home':
        return (
          <MobileDashboardHome stats={stats} onNavigate={handlePageChange} />
        )
      case 'project-info':
        return loadedProject ? (
          <ProjectInfoView
            project={loadedProject}
            onEdit={() => handlePageChange('calculator')}
          />
        ) : null
      case 'calculator':
        // Ir directamente a la calculadora con el proyecto cargado (si hay)
        return (
          <MobileCostCalculator 
            loadedProject={loadedProject ? projectToDbProject(loadedProject) : undefined} 
            onProjectSaved={handleProjectSaved}
            onEditingComplete={handleEditingComplete}
            onNavigateToSettings={() => handlePageChange('settings', 'materials')}
          />
        )
      case 'accounting':
        return (
          <Suspense fallback={<DashboardSkeleton />}>
            <LazyAccounting />
          </Suspense>
        )
      case 'projects':
        return (
          <MobileProjectManager 
            onLoadProject={handleLoadProject} 
            onEditProject={handleEditProject}
          />
        )
      case 'settings':
        return <SettingsPage initialTab={settingsTab} />
      case 'teams':
        return <TeamManager />
      case 'clients':
        return <ClientsManager onBack={() => handlePageChange('home')} />
      case 'kanban':
        return (
          <Suspense fallback={<KanbanBoardSkeleton />}>
            <KanbanBoard />
          </Suspense>
        )
      default:
        return (
          <MobileCostCalculator 
            loadedProject={loadedProject ? projectToDbProject(loadedProject) : undefined} 
            onProjectSaved={handleProjectSaved}
            onEditingComplete={handleEditingComplete}
            onNavigateToSettings={() => handlePageChange('settings', 'materials')}
          />
        )
    }
  }

  return (
    <div className="min-h-screen-safe bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <MobileHeader 
        title={getPageTitle()}
        showBack={showBackButton}
        onBack={handleBack}
      />

      {/* Main Content - Native scroll behavior */}
      <main className="pt-14 pb-20 min-h-screen native-scroll">
        <div className="py-3">
          {renderContent()}
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation 
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onMenuOpen={() => setDrawerOpen(true)}
      />

      {/* Drawer Menu */}
      <MobileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onPageChange={handlePageChange}
        currentPage={currentPage}
      />
    </div>
  )
}
