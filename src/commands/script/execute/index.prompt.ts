import { PromptWrapper } from '@commons/prompt-wrapper'
import { select } from '@inquirer/prompts'
import { isValidTypescriptFileName } from '@utils/string'

export const scriptFileNamePrompt = async (fileNames: string[]): Promise<string | undefined> => {
  const filteredFileNames = fileNames.filter((v) => isValidTypescriptFileName(v))
  if (filteredFileNames.length === 0) return undefined

  return await PromptWrapper(select, {
    message: 'Select script file',
    choices: filteredFileNames.map((v) => ({ name: v, value: v })),
  })
}
