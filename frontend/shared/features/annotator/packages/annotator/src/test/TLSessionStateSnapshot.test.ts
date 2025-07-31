import {
	TLSessionStateSnapshot,
	createSessionStateSnapshotSignal,
	loadSessionStateSnapshotIntoStore,
	react,
} from '@annotator/editor'
import { TestEditor } from './TestEditor'

let editor: TestEditor

beforeEach(() => {
	editor = new TestEditor()
})

describe('createSessionStateSnapshotSignal', () => {
	it('creates a signal', () => {
		const $snapshot = createSessionStateSnapshotSignal(editor.store)

		expect($snapshot.get()).toMatchObject({
			exportBackground: true,
			isDebugMode: false,
			isFocusMode: false,
			isGridMode: false,
			isToolLocked: false,
			pageStates: [
				{
					camera: {
						x: 0,
						y: 0,
						z: 1,
					},
					focusedGroupId: null,
					selectedShapeIds: [],
				},
			],
			version: 0,
		})
	})

	it('creates a signal that can be reacted to', () => {
		const $snapshot = createSessionStateSnapshotSignal(editor.store)

		let isGridMode = false
		let numPages = 0

		react('', () => {
			isGridMode = $snapshot.get()?.isGridMode ?? false
			numPages = $snapshot.get()?.pageStates?.length ?? 0
		})

		expect(isGridMode).toBe(false)
		expect(numPages).toBe(1)

		editor.updateInstanceState({ isGridMode: true })

		expect(isGridMode).toBe(true)
		expect(numPages).toBe(1)

		editor.createPage({ name: 'new page' })

		expect(isGridMode).toBe(true)
		expect(editor.getPages().length).toBe(2)
		expect(numPages).toBe(2)
	})
})

describe(loadSessionStateSnapshotIntoStore, () => {
	it('loads a snapshot into the store', () => {
		let snapshot = createSessionStateSnapshotSignal(editor.store).get()
		if (!snapshot) throw new Error('snapshot is null')

		expect(editor.getInstanceState().isGridMode).toBe(false)
		expect(editor.getCamera().x).toBe(0)
		expect(editor.getCamera().y).toBe(0)

		snapshot = JSON.parse(JSON.stringify(snapshot)) as TLSessionStateSnapshot

		snapshot.pageStates![0].camera!.x = 1
		snapshot.pageStates![0].camera!.y = 2

		loadSessionStateSnapshotIntoStore(editor.store, snapshot)

		expect(editor.getCamera().x).toBe(1)
		expect(editor.getCamera().y).toBe(2)
	})

	it('preserves existing UI flags by default', () => {
		expect(editor.getInstanceState()).toMatchObject({
			isGridMode: false,
			isFocusMode: false,
			isDebugMode: false,
			isToolLocked: false,
		})
		const snapshot = createSessionStateSnapshotSignal(editor.store).get()
		editor.updateInstanceState({
			isGridMode: true,
			isFocusMode: true,
			isDebugMode: true,
			isToolLocked: true,
		})
		loadSessionStateSnapshotIntoStore(editor.store, snapshot!)
		expect(editor.getInstanceState()).toMatchObject({
			isGridMode: true,
			isFocusMode: true,
			isDebugMode: true,
			isToolLocked: true,
		})
	})

	it('overrides existing UI flags if you say so', () => {
		expect(editor.getInstanceState()).toMatchObject({
			isGridMode: false,
			isFocusMode: false,
			isDebugMode: false,
			isToolLocked: false,
		})
		const snapshot = createSessionStateSnapshotSignal(editor.store).get()
		editor.updateInstanceState({
			isGridMode: true,
			isFocusMode: true,
			isDebugMode: true,
			isToolLocked: true,
		})
		loadSessionStateSnapshotIntoStore(editor.store, snapshot!, { forceOverwrite: true })
		expect(editor.getInstanceState()).toMatchObject({
			isGridMode: false,
			isFocusMode: false,
			isDebugMode: false,
			isToolLocked: false,
		})
	})
})


