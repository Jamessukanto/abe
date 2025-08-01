import {
	Mat,
	StateNode,
	TLHandle,
	TLLineShape,
	TLPointerEventInfo,
	TLShapeId,
	TLShapePartial,
	Vec,
	kickoutOccludedShapes,
	snapAngle,
	sortByIndex,
	structuredClone,
} from '@annotator/editor'

export type DraggingHandleInfo = TLPointerEventInfo & {
	shape: TLLineShape
	target: 'handle'
	onInteractionEnd?: string
	isCreating?: boolean
	creatingMarkId?: string
}

export class DraggingHandle extends StateNode {
	static override id = 'dragging_handle'

	shapeId!: TLShapeId
	initialHandle!: TLHandle
	initialAdjacentHandle!: TLHandle | null
	initialPagePoint!: Vec

	markId!: string
	initialPageTransform!: Mat
	initialPageRotation!: number

	info!: DraggingHandleInfo

	isPrecise = false
	isPreciseId: TLShapeId | null = null
	pointingId: TLShapeId | null = null

	override onEnter(info: DraggingHandleInfo) {
		const { shape, isCreating, creatingMarkId, handle } = info
		this.info = info
		this.parent.setCurrentToolIdMask(info.onInteractionEnd)
		this.shapeId = shape.id
		this.markId = ''

		if (isCreating) {
			if (creatingMarkId) {
				this.markId = creatingMarkId
			} 
		} else {
			this.markId = this.editor.markHistoryStoppingPoint('dragging handle')
		}

		this.initialHandle = structuredClone(handle)

		this.initialPageTransform = this.editor.getShapePageTransform(shape)!
		this.initialPageRotation = this.initialPageTransform.rotation()
		this.initialPagePoint = this.editor.inputs.originPagePoint.clone()

		this.editor.setCursor({ type: isCreating ? 'cross' : 'grabbing', rotation: 0 })

		const handles = this.editor.getShapeHandles(shape)!.sort(sortByIndex)
		const index = handles.findIndex((h) => h.id === info.handle.id)

		// Find the adjacent handle
		this.initialAdjacentHandle = null

		// Start from the handle and work forward
		for (let i = index + 1; i < handles.length; i++) {
			const handle = handles[i]
			if (handle.type === 'vertex' && handle.id !== 'middle' && handle.id !== info.handle.id) {
				this.initialAdjacentHandle = handle
				break
			}
		}

		// If still no handle, start from the end and work backward
		if (!this.initialAdjacentHandle) {
			for (let i = handles.length - 1; i >= 0; i--) {
				const handle = handles[i]
				if (handle.type === 'vertex' && handle.id !== 'middle' && handle.id !== info.handle.id) {
					this.initialAdjacentHandle = handle
					break
				}
			}
		}

		// Call onHandleDragStart callback
		const handleDragInfo = {
			handle: this.initialHandle,
			isPrecise: this.isPrecise,
			isCreatingShape: !!this.info.isCreating,
			initial: shape,
		}
		const util = this.editor.getShapeUtil(shape)
		const startChanges = util.onHandleDragStart?.(shape, handleDragInfo)
		if (startChanges) {
			this.editor.updateShapes([{ ...startChanges, id: shape.id, type: shape.type }])
		}

		this.update()

		this.editor.select(this.shapeId)
	}

	// Only relevant to arrows
	private exactTimeout = -1 as any

	// Only relevant to arrows
	private resetExactTimeout() {
		if (this.exactTimeout !== -1) {
			this.clearExactTimeout()
		}

		this.exactTimeout = this.editor.timers.setTimeout(() => {
			if (this.getIsActive() && !this.isPrecise) {
				this.isPrecise = true
				this.isPreciseId = this.pointingId
				this.update()
			}
			this.exactTimeout = -1
		}, 750)
	}

	// Only relevant to arrows
	private clearExactTimeout() {
		if (this.exactTimeout !== -1) {
			clearTimeout(this.exactTimeout)
			this.exactTimeout = -1
		}
	}

	override onPointerMove() {
		this.update()
	}

	override onKeyDown() {
		this.update()
	}

	override onKeyUp() {
		this.update()
	}

	override onPointerUp() {
		this.complete()
	}

	override onComplete() {
		this.update()
		this.complete()
	}

	override onCancel() {
		this.cancel()
	}

	override onExit() {
		this.parent.setCurrentToolIdMask(undefined)
		this.editor.snaps.clearIndicators()

		this.editor.setCursor({ type: 'default', rotation: 0 })
	}

	private complete() {
		this.editor.snaps.clearIndicators()
		kickoutOccludedShapes(this.editor, [this.shapeId])

		// Call onHandleDragEnd callback before state transitions
		const shape = this.editor.getShape(this.shapeId)
		if (shape) {
			const util = this.editor.getShapeUtil(shape)
			const handleDragInfo = {
				handle: this.initialHandle,
				isPrecise: this.isPrecise,
				isCreatingShape: !!this.info.isCreating,
				initial: this.info.shape,
			}
			const endChanges = util.onHandleDragEnd?.(shape, handleDragInfo)
			if (endChanges) {
				this.editor.updateShapes([{ ...endChanges, id: shape.id, type: shape.type }])
			}
		}

		const { onInteractionEnd } = this.info
		if (this.editor.getInstanceState().isToolLocked && onInteractionEnd) {
			// Return to the tool that was active before this one,
			// but only if tool lock is turned on!
			this.editor.setCurrentTool(onInteractionEnd, { shapeId: this.shapeId })
			return
		}

		this.parent.transition('idle')
	}

	private cancel() {
		// Call onHandleDragCancel callback before bailing to mark
		const shape = this.editor.getShape(this.shapeId)
		if (shape) {
			const util = this.editor.getShapeUtil(shape)
			const handleDragInfo = {
				handle: this.initialHandle,
				isPrecise: this.isPrecise,
				isCreatingShape: !!this.info.isCreating,
				initial: this.info.shape,
			}
			util.onHandleDragCancel?.(shape, handleDragInfo)
		}

		this.editor.bailToMark(this.markId)
		this.editor.snaps.clearIndicators()

		const { onInteractionEnd } = this.info
		if (onInteractionEnd) {
			// Return to the tool that was active before this one,
			// whether tool lock is turned on or not!
			this.editor.setCurrentTool(onInteractionEnd, { shapeId: this.shapeId })
			return
		}

		this.parent.transition('idle')
	}

	private update() {
		const { editor, shapeId, initialPagePoint } = this
		const { initialHandle, initialPageRotation, initialAdjacentHandle } = this
		const isSnapMode = this.editor.user.getIsSnapMode()
		const {
			snaps,
			inputs: { currentPagePoint, shiftKey, ctrlKey, altKey, pointerVelocity },
		} = editor

		const initial = this.info.shape

		const shape = editor.getShape(shapeId)
		if (!shape) return
		const util = editor.getShapeUtil(shape)

		let point = currentPagePoint
			.clone()
			.sub(initialPagePoint)
			.rot(-initialPageRotation)
			.add(initialHandle)

		if (shiftKey && initialAdjacentHandle && initialHandle.id !== 'middle') {
			const angle = Vec.Angle(initialAdjacentHandle, point)
			const snappedAngle = snapAngle(angle, 24)
			const angleDifference = snappedAngle - angle
			point = Vec.RotWith(point, initialAdjacentHandle, angleDifference)
		}

		// Clear any existing snaps
		editor.snaps.clearIndicators()

		let nextHandle = { ...initialHandle, x: point.x, y: point.y }

		if (initialHandle.canSnap && (isSnapMode ? !ctrlKey : ctrlKey)) {
			// We're snapping
			const pageTransform = editor.getShapePageTransform(shape.id)
			if (!pageTransform) throw Error('Expected a page transform')

			const snap = snaps.handles.snapHandle({ currentShapeId: shapeId, handle: nextHandle })

			if (snap) {
				snap.nudge.rot(-editor.getShapeParentTransform(shape)!.rotation())
				point.add(snap.nudge)
				nextHandle = { ...initialHandle, x: point.x, y: point.y }
			}
		}

		const changes = util.onHandleDrag?.(shape, {
			handle: nextHandle,
			isPrecise: this.isPrecise || altKey,
			isCreatingShape: !!this.info.isCreating,
			initial: initial,
		})

		const next: TLShapePartial<any> = { id: shape.id, type: shape.type, ...changes }

		if (changes) {
			editor.updateShapes([next])
		}
	}
}
