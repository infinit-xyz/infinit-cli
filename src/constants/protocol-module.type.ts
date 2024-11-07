import type { PROTOCOL_MODULE } from '@enums/module'
import type { ActionDetailRecord } from '@infinit-xyz/core'
import type { BaseContractVerifier } from '@infinit-xyz/core/internal'
import type { dependencies } from 'package.json'

export type ModuleAction = {
  key: PROTOCOL_MODULE
  name: string
  description: string
  actions: ActionDetailRecord
  libPath: keyof typeof dependencies
  Verifier: typeof BaseContractVerifier
}
