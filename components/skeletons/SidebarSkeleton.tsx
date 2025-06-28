import React from 'react'

export default function SidebarSkeleton() {
  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col animate-pulse">
      {/* Logo/Brand Skeleton */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-200 rounded"></div>
          <div className="h-6 bg-gray-200 rounded w-24"></div>
        </div>
      </div>

      {/* Navigation Menu Skeleton */}
      <nav className="flex-1 p-4 space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center space-x-3 p-3 rounded-lg">
            <div className="w-5 h-5 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
        ))}
      </nav>

      {/* User Profile Skeleton */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          <div className="flex-1">
            <div className="h-3 bg-gray-200 rounded w-16 mb-1"></div>
            <div className="h-2 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="w-4 h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  )
} 