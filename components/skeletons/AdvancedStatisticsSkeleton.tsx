import React from 'react'

export default function AdvancedStatisticsSkeleton() {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded-full mb-4"></div>
        <div className="h-8 bg-gray-200 rounded-lg w-64 mx-auto mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-80 mx-auto"></div>
      </div>

      {/* Key Metrics Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="w-8 h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart Skeleton */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="h-5 bg-gray-200 rounded w-32"></div>
            <div className="h-8 bg-gray-200 rounded-lg w-24"></div>
          </div>
          <div className="h-64 bg-gray-100 rounded-lg flex items-end justify-between px-4 pb-4">
            {[20, 40, 60, 80, 45, 70, 90].map((height, i) => (
              <div key={i} className="bg-gray-300 rounded-t" style={{ height: `${height}%`, width: '8%' }}></div>
            ))}
          </div>
        </div>

        {/* Profit Margin Chart Skeleton */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="h-5 bg-gray-200 rounded w-36"></div>
            <div className="h-8 bg-gray-200 rounded-lg w-24"></div>
          </div>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="w-32 h-32 bg-gray-300 rounded-full border-8 border-gray-200"></div>
          </div>
        </div>
      </div>

      {/* Performance Metrics Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center mb-4">
              <div className="w-5 h-5 bg-gray-200 rounded mr-2"></div>
              <div className="h-5 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((j) => (
                <div key={j} className="flex justify-between items-center">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-12"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Project Analysis Skeleton */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="h-5 bg-gray-200 rounded w-40"></div>
            <div className="h-8 bg-gray-200 rounded-lg w-24"></div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center">
                <div className="h-6 bg-gray-200 rounded w-16 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-12 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Time Analysis Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="h-5 bg-gray-200 rounded w-32 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="flex-1 mx-4">
                  <div className="h-2 bg-gray-200 rounded-full"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-12"></div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="h-5 bg-gray-200 rounded w-28 mb-6"></div>
          <div className="h-48 bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    </div>
  )
} 