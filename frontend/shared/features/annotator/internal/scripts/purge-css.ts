import { PurgeCSS } from 'purgecss'
import { nicelog } from './lib/nicelog'

async function main() {
	const purgeCSSResults = await new PurgeCSS().purge({
		content: ['packages/annotator/**/*.tsx', 'packages/editor/**/*.tsx'],
		css: ['packages/annotator/src/lib/ui.css'],
		rejected: true,
	})

	nicelog(purgeCSSResults)
}

main()
