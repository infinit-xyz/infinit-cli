import { ValidatePrompt } from '@commons/prompt-wrapper'
import { input } from '@inquirer/prompts'
import { validate } from '@utils/validations'

export const projectPathPrompt = (defaultValue: string) => {
  return ValidatePrompt(input, { message: 'Project Root Directory', default: defaultValue }, undefined, validate.required)
}
