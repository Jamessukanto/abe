import { render } from '@testing-library/react'
import { Editor, promiseWithResolve } from '@annotator/editor'
import { ReactElement } from 'react'

/**
 * Render a <Annotator /> component and wait for it to become ready. By default, this includes waiting
 * for the canvas and fill patterns to pre-render.
 *
 * You almost always want to wait for the canvas, but if you are testing a component that passes its
 * own children and doesn't render the canvas itself, you can set `waitForCanvas` to false.
 *
 * Without waiting for patterns, a bunch of "missing `act()`" errors will fill the console, but if
 * you don't need it (or your're testing the annotator component without our default shapes, and so
 * don't have pre-rendered patterns to worry about) you can set `waitForPatterns` to false.
 */
export async function renderAnnotatorComponent(
	element: ReactElement,
	{ waitForPatterns }: { waitForPatterns: boolean }
) {
	const result = render(element)
	await result.findAllByTestId('canvas')
	if (waitForPatterns) await result.findByTestId('ready-pattern-fill-defs')
	return result
}

export async function renderAnnotatorComponentWithEditor(
	cb: (onMount: (editor: Editor) => void) => ReactElement,
	opts: { waitForPatterns: boolean }
) {
	const editorPromise = promiseWithResolve<Editor>()
	const element = cb((editor) => {
		editorPromise.resolve(editor)
	})
	const rendered = await renderAnnotatorComponent(element, opts)
	const editor = await editorPromise
	return { editor, rendered }
}
