// This sets up some mutually exclusive environment flags

const ANNOTATOR_ENV = process.env.ANNOTATOR_ENV
if (!ANNOTATOR_ENV) {
	throw new Error('ANNOTATOR_ENV must be set')
}

/**
 * True if the app is running at staging.annotator.com only.
 */
export const isStagingEnv = ANNOTATOR_ENV === 'staging'
/**
 * True if the app is running in a preview environment that is not staging.annotator.com, e.g. a PR deploy.
 */
export const isPreviewEnv = ANNOTATOR_ENV === 'preview'
/**
 * True if the app is running at www.annotator.com only.
 */
export const isProductionEnv = ANNOTATOR_ENV === 'production'
/**
 * True if the app is running in a development environment, e.g. localhost.
 */
export const isDevelopmentEnv = ANNOTATOR_ENV === 'development'

/**
 * The current environment, one of 'staging', 'preview', or 'production'.
 * These are mutually exclusive.
 *
 * - staging: staging.annotator.com
 * - preview: any PR deploy or other preview deploy from vercel
 * - production: www.annotator.com
 * - development: localhost
 *
 */
export const env = ANNOTATOR_ENV as 'staging' | 'preview' | 'production' | 'development'
