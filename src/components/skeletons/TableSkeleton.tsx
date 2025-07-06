import React from 'react'

interface TableSkeletonProps {
  rows?: number
  columns?: number
  className?: string
}

export default function TableSkeleton({ 
  rows = 5, 
  columns = 6, 
  className = '' 
}: TableSkeletonProps) {
  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-100 ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="h-5 bg-gray-200 rounded w-32"></div>
          <div className="h-8 bg-gray-200 rounded-lg w-24"></div>
        </div>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-6 py-3 text-left">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 