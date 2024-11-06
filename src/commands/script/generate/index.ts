import type { InfinitAction } from '@infinit-xyz/core'
import { confirm, select } from '@inquirer/prompts'

import { config } from '@classes'
import { chalkError, chalkInfo } from '@constants/chalk'
import { protocolModules } from '@constants/protocol-module'
import type { PROTOCOL_MODULE } from '@enums/module'
import { ERROR_MESSAGE_RECORD } from '@errors/errorList'
import { ValidateInputValueError } from '@errors/validate'
import { sendOffChainEvent } from '@utils/analytics'
import { ensureCwdRootProject } from '@utils/files'
import type { ProtocolModuleActionKey } from './index.type'
import { getScriptFileDirectory, getUniqueScriptFileName, handleGenerateScriptFile } from './utils'

export const handleGenerateScript = async (actionIdFromInput?: string) => {
  ensureCwdRootProject()

  const projectConfig = config.getProjectConfig()
  // Validate config
  const protocolModule = protocolModules[projectConfig.protocol_module as PROTOCOL_MODULE]

  if (!protocolModule) {
    throw new ValidateInputValueError(ERROR_MESSAGE_RECORD.PROTOCOL_NOT_SUPPORTED)
  }

  let actionKey: ProtocolModuleActionKey | undefined = undefined

  if (actionIdFromInput) {
    if (actionIdFromInput in protocolModule.onChainActions) actionKey = actionIdFromInput as ProtocolModuleActionKey
    else console.error(chalkError(`Action ${actionIdFromInput} not found. Please select your desired action.`))
  }

  // Prompts
  if (!actionKey) {
    actionKey = await select<ProtocolModuleActionKey>({
      message: 'Select an action to generate',
      choices: Object.entries(protocolModule.onChainActions).map(([key, { name }]) => ({ name: name, value: key as ProtocolModuleActionKey })),
    })
  }

  if (!actionKey) {
    throw new ValidateInputValueError('ActionKey is required')
  }

  const isConfirm = await confirm({
    message: `Do you want to generate script with action ${chalkInfo(protocolModule.onChainActions[actionKey].name)}?`,
    default: true,
  })

  if (!isConfirm) {
    console.error(chalkError('User denied the confirmation to generate the script.'))
    return
  }

  const folderPath = getScriptFileDirectory()
  const selectedAction: InfinitAction = protocolModule.onChainActions[actionKey] as InfinitAction

  // File name
  const scriptFileName = getUniqueScriptFileName(selectedAction.actionClassName, folderPath)

  // Generate file
  await handleGenerateScriptFile(selectedAction, actionKey, protocolModule.libPath, scriptFileName, folderPath)

  // Log
  console.log()
  console.log(`⚙ Generate ${chalkInfo(selectedAction.name)} script successfully`)
  console.log()
  console.log(`📁 Checkout ${chalkInfo('src/scripts/' + scriptFileName + '.script.ts')}`)

  if (projectConfig.allow_analytics) {
    sendOffChainEvent({ action: 'script generate', payload: { action: actionKey, module: projectConfig.protocol_module } })
  }
}
