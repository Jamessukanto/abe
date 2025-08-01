import { preventDefault } from '@annotator/editor'
import { ContextMenu as _ContextMenu, DropdownMenu as _DropdownMenu } from 'radix-ui'
import { unwrapLabel } from '../../../context/actions'
import { TLUiEventSource } from '../../../context/events'
import { useReadonly } from '../../../hooks/useReadonly'
import { TLUiTranslationKey } from '../../../hooks/useTranslation/TLUiTranslationKey'
import { useTranslation } from '../../../hooks/useTranslation/useTranslation'
import { AnnotatorUiIcon, TLUiIconJsx } from '../AnnotatorUiIcon'
import { AnnotatorUiKbd } from '../AnnotatorUiKbd'
import { useAnnotatorUiMenuContext } from './AnnotatorUiMenuContext'

/** @public */
export interface TLUiMenuCheckboxItemProps<
	TranslationKey extends string = string,
	IconType extends string = string,
> {
	icon?: IconType | TLUiIconJsx
	id: string
	kbd?: string
	title?: string
	label?: TranslationKey | { [key: string]: TranslationKey }
	readonlyOk?: boolean
	onSelect(source: TLUiEventSource): Promise<void> | void
	toggle?: boolean
	checked?: boolean
	disabled?: boolean
}

/** @public @react */
export function AnnotatorUiMenuCheckboxItem<
	TranslationKey extends string = string,
	IconType extends string = string,
>({
	id,
	kbd,
	label,
	readonlyOk,
	onSelect,
	toggle = false,
	disabled = false,
	checked = false,
}: TLUiMenuCheckboxItemProps<TranslationKey, IconType>) {
	const { type: menuType, sourceId } = useAnnotatorUiMenuContext()
	const isReadonlyMode = useReadonly()
	const msg = useTranslation()

	// If the editor is in readonly mode and the item is not marked as readonlyok, return null
	if (isReadonlyMode && !readonlyOk) return null

	const labelToUse = unwrapLabel(label, menuType)
	const labelStr = labelToUse ? msg(labelToUse as TLUiTranslationKey) : undefined

	switch (menuType) {
		case 'menu': {
			return (
				<_DropdownMenu.CheckboxItem
					dir="ltr"
					className="tlui-button tlui-button__menu tlui-button__checkbox"
					title={labelStr}
					onSelect={(e) => {
						onSelect?.(sourceId)
						preventDefault(e)
					}}
					disabled={disabled}
					checked={checked}
				>
					<AnnotatorUiIcon
						small
						label={msg(checked ? 'ui.checked' : 'ui.unchecked')}
						icon={toggle ? (checked ? 'toggle-on' : 'toggle-off') : checked ? 'check' : 'none'}
					/>
					{labelStr && (
						<span className="tlui-button__label" draggable={false}>
							{labelStr}
						</span>
					)}
					{kbd && <AnnotatorUiKbd>{kbd}</AnnotatorUiKbd>}
				</_DropdownMenu.CheckboxItem>
			)
		}
		case 'context-menu': {
			return (
				<_ContextMenu.CheckboxItem
					key={id}
					className="tlui-button tlui-button__menu tlui-button__checkbox"
					dir="ltr"
					title={labelStr}
					onSelect={(e) => {
						onSelect(sourceId)
						preventDefault(e)
					}}
					disabled={disabled}
					checked={checked}
				>
					<AnnotatorUiIcon
						small
						label={msg(checked ? 'ui.checked' : 'ui.unchecked')}
						icon={toggle ? (checked ? 'toggle-on' : 'toggle-off') : checked ? 'check' : 'none'}
					/>
					{labelStr && (
						<span className="tlui-button__label" draggable={false}>
							{labelStr}
						</span>
					)}
					{kbd && <AnnotatorUiKbd>{kbd}</AnnotatorUiKbd>}
				</_ContextMenu.CheckboxItem>
			)
		}
		default: {
			// no checkbox items in actions menu
			return null
		}
	}
}
