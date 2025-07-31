import { useContainer } from '@annotator/editor'
import { ContextMenu as _ContextMenu } from 'radix-ui'
import { ReactNode } from 'react'
import { useMenuIsOpen } from '../../../hooks/useMenuIsOpen'
import { TLUiTranslationKey } from '../../../hooks/useTranslation/TLUiTranslationKey'
import { useTranslation } from '../../../hooks/useTranslation/useTranslation'
import { AnnotatorUiButton } from '../Button/AnnotatorUiButton'
import { AnnotatorUiButtonIcon } from '../Button/AnnotatorUiButtonIcon'
import { AnnotatorUiButtonLabel } from '../Button/AnnotatorUiButtonLabel'
import {
	AnnotatorUiDropdownMenuSub,
	AnnotatorUiDropdownMenuSubContent,
	AnnotatorUiDropdownMenuSubTrigger,
} from '../AnnotatorUiDropdownMenu'
import { useAnnotatorUiMenuContext } from './AnnotatorUiMenuContext'

/** @public */
export interface TLUiMenuSubmenuProps<Translation extends string = string> {
	id: string
	label?: Translation | { [key: string]: Translation }
	disabled?: boolean
	children: ReactNode
	size?: 'tiny' | 'small' | 'medium' | 'wide'
}

/** @public @react */
export function AnnotatorUiMenuSubmenu<Translation extends string = string>({
	id,
	disabled = false,
	label,
	size = 'small',
	children,
}: TLUiMenuSubmenuProps<Translation>) {
	const { type: menuType, sourceId } = useAnnotatorUiMenuContext()
	const container = useContainer()
	const msg = useTranslation()
	const labelToUse = label
		? typeof label === 'string'
			? label
			: (label[menuType] ?? label['default'])
		: undefined
	const labelStr = labelToUse ? msg(labelToUse as TLUiTranslationKey) : undefined

	switch (menuType) {
		case 'menu': {
			return (
				<AnnotatorUiDropdownMenuSub id={`${sourceId}-sub.${id}`}>
					<AnnotatorUiDropdownMenuSubTrigger
						id={`${sourceId}-sub.${id}-button`}
						disabled={disabled}
						label={labelStr!}
						title={labelStr!}
					/>
					<AnnotatorUiDropdownMenuSubContent id={`${sourceId}-sub.${id}-content`} size={size}>
						{children}
					</AnnotatorUiDropdownMenuSubContent>
				</AnnotatorUiDropdownMenuSub>
			)
		}
		case 'context-menu': {
			if (disabled) return null

			return (
				<ContextMenuSubWithMenu id={`${sourceId}-sub.${id}`}>
					<_ContextMenu.ContextMenuSubTrigger dir="ltr" disabled={disabled} asChild>
						<AnnotatorUiButton
							data-testid={`${sourceId}-sub.${id}-button`}
							type="menu"
							className="tlui-menu__submenu__trigger"
						>
							<AnnotatorUiButtonLabel>{labelStr}</AnnotatorUiButtonLabel>
							<AnnotatorUiButtonIcon icon="chevron-right" small />
						</AnnotatorUiButton>
					</_ContextMenu.ContextMenuSubTrigger>
					<_ContextMenu.ContextMenuPortal container={container}>
						<_ContextMenu.ContextMenuSubContent
							data-testid={`${sourceId}-sub.${id}-content`}
							className="tlui-menu tlui-menu__submenu__content"
							alignOffset={-1}
							sideOffset={-4}
							collisionPadding={4}
							data-size={size}
						>
							{children}
						</_ContextMenu.ContextMenuSubContent>
					</_ContextMenu.ContextMenuPortal>
				</ContextMenuSubWithMenu>
			)
		}
		default: {
			// no submenus in actions
			return children
		}
	}
}

/** @private */
export interface TLUiContextMenuSubProps {
	id: string
	children: ReactNode
}

/** @private */
export function ContextMenuSubWithMenu({ id, children }: TLUiContextMenuSubProps) {
	const [open, onOpenChange] = useMenuIsOpen(id)

	return (
		<_ContextMenu.ContextMenuSub open={open} onOpenChange={onOpenChange}>
			{children}
		</_ContextMenu.ContextMenuSub>
	)
}
