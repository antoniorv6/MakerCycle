'use client'

import React, { useState, Suspense } from 'react'
import { Settings } from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'
import { useDashboardData } from '@/hooks/useDashboardData'

// Import existing components
import Sidebar from './Sidebar'
import ProjectInfoView from './ProjectInfoView'
import type { DatabaseProject, DatabasePiece, AppProject } from '@/types'
import TeamManager from './TeamManager'
import SettingsPage from './settings/SettingsPage'
import { ClientsManager } from './accounting/ClientsManager'
import dynamic from 'next/dynamic';
const KanbanBoard = dynamic(() => import('./kanban/KanbanBoard'), { ssr: false });
import { KanbanBoardSkeleton } from './skeletons';

// Import lazy components
import { 
  LazyAccounting, 
  LazyProjectManager, 
  LazyCostCalculator, 
  LazyDashboardHome 
} from './LazyComponent'
import { DashboardSkeleton } from './skeletons'

export default function Dashboard({ initialPage }: { initialPage?: string } = {}) {
  const [currentPage, setCurrentPage] = useState(initialPage || 'home')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loadedProject, setLoadedProject] = useState<AppProject | null>(null)
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

  // Helper to convert AppProject back to DatabaseProject for CostCalculator
  function projectToDbProject(project: AppProject): DatabaseProject & { pieces?: DatabasePiece[] } {
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
      pieces: project.pieces?.map(piece => ({
        id: piece.id,
        project_id: project.id,
        name: piece.name,
        filament_weight: piece.filamentWeight,
        filament_price: piece.filamentPrice,
        print_hours: piece.printHours,
        quantity: piece.quantity,
        notes: piece.notes || '',
        created_at: '', // Opcional, puedes ajustar si tienes el dato
        updated_at: '', // Opcional, puedes ajustar si tienes el dato
      }))
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
        return (
          <Suspense fallback={<DashboardSkeleton />}>
            <LazyDashboardHome stats={stats} onNavigate={setCurrentPage} />
          </Suspense>
        )
      case 'project-info':
        return loadedProject ? (
          <ProjectInfoView
            project={loadedProject}
            onEdit={() => setCurrentPage('calculator')}
          />
        ) : null;
      case 'calculator':
        return (
          <Suspense fallback={<DashboardSkeleton />}>
            <LazyCostCalculator 
              loadedProject={loadedProject ? projectToDbProject(loadedProject) : undefined} 
              onProjectSaved={handleProjectSaved}
            />
          </Suspense>
        )
      case 'accounting':
        return (
          <Suspense fallback={<DashboardSkeleton />}>
            <LazyAccounting />
          </Suspense>
        )
      case 'projects':
        return (
          <Suspense fallback={<DashboardSkeleton />}>
            <LazyProjectManager onLoadProject={handleLoadProject} />
          </Suspense>
        )
      case 'settings':
        return <SettingsPage />
      case 'teams':
        return <TeamManager />
      case 'clients':
        return <ClientsManager onBack={() => setCurrentPage('home')} />
      case 'kanban':
        return (
          <Suspense fallback={<KanbanBoardSkeleton />}>
            <KanbanBoard />
          </Suspense>
        );
      default:
        return (
          <Suspense fallback={<DashboardSkeleton />}>
            <LazyCostCalculator 
              loadedProject={loadedProject ? projectToDbProject(loadedProject) : undefined} 
              onProjectSaved={handleProjectSaved} 
            />
          </Suspense>
        )
    }
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
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