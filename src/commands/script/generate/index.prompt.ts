import type { ProtocolModuleActionKey } from '@commands/script/generate/index.type'
import { PromptWrapper } from '@commons/prompt-wrapper'
import type { ModuleAction } from '@constants/protocol-module.type'
import { select } from '@inquirer/prompts'

export const actionSelectPrompt = (moduleAction: ModuleAction): Promise<ProtocolModuleActionKey | undefined> => {
  return PromptWrapper(select, {
    message: 'Select an action to generate',
    choices: Object.entries(moduleAction.actions).map(([key, { name }]) => ({ name: name, value: key as ProtocolModuleActionKey })),
  })
}
