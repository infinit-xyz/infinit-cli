import { Wallet } from '@ethereumjs/wallet'
import fs from 'fs'
import type { Hex } from 'viem'

import { accounts, config } from '@classes'
import { notDuplicatedAccountIdPrompt, passwordWithConfirmPrompt } from '@commands/account/prompt'
import { chalkInfo } from '@constants/chalk'
import { customErrorLog } from '@errors/log'
import { getAccountsFolderPath } from '@utils/account'
import { sendOffChainEvent } from '@utils/analytics'
import { getProjectChainInfo } from '@utils/config'
import { ensureAccessibilityAtPath } from '@utils/files'

export const handleGenerateAccount = async (accountId?: string) => {
  try {
    const projectConfig = config.getProjectConfig()

    // 1. prompt account ID
    const validAccountId = await notDuplicatedAccountIdPrompt(accountId)

    // 2. ensure account file is writable
    const accountsFolderPath = getAccountsFolderPath()
    ensureAccessibilityAtPath(accountsFolderPath, fs.constants.W_OK)

    // 3. prompt password
    const password = await passwordWithConfirmPrompt()

    // 4. generate wallet
    console.log('Generating a new private key...')
    const wallet = Wallet.generate()

    const privateKey = wallet.getPrivateKeyString() as Hex
    // 5. create account
    const account = await accounts.save(validAccountId, privateKey, password)

    // 6. chainInfo
    const chainInfo = getProjectChainInfo()

    const walletAddress = '0x' + account.keystore.address

    console.log(`Generate your account successfully with the id ${chalkInfo(validAccountId)}`)
    console.log(`Wallet address: ${chalkInfo(walletAddress)}`)
    console.log('\n')
    console.log(
      `Please transfer ${chainInfo.nativeCurrency.symbol} to the address ${chalkInfo(walletAddress)} account on ${chalkInfo(chainInfo.name)} blockchain to cover gas fees.`,
    )

    if (projectConfig.allow_analytics) {
      sendOffChainEvent({ action: 'account generate', payload: { walletAddress } })
    }
  } catch (error) {
    console.error(customErrorLog(error as Error))
  }
}
