import React from 'react';
import { Calculator, TrendingUp, FolderOpen, Settings, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const menuItems = [
  { id: 'calculator', label: 'Calculadora', icon: Calculator },
  { id: 'accounting', label: 'Contabilidad', icon: TrendingUp },
  { id: 'projects', label: 'Proyectos', icon: FolderOpen },
  { id: 'settings', label: 'Configuración', icon: Settings },
];

export default function Sidebar({ currentPage, onPageChange, isOpen, onToggle }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Mobile menu button */}
      <button
        onClick={onToggle}
        className="fixed top-4 left-4 z-50 lg:hidden bg-white rounded-lg p-2 shadow-lg border border-gray-200"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isOpen ? 0 : -280,
          transition: { type: "spring", stiffness: 300, damping: 30 }
        }}
        className="fixed left-0 top-0 h-full w-70 bg-white border-r border-gray-200 shadow-lg z-50 lg:relative lg:translate-x-0 lg:z-auto lg:w-64"
      >
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">3D Manager</h1>
              <p className="text-sm text-gray-500">Dashboard</p>
            </div>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onPageChange(item.id);
                    if (window.innerWidth < 1024) onToggle();
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 border border-primary-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-1">¿Necesitas ayuda?</h3>
            <p className="text-sm text-gray-600 mb-3">Consulta nuestra documentación</p>
            <button className="text-sm text-primary-600 font-medium hover:text-primary-700">
              Ver guías →
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
}