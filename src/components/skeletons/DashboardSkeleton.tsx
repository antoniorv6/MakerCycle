import React from 'react'

export default function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded-full mb-4"></div>
        <div className="h-8 bg-gray-200 rounded-lg w-48 mx-auto mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-80 mx-auto"></div>
      </div>

      {/* Quick Actions Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-center p-6 bg-gray-100 rounded-xl border border-gray-200">
            <div className="w-8 h-8 bg-gray-300 rounded mr-3"></div>
            <div className="text-left">
              <div className="h-4 bg-gray-300 rounded w-24 mb-1"></div>
              <div className="h-3 bg-gray-300 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Key Statistics Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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

      {/* Additional Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-100 rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-3 bg-gray-300 rounded w-24 mb-2"></div>
                <div className="h-6 bg-gray-300 rounded w-20"></div>
              </div>
              <div className="w-8 h-8 bg-gray-300 rounded"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Latest Projects and Sales Skeleton */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Projects Skeleton */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="h-5 bg-gray-200 rounded w-32"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="flex space-x-4">
                      <div className="h-3 bg-gray-200 rounded w-12"></div>
                      <div className="h-3 bg-gray-200 rounded w-8"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-5 bg-gray-200 rounded-full w-16"></div>
                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sales Skeleton */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="h-5 bg-gray-200 rounded w-28"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-36 mb-2"></div>
                    <div className="flex space-x-4">
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-5 bg-gray-200 rounded-full w-20"></div>
                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Activity Summary Skeleton */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="h-5 bg-gray-200 rounded w-40 mb-4"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <div className="h-6 bg-gray-200 rounded w-12 mx-auto mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-20 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 