import { getFromLocalStorage, setInLocalStorage } from '@annotator/editor'
import React from 'react'

/** @public */
export function useLocalStorageState<T = any>(key: string, defaultValue: T) {
	const [state, setState] = React.useState(defaultValue)

	React.useLayoutEffect(() => {
		const value = getFromLocalStorage(key)
		if (value) {
			try {
				setState(JSON.parse(value))
			} catch {
				console.error(`Could not restore value ${key} from local storage.`)
			}
		}
	}, [key])

	const updateValue = React.useCallback(
		(setter: T | ((value: T) => T)) => {
			setState((s) => {
				const value = typeof setter === 'function' ? (setter as any)(s) : setter
				setInLocalStorage(key, JSON.stringify(value))
				return value
			})
		},
		[key]
	)

	return [state, updateValue] as const
}
