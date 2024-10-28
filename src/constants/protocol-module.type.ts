import type { PROTOCOL_MODULE } from '@enums/module'
import type { AaveV3ContractVerifier } from '@infinit-xyz/aave-v3/utils'
import type { InfinitActionRecord } from '@infinit-xyz/core'
import type { TokenContractVerifier } from '@infinit-xyz/token/utils'
import type { UniswapV3ContractVerifier } from '@infinit-xyz/uniswap-v3/utils'
import type { dependencies } from 'package.json'

export type ModuleAction = {
  key: PROTOCOL_MODULE
  name: string
  description: string
  actions: InfinitActionRecord
  libPath: keyof typeof dependencies
  Verifier: typeof TokenContractVerifier | typeof AaveV3ContractVerifier | typeof UniswapV3ContractVerifier
}
