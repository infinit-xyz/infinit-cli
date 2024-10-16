import { accounts } from '@classes'
import { loadAccountFromPrompt } from '@commons/prompts/accounts'
import { chalkError, chalkInfo } from '@constants/chalk'
import { AccountValidateError } from '@errors/account'
import { ERROR_MESSAGE_RECORD } from '@errors/errorList'
import { confirm } from '@inquirer/prompts'
import { checkIsAccountFound } from '@utils/account'
import { ensureAccessibilityAtPath } from '@utils/files'
import fs from 'fs'

export const handleDeleteAccount = async (accountId: string) => {
  // 1. check if found account
  const isAccountFound = checkIsAccountFound(accountId)

  if (!isAccountFound) {
    const accountNotFoundMsg = ERROR_MESSAGE_RECORD.ACCOUNT_NOT_FOUND(accountId)
    throw new AccountValidateError(accountNotFoundMsg)
  }

  const accountFilePath = accounts.getAccountFilePath(accountId)

  // 2. ensure account file is writable
  ensureAccessibilityAtPath(accountFilePath, fs.constants.W_OK)

  // 3. load account from prmopt
  const wallet = await loadAccountFromPrompt(accountId)
  if (!wallet) return

  const isConfirmed = await confirm({ message: `Do you want to delete ${accountId} account?`, default: false })

  if (isConfirmed) {
    console.log(`Delete ${chalkInfo(accountId)} successfully`)
    fs.rmSync(accountFilePath)
  } else {
    console.error(chalkError('User denied the confirmation to delete the account.'))
  }
}
