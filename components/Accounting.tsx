import React, { useState, useEffect } from 'react';
import { TrendingUp, Plus, Search, Calendar, Euro, BarChart3, PieChart, Clock, FileText, Loader, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';
import AdvancedStatistics from './AdvancedStatistics';

interface Sale {
  id: string;
  user_id: string;
  project_name: string;
  cost: number;
  unit_cost: number;
  quantity: number;
  sale_price: number;
  profit: number;
  margin: number;
  date: string;
  status: 'pending' | 'completed' | 'cancelled';
  print_hours?: number;
  created_at: string;
  updated_at: string;
}

interface DatabaseProject {
  id: string;
  user_id: string;
  name: string;
  filament_weight: number;
  filament_price: number;
  print_hours: number;
  electricity_cost: number;
  materials: Array<{ id: string; name: string; price: number }>;
  total_cost: number;
  created_at: string;
  status: 'draft' | 'calculated' | 'completed';
}

interface Stats {
  totalRevenue: number;
  totalCosts: number;
  totalProfit: number;
  averageMargin: number;
  totalSales: number;
  averageEurosPerHour: number;
  totalPrintHours: number;
  totalProducts: number;
}

export default function Accounting() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [projects, setProjects] = useState<DatabaseProject[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [showAdvancedStats, setShowAdvancedStats] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const supabase = createClient();
  
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    totalCosts: 0,
    totalProfit: 0,
    averageMargin: 0,
    totalSales: 0,
    averageEurosPerHour: 0,
    totalPrintHours: 0,
    totalProducts: 0
  });

  // Formulario para nueva venta
  const [newSale, setNewSale] = useState({
    projectName: '',
    unitCost: 0,
    quantity: 1,
    salePrice: 0,
    date: new Date().toISOString().split('T')[0],
    printHours: 0
  });

  // Cargar datos al inicializar
  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch sales
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (salesError) {
        console.error('Error fetching sales:', salesError);
      } else {
        setSales(salesData || []);
      }

      // Fetch projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (projectsError) {
        console.error('Error fetching projects:', projectsError);
      } else {
        setProjects(projectsData || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calcular estadísticas
  useEffect(() => {
    const completedSales = sales.filter(sale => sale.status === 'completed');
    const totalRevenue = completedSales.reduce((sum, sale) => sum + sale.sale_price, 0);
    const totalCosts = completedSales.reduce((sum, sale) => sum + sale.cost, 0);
    const totalProfit = totalRevenue - totalCosts;
    const averageMargin = completedSales.length > 0 
      ? completedSales.reduce((sum, sale) => sum + sale.margin, 0) / completedSales.length 
      : 0;

    // Calcular total de horas y euros por hora
    const totalPrintHours = completedSales.reduce((sum, sale) => sum + (sale.print_hours || 0), 0);
    const averageEurosPerHour = totalPrintHours > 0 ? totalProfit / totalPrintHours : 0;
    
    // Calcular total de productos vendidos
    const totalProducts = completedSales.reduce((sum, sale) => sum + (sale.quantity || 1), 0);

    setStats({
      totalRevenue,
      totalCosts,
      totalProfit,
      averageMargin,
      totalSales: completedSales.length,
      averageEurosPerHour,
      totalPrintHours,
      totalProducts
    });
  }, [sales]);

  // Manejar selección de proyecto
  const handleProjectSelect = (projectId: string) => {
    if (!projectId) {
      setNewSale({
        projectName: '',
        unitCost: 0,
        quantity: 1,
        salePrice: 0,
        date: new Date().toISOString().split('T')[0],
        printHours: 0
      });
      return;
    }

    const project = projects.find(p => p.id === projectId);
    if (project) {
      setNewSale({
        projectName: project.name,
        unitCost: project.total_cost,
        quantity: 1,
        salePrice: 0, // Usuario debe introducir precio de venta
        date: new Date().toISOString().split('T')[0],
        printHours: project.print_hours
      });
    }
  };

  const handleAddSale = async () => {
    if (!user) {
      alert('Debes iniciar sesión para registrar ventas.');
      return;
    }
    
    if (!newSale.projectName || newSale.unitCost <= 0 || newSale.salePrice <= 0 || newSale.quantity <= 0) {
      alert('Por favor, completa todos los campos correctamente');
      return;
    }

    const totalCost = newSale.unitCost * newSale.quantity;
    const profit = newSale.salePrice - totalCost;
    const margin = (profit / newSale.salePrice) * 100;

    const sale = {
      user_id: user.id,
      project_name: newSale.projectName,
      cost: totalCost,
      unit_cost: newSale.unitCost,
      quantity: newSale.quantity,
      sale_price: newSale.salePrice,
      profit,
      margin,
      date: newSale.date,
      status: 'completed' as const,
      print_hours: newSale.printHours * newSale.quantity
    };

    try {
      const { error } = await supabase.from('sales').insert([sale]);
      
      if (error) {
        console.error('Error adding sale:', error);
        alert('Error al registrar la venta');
        return;
      }

      // Refresh data
      await fetchData();

      // Resetear formulario
      setNewSale({
        projectName: '',
        unitCost: 0,
        quantity: 1,
        salePrice: 0,
        date: new Date().toISOString().split('T')[0],
        printHours: 0
      });
      setSelectedProject('');
      setShowAddForm(false);
      
      alert('Venta registrada correctamente');
    } catch (error) {
      console.error('Error adding sale:', error);
      alert('Error al registrar la venta');
    }
  };

  const handleDeleteSale = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta venta?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('sales')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting sale:', error);
        alert('Error al eliminar la venta');
        return;
      }

      // Refresh data
      await fetchData();
    } catch (error) {
      console.error('Error deleting sale:', error);
      alert('Error al eliminar la venta');
    }
  };

  const filteredSales = sales.filter(sale =>
    sale.project_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completado';
      case 'pending': return 'Pendiente';
      case 'cancelled': return 'Cancelado';
      default: return 'Desconocido';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos de contabilidad...</p>
        </div>
      </div>
    );
  }

  // Si se está mostrando estadísticas avanzadas, renderizar ese componente
  if (showAdvancedStats) {
    return <AdvancedStatistics onBack={() => setShowAdvancedStats(false)} />;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded-full mb-4">
          <TrendingUp className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Contabilidad</h1>
        <p className="text-gray-600">Gestiona las ventas y analiza la rentabilidad de tus proyectos</p>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Ingresos Totales</p>
              <p className="text-3xl font-bold text-blue-900">€{stats.totalRevenue.toFixed(2)}</p>
              <p className="text-blue-700 text-xs mt-1">{stats.totalSales} ventas • {stats.totalProducts} productos</p>
            </div>
            <Euro className="w-12 h-12 text-blue-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Margen Promedio</p>
              <p className="text-3xl font-bold text-green-900">{stats.averageMargin.toFixed(1)}%</p>
              <p className="text-green-700 text-xs mt-1">Beneficio: €{stats.totalProfit.toFixed(2)}</p>
            </div>
            <PieChart className="w-12 h-12 text-green-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">€/Hora Promedio</p>
              <p className="text-3xl font-bold text-purple-900">€{stats.averageEurosPerHour.toFixed(2)}</p>
              <p className="text-purple-700 text-xs mt-1">{stats.totalPrintHours.toFixed(1)}h totales</p>
            </div>
            <Clock className="w-12 h-12 text-purple-600" />
          </div>
        </motion.div>
      </div>

      {/* Estadísticas Adicionales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center">
            <BarChart3 className="w-5 h-5 text-red-500 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Costes Totales</p>
              <p className="text-lg font-semibold text-gray-900">€{stats.totalCosts.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center">
            <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Beneficio Total</p>
              <p className="text-lg font-semibold text-gray-900">€{stats.totalProfit.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center">
            <Calendar className="w-5 h-5 text-blue-500 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Proyectos Guardados</p>
              <p className="text-lg font-semibold text-gray-900">{projects.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center">
            <Clock className="w-5 h-5 text-orange-500 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Horas de Impresión</p>
              <p className="text-lg font-semibold text-gray-900">{stats.totalPrintHours.toFixed(1)}h</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 lg:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar ventas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowAdvancedStats(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
            >
              <Activity className="w-5 h-5" />
              <span>Estadísticas Avanzadas</span>
            </button>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
            >
              <Plus className="w-5 h-5" />
              <span>Nueva Venta</span>
            </button>
          </div>
        </div>
      </div>

      {/* Formulario de nueva venta */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Registrar Nueva Venta</h3>
          
          {/* Selector de proyecto guardado */}
          <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <label className="block text-sm font-medium text-blue-700 mb-2">
              ¿Quieres cargar un proyecto guardado?
            </label>
            <select
              value={selectedProject}
              onChange={(e) => {
                setSelectedProject(e.target.value);
                handleProjectSelect(e.target.value);
              }}
              className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="">Crear venta manualmente</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name} - €{project.total_cost.toFixed(2)} ({project.print_hours}h)
                </option>
              ))}
            </select>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Proyecto
              </label>
              <input
                type="text"
                value={newSale.projectName}
                onChange={(e) => setNewSale({ ...newSale, projectName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Ej: Figura decorativa"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Coste por Unidad (€)
              </label>
              <input
                type="number"
                value={newSale.unitCost || ''}
                onChange={(e) => setNewSale({ ...newSale, unitCost: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                min="0.01"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad
              </label>
              <input
                type="number"
                value={newSale.quantity || ''}
                onChange={(e) => setNewSale({ ...newSale, quantity: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                min="1"
                step="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio de Venta Total (€)
              </label>
              <input
                type="number"
                value={newSale.salePrice || ''}
                onChange={(e) => setNewSale({ ...newSale, salePrice: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                min="0.01"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Horas por Unidad
              </label>
              <input
                type="number"
                value={newSale.printHours || ''}
                onChange={(e) => setNewSale({ ...newSale, printHours: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                min="0.1"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha
              </label>
              <input
                type="date"
                value={newSale.date}
                onChange={(e) => setNewSale({ ...newSale, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Preview de beneficio */}
          {newSale.unitCost > 0 && newSale.salePrice > 0 && newSale.quantity > 0 && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Coste Total: </span>
                  <span className="font-medium text-gray-900">
                    €{(newSale.unitCost * newSale.quantity).toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Beneficio: </span>
                  <span className={`font-medium ${(newSale.salePrice - (newSale.unitCost * newSale.quantity)) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    €{(newSale.salePrice - (newSale.unitCost * newSale.quantity)).toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Margen: </span>
                  <span className={`font-medium ${((newSale.salePrice - (newSale.unitCost * newSale.quantity)) / newSale.salePrice * 100) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {((newSale.salePrice - (newSale.unitCost * newSale.quantity)) / newSale.salePrice * 100).toFixed(1)}%
                  </span>
                </div>
                {newSale.printHours > 0 && (
                  <div>
                    <span className="text-gray-600">€/Hora: </span>
                    <span className="font-medium text-purple-600">
                      €{((newSale.salePrice - (newSale.unitCost * newSale.quantity)) / (newSale.printHours * newSale.quantity)).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => {
                setShowAddForm(false);
                setSelectedProject('');
                setNewSale({
                  projectName: '',
                  unitCost: 0,
                  quantity: 1,
                  salePrice: 0,
                  date: new Date().toISOString().split('T')[0],
                  printHours: 0
                });
              }}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              onClick={handleAddSale}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              Guardar Venta
            </button>
          </div>
        </motion.div>
      )}

      {/* Lista de ventas */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Historial de Ventas</h3>
        </div>
        
        {filteredSales.length === 0 ? (
          <div className="p-12 text-center">
            <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay ventas registradas</h3>
            <p className="text-gray-600 mb-6">
              Comienza registrando tu primera venta para ver el análisis de rentabilidad
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proyecto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Coste Unit.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Coste Total
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
                    €/Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
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
                      <div className="font-medium text-gray-900">{sale.project_name}</div>
                      {sale.print_hours && (
                        <div className="text-sm text-gray-500">
                          {(sale.print_hours / (sale.quantity || 1)).toFixed(1)}h/unidad
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">
                      {sale.quantity || 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                      €{(sale.unit_cost || sale.cost / (sale.quantity || 1)).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                      €{sale.cost.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                      €{sale.sale_price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`font-medium ${sale.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        €{sale.profit.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`font-medium ${sale.margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {sale.margin.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {sale.print_hours && sale.print_hours > 0 ? (
                        <span className="font-medium text-purple-600">
                          €{(sale.profit / sale.print_hours).toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                      {new Date(sale.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(sale.status)}`}>
                        {getStatusText(sale.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleDeleteSale(sale.id)}
                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                      >
                        Eliminar
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}