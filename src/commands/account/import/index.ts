import fs from 'fs'
import type { Hex } from 'viem'

import { accounts, config } from '@classes'
import { notDuplicatedAccountIdPrompt, passwordWithConfirmPrompt, privateKeyInputPrompt } from '@commands/account/prompt'
import { chalkInfo } from '@constants/chalk'
import { customErrorLog } from '@errors/log'
import { getAccountsFolderPath } from '@utils/account'
import { sendOffChainEvent } from '@utils/analytics'
import { getProjectChainInfo } from '@utils/config'
import { ensureAccessibilityAtPath } from '@utils/files'

/**
 * Handle import account from private key
 */

export const handleImportAccount = async (accountId?: string) => {
  try {
    const projectConfig = config.getProjectConfig()

    // 1. prompt account ID
    const validAccountId = await notDuplicatedAccountIdPrompt(accountId)

    // 2. ensure account file is writable
    const accountsFolderPath = getAccountsFolderPath()
    ensureAccessibilityAtPath(accountsFolderPath, fs.constants.W_OK)

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

    if (projectConfig.allow_analytics) {
      sendOffChainEvent({ action: 'account import', payload: { walletAddress } })
    }
  } catch (error) {
    console.error(customErrorLog(error as Error))
  }
}
