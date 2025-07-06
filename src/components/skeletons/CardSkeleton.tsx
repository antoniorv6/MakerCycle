import React from 'react'

interface CardSkeletonProps {
  className?: string
  showImage?: boolean
  showActions?: boolean
}

export default function CardSkeleton({ 
  className = '', 
  showImage = false, 
  showActions = false 
}: CardSkeletonProps) {
  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300 ${className}`}>
      {/* Image placeholder */}
      {showImage && (
        <div className="h-48 bg-gray-200 rounded-t-xl"></div>
      )}
      
      {/* Content */}
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 bg-gray-200 rounded w-32"></div>
          <div className="h-5 bg-gray-200 rounded-full w-16"></div>
        </div>
        
        {/* Title */}
        <div className="h-6 bg-gray-200 rounded w-48 mb-3"></div>
        
        {/* Description */}
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="h-3 bg-gray-200 rounded w-16 mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-12"></div>
          </div>
          <div>
            <div className="h-3 bg-gray-200 rounded w-20 mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
        
        {/* Actions */}
        {showActions && (
          <div className="flex space-x-2 pt-4">
            <div className="h-8 bg-gray-200 rounded-lg flex-1"></div>
            <div className="h-8 bg-gray-200 rounded-lg w-8"></div>
            <div className="h-8 bg-gray-200 rounded-lg w-8"></div>
          </div>
        )}
      </div>
    </div>
  )
} 