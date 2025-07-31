export const cspDirectives: { [key: string]: string[] } = {
	'default-src': [`'self'`],
	'connect-src': [
		`'self'`,
		`ws:`,
		`wss:`,
		'blob:',
		'data:',
		'http://localhost:8788',
		`https://*.annotator.xyz`,
		`https://cdn.annotator.com`,
		`https://*.annotator.workers.dev`,
		`https://*.ingest.sentry.io`,
		`https://*.ingest.us.sentry.io`,
		'https://*.analytics.google.com',
		// for thumbnail server
		'http://localhost:5002',
		'https://*.clerk.accounts.dev',
		'https://clerk.annotator.com',
		'https://clerk.staging.annotator.com',
		// zero
		'https://*.zero.annotator.com',
		'https://zero.annotator.com',
		'http://localhost:4848',
		'https://analytics.annotator.com',
		'https://stats.g.doubleclick.net',
		'https://*.google-analytics.com',
		'https://api.reo.dev',
		'https://fonts.googleapis.com',
	],
	'font-src': [`'self'`, `https://fonts.googleapis.com`, `https://fonts.gstatic.com`, 'data:'],
	'frame-src': [`'self'`, `https:`],
	'img-src': [`'self'`, `http:`, `https:`, `data:`, `blob:`],
	'media-src': [`'self'`, `http:`, `https:`, `data:`, `blob:`],
	'script-src': [
		`'self'`,
		'https://challenges.cloudflare.com',
		'https://*.clerk.accounts.dev',
		'https://clerk.annotator.com',
		'https://clerk.staging.annotator.com',
		// embeds that have scripts
		'https://gist.github.com',
		'https://www.googletagmanager.com',
		'https://analytics.annotator.com',
		'https://static.reo.dev',
	],
	'worker-src': [`'self'`, `blob:`],
	'style-src': [`'self'`, `'unsafe-inline'`, `https://fonts.googleapis.com`],
	'style-src-elem': [
		`'self'`,
		`'unsafe-inline'`,
		`https://fonts.googleapis.com`,
		// embeds that have styles
		'https://github.githubassets.com',
	],
	'report-uri': [process.env.SENTRY_CSP_REPORT_URI ?? ``],
}

export const csp = Object.keys(cspDirectives)
	.map((directive) => `${directive} ${cspDirectives[directive].join(' ')}`)
	.join('; ')

export const cspDev = Object.keys(cspDirectives)
	.filter((key) => key !== 'report-uri')
	.map((directive) => `${directive} ${cspDirectives[directive].join(' ')}`)
	.join('; ')
