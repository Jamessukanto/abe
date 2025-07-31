import { clearLocalStorage, clearSessionStorage } from '@annotator/utils'
import { deleteDB } from 'idb'
import { LocalIndexedDb, getAllIndexDbNames } from './LocalIndexedDb'

/**
 * Clear the database of all data associated with annotator.
 *
 * @public */
export async function hardReset({ shouldReload = true } = {}) {
	clearSessionStorage()

	for (const instance of LocalIndexedDb.connectedInstances) {
		await instance.close()
	}
	await Promise.all(getAllIndexDbNames().map((db) => deleteDB(db)))

	clearLocalStorage()
	if (shouldReload) {
		window.location.reload()
	}
}

if (typeof window !== 'undefined') {
	if (process.env.NODE_ENV === 'development') {
		;(window as any).hardReset = hardReset
	}
	// window.__ANNOTATOR__hardReset is used to inject the logic into the annotator library
	;(window as any).__ANNOTATOR__hardReset = hardReset
}
