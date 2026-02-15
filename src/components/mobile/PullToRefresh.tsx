'use client'

import React, { useState, useRef, useCallback, ReactNode } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { RefreshCw, ArrowDown } from 'lucide-react'
import { useHaptics } from '@/hooks/useCapacitor'

interface PullToRefreshProps {
  children: ReactNode
  onRefresh: () => Promise<void>
  threshold?: number
  disabled?: boolean
}

export default function PullToRefresh({ 
  children, 
  onRefresh, 
  threshold = 80,
  disabled = false 
}: PullToRefreshProps) {
  const { triggerHaptic } = useHaptics()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isPulling, setIsPulling] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const currentY = useRef(0)
  
  const pullDistance = useMotionValue(0)
  const pullProgress = useTransform(pullDistance, [0, threshold], [0, 1])
  const indicatorY = useTransform(pullDistance, [0, threshold], [-60, 0])
  const indicatorRotation = useTransform(pullDistance, [0, threshold, threshold * 2], [0, 180, 360])
  const indicatorScale = useTransform(pullDistance, [0, threshold * 0.5, threshold], [0.5, 0.8, 1])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled || isRefreshing) return
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      startY.current = e.touches[0].clientY
      setIsPulling(true)
    }
  }, [disabled, isRefreshing])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling || disabled || isRefreshing) return
    
    currentY.current = e.touches[0].clientY
    const delta = Math.max(0, currentY.current - startY.current)
    
    // Apply resistance as we pull further
    const resistance = 0.5
    const resistedDelta = delta * resistance
    
    pullDistance.set(resistedDelta)
    
    // Haptic feedback when reaching threshold
    const prevValue = pullDistance.getPrevious() ?? 0
    if (resistedDelta >= threshold && prevValue < threshold) {
      triggerHaptic('medium')
    }
  }, [isPulling, disabled, isRefreshing, pullDistance, threshold, triggerHaptic])

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling || disabled) return
    
    setIsPulling(false)
    const currentPull = pullDistance.get()
    
    if (currentPull >= threshold && !isRefreshing) {
      setIsRefreshing(true)
      triggerHaptic('heavy')
      
      // Keep indicator visible during refresh
      animate(pullDistance, threshold, { duration: 0.2 })

      try {
        const timeoutPromise = new Promise<void>((_, reject) =>
          setTimeout(() => reject(new Error('Refresh timeout')), 10000)
        )
        await Promise.race([onRefresh(), timeoutPromise])
      } catch (error) {
        console.error('Refresh failed or timed out:', error)
      }
      
      setIsRefreshing(false)
    }
    
    // Animate back to 0
    animate(pullDistance, 0, { 
      type: 'spring', 
      stiffness: 400, 
      damping: 30 
    })
  }, [isPulling, disabled, pullDistance, threshold, isRefreshing, onRefresh, triggerHaptic])

  return (
    <div 
      ref={containerRef}
      className="relative overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull Indicator */}
      <motion.div
        style={{ y: indicatorY }}
        className="absolute top-0 left-0 right-0 flex items-center justify-center h-16 pointer-events-none z-10"
      >
        <motion.div
          style={{ scale: indicatorScale }}
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isRefreshing
              ? 'bg-brand-500'
              : pullDistance.get() >= threshold
                ? 'bg-brand-600'
                : 'bg-slate-200'
          }`}
        >
          {isRefreshing ? (
            <RefreshCw className="w-5 h-5 text-white animate-spin" />
          ) : (
            <motion.div style={{ rotate: indicatorRotation }}>
              <ArrowDown className={`w-5 h-5 ${
                pullDistance.get() >= threshold ? 'text-white' : 'text-slate-500'
              }`} />
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ 
          y: useTransform(pullDistance, [0, threshold * 2], [0, threshold * 0.5])
        }}
        className="native-scroll"
      >
        {children}
      </motion.div>
    </div>
  )
}
