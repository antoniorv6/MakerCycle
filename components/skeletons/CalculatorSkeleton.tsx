import React from 'react'

export default function CalculatorSkeleton() {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="text-center flex-1">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-8 bg-gray-200 rounded-lg w-80 mx-auto mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded w-32 ml-4"></div>
      </div>

      {/* Layout principal */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Columna izquierda: Formularios */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Info Skeleton */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="h-5 bg-gray-200 rounded w-48"></div>
              <div className="flex space-x-2">
                <div className="h-8 bg-gray-200 rounded-lg w-20"></div>
                <div className="h-8 bg-gray-200 rounded-lg w-20"></div>
              </div>
            </div>
            <div className="h-12 bg-gray-200 rounded-lg"></div>
          </div>

          {/* Filament Section Skeleton */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="w-5 h-5 bg-gray-200 rounded mr-2"></div>
              <div className="h-5 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="h-4 bg-gray-200 rounded w-40 mb-2"></div>
                <div className="h-12 bg-gray-200 rounded-lg"></div>
              </div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-36 mb-2"></div>
                <div className="h-12 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>

          {/* Electricity Section Skeleton */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="w-5 h-5 bg-gray-200 rounded mr-2"></div>
              <div className="h-5 bg-gray-200 rounded w-28"></div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-12 bg-gray-200 rounded-lg"></div>
              </div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-36 mb-2"></div>
                <div className="h-12 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>

          {/* Pricing Config Skeleton */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="w-5 h-5 bg-gray-200 rounded mr-2"></div>
              <div className="h-5 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-12 bg-gray-200 rounded-lg"></div>
              </div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-12 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>

          {/* Materials Section Skeleton */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-5 h-5 bg-gray-200 rounded mr-2"></div>
                <div className="h-5 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="h-8 bg-gray-200 rounded-lg w-24"></div>
            </div>
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="h-10 bg-gray-200 rounded-lg flex-1"></div>
                  <div className="h-10 bg-gray-200 rounded-lg w-24"></div>
                  <div className="w-6 h-6 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Columna derecha: Resultados */}
        <div className="space-y-6">
          {/* Cost Breakdown Panel Skeleton */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="h-5 bg-gray-200 rounded w-40 mb-6"></div>
            <div className="space-y-4">
              {['Filamento', 'Electricidad', 'Materiales'].map((item, i) => (
                <div key={i} className="flex justify-between items-center py-3 border-b border-gray-200">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-5 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
              <div className="flex justify-between items-center py-4 bg-white rounded-lg px-4 mt-6">
                <div className="h-5 bg-gray-200 rounded w-24"></div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </div>

          {/* Sale Price Panel Skeleton */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg p-6 border border-green-200">
            <div className="h-5 bg-gray-200 rounded w-32 mb-6"></div>
            <div className="space-y-4">
              {['Precio Base', 'Con Margen', 'Con IVA', 'Recomendado'].map((item, i) => (
                <div key={i} className="flex justify-between items-center py-3 border-b border-green-200">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-5 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Project Info Panel Skeleton */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="h-5 bg-gray-200 rounded w-36 mb-6"></div>
            <div className="space-y-4">
              {['Peso', 'Tiempo', 'Materiales'].map((item, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-12"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 