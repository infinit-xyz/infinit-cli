import path from 'path'
import { config } from '@classes'

/**
 * Get contract root
 * @returns {string} contractRootPath
 */
export const getContractRoot = (): string => {
  const projectConfig = config.getProjectConfig()

  // replace _ with -
  const protocolModule = projectConfig.protocol_module.replaceAll('_', '-')

  const contractRootPath = path.resolve(process.cwd(), 'node_modules', `@infinit-xyz/${protocolModule}`, 'contracts')

  return contractRootPath
}
