import * as annotator from './index'

it('exports things from annotator', () => {
	expect(annotator).toHaveProperty('Annotator')
	expect(new annotator.Vec()).toMatchObject({ x: 0, y: 0 })
})

it('exports types from annotator', () => {
	const _thing: Annotator.VecModel = { x: 0, y: 0 }
})
