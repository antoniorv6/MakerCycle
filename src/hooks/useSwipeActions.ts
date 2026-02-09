'use client'

import { useState, useCallback } from 'react'
import { PanInfo } from 'framer-motion'
import { useHaptics } from '@/hooks/useCapacitor'

interface UseSwipeActionsOptions {
  threshold?: number
}

export function useSwipeActions({ threshold = 80 }: UseSwipeActionsOptions = {}) {
  const [swipedItemId, setSwipedItemId] = useState<string | null>(null)
  const { triggerHaptic } = useHaptics()

  const handleSwipe = useCallback((itemId: string, info: PanInfo) => {
    if (info.offset.x < -threshold) {
      setSwipedItemId(itemId)
      triggerHaptic('light')
    } else if (info.offset.x > 20) {
      setSwipedItemId(null)
    }
  }, [threshold, triggerHaptic])

  const clearSwipe = useCallback(() => {
    setSwipedItemId(null)
  }, [])

  return { swipedItemId, handleSwipe, clearSwipe }
}
