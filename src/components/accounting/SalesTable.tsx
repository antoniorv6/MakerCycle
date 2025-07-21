import React from 'react';
import { Search, Trash2, Edit, Eye, Users, User, Plus, FileText, Package, Calendar, Euro, TrendingUp, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useClients } from '@/hooks/useClients';
import type { Sale } from '@/types';

interface SalesTableProps {
  sales: Sale[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onDeleteSale: (id: string) => void;
  onEditSale: (sale: Sale) => void;
  onAddSale: () => void;
  onGenerateInvoice: (sale: Sale) => void;
}

export function SalesTable({ 
  sales, 
  searchTerm, 
  onSearchChange, 
  onDeleteSale, 
  onEditSale,
  onAddSale,
  onGenerateInvoice
}: SalesTableProps) {
  const { clients } = useClients();
  const formatCurrency = (value: number) => `€${value.toFixed(2)}`;
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('es-ES');

  const getClientName = (clientId: string | null) => {
    if (!clientId) return 'Sin cliente';
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Cliente no encontrado';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completada';
      case 'pending': return 'Pendiente';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const filteredSales = sales.filter(sale =>
    sale.items?.some(item => item.project_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    sale.date.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Search Bar and Add Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-gray-900">Lista de Ventas</h3>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar ventas..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={onAddSale}
            className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Venta
          </button>
        </div>
      </div>

      {/* Sales Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredSales.map((sale, index) => (
          <motion.div
            key={sale.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-100 min-w-0">
              <div className="flex items-start justify-between min-w-0">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2 flex-wrap min-w-0">
                    <Package className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-semibold text-gray-900">
                      {sale.items_count} proyecto{sale.items_count !== 1 ? 's' : ''}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(sale.status)}`}>
                      {getStatusText(sale.status)}
                    </span>
                  </div>
                  
                  {/* Project Names */}
                  {sale.items && sale.items.length > 0 && (
                    <div className="space-y-1">
                      {sale.items.slice(0, 2).map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-center space-x-2 text-sm text-gray-600">
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                          <span className="truncate flex-1 max-w-[120px] sm:max-w-[180px] md:max-w-[220px]">{item.project_name}</span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                            x{item.quantity}
                          </span>
                        </div>
                      ))}
                      {sale.items.length > 2 && (
                        <div className="text-xs text-gray-500 italic">
                          +{sale.items.length - 2} más...
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Actions */}
                <div className="flex space-x-1 ml-2 sales-actions-scroll overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200 max-w-full">
                  <button
                    onClick={() => onEditSale(sale)}
                    className="flex items-center justify-center w-7 h-7 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all duration-200 hover:scale-105"
                    title="Editar venta"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onGenerateInvoice(sale)}
                    className="flex items-center justify-center w-7 h-7 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-all duration-200 hover:scale-105"
                    title="Generar albarán"
                  >
                    <FileText className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteSale(sale.id)}
                    className="flex items-center justify-center w-7 h-7 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all duration-200 hover:scale-105"
                    title="Eliminar venta"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Financial Info */}
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <Euro className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-medium text-gray-600">Total Venta</span>
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatCurrency(sale.total_amount)}
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-medium text-gray-600">Beneficio</span>
                  </div>
                  <div className={`text-lg font-semibold ${sale.total_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(sale.total_profit)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <span className="text-xs font-medium text-gray-600">Fecha</span>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {formatDate(sale.date)}
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-medium text-gray-600">Margen</span>
                  </div>
                  <div className={`text-sm font-semibold ${sale.total_margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercentage(sale.total_margin)}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700 truncate max-w-[120px] sm:max-w-[180px] md:max-w-[220px]">
                    {getClientName(sale.client_id || null)}
                  </span>
                </div>
                
                <div className="flex items-center space-x-1">
                  {sale.team_id ? (
                    <>
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      <span className="text-xs text-blue-600 font-medium">Equipo</span>
                    </>
                  ) : (
                    <>
                      <User className="w-3.5 h-3.5 text-gray-600" />
                      <span className="text-xs text-gray-600">Personal</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredSales.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">No se encontraron ventas</p>
          <p className="text-gray-400 text-sm mt-2">Intenta ajustar los filtros de búsqueda</p>
        </div>
      )}
      <style jsx>{`
        @media (max-width: 640px) {
          .sales-actions-scroll {
            gap: 0.25rem;
            padding-left: 0.25rem;
            padding-right: 0.25rem;
            min-width: 0;
          }
          .sales-actions-scroll button {
            min-width: 32px;
            width: 32px;
            height: 32px;
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
} 