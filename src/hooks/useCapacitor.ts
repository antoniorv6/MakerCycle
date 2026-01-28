'use client'

import { useState, useEffect } from 'react'
import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'
import { Keyboard } from '@capacitor/keyboard'
import { App } from '@capacitor/app'
import { SplashScreen } from '@capacitor/splash-screen'

export function useCapacitor() {
  const [isNative, setIsNative] = useState(false)
  const [platform, setPlatform] = useState<'ios' | 'android' | 'web'>('web')
  const [isReady, setIsReady] = useState(false)
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  useEffect(() => {
    const initCapacitor = async () => {
      const native = Capacitor.isNativePlatform()
      setIsNative(native)
      setPlatform(Capacitor.getPlatform() as 'ios' | 'android' | 'web')

      if (native) {
        try {
          // Configure Status Bar
          await StatusBar.setStyle({ style: Style.Dark })
          await StatusBar.setBackgroundColor({ color: '#1e293b' })

          // Hide splash screen
          await SplashScreen.hide()

          // Listen to keyboard events
          Keyboard.addListener('keyboardWillShow', (info) => {
            setKeyboardHeight(info.keyboardHeight)
            document.body.classList.add('keyboard-open')
          })

          Keyboard.addListener('keyboardWillHide', () => {
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
          console.log('Capacitor plugin error:', error)
        }
      }

      setIsReady(true)
    }

    initCapacitor()

    return () => {
      if (Capacitor.isNativePlatform()) {
        Keyboard.removeAllListeners()
        App.removeAllListeners()
      }
    }
  }, [])

  return {
    isNative,
    platform,
    isReady,
    keyboardHeight,
    isIOS: platform === 'ios',
    isAndroid: platform === 'android',
    isWeb: platform === 'web',
  }
}

export function useHaptics() {
  const triggerHaptic = async (type: 'light' | 'medium' | 'heavy' | 'selection' = 'light') => {
    if (Capacitor.isNativePlatform()) {
      try {
        const { Haptics, ImpactStyle, NotificationType } = await import('@capacitor/haptics')
        
        switch (type) {
          case 'light':
            await Haptics.impact({ style: ImpactStyle.Light })
            break
          case 'medium':
            await Haptics.impact({ style: ImpactStyle.Medium })
            break
          case 'heavy':
            await Haptics.impact({ style: ImpactStyle.Heavy })
            break
          case 'selection':
            await Haptics.selectionStart()
            break
        }
      } catch (error) {
        console.log('Haptics not available')
      }
    }
  }

  return { triggerHaptic }
}
