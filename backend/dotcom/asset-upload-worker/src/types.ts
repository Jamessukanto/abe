import { R2Bucket, WorkerVersionMetadata } from '@cloudflare/workers-types'

export interface Environment {
	// bindings
	UPLOADS: R2Bucket
	CF_VERSION_METADATA: WorkerVersionMetadata

	// environment variables
	ANNOTATOR_ENV: string | undefined
	SENTRY_DSN: string | undefined
	IS_LOCAL: string | undefined
	WORKER_NAME: string | undefined
}
