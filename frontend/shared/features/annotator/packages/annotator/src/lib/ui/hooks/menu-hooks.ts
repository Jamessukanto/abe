import {
	Editor,
	AnnotatorShape,
	TLGroupShape,
	TLImageShape,
	TLLineShape,
	TLTextShape,
	useEditor,
	useValue,
} from '@annotator/editor'

function shapesWithUnboundArrows(editor: Editor) {
	const selectedShapeIds = editor.getSelectedShapeIds()
	const selectedShapes = selectedShapeIds.map((id) => {
		return editor.getShape(id)
	})

	return selectedShapes.filter((shape) => {
		if (!shape) return false
		return true
	})
}

/** @internal */
export const useThreeStackableItems = () => {
	const editor = useEditor()
	return useValue('threeStackableItems', () => shapesWithUnboundArrows(editor).length > 2, [editor])
}

/** @internal */
export const useIsInSelectState = () => {
	const editor = useEditor()
	return useValue('isInSelectState', () => editor.isIn('select'), [editor])
}

/** @internal */
export const useAllowGroup = () => {
	const editor = useEditor()
	return useValue(
		'allow group',
		() => {
			const selectedShapes = editor.getSelectedShapes()

			if (selectedShapes.length < 2) return false

			return true
		},
		[editor]
	)
}

/** @internal */
export const useAllowUngroup = () => {
	const editor = useEditor()
	return useValue(
		'allowUngroup',
		() => editor.getSelectedShapeIds().some((id) => editor.getShape(id)?.type === 'group'),
		[editor]
	)
}

export const showMenuPaste =
	typeof window !== 'undefined' &&
	'navigator' in window &&
	Boolean(navigator.clipboard) &&
	Boolean(navigator.clipboard.read)

/**
 * Returns true if the number of LOCKED OR UNLOCKED selected shapes is at least min or at most max.
 */
export function useAnySelectedShapesCount(min?: number, max?: number) {
	const editor = useEditor()
	return useValue(
		'selectedShapes',
		() => {
			const len = editor.getSelectedShapes().length
			if (min === undefined) {
				if (max === undefined) {
					// just length
					return len
				} else {
					// max but no min
					return len <= max
				}
			} else {
				if (max === undefined) {
					// min but no max
					return len >= min
				} else {
					// max and min
					return len >= min && len <= max
				}
			}
		},
		[editor, min, max]
	)
}

/**
 * Returns true if the number of UNLOCKED selected shapes is at least min or at most max.
 */
export function useUnlockedSelectedShapesCount(min?: number, max?: number) {
	const editor = useEditor()
	return useValue(
		'selectedShapes',
		() => {
			const len = editor
				.getSelectedShapes()
				.filter((s) => !editor.isShapeOrAncestorLocked(s)).length
			if (min === undefined) {
				if (max === undefined) {
					// just length
					return len
				} else {
					// max but no min
					return len <= max
				}
			} else {
				if (max === undefined) {
					// min but no max
					return len >= min
				} else {
					// max and min
					return len >= min && len <= max
				}
			}
		},
		[editor]
	)
}

export function useShowAutoSizeToggle() {
	const editor = useEditor()
	return useValue(
		'showAutoSizeToggle',
		() => {
			const selectedShapes = editor.getSelectedShapes()
			return (
				selectedShapes.length === 1 &&
				editor.isShapeOfType<TLTextShape>(selectedShapes[0], 'text') &&
				selectedShapes[0].props.autoSize === false
			)
		},
		[editor]
	)
}

export function useHasLinkShapeSelected() {
	const editor = useEditor()
	return useValue(
		'hasLinkShapeSelected',
		() => {
			const onlySelectedShape = editor.getOnlySelectedShape()
			return !!(
				onlySelectedShape &&
				'url' in onlySelectedShape.props &&
				!onlySelectedShape.isLocked
			)
		},
		[editor]
	)
}

export function useOnlyFlippableShape() {
	const editor = useEditor()
	return useValue(
		'onlyFlippableShape',
		() => {
			const shape = editor.getOnlySelectedShape()
			return (
				shape &&
				(editor.isShapeOfType<TLGroupShape>(shape, 'group') ||
					editor.isShapeOfType<TLImageShape>(shape, 'image') ||
					editor.isShapeOfType<TLLineShape>(shape, 'line') ||
					editor.isShapeOfType<AnnotatorShape>(shape, 'draw'))
			)
		},
		[editor]
	)
}

/** @public */
export function useCanRedo() {
	const editor = useEditor()
	return useValue('useCanRedo', () => editor.getCanRedo(), [editor])
}

/** @public */
export function useCanUndo() {
	const editor = useEditor()
	return useValue('useCanUndo', () => editor.getCanUndo(), [editor])
}
