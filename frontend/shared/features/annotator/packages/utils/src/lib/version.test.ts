import { clearRegisteredVersionsForTests, registerAnnotatorLibraryVersion } from './version'

jest.useFakeTimers()

describe('registerAnnotatorLibraryVersion', () => {
	afterEach(() => {
		clearRegisteredVersionsForTests()
		jest.restoreAllMocks()
	})

	it('doesnt log anything if all versions are the same', () => {
		const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()

		registerAnnotatorLibraryVersion('annotator', '1.0.0', 'esm')
		registerAnnotatorLibraryVersion('@annotator/editor', '1.0.0', 'esm')
		registerAnnotatorLibraryVersion('@annotator/utils', '1.0.0', 'esm')
		registerAnnotatorLibraryVersion('@annotator/tlschema', '1.0.0', 'esm')

		jest.runAllTimers()

		expect(consoleLogSpy).toHaveBeenCalledTimes(0)
	})

	it('logs if not all versions match', () => {
		const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()

		registerAnnotatorLibraryVersion('annotator', '1.0.0', 'esm')
		registerAnnotatorLibraryVersion('@annotator/editor', '1.1.0', 'esm')
		registerAnnotatorLibraryVersion('@annotator/utils', '1.1.0', 'esm')
		registerAnnotatorLibraryVersion('@annotator/utils', '1.2.0', 'esm')
		registerAnnotatorLibraryVersion('@annotator/tlschema', '1.2.0', 'esm')

		jest.runAllTimers()

		expect(consoleLogSpy).toHaveBeenCalledTimes(1)
		expect(consoleLogSpy.mock.lastCall).toMatchInlineSnapshot(`
		[
		  "[1;41;97m[annotator][m [31;1mYou have multiple versions of annotator libraries installed. This can lead to bugs and unexpected behavior.[m

		The latest version you have installed is [1;94mv1.2.0[m. The following libraries are on the latest version:
		  • ✅ [1m@annotator/tlschema[m

		The following libraries are not on the latest version, or have multiple versions installed:
		  • ❌ [1mannotator[m ([31mv1.0.0[m)
		  • ❌ [1m@annotator/editor[m ([31mv1.1.0[m)
		  • ❌ [1m@annotator/utils[m ([31mv1.1.0[m, [32mv1.2.0[m)",
		]
	`)
	})

	it('logs if multiple versions of te same library are installed', () => {
		const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()

		registerAnnotatorLibraryVersion('annotator', '1.1.0', 'esm')
		registerAnnotatorLibraryVersion('@annotator/editor', '1.1.0', 'esm')
		registerAnnotatorLibraryVersion('@annotator/editor', '1.1.0', 'cjs')
		registerAnnotatorLibraryVersion('@annotator/utils', '1.1.0', 'esm')
		registerAnnotatorLibraryVersion('@annotator/utils', '1.1.0', 'cjs')
		registerAnnotatorLibraryVersion('@annotator/tlschema', '1.1.0', 'esm')

		jest.runAllTimers()

		expect(consoleLogSpy).toHaveBeenCalledTimes(1)
		expect(consoleLogSpy.mock.lastCall).toMatchInlineSnapshot(`
		[
		  "[1;41;97m[annotator][m [31;1mYou have multiple instances of some annotator libraries active. This can lead to bugs and unexpected behavior. [m

		This usually means that your bundler is misconfigured, and is importing the same library multiple times - usually once as an ES Module, and once as a CommonJS module.

		The following libraries have been imported multiple times:
		  • ❌ [1m@annotator/editor[m v1.1.0: 
		      1. ES Modules
		      2. CommonJS
		  • ❌ [1m@annotator/utils[m v1.1.0: 
		      1. ES Modules
		      2. CommonJS

		You should configure your bundler to only import one version of each library.",
		]
	`)
	})
})
