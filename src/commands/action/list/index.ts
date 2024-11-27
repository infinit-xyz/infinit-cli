import { config } from '@classes'
import { protocolModules } from '@constants/protocol-module'
import type { PROTOCOL_MODULE } from '@enums/module'
import { ValidateInputValueError } from '@errors/validate'
import type { ActionDetailRecord } from '@infinit-xyz/core'
import { sendOffChainEvent } from '@utils/analytics'
import Table from 'cli-table3'

export const handleListAction = () => {
  const projectConfig = config.getProjectConfig()
  const protocolModule = protocolModules[projectConfig.protocol_module as PROTOCOL_MODULE]

  if (!protocolModule) {
    throw new ValidateInputValueError('Protocol module not supported')
  }

  const actions = protocolModule.actions as ActionDetailRecord

  const table = new Table({
    head: ['Action ID', 'Action Name', 'Signer(s)'],
    style: { head: ['cyan'] },
    chars: { mid: '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
  })

  for (const actionKey of Object.keys(actions)) {
    const action = actions[actionKey]
    if (action.type === 'on-chain') {
      table.push([actionKey, action.name, action.signers.join(', ')])
    } else if (action.type === 'off-chain') {
      table.push([actionKey, action.name])
    }
  }

  console.log(table.toString())

  if (projectConfig.allow_analytics) {
    sendOffChainEvent({ action: 'action list', payload: {} })
  }

  return table
}
