import Table from 'cli-table3'

import { config } from '@classes'
import { protocolModules } from '@constants/protocol-module'
import type { PROTOCOL_MODULE } from '@enums/module'
import { ValidateInputValueError } from '@errors/validate'
import type { InfinitActionRecord, InfinitOffChainActionRecord } from '@infinit-xyz/core'
import { sendOffChainEvent } from '@utils/analytics'

export const handleListAction = () => {
  const projectConfig = config.getProjectConfig()
  const protocolModule = protocolModules[projectConfig.protocol_module as PROTOCOL_MODULE]

  if (!protocolModule) {
    throw new ValidateInputValueError('Protocol module not supported')
  }

  // On-chain actions
  const onChainActions: InfinitActionRecord = protocolModule.actions
  const onChainActionKeys = Object.keys(onChainActions)

  const onChainActiontable = new Table({
    head: ['Action ID', 'Action Name', 'Signer(s)'],
    style: { head: ['cyan'] },
    chars: { mid: '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
  })

  if (onChainActionKeys.length > 0) {
    for (const actionKey of onChainActionKeys) {
      const action = onChainActions[actionKey]
      onChainActiontable.push([actionKey, action.name, action.signers.join(', ')])
    }

    console.log('========== On-chain Action ==========')
    console.log(onChainActiontable.toString())
    console.log() // new line
  }

  // Off-chain actions
  const offChainActions: InfinitOffChainActionRecord = protocolModule.offChainActions
  const offChainActionKeys = Object.keys(offChainActions)

  const offChainActiontable = new Table({
    head: ['Action ID', 'Action Name'],
    style: { head: ['cyan'] },
    chars: { mid: '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
  })

  if (offChainActionKeys.length > 0) {
    for (const actionKey of offChainActionKeys) {
      const action = offChainActions[actionKey]
      offChainActiontable.push([actionKey, action.name])
    }

    console.log('========== Off-chain Action ==========')
    console.log(offChainActiontable.toString())
    console.log() // new line
  }

  if (projectConfig.allow_analytics) {
    sendOffChainEvent({ action: 'action list', payload: {} })
  }

  return { onChainActiontable, offChainActiontable }
}
