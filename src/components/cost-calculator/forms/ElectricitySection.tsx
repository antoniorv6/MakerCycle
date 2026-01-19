import React, { useState } from 'react';
import { Zap, Info, Printer, Plus, ChevronDown, Settings, TrendingUp } from 'lucide-react';
import type { ElectricitySectionProps } from '../types';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { 
  calculateAmortizationCostPerHour, 
  calculateAmortizationProgress,
  calculateRemainingAmortizationAmount 
} from '@/services/printerPresetService';

const ElectricitySection: React.FC<ElectricitySectionProps> = ({
  printHours,
  electricityCost,
  printerPower,
  onElectricityCostChange,
  onPrinterPowerChange,
  selectedPrinterId,
  onPrinterSelect,
  printerPresets = [],
  onNavigateToSettings,
  includeAmortization = true,
  onIncludeAmortizationChange
}) => {
  const [showPrinterSelector, setShowPrinterSelector] = useState(false);
  const { formatCurrency, currencySymbol } = useFormatCurrency();
  
  const selectedPrinter = printerPresets.find(p => p.id === selectedPrinterId);
  
  // Calcular datos de amortización si hay impresora seleccionada
  const amortizationData = selectedPrinter && selectedPrinter.purchase_price > 0 ? {
    costPerHour: calculateAmortizationCostPerHour(selectedPrinter.purchase_price, selectedPrinter.amortization_hours),
    progress: calculateAmortizationProgress(selectedPrinter.current_usage_hours, selectedPrinter.amortization_hours),
    remainingAmount: calculateRemainingAmortizationAmount(
      selectedPrinter.purchase_price,
      selectedPrinter.current_usage_hours,
      selectedPrinter.amortization_hours
    ),
    isFullyAmortized: selectedPrinter.current_usage_hours >= selectedPrinter.amortization_hours
  } : null;

  const handlePrinterSelect = (printerId: string | null) => {
    if (printerId && onPrinterSelect) {
      const printer = printerPresets.find(p => p.id === printerId);
      if (printer) {
        // Auto-rellenar la potencia de la impresora seleccionada
        onPrinterPowerChange(printer.power_consumption);
        onPrinterSelect(printerId);
      }
    } else if (onPrinterSelect) {
      onPrinterSelect(null);
    }
    setShowPrinterSelector(false);
  };

  const amortizationCostForProject = amortizationData && includeAmortization && !amortizationData.isFullyAmortized
    ? amortizationData.costPerHour * printHours
    : 0;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Zap className="w-5 h-5 text-yellow-500 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">Electricidad e Impresora</h2>
        </div>
        
        {/* Selector de impresora */}
        {printerPresets.length > 0 && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPrinterSelector(!showPrinterSelector)}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors border border-amber-200"
            >
              <Printer className="w-4 h-4" />
              {selectedPrinter ? selectedPrinter.name : 'Seleccionar impresora'}
              <ChevronDown className={`w-4 h-4 transition-transform ${showPrinterSelector ? 'rotate-180' : ''}`} />
            </button>
            
            {showPrinterSelector && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="p-2">
                  <button
                    type="button"
                    onClick={() => handlePrinterSelect(null)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-gray-100 ${
                      !selectedPrinterId ? 'bg-gray-100 font-medium' : ''
                    }`}
                  >
                    Ninguna (manual)
                  </button>
                  {printerPresets.map(printer => (
                    <button
                      key={printer.id}
                      type="button"
                      onClick={() => handlePrinterSelect(printer.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-amber-50 ${
                        selectedPrinterId === printer.id ? 'bg-amber-100 font-medium' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{printer.name}</span>
                        <span className="text-xs text-gray-500">{printer.power_consumption} kW</span>
                      </div>
                      {printer.brand && (
                        <div className="text-xs text-gray-400">{printer.brand} {printer.model}</div>
                      )}
                    </button>
                  ))}
                </div>
                {onNavigateToSettings && (
                  <div className="border-t border-gray-200 p-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPrinterSelector(false);
                        onNavigateToSettings();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-amber-600 hover:bg-amber-50 rounded-lg"
                    >
                      <Plus className="w-4 h-4" />
                      Añadir nueva impresora
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {printerPresets.length === 0 && onNavigateToSettings && (
          <button
            type="button"
            onClick={onNavigateToSettings}
            className="flex items-center gap-2 px-3 py-2 text-sm text-amber-600 hover:bg-amber-50 rounded-lg border border-amber-200"
          >
            <Plus className="w-4 h-4" />
            Añadir impresora
          </button>
        )}
      </div>

      {/* Info de impresora seleccionada */}
      {selectedPrinter && (
        <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Printer className="w-4 h-4 text-amber-600" />
              <span className="font-medium text-amber-900">{selectedPrinter.name}</span>
              {selectedPrinter.brand && (
                <span className="text-sm text-amber-600">({selectedPrinter.brand} {selectedPrinter.model})</span>
              )}
            </div>
            {onNavigateToSettings && (
              <button
                type="button"
                onClick={onNavigateToSettings}
                className="p-1 text-amber-500 hover:text-amber-700 hover:bg-amber-100 rounded"
                title="Editar impresora"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {amortizationData && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                  <span className="text-amber-700">Amortización:</span>
                </div>
                <div className="text-right">
                  {amortizationData.isFullyAmortized ? (
                    <span className="text-green-600 font-medium">✓ Totalmente amortizada</span>
                  ) : (
                    <span className="text-amber-900 font-medium">
                      {formatCurrency(amortizationData.costPerHour)}/h
                    </span>
                  )}
                </div>
              </div>
              
              {/* Barra de progreso */}
              <div>
                <div className="flex justify-between text-xs text-amber-600 mb-1">
                  <span>{amortizationData.progress.toFixed(1)}% amortizado</span>
                  <span>Restante: {formatCurrency(amortizationData.remainingAmount)}</span>
                </div>
                <div className="w-full bg-amber-200 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      amortizationData.isFullyAmortized ? 'bg-green-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(amortizationData.progress, 100)}%` }}
                  />
                </div>
              </div>

              {/* Toggle de incluir amortización */}
              {!amortizationData.isFullyAmortized && onIncludeAmortizationChange && (
                <div className="flex items-center justify-between pt-2 border-t border-amber-200">
                  <label htmlFor="include-amortization" className="text-sm text-amber-700 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="include-amortization"
                      checked={includeAmortization}
                      onChange={(e) => onIncludeAmortizationChange(e.target.checked)}
                      className="w-4 h-4 text-amber-600 border-amber-300 rounded focus:ring-amber-500"
                    />
                    Incluir coste de amortización en el proyecto
                  </label>
                  {includeAmortization && (
                    <span className="text-sm font-medium text-amber-900">
                      +{formatCurrency(amortizationCostForProject)}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <div className="flex items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Tiempo total de impresión
            </span>
            <div className="group relative ml-2">
              <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                Calculado automáticamente sumando las horas de todas las piezas
              </div>
            </div>
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {printHours.toFixed(1)} horas
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Potencia impresora (kW)
          </label>
          <input
            type="number"
            value={printerPower || ''}
            onChange={(e) => onPrinterPowerChange(Number(e.target.value) || 0)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            min="0"
            step="0.01"
            placeholder="0.35"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Coste electricidad ({currencySymbol}/kWh)
          </label>
          <input
            type="number"
            value={electricityCost || ''}
            onChange={(e) => onElectricityCostChange(Number(e.target.value) || 0)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            min="0"
            step="0.01"
          />
        </div>
      </div>

      {/* Resumen de costes de electricidad */}
      {printHours > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Coste de electricidad estimado:</span>
            <span className="font-medium text-gray-900">
              {formatCurrency(printHours * printerPower * electricityCost)}
            </span>
          </div>
          {amortizationData && includeAmortization && !amortizationData.isFullyAmortized && (
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-amber-600">Coste de amortización:</span>
              <span className="font-medium text-amber-700">
                {formatCurrency(amortizationCostForProject)}
              </span>
            </div>
          )}
          {amortizationData && includeAmortization && !amortizationData.isFullyAmortized && (
            <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t border-gray-100">
              <span className="text-gray-700 font-medium">Total electricidad + amortización:</span>
              <span className="font-bold text-gray-900">
                {formatCurrency((printHours * printerPower * electricityCost) + amortizationCostForProject)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ElectricitySection;
