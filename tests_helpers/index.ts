import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const BASE_PATH = join(dirname(fileURLToPath(import.meta.url)), './tmp')
