import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'

import { FILE_NAMES } from '@constants'
import { FileNotFoundError } from '@errors/fs'
import type { InfinitConfigSchema } from '@schemas/generated'

/**
 * Get contract root
 * @returns {string} contractRootPath
 */
export const getContractRoot = (): string => {
  const configPath = path.resolve(process.cwd(), 'src', FILE_NAMES.CONFIG)
  if (!fs.existsSync(configPath)) {
    throw new FileNotFoundError(configPath)
  }

  const config = yaml.load(fs.readFileSync(configPath, 'utf-8')) as InfinitConfigSchema

  // replace _ with -
  const protocolModule = config.protocol_module.replaceAll('_', '-')

  const contractRootPath = path.resolve(process.cwd(), 'node_modules', `@infinit-xyz/${protocolModule}`, 'contracts')

  return contractRootPath
}
