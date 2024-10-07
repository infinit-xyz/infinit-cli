import { ValidatePrompt } from '@commons/prompt-wrapper'
import { input, password } from '@inquirer/prompts'
import { validate } from '@utils/validations'

export const explorerNamePrompt = async (): Promise<string> => {
  return (await ValidatePrompt(
    input,
    {
      message: 'Enter the block explorer name',
    },
    undefined,
    validate.required,
  ))!
}

export const explorerApiUrlPrompt = async (): Promise<string> => {
  return (await ValidatePrompt(
    input,
    {
      message: 'Enter the block explorer API URL',
    },
    undefined,
    validate.required,
    validate.url,
  ))!
}

export const explorerApiKeyPrompt = async (): Promise<string> => {
  return (await ValidatePrompt(
    password,
    {
      message: 'Enter the block explorer API key',
    },
    undefined,
    validate.required,
  ))!
}

export const explorerUrlPrompt = async (): Promise<string> => {
  return (await ValidatePrompt(
    input,
    {
      message: 'Enter the block explorer URL',
    },
    undefined,
    validate.required,
    validate.url,
  ))!
}
