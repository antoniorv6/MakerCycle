"use client"

import posthog from "posthog-js"
import { PostHogProvider as PHProvider } from "posthog-js/react"
import { useEffect, useRef, Suspense } from "react"
import { usePathname, useSearchParams } from "next/navigation"

function PostHogTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const previousPathname = useRef<string | null>(null)

  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: "/ingest",
      ui_host: "https://eu.posthog.com",
      defaults: '2025-05-24',
      capture_exceptions: true, // This enables capturing exceptions using Error Tracking, set to false if you don't want this
      debug: process.env.NODE_ENV === "development",
      autocapture: true, // Automatically capture clicks, form submissions, and page views
      capture_pageview: false, // We'll handle page views manually
      capture_pageleave: true, // Enable page leave tracking
      disable_session_recording: false, // Enable session recordings
      session_recording: {
        maskAllInputs: false, // Don't mask all inputs by default
      },
      // Enable automatic page leave tracking
      loaded: (posthog) => {
        // This ensures page leave events are captured
        if (typeof window !== 'undefined') {
          window.addEventListener('beforeunload', () => {
            posthog.capture('$pageleave')
          })
        }
      }
    })
  }, [])

  // Track page views and page leaves
  useEffect(() => {
    if (pathname) {
      const url = searchParams?.size 
        ? `${pathname}?${searchParams.toString()}`
        : pathname
      
      // Track page leave for the previous page
      if (previousPathname.current && previousPathname.current !== pathname) {
        posthog.capture('$pageleave', {
          $current_url: previousPathname.current,
          next_url: url,
        })
      }
      
      // Track page view for the current page
      posthog.capture('$pageview', {
        $current_url: url,
        pathname,
        search_params: searchParams?.toString() || null,
      })
      
      // Update previous pathname
      previousPathname.current = pathname
    }
  }, [pathname, searchParams])

  // Track page leave when component unmounts (user leaves the app)
  useEffect(() => {
    return () => {
      if (previousPathname.current) {
        posthog.capture('$pageleave', {
          $current_url: previousPathname.current,
          reason: 'component_unmount',
        })
      }
    }
  }, [])

  return null
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogTracker />
      </Suspense>
      {children}
    </PHProvider>
  )
}