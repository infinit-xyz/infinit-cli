import { PromptWrapper } from '@commons/prompt-wrapper'
import { select } from '@inquirer/prompts'

export const scriptFileNamePrompt = async (fileNames: string[]): Promise<string | undefined> => {
  const filteredFileNames = fileNames.filter((v) => v.endsWith('.ts'))
  if (filteredFileNames.length === 0) return undefined

  return await PromptWrapper(select, {
    message: 'Select script file',
    choices: filteredFileNames.map((v) => ({ name: v, value: v })),
  })
}
