'use client'

import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux'
import type { ClientRootState, ClientAppDispatch } from './clientStore'

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<ClientAppDispatch>()
export const useAppSelector: TypedUseSelectorHook<ClientRootState> = useSelector 