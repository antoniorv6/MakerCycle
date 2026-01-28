import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Calendar } from 'lucide-react';
import { usePrinterPresets } from '@/hooks/usePrinterPresets';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { useSales } from '@/hooks/useSales';
import { 
  calculateRemainingAmortizationAmount,
  calculateAmortizationProgress 
} from '@/services/printerPresetService';
import type { Sale } from '@/types';

export function AmortizationsSection() {
  const { presets: printerPresets, getAmortizationData } = usePrinterPresets();
  const { sales } = useSales();
  const { formatCurrency } = useFormatCurrency();
  const [expandedPrinters, setExpandedPrinters] = useState<Set<string>>(new Set());

  // Filtrar impresoras que se están amortizando
  const amortizingPrinters = printerPresets.filter(printer => {
    if (printer.purchase_price <= 0) return false;
    const data = getAmortizationData(printer);
    return !data.isFullyAmortized && (printer.is_being_amortized || data.remainingAmount > 0);
  });

  const toggleExpanded = (printerId: string) => {
    const newExpanded = new Set(expandedPrinters);
    if (newExpanded.has(printerId)) {
      newExpanded.delete(printerId);
    } else {
      newExpanded.add(printerId);
    }
    setExpandedPrinters(newExpanded);
  };

  // Obtener ventas que amortizan una impresora específica
  const getSalesForPrinter = (printerId: string): Sale[] => {
    return sales.filter(sale => 
      sale.printer_amortizations?.some(amort => amort.printer_preset_id === printerId)
    );
  };

  // Calcular total amortizado de una impresora
  const getTotalAmortizedForPrinter = (printerId: string): number => {
    const printerSales = getSalesForPrinter(printerId);
    return printerSales.reduce((sum, sale) => {
      const amortization = sale.printer_amortizations?.find(a => a.printer_preset_id === printerId);
      return sum + (amortization?.amortization_amount || 0);
    }, 0);
  };

  if (amortizingPrinters.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No hay impresoras en amortización
        </h3>
        <p className="text-gray-500 text-sm">
          Las impresoras que estés amortizando aparecerán aquí
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Amortización de Impresoras</h3>
          <p className="text-sm text-gray-600 mt-1">
            Gestiona el progreso de amortización de tus impresoras
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {amortizingPrinters.map(printer => {
          const amortizationData = getAmortizationData(printer);
          const printerSales = getSalesForPrinter(printer.id);
          const totalAmortized = getTotalAmortizedForPrinter(printer.id);
          const isExpanded = expandedPrinters.has(printer.id);

          return (
            <div
              key={printer.id}
              className="bg-white rounded-lg border border-purple-200 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <button
                        onClick={() => toggleExpanded(printer.id)}
                        className="p-1 hover:bg-purple-50 rounded"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-purple-600" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-purple-600" />
                        )}
                      </button>
                      <span className="font-semibold text-gray-900">{printer.name}</span>
                      {printer.brand && (
                        <span className="text-sm text-gray-500">({printer.brand} {printer.model})</span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm ml-7">
                      <div>
                        <span className="text-gray-500">Precio de compra:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {formatCurrency(printer.purchase_price)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Amortizado:</span>
                        <span className="ml-2 font-medium text-green-600">
                          {formatCurrency(totalAmortized)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Por amortizar:</span>
                        <span className="ml-2 font-medium text-purple-600">
                          {formatCurrency(amortizationData.remainingAmount)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Progreso:</span>
                        <span className="ml-2 font-medium">
                          {amortizationData.progress.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3 ml-7">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            amortizationData.isFullyAmortized ? 'bg-green-500' : 'bg-purple-500'
                          }`}
                          style={{ width: `${Math.min(amortizationData.progress, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded content - Sales list */}
              {isExpanded && (
                <div className="border-t border-purple-100 bg-purple-50 p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">
                    Ventas que amortizan esta impresora ({printerSales.length})
                  </h4>
                  
                  {printerSales.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No hay ventas que amorticen esta impresora aún
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {printerSales.map(sale => {
                        const amortization = sale.printer_amortizations?.find(
                          a => a.printer_preset_id === printer.id
                        );
                        if (!amortization) return null;

                        return (
                          <div
                            key={sale.id}
                            className="bg-white rounded-lg p-3 border border-purple-200"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm font-medium text-gray-900">
                                    {new Date(sale.date).toLocaleDateString('es-ES')}
                                  </span>
                                  {sale.items && sale.items.length > 0 && (
                                    <span className="text-xs text-gray-500">
                                      {sale.items.length} proyecto{sale.items.length !== 1 ? 's' : ''}
                                    </span>
                                  )}
                                </div>
                                {sale.items && sale.items.length > 0 && (
                                  <div className="text-xs text-gray-600 ml-6">
                                    {sale.items.slice(0, 2).map(item => item.project_name).join(', ')}
                                    {sale.items.length > 2 && ` +${sale.items.length - 2} más`}
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-semibold text-purple-700">
                                  {formatCurrency(amortization.amortization_amount)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {amortization.amortization_method === 'percentage' 
                                    ? `${amortization.amortization_value}%` 
                                    : 'Cantidad fija'}
                                </div>
                              </div>
                            </div>
                            <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500 grid grid-cols-2 gap-2">
                              <div>
                                <span>Beneficio antes:</span>
                                <span className="ml-1 font-medium">
                                  {formatCurrency(amortization.profit_before_amortization)}
                                </span>
                              </div>
                              <div>
                                <span>Beneficio después:</span>
                                <span className="ml-1 font-medium text-green-600">
                                  {formatCurrency(amortization.profit_after_amortization)}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
