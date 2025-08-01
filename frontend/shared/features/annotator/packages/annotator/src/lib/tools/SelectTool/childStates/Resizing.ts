import {
	Box,
	HALF_PI,
	Mat,
	PI,
	PI2,
	SelectionCorner,
	SelectionEdge,
	StateNode,
	TLFrameShape,
	TLPointerEventInfo,
	TLShape,
	TLShapeId,
	TLShapePartial,
	TLTextShape,
	TLTickEventInfo,
	Vec,
	VecLike,
	areAnglesCompatible,
	compact,
	isAccelKey,
	kickoutOccludedShapes,
} from '@annotator/editor'

export type ResizingInfo = TLPointerEventInfo & {
	target: 'selection'
	handle: SelectionEdge | SelectionCorner
	isCreating?: boolean
	creatingMarkId?: string
	onCreate?(shape: TLShape | null): void
	creationCursorOffset?: VecLike
	onInteractionEnd?: string
}

export class Resizing extends StateNode {
	static override id = 'resizing'

	info = {} as ResizingInfo

	markId = ''

	// A switch to detect when the user is holding ctrl
	private didHoldCommand = false

	// we transition into the resizing state from the geo pointing state, which starts with a shape of size w: 1, h: 1,
	// so if the user drags x: +50, y: +50 after mouseDown, the shape will be w: 51, h: 51, which is too many pixels, alas
	// so we allow passing a further offset into this state to negate such issues
	creationCursorOffset = { x: 0, y: 0 } as VecLike

	private snapshot = {} as any as Snapshot

	override onEnter(info: ResizingInfo) {
		const { isCreating = false, creatingMarkId, creationCursorOffset = { x: 0, y: 0 } } = info

		this.info = info
		this.didHoldCommand = false

		this.parent.setCurrentToolIdMask(info.onInteractionEnd)
		this.creationCursorOffset = creationCursorOffset

		try {
			// On rare and mysterious occasions, the user can enter the resizing state with no shapes selected
			this.snapshot = this._createSnapshot()
		} catch (e) {
			console.error(e)
			this.cancel()
			return
		}

		this.markId = ''

		if (isCreating) {
			if (creatingMarkId) {
				this.markId = creatingMarkId
			} 
		} else {
			this.markId = this.editor.markHistoryStoppingPoint('starting resizing')
		}

		if (isCreating) {
			this.editor.setCursor({ type: 'cross', rotation: 0 })
		}

		this.handleResizeStart()
		this.updateShapes()
	}

	override onTick({ elapsed }: TLTickEventInfo) {
		const { editor } = this
		editor.edgeScrollManager.updateEdgeScrolling(elapsed)
	}

	override onPointerMove() {
		this.updateShapes()
	}

	override onKeyDown() {
		this.updateShapes()
	}
	override onKeyUp() {
		this.updateShapes()
	}

	override onPointerUp() {
		this.complete()
	}

	override onComplete() {
		this.complete()
	}

	override onCancel() {
		this.cancel()
	}

	private cancel() {
		// Call onResizeCancel callback before resetting
		const { shapeSnapshots } = this.snapshot

		shapeSnapshots.forEach(({ shape }) => {
			const current = this.editor.getShape(shape.id)
			if (current) {
				const util = this.editor.getShapeUtil(shape)
				util.onResizeCancel?.(shape, current)
			}
		})

		this.editor.bailToMark(this.markId)

		if (this.info.onInteractionEnd) {
			this.editor.setCurrentTool(this.info.onInteractionEnd, {})
		} else {
			this.parent.transition('idle')
		}
	}

	private complete() {
		kickoutOccludedShapes(this.editor, this.snapshot.selectedShapeIds)

		this.handleResizeEnd()

		if (this.info.isCreating && this.info.onCreate) {
			this.info.onCreate?.(this.editor.getOnlySelectedShape())
			return
		}

		if (this.editor.getInstanceState().isToolLocked && this.info.onInteractionEnd) {
			this.editor.setCurrentTool(this.info.onInteractionEnd, {})
			return
		}

		this.parent.transition('idle')
	}

	private handleResizeStart() {
		const { shapeSnapshots } = this.snapshot

		const changes: TLShapePartial[] = []

		shapeSnapshots.forEach(({ shape }) => {
			const util = this.editor.getShapeUtil(shape)
			const change = util.onResizeStart?.(shape)
			if (change) {
				changes.push(change)
			}
		})

		if (changes.length > 0) {
			this.editor.updateShapes(changes)
		}
	}

	private handleResizeEnd() {
		const { shapeSnapshots } = this.snapshot

		const changes: TLShapePartial[] = []

		shapeSnapshots.forEach(({ shape }) => {
			const current = this.editor.getShape(shape.id)!
			const util = this.editor.getShapeUtil(shape)
			const change = util.onResizeEnd?.(shape, current)
			if (change) {
				changes.push(change)
			}
		})

		if (changes.length > 0) {
			this.editor.updateShapes(changes)
		}
	}

	private updateShapes() {
		const { altKey, shiftKey } = this.editor.inputs
		const {
			frames,
			shapeSnapshots,
			selectionBounds,
			cursorHandleOffset,
			selectedShapeIds,
			selectionRotation,
			canShapesDeform,
		} = this.snapshot

		let isAspectRatioLocked = shiftKey || !canShapesDeform

		if (shapeSnapshots.size === 1) {
			const onlySnapshot = [...shapeSnapshots.values()][0]!
			if (this.editor.isShapeOfType<TLTextShape>(onlySnapshot.shape, 'text')) {
				isAspectRatioLocked = !(this.info.handle === 'left' || this.info.handle === 'right')
			}
		}

		// first negate the 'cursor handle offset'
		// we need to do this because we do grid snapping based on the page point of the handle
		// rather than the page point of the cursor, so it's easier to pretend that the cursor
		// is really where the handle actually is
		//
		// *** Massively zoomed-in diagram of the initial mouseDown ***
		//
		//
		//                         │
		//                         │
		//                         │
		//                         │
		//                         │
		//                         │
		//                         │
		//                         │corner handle
		//                     ┌───┴───┐
		//   selection         │       │
		//  ───────────────────┤   x◄──┼──── drag handle point   ▲
		//                     │       │                         │
		//                     └───────┘                         ├─ cursorHandleOffset.y
		//                                                       │
		//        originPagePoint───────►x─┐                     ▼
		//                               │ └─┐
		//                               │   └─┐
		//                               │     │ mouse (sorry)
		//                               └──┐ ┌┘
		//                                  │ │
		//                                  └─┘
		//                         ◄──┬──►
		//                            │
		//                   cursorHandleOffset.x

		const isHoldingAccel = isAccelKey(this.editor.inputs)

		const currentPagePoint = this.editor.inputs.currentPagePoint
			.clone()
			.sub(cursorHandleOffset)
			.sub(this.creationCursorOffset)

		const originPagePoint = this.editor.inputs.originPagePoint.clone().sub(cursorHandleOffset)

		if (this.editor.getInstanceState().isGridMode && !isHoldingAccel) {
			const { gridSize } = this.editor.getDocumentSettings()
			currentPagePoint.snapToGrid(gridSize)
		}

		const dragHandle = this.info.handle as SelectionCorner | SelectionEdge
		const scaleOriginHandle = rotateSelectionHandle(dragHandle, Math.PI)

		this.editor.snaps.clearIndicators()

		const shouldSnap = this.editor.user.getIsSnapMode() ? !isHoldingAccel : isHoldingAccel

		if (shouldSnap && selectionRotation % HALF_PI === 0) {
			const { nudge } = this.editor.snaps.shapeBounds.snapResizeShapes({
				dragDelta: Vec.Sub(currentPagePoint, originPagePoint),
				initialSelectionPageBounds: this.snapshot.initialSelectionPageBounds,
				handle: rotateSelectionHandle(dragHandle, selectionRotation),
				isAspectRatioLocked,
				isResizingFromCenter: altKey,
			})

			currentPagePoint.add(nudge)
		}

		// get the page point of the selection handle opposite to the drag handle
		// or the center of the selection box if altKey is pressed
		const scaleOriginPage = Vec.RotWith(
			altKey ? selectionBounds.center : selectionBounds.getHandlePoint(scaleOriginHandle),
			selectionBounds.point,
			selectionRotation
		)

		// calculate the scale by measuring the current distance between the drag handle and the scale origin
		// and dividing by the original distance between the drag handle and the scale origin

		// bug: for edges, the page point doesn't matter, the

		const distanceFromScaleOriginNow = Vec.Sub(currentPagePoint, scaleOriginPage).rot(
			-selectionRotation
		)

		const distanceFromScaleOriginAtStart = Vec.Sub(originPagePoint, scaleOriginPage).rot(
			-selectionRotation
		)

		const scale = Vec.DivV(distanceFromScaleOriginNow, distanceFromScaleOriginAtStart)

		if (!Number.isFinite(scale.x)) scale.x = 1
		if (!Number.isFinite(scale.y)) scale.y = 1

		const isXLocked = dragHandle === 'top' || dragHandle === 'bottom'
		const isYLocked = dragHandle === 'left' || dragHandle === 'right'

		// lock an axis if required
		if (isAspectRatioLocked) {
			if (isYLocked) {
				// holding shift and dragging either the left or the right edge
				scale.y = Math.abs(scale.x)
			} else if (isXLocked) {
				// holding shift and dragging either the top or the bottom edge
				scale.x = Math.abs(scale.y)
			} else if (Math.abs(scale.x) > Math.abs(scale.y)) {
				// holding shift and the drag has moved further in the x dimension
				scale.y = Math.abs(scale.x) * (scale.y < 0 ? -1 : 1)
			} else {
				// holding shift and the drag has moved further in the y dimension
				scale.x = Math.abs(scale.y) * (scale.x < 0 ? -1 : 1)
			}
		} else {
			// not holding shift, but still need to lock axes if dragging an edge
			if (isXLocked) {
				scale.x = 1
			}
			if (isYLocked) {
				scale.y = 1
			}
		}

		if (!this.info.isCreating) {
			this.updateCursor({
				dragHandle,
				isFlippedX: scale.x < 0,
				isFlippedY: scale.y < 0,
				rotation: selectionRotation,
			})
		}

		for (const id of shapeSnapshots.keys()) {
			const snapshot = shapeSnapshots.get(id)!

			this.editor.resizeShape(id, scale, {
				initialShape: snapshot.shape,
				initialBounds: snapshot.bounds,
				initialPageTransform: snapshot.pageTransform,
				dragHandle,
				mode:
					selectedShapeIds.length === 1 && id === selectedShapeIds[0]
						? 'resize_bounds'
						: 'scale_shape',
				scaleOrigin: scaleOriginPage,
				isAspectRatioLocked,
				scaleAxisRotation: selectionRotation,
				skipStartAndEndCallbacks: true,
			})
		}

		// If there's only one shape snapshot and it's a frame and the user is holding ctrl,
		// then we preserve the position of the frame's children, almost like the user is cropping
		// the frame rather than resizing it.
		if (isHoldingAccel) {
			this.didHoldCommand = true

			for (const { id, children } of frames) {
				if (!children.length) continue
				const initial = shapeSnapshots.get(id)!.shape
				const current = this.editor.getShape(id)!
				if (!(initial && current)) continue

				const dx = current.x - initial.x
				const dy = current.y - initial.y

				const delta = new Vec(dx, dy).rot(-initial.rotation)

				if (delta.x !== 0 || delta.y !== 0) {
					for (const child of children) {
						this.editor.updateShape({
							id: child.id,
							type: child.type,
							x: child.x - delta.x,
							y: child.y - delta.y,
						})
					}
				}
			}
		} else if (this.didHoldCommand) {
			// If we're no longer holding the command key...
			this.didHoldCommand = false

			for (const { children } of frames) {
				if (!children.length) continue
				for (const child of children) {
					this.editor.updateShape({
						id: child.id,
						type: child.type,
						x: child.x,
						y: child.y,
					})
				}
			}
		}
	}

	// ---

	private updateCursor({
		dragHandle,
		isFlippedX,
		isFlippedY,
		rotation,
	}: {
		dragHandle: SelectionCorner | SelectionEdge
		isFlippedX: boolean
		isFlippedY: boolean
		rotation: number
	}) {
		const nextCursor = { ...this.editor.getInstanceState().cursor }

		switch (dragHandle) {
			case 'top_left':
			case 'bottom_right': {
				nextCursor.type = 'nwse-resize'
				if (isFlippedX !== isFlippedY) {
					nextCursor.type = 'nesw-resize'
				}
				break
			}
			case 'top_right':
			case 'bottom_left': {
				nextCursor.type = 'nesw-resize'
				if (isFlippedX !== isFlippedY) {
					nextCursor.type = 'nwse-resize'
				}
				break
			}
		}

		nextCursor.rotation = rotation

		this.editor.setCursor(nextCursor)
	}

	override onExit() {
		this.parent.setCurrentToolIdMask(undefined)
		this.editor.setCursor({ type: 'default', rotation: 0 })
		this.editor.snaps.clearIndicators()
	}

	private _createSnapshot() {
		const { editor } = this
		const selectedShapeIds = editor.getSelectedShapeIds()
		const selectionRotation = editor.getSelectionRotation()
		const {
			inputs: { originPagePoint },
		} = editor

		const selectionBounds = editor.getSelectionRotatedPageBounds()
		if (!selectionBounds) throw Error('Resizing but nothing is selected')

		const dragHandlePoint = Vec.RotWith(
			selectionBounds.getHandlePoint(this.info.handle!),
			selectionBounds.point,
			selectionRotation
		)

		const cursorHandleOffset = Vec.Sub(originPagePoint, dragHandlePoint)

		const shapeSnapshots = new Map<
			TLShapeId,
			{
				shape: TLShape
				bounds: Box
				pageTransform: Mat
				pageRotation: number
				isAspectRatioLocked: boolean
			}
		>()

		const frames: { id: TLShapeId; children: TLShape[] }[] = []

		const populateResizingShapes = (shapeId: TLShapeId): false | undefined => {
			const shape = editor.getShape(shapeId)
			if (!shape) return false

			const util = editor.getShapeUtil(shape)

			// If the shape can resize, add it to the resizing shapes snapshots
			if (util.canResize(shape)) {
				const pageTransform = editor.getShapePageTransform(shape)!
				shapeSnapshots.set(shape.id, {
					shape,
					bounds: editor.getShapeGeometry(shape).bounds,
					pageTransform,
					pageRotation: Mat.Decompose(pageTransform).rotation,
					isAspectRatioLocked: util.isAspectRatioLocked(shape),
				})
			}

			// Special case:
			// For frames, we don't want to resize children but we DO want to get a snapshot of their children so that we can restore their
			// positions with the accel key behavior. We could break this further into APIs, for example by collecting snapshots of all
			// descendants (easy) but also flagging with behavior like "resize" or "keep absolute position" or "reposition only with accel key",
			// though I'm not sure where that would be defined; perhaps better handled with onResizeStart / onResize callbacks on the util, and
			// pass `accelKeyIsPressed` as well as `accelKeyWasPressed`?
			if (editor.isShapeOfType<TLFrameShape>(shape, 'frame')) {
				frames.push({
					id: shape.id,
					children: compact(
						editor.getSortedChildIdsForParent(shape).map((id) => editor.getShape(id))
					),
				})
			}

			// This will stop the traversal of descendants
			if (!util.canResizeChildren(shape)) return false
		}

		selectedShapeIds.forEach((shapeId) => {
			const keepDescending = populateResizingShapes(shapeId)
			if (keepDescending === false) return
			editor.visitDescendants(shapeId, populateResizingShapes)
		})

		const canShapesDeform = ![...shapeSnapshots.values()].some(
			(shape) =>
				!areAnglesCompatible(shape.pageRotation, selectionRotation) || shape.isAspectRatioLocked
		)

		return {
			shapeSnapshots,
			selectionBounds,
			cursorHandleOffset,
			selectionRotation,
			selectedShapeIds,
			canShapesDeform,
			initialSelectionPageBounds: this.editor.getSelectionPageBounds()!,
			frames,
		}
	}
}

type Snapshot = ReturnType<Resizing['_createSnapshot']>

const ORDERED_SELECTION_HANDLES: (SelectionEdge | SelectionCorner)[] = [
	'top',
	'top_right',
	'right',
	'bottom_right',
	'bottom',
	'bottom_left',
	'left',
	'top_left',
]

export function rotateSelectionHandle(handle: SelectionEdge | SelectionCorner, rotation: number) {
	// first find out how many tau we need to rotate by
	rotation = rotation % PI2
	const numSteps = Math.round(rotation / (PI / 4))

	const currentIndex = ORDERED_SELECTION_HANDLES.indexOf(handle)
	return ORDERED_SELECTION_HANDLES[(currentIndex + numSteps) % ORDERED_SELECTION_HANDLES.length]
}
