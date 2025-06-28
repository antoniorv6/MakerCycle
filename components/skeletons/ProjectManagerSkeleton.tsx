import React from 'react'

export default function ProjectManagerSkeleton() {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded-full mb-4"></div>
        <div className="h-8 bg-gray-200 rounded-lg w-64 mx-auto mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-80 mx-auto"></div>
      </div>

      {/* Search and Filter Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="h-12 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="flex space-x-2">
          <div className="h-10 bg-gray-200 rounded-lg w-24"></div>
          <div className="h-10 bg-gray-200 rounded-lg w-32"></div>
        </div>
      </div>

      {/* Projects Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            {/* Project Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="h-5 bg-gray-200 rounded w-32"></div>
                <div className="h-5 bg-gray-200 rounded-full w-16"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>

            {/* Project Details */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="h-3 bg-gray-200 rounded w-16 mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-12"></div>
                </div>
                <div>
                  <div className="h-3 bg-gray-200 rounded w-20 mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
                <div>
                  <div className="h-3 bg-gray-200 rounded w-24 mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
                <div>
                  <div className="h-3 bg-gray-200 rounded w-28 mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              </div>

              {/* Cost Summary */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-5 bg-gray-200 rounded w-16"></div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-4">
                <div className="h-8 bg-gray-200 rounded-lg flex-1"></div>
                <div className="h-8 bg-gray-200 rounded-lg w-8"></div>
                <div className="h-8 bg-gray-200 rounded-lg w-8"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State Skeleton (hidden by default) */}
      <div className="hidden text-center py-12">
        <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
        <div className="h-6 bg-gray-200 rounded w-48 mx-auto mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-64 mx-auto mb-6"></div>
        <div className="h-10 bg-gray-200 rounded-lg w-32 mx-auto"></div>
      </div>
    </div>
  )
} 