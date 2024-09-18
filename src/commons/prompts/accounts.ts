import { accounts } from '@classes'
import { passwordInputPrompt } from '@commands/account/prompt'
import { chalkError, chalkInfo } from '@constants/chalk'
import type { Wallet } from '@ethereumjs/wallet'

const maxAttempts = 3

/**
 * Recursive function to prompt user a password and load the account
 * @param accountId account id
 * @param currentAttempt current attempt
 */
export const loadAccountFromPrompt = async (accountId: string, currentAttempt: number = 0): Promise<Wallet | undefined> => {
  const password = await passwordInputPrompt(`Enter password for ${chalkInfo(accountId)}`)
  //   shouldn't happen
  if (!password) return

  const newAttempt = currentAttempt + 1
  try {
    // if invalid password, accounts.load will throw error
    return await accounts.load(accountId, password)
  } catch (error) {
    // limit to 3 attempts
    if (newAttempt >= maxAttempts) {
      console.log(chalkError(`${error}, Failed to load account ${accountId} after ${maxAttempts} incorrect password attempts`))
      return
    } else {
      console.log(chalkError(`${error}, Please try again`))
    }

    // if invalid password -> retry
    return loadAccountFromPrompt(accountId, newAttempt)
  }
}
