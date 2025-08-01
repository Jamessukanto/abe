import { exhaustiveSwitchError, preventDefault } from '@annotator/editor'
import { ContextMenu as _ContextMenu } from 'radix-ui'
import { useState } from 'react'
import { unwrapLabel } from '../../../context/actions'
import { TLUiEventSource } from '../../../context/events'
import { useReadonly } from '../../../hooks/useReadonly'
import { TLUiTranslationKey } from '../../../hooks/useTranslation/TLUiTranslationKey'
import { useTranslation } from '../../../hooks/useTranslation/useTranslation'
import { kbdStr } from '../../../kbd-utils'
import { Spinner } from '../../Spinner'
import { AnnotatorUiButton } from '../Button/AnnotatorUiButton'
import { AnnotatorUiButtonIcon } from '../Button/AnnotatorUiButtonIcon'
import { AnnotatorUiButtonLabel } from '../Button/AnnotatorUiButtonLabel'
import { AnnotatorUiDropdownMenuItem } from '../AnnotatorUiDropdownMenu'
import { TLUiIconJsx } from '../AnnotatorUiIcon'
import { AnnotatorUiKbd } from '../AnnotatorUiKbd'
import { AnnotatorUiToolbarButton } from '../AnnotatorUiToolbar'
import { useAnnotatorUiMenuContext } from './AnnotatorUiMenuContext'

/** @public */
export interface TLUiMenuItemProps<
	TranslationKey extends string = string,
	IconType extends string = string,
> {
	id: string
	/**
	 * The icon to display on the item. Icons are only shown in certain menu types.
	 */
	icon?: IconType | TLUiIconJsx
	/**
	 * An icon to display to the left of the menu item.
	 */
	iconLeft?: IconType | TLUiIconJsx
	/**
	 * The keyboard shortcut to display on the item.
	 */
	kbd?: string
	/**
	 * The label to display on the item. If it's a string, it will be translated. If it's an object, the keys will be used as the language keys and the values will be translated.
	 */
	label?: TranslationKey | { [key: string]: TranslationKey }
	/**
	 * If the editor is in readonly mode and the item is not marked as readonlyok, it will not be rendered.
	 */
	readonlyOk?: boolean
	/**
	 * The function to call when the item is clicked.
	 */
	onSelect(source: TLUiEventSource): Promise<void> | void
	/**
	 * Whether this item should be disabled.
	 */
	disabled?: boolean
	/**
	 * Prevent the menu from closing when the item is clicked
	 */
	noClose?: boolean
	/**
	 * Whether to show a spinner on the item.
	 */
	spinner?: boolean
	/**
	 * Whether the item is selected.
	 */
	isSelected?: boolean
}

/** @public @react */
export function AnnotatorUiMenuItem<
	TranslationKey extends string = string,
	IconType extends string = string,
>({
	disabled = false,
	spinner = false,
	readonlyOk = false,
	id,
	kbd,
	label,
	icon,
	iconLeft,
	onSelect,
	noClose,
	isSelected,
}: TLUiMenuItemProps<TranslationKey, IconType>) {
	const { type: menuType, sourceId } = useAnnotatorUiMenuContext()

	const msg = useTranslation()

	const [disableClicks, setDisableClicks] = useState(false)

	const isReadonlyMode = useReadonly()
	if (isReadonlyMode && !readonlyOk) return null

	const labelToUse = unwrapLabel(label, menuType)
	const kbdToUse = kbd ? kbdStr(kbd) : undefined

	const labelStr = labelToUse ? msg(labelToUse as TLUiTranslationKey) : undefined
	const titleStr = labelStr && kbdToUse ? `${labelStr} ${kbdToUse}` : labelStr

	switch (menuType) {
		case 'menu': {
			return (
				<AnnotatorUiDropdownMenuItem>
					<AnnotatorUiButton
						type="menu"
						data-testid={`${sourceId}.${id}`}
						disabled={disabled}
						title={titleStr}
						onClick={(e) => {
							if (noClose) {
								preventDefault(e)
							}
							if (disableClicks) {
								setDisableClicks(false)
							} else {
								onSelect(sourceId)
							}
						}}
					>
						{iconLeft && <AnnotatorUiButtonIcon icon={iconLeft} small />}
						<AnnotatorUiButtonLabel>{labelStr}</AnnotatorUiButtonLabel>
						{kbd && <AnnotatorUiKbd>{kbd}</AnnotatorUiKbd>}
					</AnnotatorUiButton>
				</AnnotatorUiDropdownMenuItem>
			)
		}
		case 'context-menu': {
			// Hide disabled context menu items
			if (disabled) return null

			return (
				<_ContextMenu.Item
					dir="ltr"
					title={titleStr}
					draggable={false}
					className="tlui-button tlui-button__menu"
					data-testid={`${sourceId}.${id}`}
					onSelect={(e) => {
						if (noClose) preventDefault(e)
						if (disableClicks) {
							setDisableClicks(false)
						} else {
							onSelect(sourceId)
						}
					}}
				>
					<span className="tlui-button__label" draggable={false}>
						{labelStr}
					</span>
					{iconLeft && <AnnotatorUiButtonIcon icon={iconLeft} small />}
					{kbd && <AnnotatorUiKbd>{kbd}</AnnotatorUiKbd>}
					{spinner && <Spinner />}
				</_ContextMenu.Item>
			)
		}
		case 'panel': {
			return (
				<AnnotatorUiButton
					data-testid={`${sourceId}.${id}`}
					type="menu"
					title={titleStr}
					disabled={disabled}
					onClick={() => onSelect(sourceId)}
				>
					<AnnotatorUiButtonLabel>{labelStr}</AnnotatorUiButtonLabel>
					{spinner ? <Spinner /> : icon && <AnnotatorUiButtonIcon icon={icon} />}
				</AnnotatorUiButton>
			)
		}
		case 'small-icons':
		case 'icons': {
			return (
				<AnnotatorUiToolbarButton
					data-testid={`${sourceId}.${id}`}
					type="icon"
					title={titleStr}
					disabled={disabled}
					onClick={() => onSelect(sourceId)}
				>
					<AnnotatorUiButtonIcon icon={icon!} small />
				</AnnotatorUiToolbarButton>
			)
		}
		case 'keyboard-shortcuts': {
			if (!kbd) {
				console.warn(
					`Menu item '${label}' isn't shown in the keyboard shortcuts dialog because it doesn't have a keyboard shortcut.`
				)
				return null
			}

			return (
				<div className="tlui-shortcuts-dialog__key-pair" data-testid={`${sourceId}.${id}`}>
					<div className="tlui-shortcuts-dialog__key-pair__key">{labelStr}</div>
					<div className="tlui-shortcuts-dialog__key-pair__value">
						<AnnotatorUiKbd visibleOnMobileLayout>{kbd}</AnnotatorUiKbd>
					</div>
				</div>
			)
		}
		case 'helper-buttons': {
			return (
				<AnnotatorUiButton type="low" onClick={() => onSelect(sourceId)}>
					<AnnotatorUiButtonIcon icon={icon!} />
					<AnnotatorUiButtonLabel>{labelStr}</AnnotatorUiButtonLabel>
				</AnnotatorUiButton>
			)
		}
		case 'toolbar': {
			return (
				<AnnotatorUiToolbarButton
					aria-label={labelStr}
					aria-pressed={isSelected ? 'true' : 'false'}
					data-testid={`tools.${id}`}
					data-value={id}
					disabled={disabled}
					onClick={() => onSelect('toolbar')}
					onTouchStart={(e) => {
						preventDefault(e)
						onSelect('toolbar')
					}}
					title={titleStr}
					type="tool"
				>
					<AnnotatorUiButtonIcon icon={icon!} />
				</AnnotatorUiToolbarButton>
			)
		}
		case 'toolbar-overflow': {
			return (
				<AnnotatorUiToolbarButton
					aria-label={labelStr}
					aria-pressed={isSelected ? 'true' : 'false'}
					isActive={isSelected}
					className="tlui-button-grid__button"
					data-testid={`tools.more.${id}`}
					data-value={id}
					disabled={disabled}
					onClick={() => onSelect('toolbar')}
					title={titleStr}
					type="icon"
				>
					<AnnotatorUiButtonIcon icon={icon!} />
				</AnnotatorUiToolbarButton>
			)
		}
		default: {
			throw exhaustiveSwitchError(menuType)
		}
	}
}
