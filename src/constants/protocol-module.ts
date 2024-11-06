import { actions as aaveV3Actions } from '@infinit-xyz/aave-v3/actions'
import { AaveV3ContractVerifier } from '@infinit-xyz/aave-v3/utils'

import { actions as tokenActions } from '@infinit-xyz/token/actions'
import { offChainActions as tokenOffChainActions } from '@infinit-xyz/token/offChainActions'
import { TokenContractVerifier } from '@infinit-xyz/token/utils'

import { actions as uniswapV3Actions } from '@infinit-xyz/uniswap-v3/actions'
import { UniswapV3ContractVerifier } from '@infinit-xyz/uniswap-v3/utils'

import { PROTOCOL_MODULE } from '@enums/module'
import type { ModuleAction } from './protocol-module.type'

export const protocolModules = {
  [PROTOCOL_MODULE.token]: {
    key: PROTOCOL_MODULE.token,
    name: 'Token',
    description: 'Token',
    onChainActions: tokenActions,
    offChainActions: tokenOffChainActions,
    libPath: '@infinit-xyz/token',
    Verifier: TokenContractVerifier,
  },
  [PROTOCOL_MODULE.aave_v3]: {
    key: PROTOCOL_MODULE.aave_v3,
    name: 'Aave V3',
    description: 'Aave V3',
    onChainActions: aaveV3Actions,
    offChainActions: {},
    libPath: '@infinit-xyz/aave-v3',
    Verifier: AaveV3ContractVerifier,
  },
  [PROTOCOL_MODULE.uniswap_v3]: {
    key: PROTOCOL_MODULE.uniswap_v3,
    name: 'Uniswap V3',
    description: 'Uniswap V3',
    onChainActions: uniswapV3Actions,
    offChainActions: {},
    libPath: '@infinit-xyz/uniswap-v3',
    Verifier: UniswapV3ContractVerifier,
  },
} satisfies Record<PROTOCOL_MODULE, ModuleAction>
