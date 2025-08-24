import {
	PageRecordType,
	TLPageId,
	stopEventPropagation,
	useEditor,
	useValue,
} from '@annotator/editor'
import { memo, useCallback, ReactNode, useState } from 'react'
import { useAnnotatorUiComponents } from '../context/components'
import { useTranslation } from '../hooks/useTranslation/useTranslation'
import { useBreakpoint } from '../context/breakpoints'
import { PORTRAIT_BREAKPOINT } from '../constants'
import { AnnotatorUiToolbar } from './primitives/AnnotatorUiToolbar'

import { useUiEvents } from '../context/events'
import { AnnotatorUiButton } from './primitives/Button/AnnotatorUiButton'
import { AnnotatorUiButtonIcon } from './primitives/Button/AnnotatorUiButtonIcon'
import { AnnotatorUiButtonLabel } from './primitives/Button/AnnotatorUiButtonLabel'
import { AnnotatorUiButtonCTA } from './primitives/Button/AnnotatorUiButtonCTA'
import { AnnotatorUiInput } from './primitives/AnnotatorUiInput'
import classnames from 'classnames'
// import { onMovePage } from './edit-pages-shared'

/** @public @react */
export const DefaultAppPanel = memo(function AppPanel() {
	const separator = '/'

	const editor = useEditor()
	const trackEvent = useUiEvents()
	const msg = useTranslation()
	const breakpoint = useBreakpoint()
	const isTabletAndAbove = breakpoint >= PORTRAIT_BREAKPOINT.TABLET

	const pages = useValue('pages', () => editor.getPages(), [editor])
	const currentPage = useValue('currentPage', () => editor.getCurrentPage(), [editor])	
	const { currPageIdx, prevPage, nextPage } = useValue('currentPageIndex', () => {
		let currPageIdx = pages.findIndex(page => page.id === currentPage.id)
		const prevPage = currPageIdx > 0 ? pages[currPageIdx - 1] : null
		const nextPage = currPageIdx < pages.length - 1 ? pages[currPageIdx + 1] : null
		currPageIdx = currPageIdx + 1
		return { currPageIdx, prevPage, nextPage }
	}, [currentPage])
	const [inputValue, setInputValue] = useState(currPageIdx.toString())

	const changePage = useCallback(
		(id: TLPageId) => {
			editor.setCurrentPage(id)
			setInputValue((pages.findIndex(page => page.id === id) + 1).toString())
			trackEvent('change-page', { source: 'page-menu' })
		},
		[editor, trackEvent]
	)
	const handleInputComplete = useCallback((value: string) => {
		if (/^\d+$/.test(value)) {
			let val = parseInt(value, 10)
			if (val > 0) {
				val = Math.min(val, pages.length)
				changePage(pages[val - 1].id)
				return
			}
		}
		alert(`Please enter digits only from 1 to ${pages.length}.`)
		setInputValue(currPageIdx.toString())
	}, [pages, currPageIdx, changePage])

	return (
		<nav
			className={classnames("tlui-layout__app", {
				"tlui-layout__app-tablet": !isTabletAndAbove,
			})}
		>
			{/* Frame header */}
			{isTabletAndAbove && <div className="tlui-layout__app__header">
				<div className="tlui-layout__app__subtitle">
					<div>Project Demo</div>
					<div>{separator}</div>
					<div>Job ID: anno-xxxxx-xxxxx</div>
				</div>
				{/* TODO: james to fix demo hack */}
				<div className="tlui-layout__app__title">{
					currentPage.name.replace('Page ', 'image_frame_') + ".jpg"
				}</div>
			</div>}

			{/* Navigation */}
			<div className={classnames("tlui-layout_app__page__navigation", {
				"tlui-layout_app__page__navigation-tablet": !isTabletAndAbove,
			})}>
				<AnnotatorUiButton
					type="normal"
					onClick={() => changePage(prevPage.id)}
					title={msg('page-menu.go-to-previous-image')}
					disabled={!prevPage}
				>
					<AnnotatorUiButtonIcon icon="chevron-left" />
				</AnnotatorUiButton>

				{isTabletAndAbove && 
					<div className="tlui-layout_app__navigation__input">
						<div className="tlui-layout_app__prefix">
							Go to frame:
						</div>
						<AnnotatorUiInput
							className="tlui-layout_app__value"
							placeholder={currPageIdx.toString()}
							value={inputValue}
							onValueChange={setInputValue}
							onComplete={handleInputComplete}
							autoSelect={true} 
						/>
						<div className="tlui-layout_app__suffix">
							{"/ " + pages.length}
						</div>
					</div>
				}
				<AnnotatorUiButton
					type="normal"
					onClick={() => changePage(nextPage.id)}
					title={msg('page-menu.go-to-next-image')}
					disabled={!nextPage}
				>
					<AnnotatorUiButtonIcon icon="chevron-right" />
				</AnnotatorUiButton>
			</div>

			{/* Actions */}
			<div className='tlui-layout_app__actions'> 
				<AnnotatorUiButtonCTA
					onClick={() => {console.log('Exit Annotator clicked')}}
					title="Exit Annotator"
				>
					<AnnotatorUiButtonLabel>EXIT ANNOTATOR</AnnotatorUiButtonLabel>
				</AnnotatorUiButtonCTA>
			</div>

		</nav>
	)
})





