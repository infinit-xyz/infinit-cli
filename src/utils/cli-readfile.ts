import path from 'path'

import { readFileSync } from 'fs'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export const cliReadFile = (filePath: string): string => {
  return readFileSync(path.join(__dirname, filePath), 'utf-8')
}
