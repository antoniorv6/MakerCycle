import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Package, Euro, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTeam } from '@/components/providers/TeamProvider';
import { useAuth } from '@/components/providers/AuthProvider';
import { createClient } from '@/lib/supabase';
import type { SaleItemFormData, Project } from '@/types';

interface SaleItemsFormProps {
  items: SaleItemFormData[];
  onItemsChange: (items: SaleItemFormData[]) => void;
}

export function SaleItemsForm({ items, onItemsChange }: SaleItemsFormProps) {
  const { currentTeam, userTeams, getEffectiveTeam } = useTeam();
  const { user } = useAuth();
  const supabase = createClient();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [showProjectSelector, setShowProjectSelector] = useState<number | null>(null);

  // Fetch projects when component mounts or team changes
  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user, currentTeam]);

  const fetchProjects = async () => {
    if (!user) return;
    
    setLoadingProjects(true);
    try {
      let query = supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      const effectiveTeam = getEffectiveTeam();
      
      if (effectiveTeam) {
        // Get team projects
        query = query.eq('team_id', effectiveTeam.id);
      } else {
        // Get personal projects (where team_id is null)
        query = query.eq('user_id', user.id).is('team_id', null);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching projects:', error);
        return;
      }

      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoadingProjects(false);
    }
  };

  const calculateDefaultSalePrice = (unitCost: number) => {
    // Default to 15% margin if no recommended price is available
    return unitCost * 1.15;
  };

  const addItem = () => {
    const newItem: SaleItemFormData = {
      project_id: null,
      project_name: '',
      unit_cost: 0,
      quantity: 1,
      sale_price: 0,
      print_hours: 0
    };
    onItemsChange([...items, newItem]);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onItemsChange(newItems);
  };

  const updateItem = (index: number, field: keyof SaleItemFormData, value: string | number | null) => {
    const newItems = [...items];
    let processedValue = value;
    
    // Ensure numeric fields are properly converted
    if (field === 'unit_cost' || field === 'sale_price' || field === 'print_hours') {
      processedValue = typeof value === 'string' ? parseFloat(value) || 0 : (value as number) || 0;
    } else if (field === 'quantity') {
      processedValue = typeof value === 'string' ? parseInt(value) || 1 : (value as number) || 1;
    }
    
    newItems[index] = {
      ...newItems[index],
      [field]: processedValue
    };
    onItemsChange(newItems);
  };

  const handleProjectSelect = (index: number, project: Project) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      project_id: project.id,
      project_name: project.name,
      unit_cost: project.total_cost,
      print_hours: project.print_hours,
      // Set a reasonable default sale price based on recommended price or cost + margin
      sale_price: project.recommended_price > 0 ? project.recommended_price : calculateDefaultSalePrice(project.total_cost)
    };
    onItemsChange(newItems);
    setShowProjectSelector(null);
  };

  const calculateItemTotal = (item: SaleItemFormData) => {
    return item.unit_cost * item.quantity;
  };

  const calculateItemProfit = (item: SaleItemFormData) => {
    return item.sale_price - calculateItemTotal(item);
  };

  const calculateItemMargin = (item: SaleItemFormData) => {
    const total = calculateItemTotal(item);
    return total > 0 ? (calculateItemProfit(item) / total) * 100 : 0;
  };

  const formatCurrency = (value: number) => `€${value.toFixed(2)}`;
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Elementos de la venta</h3>
        <button
          type="button"
          onClick={addItem}
          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Agregar Proyecto
        </button>
      </div>

      <AnimatePresence>
        {items.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white border border-gray-200 rounded-lg p-4 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-md font-medium text-gray-900">
                Proyecto {index + 1}
              </h4>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="flex items-center justify-center w-8 h-8 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all duration-200"
                title="Eliminar proyecto"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Project Selection */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proyecto
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={item.project_name}
                    onChange={(e) => updateItem(index, 'project_name', e.target.value)}
                    placeholder="Nombre del proyecto"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowProjectSelector(showProjectSelector === index ? null : index)}
                      className={`w-full flex items-center justify-between px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        item.project_id 
                          ? 'border-green-300 bg-green-50 text-green-700' 
                          : 'border-gray-300 bg-gray-50 text-gray-600'
                      }`}
                    >
                      <span className="text-sm">
                        {item.project_id ? 'Proyecto seleccionado' : 'Seleccionar proyecto existente'}
                      </span>
                      <Package className={`w-4 h-4 ${item.project_id ? 'text-green-600' : 'text-gray-400'}`} />
                    </button>
                    
                    {showProjectSelector === index && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                        {loadingProjects ? (
                          <div className="p-3 text-sm text-gray-500">Cargando proyectos...</div>
                        ) : projects.length > 0 ? (
                          <div>
                            {projects.map((project) => (
                              <button
                                key={project.id}
                                type="button"
                                onClick={() => handleProjectSelect(index, project)}
                                className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                              >
                                <div className="font-medium text-sm">{project.name}</div>
                                <div className="text-xs text-gray-500">
                                  Coste: €{project.total_cost.toFixed(2)} | Horas: {project.print_hours}h
                                </div>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="p-3 text-sm text-gray-500">No hay proyectos disponibles</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Cost and Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coste Unitario (€)
                </label>
                <input
                  type="number"
                  value={item.unit_cost}
                  onChange={(e) => {
                    const newCost = parseFloat(e.target.value) || 0;
                    updateItem(index, 'unit_cost', newCost);
                    // Auto-calculate sale price if it's currently 0 or if user hasn't set it manually
                    if (item.sale_price === 0) {
                      updateItem(index, 'sale_price', calculateDefaultSalePrice(newCost));
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad
                </label>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  step="1"
                />
              </div>

              {/* Sale Price and Print Hours */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio de Venta (€)
                </label>
                <input
                  type="number"
                  value={item.sale_price}
                  onChange={(e) => updateItem(index, 'sale_price', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horas de Impresión
                </label>
                <input
                  type="number"
                  value={item.print_hours}
                  onChange={(e) => updateItem(index, 'print_hours', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  step="0.1"
                />
              </div>
            </div>

            {/* Item Summary */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Coste Total:</span>
                  <div className="font-medium">{formatCurrency(calculateItemTotal(item))}</div>
                </div>
                <div>
                  <span className="text-gray-600">Beneficio:</span>
                  <div className={`font-medium ${calculateItemProfit(item) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(calculateItemProfit(item))}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Margen:</span>
                  <div className={`font-medium ${calculateItemMargin(item) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercentage(calculateItemMargin(item))}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Horas:</span>
                  <div className="font-medium">{item.print_hours}h</div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {items.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No hay proyectos agregados</p>
          <p className="text-sm">Haz clic en "Agregar Proyecto" para comenzar</p>
        </div>
      )}
    </div>
  );
} 