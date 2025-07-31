import { readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const packageDir = join(__dirname, '..')

const content = readFileSync(join(packageDir, '..', 'annotator', 'annotator.css'), 'utf8')
const destination = join(packageDir, 'annotator.css')
writeFileSync(destination, content)
