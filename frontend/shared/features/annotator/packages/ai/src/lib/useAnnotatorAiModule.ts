import { useMemo } from 'react'
import { AnnotatorAiModule, AnnotatorAiModuleOptions } from './annotatorAiModule'

/** @public */
export function useAnnotatorAiModule(options: AnnotatorAiModuleOptions) {
	const ai = useMemo(() => new AnnotatorAiModule(options), [options])
	return ai
}
