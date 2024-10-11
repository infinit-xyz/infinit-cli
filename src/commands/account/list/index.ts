import CliTable3 from 'cli-table3'
import fs from 'fs'
import path from 'path'
import { createPublicClient, getAddress, http, type PublicClient } from 'viem'

import { type ChainInfo } from '@constants/chains'
import { chalkInfo } from '@constants/chalk'
import { AccountNotFoundError } from '@errors/account'
import { customErrorLog } from '@errors/log'
import { getAccountIdFromAccountFileName, getAccountsList } from '@utils/account'
import { getProjectChainInfo, getProjectRpc } from '@utils/config'

export const handleListAccounts = async (): Promise<CliTable3.Table> => {
  const { accountFiles, accountsFolderPath } = getAccountsList()

  // setup a table
  const table = new CliTable3({
    head: ['Account ID', 'Address', 'Balance'],
    style: { head: ['cyan'] },
    chars: { mid: '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
  })

  // Log summary
  console.log(`Found ${accountFiles.length} account(s)`)

  if (accountFiles.length === 0) {
    return table
  }

  let publicClient: PublicClient | undefined = undefined
  let chainInfo: ChainInfo | undefined = undefined

  try {
    // Setup public client
    chainInfo = getProjectChainInfo()
    publicClient = createPublicClient({ chain: chainInfo.viemChain.instance, transport: http(getProjectRpc()) })
  } catch (_) {
    console.warn('Warning: Cannot setup public client')
  }

  console.log(`Accounts and balances${chainInfo ? ` on ${chalkInfo(chainInfo?.name)}` : ''}`)

  // read accounts from data folder in (~/.infinit/accounts.json)
  for (const accountFileName of accountFiles) {
    const accountId = getAccountIdFromAccountFileName(accountFileName)

    try {
      // read the keystore file
      const keystore = JSON.parse(fs.readFileSync(path.join(accountsFolderPath, accountFileName), 'utf-8'))

      const walletAddress = getAddress(`0x${keystore.address}`)

      let walletBalanceDisplayText = '-'
      try {
        if (publicClient && chainInfo) {
          const _walletBalance = await publicClient.getBalance({ address: walletAddress })

          const walletBalance = Number(_walletBalance)
          const walletBalanceDisplay = walletBalance / 10 ** chainInfo.nativeCurrency.decimals

          walletBalanceDisplayText = `${walletBalanceDisplay.toLocaleString(undefined, { maximumFractionDigits: 8 })} ${chainInfo.nativeCurrency.symbol}`
        }
      } catch (_) {
        console.warn('Warning: Cannot get balance')
      }

      // push the account to table
      table.push([accountId, walletAddress, walletBalanceDisplayText])
    } catch (_) {
      // should not happen
      const customError = new AccountNotFoundError(`Something went wrong while reading the account file for account ID: ${accountId}`)
      console.error(customErrorLog(customError))
    }
  }

  // Log output as table at the end
  console.log(table.toString())

  return table
}
