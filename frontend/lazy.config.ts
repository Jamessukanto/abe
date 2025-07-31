import { LazyConfig } from 'lazyrepo'

const config = {
	scripts: {
		dev: {
			execution: 'independent',
			cache: 'none',
			workspaceOverrides: {
				'shared/features/annotator/packages/annotator': {
					baseCommand: 'yarn dev',
				},
			},
		},
	},
} satisfies LazyConfig

export default config
