import type { PROTOCOL_MODULE } from '@enums/module'
import type { InfinitActionRecord } from '@infinit-xyz/core'
import type { BaseContractVerifier } from '@infinit-xyz/core/internal'
import type { dependencies } from 'package.json'

export type ModuleAction = {
  key: PROTOCOL_MODULE
  name: string
  description: string
  actions: InfinitActionRecord
  libPath: keyof typeof dependencies
  Verifier: typeof BaseContractVerifier
}
