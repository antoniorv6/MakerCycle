'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Capacitor } from '@capacitor/core'
import { logger } from '@/lib/logger'

interface CapacitorContextType {
  isNative: boolean
  platform: 'ios' | 'android' | 'web'
  isReady: boolean
  keyboardVisible: boolean
  keyboardHeight: number
}

const CapacitorContext = createContext<CapacitorContextType>({
  isNative: false,
  platform: 'web',
  isReady: false,
  keyboardVisible: false,
  keyboardHeight: 0,
})

export function useCapacitorContext() {
  return useContext(CapacitorContext)
}

interface CapacitorProviderProps {
  children: ReactNode
}

export function CapacitorProvider({ children }: CapacitorProviderProps) {
  const [isNative, setIsNative] = useState(false)
  const [platform, setPlatform] = useState<'ios' | 'android' | 'web'>('web')
  const [isReady, setIsReady] = useState(false)
  const [keyboardVisible, setKeyboardVisible] = useState(false)
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  useEffect(() => {
    const initCapacitor = async () => {
      const native = Capacitor.isNativePlatform()
      setIsNative(native)
      setPlatform(Capacitor.getPlatform() as 'ios' | 'android' | 'web')

      if (native) {
        try {
          // Import plugins dynamically
          const [{ StatusBar, Style }, { Keyboard }, { SplashScreen }, { App }] = await Promise.all([
            import('@capacitor/status-bar'),
            import('@capacitor/keyboard'),
            import('@capacitor/splash-screen'),
            import('@capacitor/app'),
          ])

          // Configure Status Bar
          await StatusBar.setStyle({ style: Style.Dark })
          if (Capacitor.getPlatform() === 'android') {
            await StatusBar.setBackgroundColor({ color: '#1e293b' })
          }

          // Hide splash screen
          await SplashScreen.hide()

          // Listen to keyboard events
          Keyboard.addListener('keyboardWillShow', (info) => {
            setKeyboardVisible(true)
            setKeyboardHeight(info.keyboardHeight)
            document.body.classList.add('keyboard-open')
          })

          Keyboard.addListener('keyboardWillHide', () => {
            setKeyboardVisible(false)
            setKeyboardHeight(0)
            document.body.classList.remove('keyboard-open')
          })

          // Handle back button on Android
          App.addListener('backButton', ({ canGoBack }) => {
            if (!canGoBack) {
              App.exitApp()
            } else {
              window.history.back()
            }
          })

        } catch (error) {
          logger.error('Capacitor plugin initialization error:', error)
        }
      }

      setIsReady(true)
    }

    initCapacitor()

    return () => {
      // Cleanup listeners on unmount
      if (Capacitor.isNativePlatform()) {
        const cleanup = async () => {
          try {
            const [{ Keyboard }, { App }] = await Promise.all([
              import('@capacitor/keyboard'),
              import('@capacitor/app'),
            ])
            Keyboard.removeAllListeners()
            App.removeAllListeners()
          } catch (error) {
            logger.error('Cleanup error:', error)
          }
        }
        cleanup()
      }
    }
  }, [])

  return (
    <CapacitorContext.Provider value={{ isNative, platform, isReady, keyboardVisible, keyboardHeight }}>
      {children}
    </CapacitorContext.Provider>
  )
}
