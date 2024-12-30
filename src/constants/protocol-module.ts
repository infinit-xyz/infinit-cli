import { actions as aaveV3Actions } from '@infinit-xyz/aave-v3/actions'
import { AaveV3ContractVerifier } from '@infinit-xyz/aave-v3/utils'

import { actions as initCapitalActions } from '@infinit-xyz/init-capital/actions'
import { InitCapitalContractVerifier } from '@infinit-xyz/init-capital/utils'

import { actions as tokenActions } from '@infinit-xyz/token/actions'
import { TokenContractVerifier } from '@infinit-xyz/token/utils'

import { actions as uniswapV3Actions } from '@infinit-xyz/uniswap-v3/actions'
import { UniswapV3ContractVerifier } from '@infinit-xyz/uniswap-v3/utils'

import type { ModuleAction } from '@constants/protocol-module.type'
import { PROTOCOL_MODULE } from '@enums/module'

export const protocolModules = {
  [PROTOCOL_MODULE.token]: {
    key: PROTOCOL_MODULE.token,
    name: 'Token',
    description: 'Token',
    actions: tokenActions,
    libPath: '@infinit-xyz/token',
    Verifier: TokenContractVerifier,
  },
  [PROTOCOL_MODULE.aave_v3]: {
    key: PROTOCOL_MODULE.aave_v3,
    name: 'Aave V3',
    description: 'Aave V3',
    actions: aaveV3Actions,
    libPath: '@infinit-xyz/aave-v3',
    Verifier: AaveV3ContractVerifier,
  },
  [PROTOCOL_MODULE.uniswap_v3]: {
    key: PROTOCOL_MODULE.uniswap_v3,
    name: 'Uniswap V3',
    description: 'Uniswap V3',
    actions: uniswapV3Actions,
    libPath: '@infinit-xyz/uniswap-v3',
    Verifier: UniswapV3ContractVerifier,
  },
  [PROTOCOL_MODULE.init_capital]: {
    key: PROTOCOL_MODULE.init_capital,
    name: 'INIT Capital',
    description: 'INIT Capital',
    actions: initCapitalActions,
    libPath: '@infinit-xyz/init-capital',
    Verifier: InitCapitalContractVerifier,
  },
  [PROTOCOL_MODULE.pendle]: {
    key: PROTOCOL_MODULE.pendle,
    name: 'Pendle',
    description: 'Pendle',
    actions: initCapitalActions,
    libPath: '@infinit-xyz/pendle',
    Verifier: InitCapitalContractVerifier,
  },
} satisfies Record<PROTOCOL_MODULE, ModuleAction>
