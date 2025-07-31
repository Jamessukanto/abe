import { TLAsset } from 'annotator'
import { multiplayerAssetStore } from './multiplayerAssetStore'

const resolver = multiplayerAssetStore().resolve
const FILE_SIZE = 1024 * 1024 * 2

describe('multiplayerAssetStore.resolve', () => {
	it('should return null if the asset has no src', async () => {
		const asset = { type: 'image', props: { w: 100, fileSize: FILE_SIZE } }
		expect(
			await resolver(asset as TLAsset, {
				screenScale: -1,
				steppedScreenScale: 1,
				dpr: 1,
				networkEffectiveType: '4g',
				shouldResolveToOriginal: false,
			})
		).toBe(null)
	})

	it('should return the original src for video types', async () => {
		const asset = {
			type: 'video',
			props: { src: 'http://assets.annotator.dev/video.mp4', fileSize: FILE_SIZE },
		}
		expect(
			await resolver(asset as TLAsset, {
				screenScale: -1,
				steppedScreenScale: 1,
				dpr: 1,
				networkEffectiveType: '4g',
				shouldResolveToOriginal: false,
			})
		).toBe('http://assets.annotator.dev/video.mp4')
	})

	it('should return the original src for non-annotator assets', async () => {
		const asset = {
			type: 'video',
			props: { src: 'http://assets.not-annotator.dev/video.mp4', fileSize: FILE_SIZE },
		}
		expect(
			await resolver(asset as TLAsset, {
				screenScale: -1,
				steppedScreenScale: 1,
				dpr: 1,
				networkEffectiveType: '4g',
				shouldResolveToOriginal: false,
			})
		).toBe('http://assets.not-annotator.dev/video.mp4')
	})

	it('should return the a transformed URL for small image types', async () => {
		const asset = {
			type: 'image',
			props: { src: 'http://assets.annotator.dev/image.jpg', fileSize: 1000 },
		}
		expect(
			await resolver(asset as TLAsset, {
				screenScale: -1,
				steppedScreenScale: 1,
				dpr: 1,
				networkEffectiveType: '4g',
				shouldResolveToOriginal: false,
			})
		).toBe('https://images.annotator.xyz/assets.annotator.dev/image.jpg')
	})

	it('should return the original src for if original is asked for', async () => {
		const asset = { type: 'image', props: { src: 'http://assets.annotator.dev/image.jpg', w: 100 } }
		expect(
			await resolver(asset as TLAsset, {
				screenScale: -1,
				steppedScreenScale: 1,
				dpr: 1,
				networkEffectiveType: '4g',
				shouldResolveToOriginal: true,
			})
		).toBe('http://assets.annotator.dev/image.jpg')
	})

	it('should return the original src if it does not start with http or https', async () => {
		const asset = { type: 'image', props: { src: 'data:somedata', w: 100, fileSize: FILE_SIZE } }
		expect(
			await resolver(asset as TLAsset, {
				screenScale: -1,
				steppedScreenScale: 1,
				dpr: 1,
				networkEffectiveType: '4g',
				shouldResolveToOriginal: false,
			})
		).toBe('data:somedata')
	})

	it('should return the original src if it is animated', async () => {
		const asset = {
			type: 'image',
			props: {
				src: 'http://assets.annotator.dev/animated.gif',
				mimeType: 'image/gif',
				w: 100,
				fileSize: FILE_SIZE,
			},
		}
		expect(
			await resolver(asset as TLAsset, {
				screenScale: -1,
				steppedScreenScale: 1,
				dpr: 1,
				networkEffectiveType: '4g',
				shouldResolveToOriginal: false,
			})
		).toBe('http://assets.annotator.dev/animated.gif')
	})

	it('should return the original src if it is a vector image', async () => {
		const asset = {
			type: 'image',
			props: {
				src: 'http://assets.annotator.dev/vector.svg',
				mimeType: 'image/svg+xml',
				w: 100,
				fileSize: FILE_SIZE,
			},
		}
		expect(
			await resolver(asset as TLAsset, {
				screenScale: -1,
				steppedScreenScale: 1,
				dpr: 1,
				networkEffectiveType: '4g',
				shouldResolveToOriginal: false,
			})
		).toBe('http://assets.annotator.dev/vector.svg')
	})

	it("should return null if the asset type is not 'image'", async () => {
		const asset = {
			type: 'document',
			props: { src: 'http://assets.annotator.dev/doc.pdf', w: 100, fileSize: FILE_SIZE },
		}
		expect(
			await resolver(asset as TLAsset, {
				screenScale: -1,
				steppedScreenScale: 1,
				dpr: 1,
				networkEffectiveType: '4g',
				shouldResolveToOriginal: false,
			})
		).toBe(null)
	})

	it('should handle if network compensation is not available and zoom correctly', async () => {
		const asset = {
			type: 'image',
			props: { src: 'http://assets.annotator.dev/image.jpg', w: 100, fileSize: FILE_SIZE },
		}
		expect(
			await resolver(asset as TLAsset, {
				screenScale: -1,
				steppedScreenScale: 0.5,
				dpr: 2,
				networkEffectiveType: null,
				shouldResolveToOriginal: false,
			})
		).toBe('https://images.annotator.xyz/assets.annotator.dev/image.jpg?w=100')
	})

	it('should handle network compensation and zoom correctly', async () => {
		const asset = {
			type: 'image',
			props: { src: 'http://assets.annotator.dev/image.jpg', w: 100, fileSize: FILE_SIZE },
		}
		expect(
			await resolver(asset as TLAsset, {
				screenScale: -1,
				steppedScreenScale: 0.5,
				dpr: 2,
				networkEffectiveType: '3g',
				shouldResolveToOriginal: false,
			})
		).toBe('https://images.annotator.xyz/assets.annotator.dev/image.jpg?w=50')
	})

	it('should not scale image above natural size', async () => {
		const asset = {
			type: 'image',
			props: { src: 'https://assets.annotator.dev/image.jpg', w: 100, fileSize: FILE_SIZE },
		}
		expect(
			await resolver(asset as TLAsset, {
				screenScale: -1,
				steppedScreenScale: 5,
				dpr: 1,
				networkEffectiveType: '4g',
				shouldResolveToOriginal: false,
			})
		).toBe('https://images.annotator.xyz/assets.annotator.dev/image.jpg?w=100')
	})
})
