import fs from 'fs'
import path from 'path'
import type { Address } from 'viem'

import { FILE_NAMES } from '@constants'
import { FileNotFoundError } from '@errors/fs'

/**
 * Get the project registry
 * @returns {Record<string, Address>} registry
 */
export const readProjectRegistry = () => {
  const registryPath = path.resolve(process.cwd(), 'src', FILE_NAMES.REGISTRY)
  if (!fs.existsSync(registryPath)) {
    throw new FileNotFoundError(registryPath)
  }

  const data = fs.readFileSync(registryPath, 'utf-8')
  return { registryPath, registry: JSON.parse(data.toString()) as Record<string, Address> }
}
