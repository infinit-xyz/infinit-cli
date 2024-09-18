import type { CHAIN_ID } from '@enums/chain'
import type { PROTOCOL_MODULE } from '@enums/module'
import type { PACKAGE_MANAGER } from '@enums/package-managers'

export type CreateInput = {
  name?: string
  module?: string
  chain?: string
  deployer?: string
  // importDeployer: boolean
  // customRpc: string
  // customChainId: string
  // customChainName: string
  confirm?: boolean

  useNpm?: boolean
  useYarn?: boolean
  usePnpm?: boolean
  useBun?: boolean

  // Hidden command
  unitTest?: boolean
}

export type CreateParams = {
  projectName: string
  projectDirectory: string
  protocolModule: PROTOCOL_MODULE
  chainId: CHAIN_ID
  packageManager: PACKAGE_MANAGER

  // Hidden command
  isUnitTest?: boolean
}

export type GetProjectNameParams = {
  currentDirectoryFiles: string[]
  currentProjectName?: string
}
