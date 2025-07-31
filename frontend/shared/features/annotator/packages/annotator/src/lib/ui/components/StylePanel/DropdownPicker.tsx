import { SharedStyle, StyleProp, tlmenus, useEditor } from '@annotator/editor'
import classNames from 'classnames'
import * as React from 'react'
import { StyleValuesForUi } from '../../../styles'
import { TLUiTranslationKey } from '../../hooks/useTranslation/TLUiTranslationKey'
import { useTranslation } from '../../hooks/useTranslation/useTranslation'
import { TLUiIconType } from '../../icon-types'
import { AnnotatorUiButtonIcon } from '../primitives/Button/AnnotatorUiButtonIcon'
import { AnnotatorUiButtonLabel } from '../primitives/Button/AnnotatorUiButtonLabel'
import {
	AnnotatorUiPopover,
	AnnotatorUiPopoverContent,
	AnnotatorUiPopoverTrigger,
} from '../primitives/AnnotatorUiPopover'
import { AnnotatorUiToolbar, AnnotatorUiToolbarButton } from '../primitives/AnnotatorUiToolbar'
import { AnnotatorUiMenuContextProvider } from '../primitives/menus/AnnotatorUiMenuContext'

interface DropdownPickerProps<T extends string> {
	id: string
	label?: TLUiTranslationKey | Exclude<string, TLUiTranslationKey>
	uiType: string
	stylePanelType: string
	style: StyleProp<T>
	value: SharedStyle<T>
	items: StyleValuesForUi<T>
	type: 'icon' | 'tool' | 'menu'
	onValueChange(style: StyleProp<T>, value: T): void
}

function DropdownPickerInner<T extends string>({
	id,
	label,
	uiType,
	stylePanelType,
	style,
	items,
	type,
	value,
	onValueChange,
}: DropdownPickerProps<T>) {
	const msg = useTranslation()
	const editor = useEditor()
	const [isOpen, setIsOpen] = React.useState(false)

	const icon = React.useMemo(
		() => items.find((item) => value.type === 'shared' && item.value === value.value)?.icon,
		[items, value]
	)

	const stylePanelName = msg(`style-panel.${stylePanelType}` as TLUiTranslationKey)

	const titleStr =
		value.type === 'mixed'
			? msg('style-panel.mixed')
			: stylePanelName + ' — ' + msg(`${uiType}-style.${value.value}` as TLUiTranslationKey)
	const labelStr = label ? msg(label) : ''

	const popoverId = `style panel ${id}`
	return (
		<AnnotatorUiPopover id={popoverId} open={isOpen} onOpenChange={setIsOpen}>
			<AnnotatorUiPopoverTrigger>
				<AnnotatorUiToolbarButton
					type={type}
					data-testid={`style.${uiType}`}
					data-direction="left"
					title={titleStr}
				>
					{labelStr && <AnnotatorUiButtonLabel>{labelStr}</AnnotatorUiButtonLabel>}
					<AnnotatorUiButtonIcon icon={(icon as TLUiIconType) ?? 'mixed'} />
				</AnnotatorUiToolbarButton>
			</AnnotatorUiPopoverTrigger>
			<AnnotatorUiPopoverContent side="left" align="center">
				<AnnotatorUiToolbar
					label={labelStr}
					className={classNames('tlui-buttons__grid', `tlui-buttons__${stylePanelType}`)}
				>
					<AnnotatorUiMenuContextProvider type="icons" sourceId="style-panel">
						{items.map((item) => {
							return (
								<AnnotatorUiToolbarButton
									key={item.value}
									type="icon"
									data-testid={`style.${uiType}.${item.value}`}
									title={
										stylePanelName +
										' — ' +
										msg(`${uiType}-style.${item.value}` as TLUiTranslationKey)
									}
									isActive={icon === item.icon}
									onClick={() => {
										editor.markHistoryStoppingPoint('select style dropdown item')
										onValueChange(style, item.value)
										tlmenus.deleteOpenMenu(popoverId, editor.contextId)
										setIsOpen(false)
									}}
								>
									<AnnotatorUiButtonIcon icon={item.icon} />
								</AnnotatorUiToolbarButton>
							)
						})}
					</AnnotatorUiMenuContextProvider>
				</AnnotatorUiToolbar>
			</AnnotatorUiPopoverContent>
		</AnnotatorUiPopover>
	)
}

// need to export like this to get generics
export const DropdownPicker = React.memo(DropdownPickerInner) as typeof DropdownPickerInner
