import { GetObjectCommand, ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import assert from 'assert'
import { execSync } from 'child_process'
import * as fs from 'fs'
import { existsSync, readdirSync, writeFileSync } from 'fs'
import path from 'path'
import { PassThrough } from 'stream'
import * as tar from 'tar'
import {
	createGithubDeployment,
	getDeployInfo,
	setWranglerPreviewConfig,
	wranglerDeploy,
} from './lib/deploy'
import { Discord } from './lib/discord'
import { exec } from './lib/exec'
import { REPO_ROOT } from './lib/file'
import { makeEnv } from './lib/makeEnv'
import { nicelog } from './lib/nicelog'

const worker = path.relative(process.cwd(), path.resolve(REPO_ROOT, './apps/dotcom/sync-worker'))
const healthWorker = path.relative(
	process.cwd(),
	path.resolve(REPO_ROOT, './internal/health-worker')
)
const assetUpload = path.relative(
	process.cwd(),
	path.resolve(REPO_ROOT, './apps/dotcom/asset-upload-worker')
)
const imageResize = path.relative(
	process.cwd(),
	path.resolve(REPO_ROOT, './apps/dotcom/image-resize-worker')
)
const dotcom = path.relative(process.cwd(), path.resolve(REPO_ROOT, './apps/dotcom/client'))
const zeroCacheFolder = path.relative(
	process.cwd(),
	path.resolve(REPO_ROOT, './apps/dotcom/zero-cache')
)

const zeroCachePackageJsonPath = path.join(zeroCacheFolder, 'package.json')
const zeroVersion = JSON.parse(fs.readFileSync(zeroCachePackageJsonPath).toString()).dependencies[
	'@rocicorp/zero'
]

const { previewId, sha } = getDeployInfo()

// Do not use `process.env` directly in this script. Add your variable to `makeEnv` and use it via
// `env` instead. This makes sure that all required env vars are present.
const env = makeEnv([
	'ASSET_UPLOAD_SENTRY_DSN',
	'ASSET_UPLOAD',
	'CLERK_SECRET_KEY',
	'CLOUDFLARE_ACCOUNT_ID',
	'CLOUDFLARE_API_TOKEN',
	'DISCORD_DEPLOY_WEBHOOK_URL',
	'DISCORD_FEEDBACK_WEBHOOK_URL',
	'DISCORD_HEALTH_WEBHOOK_URL',
	'GC_MAPS_API_KEY',
	'GH_TOKEN',
	'HEALTH_CHECK_BEARER_TOKEN',
	'HEALTH_WORKER_UPDOWN_WEBHOOK_PATH',
	'IMAGE_WORKER',
	'MULTIPLAYER_SERVER',
	'R2_ACCESS_KEY_ID',
	'R2_ACCESS_KEY_SECRET',
	'RELEASE_COMMIT_HASH',
	'SENTRY_AUTH_TOKEN',
	'SENTRY_CSP_REPORT_URI',
	'SENTRY_DSN',
	'SUPABASE_LITE_ANON_KEY',
	'SUPABASE_LITE_URL',
	'ANNOTATOR_ENV',
	'ANNOTATOR_LICENSE',
	'VERCEL_ORG_ID',
	'VERCEL_PROJECT_ID',
	'VERCEL_TOKEN',
	'VITE_CLERK_PUBLISHABLE_KEY',
	'WORKER_SENTRY_DSN',
	'BOTCOM_POSTGRES_CONNECTION_STRING',
	'BOTCOM_POSTGRES_POOLED_CONNECTION_STRING',
	'DEPLOY_ZERO',
])

const deployZero = env.DEPLOY_ZERO === 'false' ? false : (env.DEPLOY_ZERO as 'flyio' | 'sst')
const flyioAppName = deployZero === 'flyio' ? `${previewId}-zero-cache` : undefined

const clerkJWKSUrl =
	env.ANNOTATOR_ENV === 'production'
		? 'https://clerk.annotator.com/.well-known/jwks.json'
		: 'https://clerk.staging.annotator.com/.well-known/jwks.json'

const discord = new Discord({
	webhookUrl: env.DISCORD_DEPLOY_WEBHOOK_URL,
	shouldNotify: env.ANNOTATOR_ENV === 'production',
	totalSteps: 8,
})

const sentryReleaseName = `${env.ANNOTATOR_ENV}-${previewId ? previewId + '-' : ''}-${sha}`

if (previewId) {
	env.ASSET_UPLOAD = `https://${previewId}-annotator-assets.annotator.workers.dev`
	env.MULTIPLAYER_SERVER = `https://${previewId}-annotator-multiplayer.annotator.workers.dev`
	env.IMAGE_WORKER = `https://${previewId}-images.annotator.xyz`
}

const zeroPushUrl = `${env.MULTIPLAYER_SERVER.replace(/^ws/, 'http')}/app/zero/push`

async function main() {
	assert(
		env.ANNOTATOR_ENV === 'staging' || env.ANNOTATOR_ENV === 'production' || env.ANNOTATOR_ENV === 'preview',
		'ANNOTATOR_ENV must be staging or production or preview'
	)

	await discord.message(`--- **${env.ANNOTATOR_ENV} dotcom deploy pre-flight** ---`)

	await discord.step('setting up deploy', async () => {
		// make sure the annotator .css files are built:
		await exec('yarn', ['lazy', 'prebuild'])

		// link to vercel and supabase projects:
		await vercelCli('link', ['--project', env.VERCEL_PROJECT_ID])
	})

	// deploy pre-flight steps:
	// 1. get the dotcom app ready to go (env vars and pre-build)
	await discord.step('building dotcom app', async () => {
		await createSentryRelease()
		await prepareDotcomApp()
		await uploadSourceMaps()
		await coalesceWithPreviousAssets(`${dotcom}/.vercel/output/static/assets`)
	})

	await discord.step('cloudflare deploy dry run', async () => {
		await deployAssetUploadWorker({ dryRun: true })
		await deployHealthWorker({ dryRun: true })
		await deployTlsyncWorker({ dryRun: true })
		await deployImageResizeWorker({ dryRun: true })
	})

	// --- point of no return! do the deploy for real --- //

	await discord.message(`--- **pre-flight complete, starting real dotcom deploy** ---`)

	// 2. deploy the cloudflare workers:
	await discord.step('deploying asset uploader to cloudflare', async () => {
		await deployAssetUploadWorker({ dryRun: false })
	})
	await discord.step('deploying multiplayer worker to cloudflare', async () => {
		await deployTlsyncWorker({ dryRun: false })
	})
	await discord.step('deploying image resizer to cloudflare', async () => {
		await deployImageResizeWorker({ dryRun: false })
	})
	await discord.step('deploying health worker to cloudflare', async () => {
		await deployHealthWorker({ dryRun: false })
	})

	// 3. deploy the pre-build dotcom app:
	const { deploymentUrl, inspectUrl } = await discord.step(
		'deploying dotcom app to vercel',
		async () => {
			return await deploySpa()
		}
	)

	let deploymentAlias = null as null | string

	if (previewId) {
		const aliasDomain = `${previewId}-preview-deploy.annotator.com`
		await discord.step('aliasing preview deployment', async () => {
			await vercelCli('alias', ['set', deploymentUrl, aliasDomain])
		})

		deploymentAlias = `https://${aliasDomain}`
	}

	nicelog('Creating deployment for', deploymentUrl)
	await createGithubDeployment(env, {
		app: 'dotcom',
		deploymentUrl: deploymentAlias ?? deploymentUrl,
		inspectUrl,
		sha,
	})

	await discord.message(`**Deploy complete!**`)
}

function getZeroUrl() {
	switch (env.ANNOTATOR_ENV) {
		case 'preview': {
			if (deployZero === 'flyio') {
				return `https://${flyioAppName}.fly.dev/`
			} else if (deployZero === 'sst') {
				return `https://${previewId}.zero.annotator.com/`
			} else {
				return 'https://zero-backend-not-deployed.annotator.com'
			}
		}
		case 'staging':
			return 'https://staging.zero.annotator.com/'
		case 'production':
			return 'https://production.zero.annotator.com/'
	}
	return 'https://zero-backend-not-deployed.annotator.com'
}

async function prepareDotcomApp() {
	// pre-build the app:
	await exec('yarn', ['build-app'], {
		env: {
			NEXT_PUBLIC_ANNOTATOR_RELEASE_INFO: `${env.RELEASE_COMMIT_HASH} ${new Date().toISOString()}`,
			ASSET_UPLOAD: env.ASSET_UPLOAD,
			IMAGE_WORKER: env.IMAGE_WORKER,
			MULTIPLAYER_SERVER: env.MULTIPLAYER_SERVER,
			ZERO_SERVER: getZeroUrl(),
			NEXT_PUBLIC_GC_API_KEY: env.GC_MAPS_API_KEY,
			SENTRY_AUTH_TOKEN: env.SENTRY_AUTH_TOKEN,
			SENTRY_ORG: 'annotator',
			SENTRY_PROJECT: 'lite',
			SUPABASE_KEY: env.SUPABASE_LITE_ANON_KEY,
			SUPABASE_URL: env.SUPABASE_LITE_URL,
			ANNOTATOR_ENV: env.ANNOTATOR_ENV,
		},
	})
}

let didUpdateAssetUploadWorker = false
async function deployAssetUploadWorker({ dryRun }: { dryRun: boolean }) {
	const workerId = `${previewId ?? env.ANNOTATOR_ENV}-annotator-assets`
	if (previewId && !didUpdateAssetUploadWorker) {
		await setWranglerPreviewConfig(assetUpload, { name: workerId })
		didUpdateAssetUploadWorker = true
	}

	await wranglerDeploy({
		location: assetUpload,
		dryRun,
		env: env.ANNOTATOR_ENV,
		vars: {
			SENTRY_DSN: env.ASSET_UPLOAD_SENTRY_DSN,
			ANNOTATOR_ENV: env.ANNOTATOR_ENV,
			WORKER_NAME: workerId,
		},
		sentry: {
			project: 'asset-upload-worker',
			authToken: env.SENTRY_AUTH_TOKEN,
		},
	})
}

let didUpdateTlsyncWorker = false
async function deployTlsyncWorker({ dryRun }: { dryRun: boolean }) {
	const workerId = `${previewId ?? env.ANNOTATOR_ENV}-annotator-multiplayer`
	if (previewId) {
		const queueName = `annotator-multiplayer-queue-${previewId}`
		if (!didUpdateTlsyncWorker) {
			await setWranglerPreviewConfig(worker, { name: workerId }, queueName)
			didUpdateTlsyncWorker = true
		}
		if (!dryRun) {
			try {
				await exec('yarn', ['wrangler', 'queues', 'info', queueName], { pwd: worker })
			} catch (_e) {
				await exec('yarn', ['wrangler', 'queues', 'create', queueName], { pwd: worker })
			}
		}
	}
	await exec('yarn', ['workspace', '@annotator/zero-cache', 'migrate', dryRun ? '--dry-run' : null], {
		env: {
			BOTCOM_POSTGRES_POOLED_CONNECTION_STRING: env.BOTCOM_POSTGRES_POOLED_CONNECTION_STRING,
		},
	})
	// Deploy zero after the migrations but before the sync worker
	if (!dryRun && deployZero !== false) {
		await deployZeroBackend()
	}
	await wranglerDeploy({
		location: worker,
		dryRun,
		env: env.ANNOTATOR_ENV,
		vars: {
			SUPABASE_URL: env.SUPABASE_LITE_URL,
			SUPABASE_KEY: env.SUPABASE_LITE_ANON_KEY,
			SENTRY_DSN: env.WORKER_SENTRY_DSN,
			ANNOTATOR_ENV: env.ANNOTATOR_ENV,
			ASSET_UPLOAD_ORIGIN: env.ASSET_UPLOAD,
			WORKER_NAME: workerId,
			CLERK_SECRET_KEY: env.CLERK_SECRET_KEY,
			CLERK_PUBLISHABLE_KEY: env.VITE_CLERK_PUBLISHABLE_KEY,
			BOTCOM_POSTGRES_CONNECTION_STRING: env.BOTCOM_POSTGRES_CONNECTION_STRING,
			BOTCOM_POSTGRES_POOLED_CONNECTION_STRING: env.BOTCOM_POSTGRES_POOLED_CONNECTION_STRING,
			MULTIPLAYER_SERVER: env.MULTIPLAYER_SERVER,
			DISCORD_FEEDBACK_WEBHOOK_URL: env.DISCORD_FEEDBACK_WEBHOOK_URL,
			HEALTH_CHECK_BEARER_TOKEN: env.HEALTH_CHECK_BEARER_TOKEN,
		},
		sentry: {
			project: 'annotator-sync',
			authToken: env.SENTRY_AUTH_TOKEN,
			environment: workerId,
		},
	})
}

let didUpdateImageResizeWorker = false
async function deployImageResizeWorker({ dryRun }: { dryRun: boolean }) {
	const workerId = `${previewId ?? env.ANNOTATOR_ENV}-annotator-image-optimizer`
	const multiplayerServer = previewId
		? `${previewId}-preview-deploy.annotator.com`
		: env.MULTIPLAYER_SERVER
	if (previewId && !didUpdateImageResizeWorker) {
		await setWranglerPreviewConfig(imageResize, {
			name: workerId,
			customDomain: `${previewId}-images.annotator.xyz`,
			serviceBinding: {
				binding: 'SYNC_WORKER',
				service: `${previewId}-annotator-multiplayer`,
			},
		})
		didUpdateImageResizeWorker = true
	}

	await wranglerDeploy({
		location: imageResize,
		dryRun,
		env: env.ANNOTATOR_ENV,
		vars: {
			ANNOTATOR_ENV: env.ANNOTATOR_ENV,
			WORKER_NAME: workerId,
			MULTIPLAYER_SERVER: multiplayerServer,
		},
	})
}

let didUpdateHealthWorker = false
async function deployHealthWorker({ dryRun }: { dryRun: boolean }) {
	if (previewId && !didUpdateHealthWorker) {
		await setWranglerPreviewConfig(healthWorker, { name: `${previewId}-annotator-health` })
		didUpdateHealthWorker = true
	}
	await wranglerDeploy({
		location: healthWorker,
		dryRun,
		env: env.ANNOTATOR_ENV,
		vars: {
			DISCORD_HEALTH_WEBHOOK_URL: env.DISCORD_HEALTH_WEBHOOK_URL,
			HEALTH_WORKER_UPDOWN_WEBHOOK_PATH: env.HEALTH_WORKER_UPDOWN_WEBHOOK_PATH,
		},
	})
}

type ExecOpts = NonNullable<Parameters<typeof exec>[2]>
async function vercelCli(command: string, args: string[], opts?: ExecOpts) {
	return exec(
		'yarn',
		[
			'run',
			'-T',
			'vercel',
			command,
			'--token',
			env.VERCEL_TOKEN,
			'--scope',
			env.VERCEL_ORG_ID,
			'--yes',
			...args,
		],
		{
			...opts,
			env: {
				// specify org id via args instead of via env vars because otherwise it gets upset
				// that there's no project id either
				VERCEL_ORG_ID: env.VERCEL_ORG_ID,
				VERCEL_PROJECT_ID: env.VERCEL_PROJECT_ID,
				...opts?.env,
			},
		}
	)
}

async function deployZeroViaSst() {
	const stage = previewId ? previewId : env.ANNOTATOR_ENV
	await exec('yarn', [
		'sst',
		'secret',
		'set',
		'PostgresConnectionString',
		env.BOTCOM_POSTGRES_CONNECTION_STRING,
		'--stage',
		stage,
	])
	await exec('yarn', ['sst', 'secret', 'set', 'ZeroAuthSecret', clerkJWKSUrl, '--stage', stage])
	await exec('yarn', ['sst', 'secret', 'set', 'ZeroPushUrl', zeroPushUrl, '--stage', stage])
	await exec('yarn', ['sst', 'unlock', '--stage', stage])
	await exec('yarn', ['bundle-schema'], { pwd: zeroCacheFolder })
	await exec('yarn', ['sst', 'deploy', '--stage', stage, '--verbose'])
}

function updateFlyioToml(appName: string): void {
	const tomlTemplate = path.join(zeroCacheFolder, 'flyio.template.toml')
	const flyioTomlFile = path.join(zeroCacheFolder, 'flyio.toml')

	const fileContent = fs.readFileSync(tomlTemplate, 'utf-8')

	const updatedContent = fileContent
		.replace('__APP_NAME', appName)
		.replace('__ZERO_VERSION', zeroVersion)
		.replaceAll('__BOTCOM_POSTGRES_CONNECTION_STRING', env.BOTCOM_POSTGRES_CONNECTION_STRING)
		.replaceAll('__ZERO_PUSH_URL', zeroPushUrl)

	fs.writeFileSync(flyioTomlFile, updatedContent, 'utf-8')
}

async function deployPermissionsToFlyIo() {
	const schemaPath = path.join(REPO_ROOT, 'packages', 'dotcom-shared', 'src', 'tlaSchema.ts')
	const permissionsFile = 'permissions.sql'
	await exec('npx', [
		'zero-deploy-permissions',
		'--schema-path',
		schemaPath,
		'--output-file',
		permissionsFile,
	])
	const result = await exec('psql', [env.BOTCOM_POSTGRES_CONNECTION_STRING, '-f', permissionsFile])
	if (result.toLowerCase().includes('error')) {
		throw new Error('Error deploying permissions to fly.io')
	}
}

async function deployZeroViaFlyIo() {
	if (!flyioAppName) {
		throw new Error('Fly.io app name is not defined')
	}
	updateFlyioToml(flyioAppName)
	const apps = await exec('flyctl', ['apps', 'list', '-o', 'annotator-gb-ltd'])
	if (apps.indexOf(flyioAppName) === -1) {
		await exec('flyctl', ['app', 'create', flyioAppName, '-o', 'annotator-gb-ltd'], {
			pwd: zeroCacheFolder,
		})
	}
	await exec('flyctl', ['deploy', '-a', flyioAppName, '-c', 'flyio.toml'], { pwd: zeroCacheFolder })
	await deployPermissionsToFlyIo()
}

async function deployZeroBackend() {
	if (deployZero === 'flyio') {
		await deployZeroViaFlyIo()
	} else if (deployZero === 'sst') {
		await deployZeroViaSst()
	}
}

async function deploySpa(): Promise<{ deploymentUrl: string; inspectUrl: string }> {
	// both 'staging' and 'production' are deployed to vercel as 'production' deploys
	// in separate 'projects'
	const prod = env.ANNOTATOR_ENV !== 'preview'
	const out = await vercelCli('deploy', ['--prebuilt', ...(prod ? ['--prod'] : [])], {
		pwd: dotcom,
	})

	const previewURL = out.match(/Preview: (https:\/\/\S*)/)?.[1]
	const inspectUrl = out.match(/Inspect: (https:\/\/\S*)/)?.[1]
	const productionURL = out.match(/Production: (https:\/\/\S*)/)?.[1]
	const deploymentUrl = previewURL ?? productionURL

	if (!deploymentUrl) {
		throw new Error('Could not find deployment URL in vercel output ' + out)
	}
	if (!inspectUrl) {
		throw new Error('Could not find inspect URL in vercel output ' + out)
	}

	return { deploymentUrl, inspectUrl }
}

const sentryEnv = {
	SENTRY_AUTH_TOKEN: env.SENTRY_AUTH_TOKEN,
	SENTRY_ORG: 'annotator',
	SENTRY_PROJECT: 'lite',
}

const execSentry = (command: string, args: string[]) =>
	exec(`yarn`, ['run', '-T', 'sentry-cli', command, ...args], { env: sentryEnv })

async function createSentryRelease() {
	await execSentry('releases', ['new', sentryReleaseName])
	if (!existsSync(`${dotcom}/sentry-release-name.ts`)) {
		throw new Error('sentry-release-name.ts does not exist')
	}
	writeFileSync(
		`${dotcom}/sentry-release-name.ts`,
		`// This file is replaced during deployments to point to a meaningful release name in Sentry.` +
			`// DO NOT MESS WITH THIS LINE OR THE ONE BELOW IT. I WILL FIND YOU\n` +
			`export const sentryReleaseName = '${sentryReleaseName}'`
	)
}

async function uploadSourceMaps() {
	const sourceMapDir = `${dotcom}/dist/assets`

	await execSentry('sourcemaps', ['upload', '--release', sentryReleaseName, sourceMapDir])
	execSync('rm -rf ./.next/static/chunks/**/*.map')
}

const R2_URL = `https://c34edc4e76350954b63adebde86d5eb1.r2.cloudflarestorage.com`
const R2_BUCKET = `dotcom-deploy-assets-cache`

const R2 = new S3Client({
	region: 'auto',
	endpoint: R2_URL,
	credentials: {
		accessKeyId: env.R2_ACCESS_KEY_ID,
		secretAccessKey: env.R2_ACCESS_KEY_SECRET,
	},
})

/**
 * When we run a vite prod build it creates a folder in the output dir called assets in which
 * every file includes a hash of its contents in the filename. These files include files that
 * are 'imported' by the js bundle, e.g. svg and css files, along with the js bundle itself
 * (split into chunks).
 *
 * By default, when we deploy a new version of the app it will replace the previous versions
 * of the files with new versions. This is problematic when we make a new deploy because if
 * existing users have annotator open in tabs while we make the new deploy, they might still try
 * to fetch .js chunks or images which are no longer present on the server and may not have
 * been cached by vercel's CDN in their location (or at all).
 *
 * To avoid this, we keep track of the assets from previous deploys in R2 and include them in the
 * new deploy. This way, if a user has an old version of the app open in a tab, they will still
 * be able to fetch the old assets from the previous deploy.
 */
async function coalesceWithPreviousAssets(assetsDir: string) {
	nicelog('Saving assets to R2 bucket')
	const objectKey = `${previewId ?? env.ANNOTATOR_ENV}/${new Date().toISOString()}+${sha}.tar.gz`
	const pack = tar.c({ gzip: true, cwd: assetsDir }, readdirSync(assetsDir))
	// Need to pipe through a PassThrough here because the tar stream is not a first class node stream
	// and AWS's sdk expects a node stream (it checks `Body instanceof streams.Readable`)
	const Body = new PassThrough()
	pack.pipe(Body)
	await new Upload({
		client: R2,
		params: {
			Bucket: R2_BUCKET,
			Key: objectKey,
			Body,
		},
	}).done()

	nicelog('Extracting previous assets from R2 bucket')
	const { Contents } = await R2.send(
		new ListObjectsV2Command({
			Bucket: R2_BUCKET,
			Prefix: `${previewId ?? env.ANNOTATOR_ENV}/`,
		})
	)
	const [mostRecent, ...others] =
		// filter out the one we just uploaded
		Contents?.filter((obj) => obj.Key !== objectKey).sort(
			(a, b) => (b.LastModified?.getTime() ?? 0) - (a.LastModified?.getTime() ?? 0)
		) ?? []

	if (!mostRecent) {
		nicelog('No previous assets found')
		return
	}

	// Always include the assets from the directly previous build, but also if there
	// have been more deploys in the last six months, include those too.
	const oneMonth = 1000 * 60 * 60 * 24 * 30
	const recentOthers = others.filter(
		(o) => (o.LastModified?.getTime() ?? 0) > Date.now() - oneMonth
	)
	const objectsToFetch = [mostRecent, ...recentOthers]

	nicelog(
		`Fetching ${objectsToFetch.length} previous assets from R2 bucket:`,
		objectsToFetch.map((k) => k.Key)
	)
	for (const obj of objectsToFetch) {
		const { Body } = await R2.send(
			new GetObjectCommand({
				Bucket: R2_BUCKET,
				Key: obj.Key,
			})
		)
		if (!Body) {
			throw new Error(`Could not fetch object ${obj.Key}`)
		}
		// pipe into untar
		// `keep-existing` is important here because we don't want to overwrite the new assets
		// if they have the same name as the old assets becuase they will have different sentry debugIds
		// and it will mess up the inline source viewer on sentry errors.
		const out = tar.x({ cwd: assetsDir, 'keep-existing': true })
		for await (const chunk of Body?.transformToWebStream() as any as AsyncIterable<Uint8Array>) {
			out.write(Buffer.from(chunk.buffer))
		}
		out.end()
	}
}

main().catch(async (err) => {
	// don't notify discord on preview builds
	if (env.ANNOTATOR_ENV !== 'preview') {
		await discord.message(`${Discord.AT_TEAM_MENTION} Deploy failed: ${err.stack}`, {
			always: true,
		})
	}
	console.error(err)
	process.exit(1)
})
