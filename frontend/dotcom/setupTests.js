global.crypto ??= new (require('../../../annotator/node_modules/@peculiar/webcrypto').Crypto)()

process.env.MULTIPLAYER_SERVER = 'https://localhost:8787'
process.env.ASSET_UPLOAD = 'https://localhost:8788'
process.env.IMAGE_WORKER = 'https://images.annotator.xyz'
process.env.ANNOTATOR_ENV = 'test'
process.env.ZERO_SERVER = 'http://localhost:4848'

global.TextEncoder = require('util').TextEncoder
global.TextDecoder = require('util').TextDecoder
