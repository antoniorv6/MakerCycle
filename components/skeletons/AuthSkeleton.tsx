import React from 'react'

export default function AuthSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 animate-pulse">
      <div className="max-w-md w-full space-y-8">
        {/* Header Skeleton */}
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-64 mx-auto"></div>
        </div>

        {/* Form Skeleton */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <div className="space-y-6">
            {/* Email Field */}
            <div>
              <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-12 bg-gray-200 rounded-lg"></div>
            </div>

            {/* Password Field */}
            <div>
              <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-12 bg-gray-200 rounded-lg"></div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>

            {/* Submit Button */}
            <div className="h-12 bg-gray-200 rounded-lg"></div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="space-y-3">
              <div className="h-12 bg-gray-200 rounded-lg"></div>
              <div className="h-12 bg-gray-200 rounded-lg"></div>
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 