import { DATA_FOLDER, accounts } from '@classes'
import { notDuplicatedAccountIdPrompt, passwordWithConfirmPrompt, privateKeyInputPrompt } from '@commands/account/prompt'
import { chalkError, chalkInfo } from '@constants/chalk'
import { getProjectChainInfo } from '@utils/config'
import { ensureAccessibilityAtPath } from '@utils/files'
import fs from 'fs'
import path from 'path'
import type { Hex } from 'viem'

/**
 * Handle import account from private key
 */

export const handleImportAccount = async (accountId?: string) => {
  try {
    // 1. prompt account ID
    const validAccountId = await notDuplicatedAccountIdPrompt(accountId)

    // 2. ensure account file is writable
    const accountFilePath = path.join(DATA_FOLDER, 'accounts')
    ensureAccessibilityAtPath(accountFilePath, fs.constants.W_OK)

    // 3. prompt private key
    const privateKey = (await privateKeyInputPrompt()) as Hex

    // 4. prompt password
    const password = await passwordWithConfirmPrompt()

    // 5. create account
    const account = await accounts.save(validAccountId, privateKey, password)

    // 6. chainInfo
    const chainInfo = getProjectChainInfo()

    const walletAddress = '0x' + account.keystore.address

    console.log(`Import your account successfully with the id ${chalkInfo(validAccountId)}`)
    console.log(`Wallet address: ${chalkInfo(walletAddress)}`)
    console.log('\n')
    console.log(
      `Please transfer ${chainInfo.nativeCurrency.symbol} to the address ${chalkInfo(walletAddress)} account on ${chalkInfo(chainInfo.name)} blockchain to cover gas fees.`,
    )
  } catch (error) {
    console.error(chalkError(error))
  }
}
