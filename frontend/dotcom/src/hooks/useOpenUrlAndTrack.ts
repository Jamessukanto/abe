import { TLUiEventSource, useUiEvents } from 'annotator'
import { openUrl } from '../utils/url'

export function useOpenUrlAndTrack(source: TLUiEventSource) {
	const trackEvent = useUiEvents()
	return (url: string) => {
		trackEvent('open-url', { source, url })
		openUrl(url)
	}
}
