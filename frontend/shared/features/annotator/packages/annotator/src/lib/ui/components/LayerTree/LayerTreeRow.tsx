import {
    tlenv,
    TLShape,
    TLShapeId,
    TLGroupShape,
	stopEventPropagation,
	useEditor,
	useValue,
    useReversedChildrenShapes,
} from '@annotator/editor'
import { useCallback, useState } from 'react'
import { useUiEvents } from '../../context/events'
import { useTranslation } from '../../hooks/useTranslation/useTranslation'
import { useSelectedShapeIds } from '../../hooks/useSelectedShapeIds'
import { AnnotatorUiButton } from '../primitives/Button/AnnotatorUiButton'
import { AnnotatorUiButtonCheck } from '../primitives/Button/AnnotatorUiButtonCheck'
import { AnnotatorUiButtonIcon } from '../primitives/Button/AnnotatorUiButtonIcon'
import { AnnotatorUiButtonLabel } from '../primitives/Button/AnnotatorUiButtonLabel'
import { LayerItemInput } from './LayerItemInput'
import { LayerItemSubmenu } from './LayerItemSubmenu'
import classNames from 'classnames'

export interface LayerTreeRowProps {
	shapeId: TLShapeId
	positionY: number
	offsetY: number
    depth: number
    isSelected: boolean
    expandedGroupIds: Set<TLShapeId>
    toggleExpandedGroup: (id: TLShapeId) => void
    visibleShapes: TLShape[]
	index: number
    rowPositions: Record<string, { y: number; offsetY: number; }>
    itemHeight: number
	handlePointerDown: (e: React.PointerEvent<HTMLButtonElement>) => void
	handlePointerMove: (e: React.PointerEvent<HTMLButtonElement>) => void
	handlePointerUp: (e: React.PointerEvent<HTMLButtonElement>) => void
	// handleKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => void
}

/** @public @react */
export function LayerTreeRow({ 
	shapeId,
	positionY,
	offsetY,
    depth,
    isSelected,
    expandedGroupIds,
    toggleExpandedGroup,
    visibleShapes,
	index,
    rowPositions,
    itemHeight,
	handlePointerDown,
	handlePointerMove,
	handlePointerUp,
	// handleKeyDown,
}: LayerTreeRowProps) {
	const editor = useEditor()
	const msg = useTranslation()
	const trackEvent = useUiEvents()

    const shape = useValue('shape', () => editor.getShape(shapeId), [editor])
    if (!shape) return null

	const childrenShapes = useReversedChildrenShapes(shapeId)
	const selectedShapeIds = useSelectedShapeIds()
    const [shapeName, setShapeName] = useState((shape?.meta?.customName as string) ?? shapeId)
	const [isEditingRow, setIsEditingRow] = useState(false)

    const isGroup = editor.isShapeOfType<TLGroupShape>(shape, 'group')
    // const [isExpanded, setIsExpanded] = useState(expandedGroupIds.has(shapeId))
    const isExpanded = expandedGroupIds.has(shapeId)
    
    // Event handlers

	const handleToggleExpand = useCallback(
		(e: React.PointerEvent<HTMLButtonElement>) => {
			e.stopPropagation()
            toggleExpandedGroup(shapeId)
		},
		[]
	)

	const renameShape = useCallback(
		(id: TLShapeId, name: string) => {
			const shape = editor.getShape(id)
			if (!shape) return
			editor.updateShape({
				id,
				type: shape.type,
				meta: { ...shape.meta, customName: name }
			})
            setShapeName(name)
			trackEvent('rename-shape', { source: 'layer-tree' })
		},
		[editor, trackEvent]
	)

    const handleDoubleClick = useCallback(
        (e: React.PointerEvent<HTMLButtonElement>) => {
            setIsEditingRow(true)
            stopEventPropagation(e)
        },
        []
    )

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLButtonElement>) => {
            if (e.key === 'Enter') {
                setIsEditingRow(true)
                stopEventPropagation(e)
            }
        },
        []
    )

	return (
        <>
            <div
                key={shapeId}
                // data-pageid={shapeId} // TODO
                // data-testid="page-menu.item" // TODO
                className="tlui-layer-tree__item__sortable"
                style={{
                    transform: `translate(0px, ${positionY + offsetY}px)`,
                    width: '100%',
                    paddingLeft: `${depth * 26}px`,
                    top: 'auto',
                    // gap: '-24px',
                }}
            >
                {/* Chevron button */}
                {isGroup 
                    ? (
                        <AnnotatorUiButton
                            type="narrow"
                            onClick={handleToggleExpand}
                            title={isExpanded ? "Collapse group" : "Expand group"}
                        >
                            <AnnotatorUiButtonIcon 
                                icon={isExpanded ? "chevron-down" : "chevron-right"}
                                className="tlui-button__icon--narrow"
                            />
                        </AnnotatorUiButton>
                    ) : ( <AnnotatorUiButton type="narrow" disabled={true}/> )
                }
                
                {/* Thumbnail */}
                {/* <AnnotatorUiButton
                    type="narrow"
                    onClick={handleToggleExpand}
                    title={isExpanded ? "Collapse group" : "Expand group"}
                >
                    <AnnotatorUiButtonIcon icon="" />
                </AnnotatorUiButton> */}
                
                {/* Row button */}
                <AnnotatorUiButton
                    type="normal"
                    className={classNames(
                        "tlui-layer-tree__item__button",
                        { "tlui-layer-tree__item__button--selected": isSelected }
                    )}
                    style={{marginLeft: '-5px',}}
                    tabIndex={-1}
                    data-id={shapeId}
                    data-index={index}
                    // title={msg('page-menu.go-to-page')}  // TODO: Translate this
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onDoubleClick={handleDoubleClick}
                    onKeyDown={handleKeyDown}
                >
                    {/* Rename */}
                    {isEditingRow
                        ? <LayerItemInput
                            name={shapeName}
                            id={shapeId}
                            renameShape={renameShape}
                            onComplete={() => {setIsEditingRow(false)}}
                            onCancel={() => {setIsEditingRow(false)}}
                        />
                        : <AnnotatorUiButtonLabel>{shapeName}</AnnotatorUiButtonLabel>
                    }

                </AnnotatorUiButton>

                {/* More icon */}
                <div className="tlui-layer-tree__item__submenu">
                    <LayerItemSubmenu
                        index={index}
                        item={shape}
                        onRename={() => {
                            // if (isSelected) {
                            //     setIsEditingRow(true)
                            //     // stopEventPropagation(e)
                            // }
                            const newName = window.prompt('Rename the region', shapeName)
                            if (newName && newName !== shapeName) {
                                renameShape(shape.id, newName)
                            }
                        }}
                    />
                </div>

            </div>

            { expandedGroupIds.has(shapeId) &&                        
                <div className={classNames('tlui-layer-panel')}>
                    {
                        (() => {
                            return childrenShapes.map((shape, childIndex, ) => {
                                const rowPosition = rowPositions[shape.id] ?? {
                                    y: 0, offsetY: 0,
                                }
                                return <LayerTreeRow
                                    key={shape.id}
                                    shapeId={shape.id}
                                    positionY={rowPosition.y}
                                    offsetY={rowPosition.offsetY}
                                    depth={depth + 1}
                                    isSelected={selectedShapeIds.includes(shape.id)}
        
                                    expandedGroupIds={expandedGroupIds}
                                    toggleExpandedGroup={toggleExpandedGroup}
                                    visibleShapes={visibleShapes}
                                    index={visibleShapes.findIndex(s => s.id === shape.id)}
                                    rowPositions={rowPositions}
                                    itemHeight={itemHeight}
                                    
                                    handlePointerDown={handlePointerDown}
                                    handlePointerMove={handlePointerMove}
                                    handlePointerUp={handlePointerUp}
                                    // handleKeyDown={handleKeyDown}
                                />
                            })
                        })()
                    }
                </div>
            }



        </>
	)
}
