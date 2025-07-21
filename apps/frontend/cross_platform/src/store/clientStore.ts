'use client'

import { configureStore } from '@reduxjs/toolkit'
import annotationReducer from './annotationSlice'

// Create store function to ensure it's created on the client side
const createClientStore = () => {
  return configureStore({
    reducer: {
      annotation: annotationReducer
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          // Ignore these action types for serialization check
          ignoredActions: ['annotation/clearDirtyFlags'],
          // Ignore these field paths in all actions
          ignoredActionsPaths: ['payload.dirtyShapeIds', 'payload.dirtyGroupIds'],
          // Ignore these paths in the state
          ignoredPaths: ['annotation.dirtyShapeIds', 'annotation.dirtyGroupIds'],
        },
      }),
    devTools: false // Disable dev tools for client store
  })
}

// Create store instance
export const clientStore = createClientStore()

// Infer the `RootState` and `AppDispatch` types from the store itself
export type ClientRootState = ReturnType<typeof clientStore.getState>
export type ClientAppDispatch = typeof clientStore.dispatch 