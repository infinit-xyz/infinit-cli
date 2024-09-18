import { PromptWrapper } from '@commons/prompt-wrapper'
import type { ModuleAction } from '@constants/protocol-module.type'
import { select } from '@inquirer/prompts'

export const actionSelectPrompt = (moduleAction: ModuleAction) => {
  return PromptWrapper(select, {
    message: 'Select action',
    choices: Object.keys(moduleAction.actions).map((v) => ({ name: v, value: v })),
  })
}
