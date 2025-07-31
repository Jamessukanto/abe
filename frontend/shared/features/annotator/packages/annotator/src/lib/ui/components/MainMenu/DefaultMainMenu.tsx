import { useContainer } from '@annotator/editor'
import { DropdownMenu as _DropdownMenu } from 'radix-ui'
import { ReactNode, memo } from 'react'
import { useMenuIsOpen } from '../../hooks/useMenuIsOpen'
import { useTranslation } from '../../hooks/useTranslation/useTranslation'
import { AnnotatorUiButton } from '../primitives/Button/AnnotatorUiButton'
import { AnnotatorUiButtonIcon } from '../primitives/Button/AnnotatorUiButtonIcon'
import { AnnotatorUiMenuContextProvider } from '../primitives/menus/AnnotatorUiMenuContext'
import { DefaultMainMenuContent } from './DefaultMainMenuContent'

/** @public */
export interface TLUiMainMenuProps {
	children?: ReactNode
}

/** @public @react */
export const DefaultMainMenu = memo(function DefaultMainMenu({ children }: TLUiMainMenuProps) {
	const container = useContainer()
	const [isOpen, onOpenChange] = useMenuIsOpen('main menu')
	const msg = useTranslation()

	// Get the main menu content, either the default component or the user's
	// override. If there's no menu content, then the user has set it to null,
	// so skip rendering the menu.
	const content = children ?? <DefaultMainMenuContent />

	return (
		<_DropdownMenu.Root dir="ltr" open={isOpen} onOpenChange={onOpenChange} modal={false}>
			<_DropdownMenu.Trigger asChild dir="ltr">
				<AnnotatorUiButton type="icon" data-testid="main-menu.button" title={msg('menu.title')}>
					<AnnotatorUiButtonIcon icon="menu" small />
				</AnnotatorUiButton>
			</_DropdownMenu.Trigger>
			<_DropdownMenu.Portal container={container}>
				<_DropdownMenu.Content
					className="tlui-menu"
					side="bottom"
					align="start"
					collisionPadding={4}
					alignOffset={0}
					sideOffset={6}
				>
					<AnnotatorUiMenuContextProvider type="menu" sourceId="main-menu">
						{content}
					</AnnotatorUiMenuContextProvider>
				</_DropdownMenu.Content>
			</_DropdownMenu.Portal>
		</_DropdownMenu.Root>
	)
})
