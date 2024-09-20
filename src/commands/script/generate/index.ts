import type { InfinitAction } from '@infinit-xyz/core'
import { confirm, select } from '@inquirer/prompts'

import { config } from '@classes'
import { chalkError, chalkInfo } from '@constants/chalk'
import { protocolModules } from '@constants/protocol-module'
import type { PROTOCOL_MODULE } from '@enums/module'
import { ensureCwdRootProject } from '@utils/files'
import type { ProtocolModuleActionKey } from './index.type'
import { getScriptFileDirectory, handleGenerateScriptFile } from './utils'

export const handleGenerateScript = async (actionId?: string) => {
  ensureCwdRootProject()

  // Validate config
  const protocolModule = protocolModules[config.getProjectConfig().protocol_module as PROTOCOL_MODULE]

  if (!protocolModule) {
    throw new Error('Protocol module not supported')
  }

  let actionKey: ProtocolModuleActionKey | undefined = undefined

  if (actionId) {
    if (actionId in protocolModule.actions) actionKey = actionId as ProtocolModuleActionKey
    else console.error(chalkError(`Action ${actionId} not found. Please select your desired action.`))
  }

  // Prompts
  if (!actionKey) {
    actionKey = await select<ProtocolModuleActionKey>({
      message: 'Select an action to generate',
      choices: Object.entries(protocolModule.actions).map(([key, { name }]) => ({ name: name, value: key as ProtocolModuleActionKey })),
    })
  }

  if (!actionKey) {
    throw new Error('ActionKey is required')
  }

  const isConfirm = await confirm({
    message: `Do you want to generate script with action ${chalkInfo(protocolModule.actions[actionKey].name)}?`,
    default: true,
  })

  if (!isConfirm) {
    console.error(chalkError('User denied the confirmation to generate the script.'))
    return
  }

  // File name
  const timestamp = Math.floor(Date.now() / 1000)
  const scriptFileName = `${protocolModule.actions[actionKey].actionClassName}-${timestamp}`

  // Generate file
  const selectedAction: InfinitAction = protocolModule.actions[actionKey] as InfinitAction
  const folderPath = getScriptFileDirectory()
  await handleGenerateScriptFile(selectedAction, actionKey, protocolModule.libPath, scriptFileName, folderPath)

  // Log
  console.log()
  console.log(`⚙ Generate ${chalkInfo(selectedAction.name)} script successfully`)
  console.log()
  console.log(`📁 Checkout ${chalkInfo('src/scripts/' + scriptFileName + '.script.ts')}`)
}
