'use client'

import React from 'react'
import { Provider } from 'react-redux'
import { clientStore } from '../../../../store/clientStore'

interface AnnotationProviderProps {
  children: React.ReactNode
}

/**
 * Provider component that wraps annotation features with Redux store
 * This ensures all annotation components have access to the centralized state
 */
export function AnnotationProvider({ children }: AnnotationProviderProps) {
  return (
    <Provider store={clientStore}>
      {children}
    </Provider>
  )
} 