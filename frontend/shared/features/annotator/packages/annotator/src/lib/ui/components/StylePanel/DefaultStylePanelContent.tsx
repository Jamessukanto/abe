import {
	DefaultColorStyle,
	DefaultFillStyle,
	DefaultFontStyle,
	DefaultHorizontalAlignStyle,
	DefaultTextAlignStyle,
	DefaultVerticalAlignStyle,
	GeoShapeGeoStyle,
	LineShapeSplineStyle,
	ReadonlySharedStyleMap,
	StyleProp,
	TLDefaultColorTheme,
	getDefaultColorTheme,
	kickoutOccludedShapes,
	minBy,
	useEditor,
	useIsDarkMode,
	useValue,
} from '@annotator/editor'
import React, { useCallback } from 'react'
import { STYLES } from '../../../styles'
import { useUiEvents } from '../../context/events'
import { useRelevantStyles } from '../../hooks/useRelevantStyles'
import { useTranslation } from '../../hooks/useTranslation/useTranslation'
import { AnnotatorUiButtonIcon } from '../primitives/Button/AnnotatorUiButtonIcon'
import { AnnotatorUiButtonPicker } from '../primitives/AnnotatorUiButtonPicker'
import { AnnotatorUiSlider } from '../primitives/AnnotatorUiSlider'
import { AnnotatorUiToolbar, AnnotatorUiToolbarButton } from '../primitives/AnnotatorUiToolbar'
import { DoubleDropdownPicker } from './DoubleDropdownPicker'
import { DropdownPicker } from './DropdownPicker'

/** @public */
export interface TLUiStylePanelContentProps {
	styles: ReturnType<typeof useRelevantStyles>
}

/** @public @react */
export function DefaultStylePanelContent({ styles }: TLUiStylePanelContentProps) {
	const isDarkMode = useIsDarkMode()

	if (!styles) return null

	const geo = styles.get(GeoShapeGeoStyle)
	const spline = styles.get(LineShapeSplineStyle)
	const font = styles.get(DefaultFontStyle)

	const hideGeo = geo === undefined
	const hideSpline = spline === undefined
	const hideText = font === undefined

	const theme = getDefaultColorTheme({ isDarkMode: isDarkMode })

	return (
		<>
			<CommonStylePickerSet theme={theme} styles={styles} />
			{!hideText && <TextStylePickerSet theme={theme} styles={styles} />}
			{!(hideGeo && hideSpline) && (
				<div className="tlui-style-panel__section">
					<GeoStylePickerSet styles={styles} theme={theme} />
					<SplineStylePickerSet styles={styles} theme={theme} />
				</div>
			)}
		</>
	)
}

function useStyleChangeCallback() {
	const editor = useEditor()
	const trackEvent = useUiEvents()

	return React.useMemo(
		() =>
			function handleStyleChange<T>(style: StyleProp<T>, value: T) {
				editor.run(() => {
					if (editor.isIn('select')) {
						editor.setStyleForSelectedShapes(style, value)
					}
					editor.setStyleForNextShapes(style, value)
					editor.updateInstanceState({ isChangingStyle: true })
				})

				trackEvent('set-style', { source: 'style-panel', id: style.id, value: value as string })
			},
		[editor, trackEvent]
	)
}

/** @public */
export interface StylePickerSetProps {
	styles: ReadonlySharedStyleMap
	theme: TLDefaultColorTheme
}

/** @public */
export interface ThemeStylePickerSetProps {
	styles: ReadonlySharedStyleMap
	theme: TLDefaultColorTheme
}

/** @public @react */
export function CommonStylePickerSet({ styles, theme }: ThemeStylePickerSetProps) {
	const msg = useTranslation()
	const editor = useEditor()

	const onHistoryMark = useCallback((id: string) => editor.markHistoryStoppingPoint(id), [editor])

	const handleValueChange = useStyleChangeCallback()

	const color = styles.get(DefaultColorStyle)
	const fill = styles.get(DefaultFillStyle)

	const showPickers = fill !== undefined

	return (
		<>
			<div className="tlui-style-panel__section__common" data-testid="style.panel">
				{color === undefined ? null : (
					<AnnotatorUiToolbar label={msg('style-panel.color')}>
						<AnnotatorUiButtonPicker
							title={msg('style-panel.color')}
							uiType="color"
							style={DefaultColorStyle}
							items={STYLES.color}
							value={color}
							onValueChange={handleValueChange}
							theme={theme}
							onHistoryMark={onHistoryMark}
						/>
					</AnnotatorUiToolbar>
				)}
				<OpacitySlider />
			</div>
			{showPickers && (
				<div className="tlui-style-panel__section">
					{fill === undefined ? null : (
						<AnnotatorUiToolbar label={msg('style-panel.fill')}>
							<AnnotatorUiButtonPicker
								title={msg('style-panel.fill')}
								uiType="fill"
								style={DefaultFillStyle}
								items={STYLES.fill}
								value={fill}
								onValueChange={handleValueChange}
								theme={theme}
								onHistoryMark={onHistoryMark}
							/>
						</AnnotatorUiToolbar>
					)}
				</div>
			)}
		</>
	)
}

/** @public @react */
export function TextStylePickerSet({ theme, styles }: ThemeStylePickerSetProps) {
	const msg = useTranslation()
	const handleValueChange = useStyleChangeCallback()

	const editor = useEditor()
	const onHistoryMark = useCallback((id: string) => editor.markHistoryStoppingPoint(id), [editor])

	const font = styles.get(DefaultFontStyle)
	const textAlign = styles.get(DefaultTextAlignStyle)
	const labelAlign = styles.get(DefaultHorizontalAlignStyle)
	const verticalLabelAlign = styles.get(DefaultVerticalAlignStyle)
	if (font === undefined && labelAlign === undefined) {
		return null
	}

	return (
		<div className="tlui-style-panel__section">
			{font === undefined ? null : (
				<AnnotatorUiToolbar label={msg('style-panel.font')}>
					<AnnotatorUiButtonPicker
						title={msg('style-panel.font')}
						uiType="font"
						style={DefaultFontStyle}
						items={STYLES.font}
						value={font}
						onValueChange={handleValueChange}
						theme={theme}
						onHistoryMark={onHistoryMark}
					/>
				</AnnotatorUiToolbar>
			)}

			{textAlign === undefined ? null : (
				<AnnotatorUiToolbar label={msg('style-panel.align')} className="tlui-style-panel__row">
					<AnnotatorUiButtonPicker
						title={msg('style-panel.align')}
						uiType="align"
						style={DefaultTextAlignStyle}
						items={STYLES.textAlign}
						value={textAlign}
						onValueChange={handleValueChange}
						theme={theme}
						onHistoryMark={onHistoryMark}
					/>
					<div className="tlui-style-panel__row__extra-button">
						<AnnotatorUiToolbarButton
							type="icon"
							title={msg('style-panel.vertical-align')}
							data-testid="vertical-align"
							disabled
						>
							<AnnotatorUiButtonIcon icon="vertical-align-middle" />
						</AnnotatorUiToolbarButton>
					</div>
				</AnnotatorUiToolbar>
			)}

			{labelAlign === undefined ? null : (
				<AnnotatorUiToolbar label={msg('style-panel.label-align')} className="tlui-style-panel__row">
					<AnnotatorUiButtonPicker
						title={msg('style-panel.label-align')}
						uiType="align"
						style={DefaultHorizontalAlignStyle}
						items={STYLES.horizontalAlign}
						value={labelAlign}
						onValueChange={handleValueChange}
						theme={theme}
						onHistoryMark={onHistoryMark}
					/>
					<div className="tlui-style-panel__row__extra-button">
						{verticalLabelAlign === undefined ? (
							<AnnotatorUiToolbarButton
								type="icon"
								title={msg('style-panel.vertical-align')}
								data-testid="vertical-align"
								disabled
							>
								<AnnotatorUiButtonIcon icon="vertical-align-middle" />
							</AnnotatorUiToolbarButton>
						) : (
							<DropdownPicker
								type="icon"
								id="geo-vertical-alignment"
								uiType="verticalAlign"
								stylePanelType="vertical-align"
								style={DefaultVerticalAlignStyle}
								items={STYLES.verticalAlign}
								value={verticalLabelAlign}
								onValueChange={handleValueChange}
							/>
						)}
					</div>
				</AnnotatorUiToolbar>
			)}
		</div>
	)
}
/** @public @react */
export function GeoStylePickerSet({ styles, theme }: StylePickerSetProps) {
	const msg = useTranslation()
	const handleValueChange = useStyleChangeCallback()

	const geo = styles.get(GeoShapeGeoStyle)
	if (geo === undefined) {
		return null
	}

	return (
		<AnnotatorUiToolbar label={msg('style-panel.geo')}>
			<DropdownPicker
				id="geo"
				type="menu"
				label={'style-panel.geo'}
				uiType="geo"
				stylePanelType="geo"
				style={GeoShapeGeoStyle}
				items={STYLES.geo}
				value={geo}
				onValueChange={handleValueChange}
			/>
		</AnnotatorUiToolbar>
	)
}
/** @public @react */
export function SplineStylePickerSet({ styles, theme }: StylePickerSetProps) {
	const msg = useTranslation()
	const handleValueChange = useStyleChangeCallback()

	const spline = styles.get(LineShapeSplineStyle)
	if (spline === undefined) {
		return null
	}

	return (
		<AnnotatorUiToolbar label={msg('style-panel.spline')}>
			<DropdownPicker
				id="spline"
				type="menu"
				label={'style-panel.spline'}
				uiType="spline"
				stylePanelType="spline"
				style={LineShapeSplineStyle}
				items={STYLES.spline}
				value={spline}
				onValueChange={handleValueChange}
			/>
		</AnnotatorUiToolbar>
	)
}
const AnnotatorSupportedOpacities = [0.1, 0.25, 0.5, 0.75, 1] as const
/** @public @react */
export function OpacitySlider() {
	const editor = useEditor()

	const onHistoryMark = useCallback((id: string) => editor.markHistoryStoppingPoint(id), [editor])

	const opacity = useValue('opacity', () => editor.getSharedOpacity(), [editor])
	const trackEvent = useUiEvents()
	const msg = useTranslation()

	const handleOpacityValueChange = React.useCallback(
		(value: number) => {
			const item = AnnotatorSupportedOpacities[value]
			editor.run(() => {
				if (editor.isIn('select')) {
					editor.setOpacityForSelectedShapes(item)
				}
				editor.setOpacityForNextShapes(item)
				editor.updateInstanceState({ isChangingStyle: true })
			})

			trackEvent('set-style', { source: 'style-panel', id: 'opacity', value })
		},
		[editor, trackEvent]
	)

	if (opacity === undefined) return null

	const opacityIndex =
		opacity.type === 'mixed'
			? -1
			: AnnotatorSupportedOpacities.indexOf(
					minBy(AnnotatorSupportedOpacities, (supportedOpacity) =>
						Math.abs(supportedOpacity - opacity.value)
					)!
				)

	return (
		<AnnotatorUiSlider
			data-testid="style.opacity"
			value={opacityIndex >= 0 ? opacityIndex : AnnotatorSupportedOpacities.length - 1}
			label={opacity.type === 'mixed' ? 'style-panel.mixed' : `opacity-style.${opacity.value}`}
			onValueChange={handleOpacityValueChange}
			steps={AnnotatorSupportedOpacities.length - 1}
			title={msg('style-panel.opacity')}
			onHistoryMark={onHistoryMark}
			ariaValueModifier={25}
		/>
	)
}
