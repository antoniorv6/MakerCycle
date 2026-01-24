import React, { useState, useEffect } from 'react';
import { Plus, X, TrendingUp, Info, AlertCircle } from 'lucide-react';
import { usePrinterPresets } from '@/hooks/usePrinterPresets';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import type { AmortizationMethod, PrinterPreset } from '@/types';
import { 
  calculateRemainingAmortizationAmount,
  calculateAmortizationProgress 
} from '@/services/printerPresetService';

interface PrinterAmortization {
  printer_preset_id: string;
  amortization_method: AmortizationMethod;
  amortization_value: number;
}

interface PrinterAmortizationSectionProps {
  profit: number; // Beneficio de la venta
  amortizations: PrinterAmortization[];
  onAmortizationsChange: (amortizations: PrinterAmortization[]) => void;
}

export function PrinterAmortizationSection({
  profit,
  amortizations,
  onAmortizationsChange
}: PrinterAmortizationSectionProps) {
  const { presets: printerPresets, getAmortizationData } = usePrinterPresets();
  const { formatCurrency, currencySymbol } = useFormatCurrency();
  const [expandedPrinters, setExpandedPrinters] = useState<Set<string>>(new Set());

  // Filtrar impresoras que se pueden amortizar (tienen precio y no están totalmente amortizadas)
  const availablePrinters = printerPresets.filter(printer => {
    if (printer.purchase_price <= 0) return false;
    const data = getAmortizationData(printer);
    return !data.isFullyAmortized;
  });

  const addAmortization = (printerId: string) => {
    const printer = printerPresets.find(p => p.id === printerId);
    if (!printer) return;

    const method = printer.amortization_method || 'percentage';
    const value = printer.amortization_value || (method === 'percentage' ? 10 : 0);

    onAmortizationsChange([
      ...amortizations,
      {
        printer_preset_id: printerId,
        amortization_method: method,
        amortization_value: value
      }
    ]);
    setExpandedPrinters(new Set([...Array.from(expandedPrinters), printerId]));
  };

  const removeAmortization = (printerId: string) => {
    onAmortizationsChange(amortizations.filter(a => a.printer_preset_id !== printerId));
    const newExpanded = new Set(expandedPrinters);
    newExpanded.delete(printerId);
    setExpandedPrinters(newExpanded);
  };

  const updateAmortization = (printerId: string, field: 'amortization_method' | 'amortization_value', value: AmortizationMethod | number) => {
    onAmortizationsChange(
      amortizations.map(a =>
        a.printer_preset_id === printerId
          ? { ...a, [field]: value }
          : a
      )
    );
  };

  const calculateAmortizationAmount = (amortization: PrinterAmortization): number => {
    if (profit <= 0) return 0;

    let amount = 0;
    if (amortization.amortization_method === 'percentage') {
      amount = (profit * amortization.amortization_value) / 100;
    } else {
      // Método fijo: no puede superar el beneficio
      amount = Math.min(amortization.amortization_value, profit);
    }

    return Math.max(0, amount);
  };

  const totalAmortization = amortizations.reduce((sum, a) => sum + calculateAmortizationAmount(a), 0);
  const profitAfterAmortization = profit - totalAmortization;

  // Validar que la amortización total no supere el beneficio
  const isValid = totalAmortization <= profit;

  return (
    <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Amortización de Impresoras</h3>
        {availablePrinters.length > 0 && (
          <select
            value=""
            onChange={(e) => {
              if (e.target.value) {
                addAmortization(e.target.value);
                e.target.value = '';
              }
            }}
            className="text-sm px-3 py-1.5 border border-purple-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Añadir impresora...</option>
            {availablePrinters
              .filter(p => !amortizations.some(a => a.printer_preset_id === p.id))
              .map(printer => (
                <option key={printer.id} value={printer.id}>
                  {printer.name}
                </option>
              ))}
          </select>
        )}
      </div>

      {amortizations.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <p className="text-sm">No hay impresoras seleccionadas para amortizar</p>
          {availablePrinters.length === 0 && (
            <p className="text-xs mt-1">No hay impresoras disponibles para amortizar</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {amortizations.map(amortization => {
            const printer = printerPresets.find(p => p.id === amortization.printer_preset_id);
            if (!printer) return null;

            const amortizationData = getAmortizationData(printer);
            const amount = calculateAmortizationAmount(amortization);
            const isExpanded = expandedPrinters.has(printer.id);

            return (
              <div
                key={printer.id}
                className="bg-white rounded-lg border border-purple-200 p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-gray-900">{printer.name}</span>
                      {printer.brand && (
                        <span className="text-xs text-gray-500">({printer.brand} {printer.model})</span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Método
                        </label>
                        <select
                          value={amortization.amortization_method}
                          onChange={(e) => updateAmortization(
                            printer.id,
                            'amortization_method',
                            e.target.value as AmortizationMethod
                          )}
                          className="w-full text-sm px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="percentage">Porcentaje del beneficio</option>
                          <option value="fixed">Cantidad fija</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          {amortization.amortization_method === 'percentage' ? 'Porcentaje (%)' : `Cantidad (${currencySymbol})`}
                        </label>
                        <input
                          type="number"
                          step={amortization.amortization_method === 'percentage' ? '0.1' : '0.01'}
                          min="0"
                          max={amortization.amortization_method === 'percentage' ? '100' : undefined}
                          value={amortization.amortization_value}
                          onChange={(e) => updateAmortization(
                            printer.id,
                            'amortization_value',
                            parseFloat(e.target.value) || 0
                          )}
                          className="w-full text-sm px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-2 mb-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Cantidad a amortizar:</span>
                        <span className="font-semibold text-purple-700">
                          {formatCurrency(amount)}
                        </span>
                      </div>
                      {amortization.amortization_method === 'fixed' && amount < amortization.amortization_value && (
                        <div className="flex items-center gap-1 text-xs text-amber-600 mt-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>Limitado al beneficio disponible ({formatCurrency(profit)})</span>
                        </div>
                      )}
                    </div>

                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                        <div className="text-xs text-gray-600">
                          <div className="flex justify-between">
                            <span>Precio de compra:</span>
                            <span className="font-medium">{formatCurrency(printer.purchase_price)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Progreso de amortización:</span>
                            <span className="font-medium">{amortizationData.progress.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Por amortizar:</span>
                            <span className="font-medium text-purple-600">
                              {formatCurrency(amortizationData.remainingAmount)}
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-purple-500 h-1.5 rounded-full transition-all"
                            style={{ width: `${Math.min(amortizationData.progress, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-start gap-2 ml-4">
                    <button
                      type="button"
                      onClick={() => {
                        const newExpanded = new Set(expandedPrinters);
                        if (isExpanded) {
                          newExpanded.delete(printer.id);
                        } else {
                          newExpanded.add(printer.id);
                        }
                        setExpandedPrinters(newExpanded);
                      }}
                      className="p-1 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded"
                      title={isExpanded ? 'Contraer' : 'Expandir'}
                    >
                      <TrendingUp className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeAmortization(printer.id)}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                      title="Eliminar"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {amortizations.length > 0 && (
        <div className="mt-4 pt-4 border-t border-purple-200 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700 font-medium">Beneficio antes de amortización:</span>
            <span className="font-semibold text-gray-900">{formatCurrency(profit)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700 font-medium">Total amortización:</span>
            <span className={`font-semibold ${isValid ? 'text-purple-700' : 'text-red-600'}`}>
              {formatCurrency(totalAmortization)}
            </span>
          </div>
          {!isValid && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded">
              <AlertCircle className="w-4 h-4" />
              <span>La amortización total supera el beneficio disponible</span>
            </div>
          )}
          <div className="flex items-center justify-between text-sm pt-2 border-t border-purple-200">
            <span className="text-gray-900 font-bold">Beneficio después de amortización:</span>
            <span className={`font-bold text-lg ${profitAfterAmortization >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(profitAfterAmortization)}
            </span>
          </div>
        </div>
      )}

      {profit <= 0 && amortizations.length > 0 && (
        <div className="mt-3 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded">
          <Info className="w-4 h-4" />
          <span>No se puede amortizar si no hay beneficio en la venta</span>
        </div>
      )}
    </div>
  );
}
