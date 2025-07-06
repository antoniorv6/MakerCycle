import React from 'react';
import { Search, Trash2, Edit, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Sale } from '@/types';

interface SalesTableProps {
  sales: Sale[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onDeleteSale: (id: string) => void;
  onEditSale: (sale: Sale) => void;
}

export function SalesTable({ 
  sales, 
  searchTerm, 
  onSearchChange, 
  onDeleteSale, 
  onEditSale 
}: SalesTableProps) {
  const formatCurrency = (value: number) => `€${value.toFixed(2)}`;
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('es-ES');

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
    sale.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.date.includes(searchTerm)
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Table Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Ventas</h3>
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
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Proyecto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Coste
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio Venta
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Beneficio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Margen
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
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {sale.project_name}
                  </div>
                  <div className="text-sm text-gray-500">
                    Cantidad: {sale.quantity}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(sale.date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(sale.cost)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(sale.sale_price)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(sale.profit)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatPercentage(sale.margin)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(sale.status)}`}>
                    {getStatusText(sale.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEditSale(sale)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteSale(sale.id)}
                      className="text-red-600 hover:text-red-900"
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
  );
} 