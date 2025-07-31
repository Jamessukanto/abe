import { createTLSchema } from '@annotator/tlschema'
import { openDB } from 'idb'
import { hardReset } from './hardReset'
import { getAllIndexDbNames, LocalIndexedDb } from './LocalIndexedDb'

const schema = createTLSchema({ shapes: {}, bindings: {} })
describe('LocalIndexedDb', () => {
	beforeEach(() => {
		jest.useRealTimers()
	})
	afterEach(async () => {
		await hardReset({ shouldReload: false })
	})
	describe('#storeSnapshot', () => {
		it("creates documents if they don't exist", async () => {
			const db = new LocalIndexedDb('test-0')
			await db.storeSnapshot({
				schema,
				snapshot: {},
			})

			expect(getAllIndexDbNames()).toEqual(['ANNOTATOR_DOCUMENT_v2test-0'])

			const db2 = new LocalIndexedDb('test-1')
			await db2.storeSnapshot({
				schema,
				snapshot: {},
			})

			expect(getAllIndexDbNames()).toEqual(['ANNOTATOR_DOCUMENT_v2test-0', 'ANNOTATOR_DOCUMENT_v2test-1'])

			await db2.storeSnapshot({
				schema,
				snapshot: {},
			})

			expect(getAllIndexDbNames()).toEqual(['ANNOTATOR_DOCUMENT_v2test-0', 'ANNOTATOR_DOCUMENT_v2test-1'])

			await db2.close()
		})

		it('allows reading back the snapshot', async () => {
			const db = new LocalIndexedDb('test-0')
			await db.storeSnapshot({
				schema,
				snapshot: {
					'shape:1': {
						id: 'shape:1',
						type: 'rectangle',
					},
					'page:1': {
						id: 'page:1',
						name: 'steve',
					},
				},
			})

			expect(getAllIndexDbNames()).toEqual(['ANNOTATOR_DOCUMENT_v2test-0'])

			const records = (await db.load())?.records
			expect(records).toEqual([
				{ id: 'page:1', name: 'steve' },
				{ id: 'shape:1', type: 'rectangle' },
			])
		})

		it('allows storing a session under a particular ID and reading it back', async () => {
			const db = new LocalIndexedDb('test-0')
			const snapshot = {
				'shape:1': {
					id: 'shape:1',
					type: 'rectangle',
				},
			}

			await db.storeSnapshot({
				sessionId: 'session-0',
				schema,
				snapshot,
				sessionStateSnapshot: {
					foo: 'bar',
				} as any,
			})

			expect((await db.load({ sessionId: 'session-0' }))?.sessionStateSnapshot).toEqual({
				foo: 'bar',
			})

			await db.storeSnapshot({
				sessionId: 'session-1',
				schema,
				snapshot,
				sessionStateSnapshot: {
					hello: 'world',
				} as any,
			})

			expect((await db.load({ sessionId: 'session-0' }))?.sessionStateSnapshot).toEqual({
				foo: 'bar',
			})

			expect((await db.load({ sessionId: 'session-1' }))?.sessionStateSnapshot).toEqual({
				hello: 'world',
			})
		})
	})

	describe('#storeChanges', () => {
		it('allows merging changes into an existing store', async () => {
			const db = new LocalIndexedDb('test-0')
			await db.storeSnapshot({
				schema,
				snapshot: {
					'shape:1': {
						id: 'shape:1',
						version: 0,
					},
					'page:1': {
						id: 'page:1',
						version: 0,
					},
					'asset:1': {
						id: 'asset:1',
						version: 0,
					},
				},
			})

			await db.storeChanges({
				schema,
				changes: {
					added: {
						'asset:2': {
							id: 'asset:2',
							version: 0,
						},
					},
					updated: {
						'page:1': [
							{
								id: 'page:1',
								version: 0,
							},
							{
								id: 'page:1',
								version: 1,
							},
						],
					},
					removed: {
						'shape:1': {
							id: 'shape:1',
							version: 0,
						},
					},
				},
			})

			expect((await db.load())?.records).toEqual([
				{
					id: 'asset:1',
					version: 0,
				},
				{
					id: 'asset:2',
					version: 0,
				},
				{
					id: 'page:1',
					version: 1,
				},
			])
		})
	})

})
