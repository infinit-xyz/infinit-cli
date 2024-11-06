import type { PROTOCOL_MODULE } from '@enums/module'
import type { InfinitActionRecord, InfinitOffChainActionRecord } from '@infinit-xyz/core'
import type { BaseContractVerifier } from '@infinit-xyz/core/internal'
import type { dependencies } from 'package.json'

export type ModuleAction = {
  key: PROTOCOL_MODULE
  name: string
  description: string
  onChainActions: InfinitActionRecord
  offChainActions: InfinitOffChainActionRecord
  libPath: keyof typeof dependencies
  Verifier: typeof BaseContractVerifier
}
