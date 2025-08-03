import { useCallback } from 'react'
import posthog from 'posthog-js'
import { ANALYTICS_EVENTS, FEATURE_FLAGS } from '@/types'

export const useAnalytics = () => {
  const capture = useCallback((event: string, properties?: Record<string, any>) => {
    try {
      posthog.capture(event, properties)
    } catch (error) {
      console.warn('PostHog capture failed:', error)
    }
  }, [])

  const identify = useCallback((distinctId: string, properties?: Record<string, any>) => {
    try {
      posthog.identify(distinctId, properties)
    } catch (error) {
      console.warn('PostHog identify failed:', error)
    }
  }, [])

  const setUserProperties = useCallback((properties: Record<string, any>) => {
    try {
      posthog.set(properties)
    } catch (error) {
      console.warn('PostHog set failed:', error)
    }
  }, [])

  const isFeatureEnabled = useCallback((flag: FEATURE_FLAGS): boolean => {
    try {
      return posthog.isFeatureEnabled(flag)
    } catch (error) {
      console.warn('PostHog feature flag check failed:', error)
      return false
    }
  }, [])

  const getFeatureFlag = useCallback((flag: FEATURE_FLAGS): any => {
    try {
      return posthog.getFeatureFlag(flag)
    } catch (error) {
      console.warn('PostHog feature flag get failed:', error)
      return null
    }
  }, [])

  // Predefined event tracking functions
  const trackProjectCreated = useCallback((projectId: string, projectName: string, teamId?: string) => {
    capture(ANALYTICS_EVENTS.PROJECT_CREATED, {
      project_id: projectId,
      project_name: projectName,
      team_id: teamId,
    })
  }, [capture])

  const trackProjectSaved = useCallback((projectId: string, projectName: string, totalCost: number, recommendedPrice: number) => {
    capture(ANALYTICS_EVENTS.PROJECT_SAVED, {
      project_id: projectId,
      project_name: projectName,
      total_cost: totalCost,
      recommended_price: recommendedPrice,
    })
  }, [capture])

  const trackCalculatorUsed = useCallback((totalCost: number, totalHours: number, piecesCount: number) => {
    capture(ANALYTICS_EVENTS.CALCULATOR_USED, {
      total_cost: totalCost,
      total_hours: totalHours,
      pieces_count: piecesCount,
    })
  }, [capture])

  const trackSaleCreated = useCallback((saleId: string, totalAmount: number, itemsCount: number, clientId?: string) => {
    capture(ANALYTICS_EVENTS.SALE_CREATED, {
      sale_id: saleId,
      total_amount: totalAmount,
      items_count: itemsCount,
      client_id: clientId,
    })
  }, [capture])

  const trackClientCreated = useCallback((clientId: string, clientName: string) => {
    capture(ANALYTICS_EVENTS.CLIENT_CREATED, {
      client_id: clientId,
      client_name: clientName,
    })
  }, [capture])

  const trackTeamCreated = useCallback((teamId: string, teamName: string) => {
    capture(ANALYTICS_EVENTS.TEAM_CREATED, {
      team_id: teamId,
      team_name: teamName,
    })
  }, [capture])

  const trackNavigation = useCallback((page: string) => {
    capture(`page_accessed`, {
      page,
    })
  }, [capture])

  const trackFeatureUsage = useCallback((feature: string, properties?: Record<string, any>) => {
    capture(ANALYTICS_EVENTS.FEATURE_USED, {
      feature,
      ...properties,
    })
  }, [capture])

  return {
    capture,
    identify,
    setUserProperties,
    isFeatureEnabled,
    getFeatureFlag,
    trackProjectCreated,
    trackProjectSaved,
    trackCalculatorUsed,
    trackSaleCreated,
    trackClientCreated,
    trackTeamCreated,
    trackNavigation,
    trackFeatureUsage,
  }
} 