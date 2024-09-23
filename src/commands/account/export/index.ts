import { loadAccountFromPrompt } from '@commons/prompts/accounts'
import { chalkInfo } from '@constants/chalk'
import { AccountValidateError } from '@errors/account'
import { customErrorLog } from '@errors/log'
import { checkIsAccountFound } from '@utils/account'

export const handleExportAccount = async (accountId: string) => {
  try {
    // 1. check if found account
    const isAccountFound = checkIsAccountFound(accountId)
    if (!isAccountFound) {
      throw new AccountValidateError(`Account with id ${accountId} not found`)
    }

    // 2. load account from prompt
    const wallet = await loadAccountFromPrompt(accountId)
    if (!wallet) return

    console.log(`Wallet address: ${chalkInfo(wallet.getAddressString())}`)
    console.log(`Private key: ${chalkInfo(wallet.getPrivateKeyString())}`)
  } catch (error) {
    customErrorLog(error as Error)
  }
}
