import { actions as aaveV3Actions } from '@infinit-xyz/aave-v3/actions'
import { actions as tokenActions } from '@infinit-xyz/token/actions'
import { actions as uniswapV3Actions } from '@infinit-xyz/uniswap-v3/actions'

import { PROTOCOL_MODULE } from '@enums/module'
import type { ModuleAction } from './protocol-module.type'

export const protocolModules = {
  [PROTOCOL_MODULE.token]: {
    key: PROTOCOL_MODULE.token,
    name: 'Token',
    description: 'Token',
    actions: tokenActions,
    libPath: '@infinit-xyz/token',
  },
  [PROTOCOL_MODULE.aave_v3]: {
    key: PROTOCOL_MODULE.aave_v3,
    name: 'Aave V3',
    description: 'Aave V3',
    actions: aaveV3Actions,
    libPath: '@infinit-xyz/aave-v3',
  },
  [PROTOCOL_MODULE.uniswap_v3]: {
    key: PROTOCOL_MODULE.uniswap_v3,
    name: 'Uniswap V3',
    description: 'Uniswap V3',
    actions: uniswapV3Actions,
    libPath: '@infinit-xyz/uniswap-v3',
  },
} satisfies Record<PROTOCOL_MODULE, ModuleAction>
