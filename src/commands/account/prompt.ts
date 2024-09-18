import { ValidatePrompt } from '@commons/prompt-wrapper'
import { chalkError } from '@constants/chalk'
import { input, password } from '@inquirer/prompts'
import { checkIsAccountFound } from '@utils/account'
import { validate } from '@utils/validations'

export const accountIdPrompt = () => {
  return ValidatePrompt(input, { message: 'Enter account ID' }, undefined, validate.required)
}

export const privateKeyInputPrompt = async () => {
  while (true) {
    const privateKey = await ValidatePrompt(password, { message: 'Enter private key' }, undefined, validate.required)

    const validation = validate.privatekey
    const isValid = validation.validate(privateKey)
    if (isValid) return privateKey

    console.log(chalkError(validation.onValidationErrorText))
  }
}

export const passwordInputPrompt = (message = 'Enter password') => {
  return ValidatePrompt(password, { message }, undefined, validate.required)
}

/**
 * Prompt for password input when need to validate with confirmed password
 */
export const passwordWithConfirmPrompt = async (): Promise<string> => {
  const password = await passwordInputPrompt('Enter password')
  const confirmedPassword = await passwordInputPrompt('Enter confirm password')

  // it was required, so this should not happen
  if (!password || !confirmedPassword) return ''

  if (password !== confirmedPassword) {
    console.log(chalkError('Password not matched, please try again'))
    await passwordWithConfirmPrompt()
  }

  return password
}

export const notDuplicatedAccountIdPrompt = async (accountId?: string): Promise<string> => {
  const _accountId = accountId ?? (await accountIdPrompt())

  // should not happen
  if (!_accountId) {
    throw new Error('Account ID is required')
  }

  const isDuplicate = checkIsAccountFound(_accountId)
  if (!isDuplicate) return _accountId

  console.log(chalkError(`${_accountId} is duplicated, please try again`))
  return notDuplicatedAccountIdPrompt()
}
