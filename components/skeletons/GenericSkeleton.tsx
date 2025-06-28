import React from 'react'

interface GenericSkeletonProps {
  className?: string
  lines?: number
  height?: string
  width?: string
}

export default function GenericSkeleton({ 
  className = '', 
  lines = 3, 
  height = 'h-4', 
  width = 'w-full' 
}: GenericSkeletonProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div 
          key={i} 
          className={`bg-gray-200 rounded animate-pulse ${height} ${width}`}
          style={{ 
            width: i === lines - 1 ? '75%' : '100%' 
          }}
        />
      ))}
    </div>
  )
} 