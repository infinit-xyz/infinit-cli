import { config } from '@classes'
import { protocolModules } from '@constants/protocol-module'
import type { PROTOCOL_MODULE } from '@enums/module'
import type { InfinitActionRecord } from '@infinit-xyz/core'
import Table from 'cli-table3'

export const handleListAction = () => {
  const projectConfig = config.getProjectConfig()
  const protocolModule = protocolModules[projectConfig.protocol_module as PROTOCOL_MODULE]

  if (!protocolModule) {
    throw new Error('Protocol module not supported')
  }

  const actions = protocolModule.actions as InfinitActionRecord

  const table = new Table({
    head: ['Action ID', 'Action Name', 'Signer(s)'],
    style: { head: ['cyan'] },
    chars: { mid: '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
  })

  for (const actionKey of Object.keys(actions)) {
    const action = actions[actionKey]
    table.push([actionKey, action.name, action.signers.join(', ')])
  }

  console.log(table.toString())
  return table
}
