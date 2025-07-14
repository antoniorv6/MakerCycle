import React from 'react';
import { Search, Trash2, Edit, Eye, Users, User, Plus, FileText, Package } from 'lucide-react';
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
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
    <div className="space-y-4">
      {/* Search Bar and Add Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Lista de Ventas</h3>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar ventas..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={onAddSale}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Venta
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proyectos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Venta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Coste
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Beneficio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Margen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Equipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSales.map((sale, index) => (
                <motion.tr
                  key={sale.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Package className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-900">
                          {sale.items_count} proyecto{sale.items_count !== 1 ? 's' : ''}
                        </span>
                      </div>
                      {sale.items && sale.items.length > 0 && (
                        <div className="text-sm text-gray-600 space-y-1">
                          {sale.items.slice(0, 2).map((item, itemIndex) => (
                            <div key={itemIndex} className="flex items-center space-x-2">
                              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                              <span className="truncate max-w-xs">{item.project_name}</span>
                              <span className="text-xs text-gray-500">
                                (x{item.quantity})
                              </span>
                            </div>
                          ))}
                          {sale.items.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{sale.items.length - 2} más...
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(sale.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(sale.total_amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(sale.total_cost)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={sale.total_profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatCurrency(sale.total_profit)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={sale.total_margin >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatPercentage(sale.total_margin)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {getClientName(sale.client_id || null)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      {sale.team_id ? (
                        <>
                          <Users className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-blue-600 font-medium">Equipo</span>
                        </>
                      ) : (
                        <>
                          <User className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-600">Personal</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(sale.status)}`}>
                      {getStatusText(sale.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => onEditSale(sale)}
                        className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all duration-200 hover:scale-105"
                        title="Editar venta"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onGenerateInvoice(sale)}
                        className="flex items-center justify-center w-8 h-8 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-all duration-200 hover:scale-105"
                        title="Generar albarán"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteSale(sale.id)}
                        className="flex items-center justify-center w-8 h-8 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all duration-200 hover:scale-105"
                        title="Eliminar venta"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSales.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-gray-500">No se encontraron ventas</p>
          </div>
        )}
      </div>
    </div>
  );
} 