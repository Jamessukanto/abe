import { LazyConfig } from 'lazyrepo'

const config = {
	baseCacheConfig: {
		include: [
			'<rootDir>/package.json',
			'<rootDir>/yarn.lock',
			'<rootDir>/lazy.config.ts',
			'<rootDir>/internal/config/**/*',
			'<rootDir>/internal/scripts/**/*',
			'package.json',
		],
		exclude: [
			'<allWorkspaceDirs>/coverage/**/*',
			'<allWorkspaceDirs>/dist*/**/*',
			'<allWorkspaceDirs>/.next*/**/*',
			'**/*.tsbuildinfo',
			'<rootDir>/docs/gen/**/*',
		],
	},
	scripts: {
		build: {
			baseCommand: 'exit 0',
			runsAfter: { 'refresh-assets': {}, 'build-i18n': {} },
			workspaceOverrides: {
				'packages/*': {
					runsAfter: { 'build-api': { in: 'self-only' } },
					cache: {
						inputs: ['api/**/*', 'src/**/*'],
					},
				},
			},
		},
		dev: {
			execution: 'independent',
			runsAfter: { 'refresh-assets': {}, 'build-i18n': {} },
			cache: 'none',
			workspaceOverrides: {},
		},
		e2e: {
			cache: 'none',
		},
		'e2e-x10': {
			cache: 'none',
		},
		'test-ci': {
			baseCommand: 'yarn run -T jest',
			runsAfter: { 'refresh-assets': {} },
			cache: {
				inputs: {
					exclude: ['*.tsbuildinfo'],
				},
			},
		},
		'test-coverage': {
			baseCommand: 'yarn run -T jest --coverage',
			runsAfter: { 'refresh-assets': {} },
		},
		lint: {
			execution: 'independent',
			runsAfter: { 'build-types': {} },
			cache: {
				inputs: {
					exclude: ['*.tsbuildinfo'],
				},
			},
		},
		'pack-tarball': {
			parallel: false,
		},
		'refresh-assets': {
			execution: 'top-level',
			baseCommand: `tsx <rootDir>/internal/scripts/refresh-assets.ts`,
		},
		'build-types': {
			execution: 'top-level',
			baseCommand: `tsx <rootDir>/internal/scripts/typecheck.ts`,
			cache: {
				inputs: {
					include: ['<allWorkspaceDirs>/**/*.{ts,tsx}', '<allWorkspaceDirs>/tsconfig.json'],
					exclude: ['<allWorkspaceDirs>/dist*/**/*', '<allWorkspaceDirs>/api/**/*'],
				},
				outputs: ['<allWorkspaceDirs>/*.tsbuildinfo', '<allWorkspaceDirs>/.tsbuild/**/*'],
			},
			runsAfter: {
				'refresh-assets': {},
			},
		},
		'build-api': {
			execution: 'independent',
			cache: {
				inputs: ['.tsbuild/**/*.d.ts', 'tsconfig.json'],
				outputs: ['api/**/*'],
			},
			runsAfter: {
				'build-types': {
					// Because build-types is top level, if usesOutput were set to true every
					// build-api task would depend on all the .tsbuild files in the whole
					// repo. So we set this to false and configure it to use only the
					// local .tsbuild files
					usesOutput: false,
				},
			},
		},
		'build-i18n': {
			execution: 'independent',
			cache: {
				inputs: ['<rootDir>/public/tla/locales/*.json'],
				outputs: ['<rootDir>/public/tla/locales-compiled/*.json'],
			},
		},
		'api-check': {
			execution: 'top-level',
			baseCommand: `tsx <rootDir>/internal/scripts/api-check.ts`,
			runsAfter: { 'build-api': {} },
			cache: {
				inputs: [`<rootDir>/packages/*/api/public.d.ts`],
			},
		},
	},
} satisfies LazyConfig

export default config
