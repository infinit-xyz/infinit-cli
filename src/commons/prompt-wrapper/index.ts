import type { Prompt } from '@inquirer/type'

import { injectedConsole } from '@classes/InjectedConsole/InjectedConsole'
import type { Validation } from '@classes/Validation/Validation'
import { chalkError } from '@constants/chalk'

export const PromptWrapper = async <V extends string, C extends object>(
  prompt: Prompt<V, C>,
  config: Parameters<Prompt<V, C>>[0],
  context?: Parameters<Prompt<V, C>>[1],
): Promise<V | undefined> => {
  const { inputStream, outputStream } = injectedConsole.getCurrentConsole()

  const newContext = {
    ...(context as unknown as object),
    input: inputStream,
    output: outputStream,
  }

  try {
    const result = await prompt(config, newContext)
    return result
  } catch (error) {
    // biome-ignore lint/suspicious/noExplicitAny: https://github.com/SBoudrias/Inquirer.js/issues/1475#issuecomment-2254625966
    if ((error as any).name === 'ExitPromptError') {
      console.log(chalkError('User force closed the prompt'))
      process.exit(0)
    } else {
      throw error
    }
  }
}

export const ValidatePrompt = async <V extends string, C extends object>(
  prompt: Prompt<V, C>,
  config: Parameters<Prompt<V, C>>[0],
  context?: Parameters<Prompt<V, C>>[1],
  ...validations: Validation[]
): Promise<string | undefined> => {
  const validate = (input: string): string | boolean => {
    for (const validation of validations) {
      const isValid = validation.validate(input)
      if (!isValid) return validation.onValidationErrorText
    }
    return true
  }

  const { inputStream, outputStream } = injectedConsole.getCurrentConsole()

  const newConfig = {
    ...(config as unknown as object),
    validate,
  } as C

  const newContext = {
    ...(context as unknown as object),
    input: inputStream,
    output: outputStream,
  }

  return await PromptWrapper(prompt, newConfig, newContext)
}
