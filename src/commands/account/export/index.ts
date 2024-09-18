import { loadAccountFromPrompt } from '@commons/prompts/accounts'
import { chalkError, chalkInfo } from '@constants/chalk'
import { checkIsAccountFound } from '@utils/account'

export const handleExportAccount = async (accountId: string) => {
  try {
    // 1. check if found account
    const isAccountFound = checkIsAccountFound(accountId)
    if (!isAccountFound) {
      throw new Error(`Account with id ${accountId} not found`)
    }

    // 2. load account from prompt
    const wallet = await loadAccountFromPrompt(accountId)
    if (!wallet) return

    console.log(`Wallet address: ${chalkInfo(wallet.getAddressString())}`)
    console.log(`Private key: ${chalkInfo(wallet.getPrivateKeyString())}`)
  } catch (error) {
    console.log(chalkError(error))
  }
}
