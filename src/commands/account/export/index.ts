import { loadAccountFromPrompt } from '@commons/prompts/accounts'
import { chalkInfo } from '@constants/chalk'
import { AccountValidateError } from '@errors/account'
import { ERROR_MESSAGE_RECORD } from '@errors/errorList'
import { customErrorLog } from '@errors/log'
import { checkIsAccountFound } from '@utils/account'

export const handleExportAccount = async (accountId: string) => {
  try {
    // 1. check if found account
    const isAccountFound = checkIsAccountFound(accountId)
    if (!isAccountFound) {
      const accountNotFoundMsg = ERROR_MESSAGE_RECORD.ACCOUNT_NOT_FOUND(accountId)
      throw new AccountValidateError(accountNotFoundMsg)
    }

    // 2. load account from prompt
    const wallet = await loadAccountFromPrompt(accountId)
    if (!wallet) return

    console.log(`Wallet address: ${chalkInfo(wallet.getAddressString())}`)
    console.log(`Private key: ${chalkInfo(wallet.getPrivateKeyString())}`)
  } catch (error) {
    console.error(customErrorLog(error as Error))
  }
}
