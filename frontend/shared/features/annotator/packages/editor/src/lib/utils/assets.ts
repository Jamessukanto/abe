import { fetch } from '@annotator/utils'
import { version } from '../../version'

/** @public */
export function dataUrlToFile(url: string, filename: string, mimeType: string) {
	return fetch(url)
		.then(function (res) {
			return res.arrayBuffer()
		})
		.then(function (buf) {
			return new File([buf], filename, { type: mimeType })
		})
}

/** @internal */
const CDN_BASE_URL = 'https://cdn.annotator.com'

/** @public */
export function getDefaultCdnBaseUrl() {
	return `${CDN_BASE_URL}/${version}`
}
