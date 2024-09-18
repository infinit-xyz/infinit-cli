import { type ChainInfo } from '@constants/chains'
import { chalkInfo } from '@constants/chalk'
import { getAccountsList } from '@utils/account'
import { getProjectChainInfo } from '@utils/config'
import CliTable3 from 'cli-table3'
import fs from 'fs'
import path from 'path'
import { createPublicClient, getAddress, http, type PublicClient } from 'viem'

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
    publicClient = createPublicClient({ chain: chainInfo.viemChainInstance, transport: http(chainInfo.rpcList[0]) })
  } catch (error) {
    console.warn('Warning: Cannot setup public client')
    console.warn(error)
  }

  console.log(`Accounts and balances${chainInfo ? ` on ${chalkInfo(chainInfo?.name)}` : ''}`)

  // read accounts from data folder in (~/.infinit/accounts.json)
  for (const file of accountFiles) {
    // file name will be the <accountId>.json
    const accountId = file.split('.')[0]

    try {
      // read the keystore file
      const keystore = JSON.parse(fs.readFileSync(path.join(accountsFolderPath, file), 'utf-8'))

      const walletAddress = getAddress(`0x${keystore.address}`)

      let walletBalanceDisplayText = '-'
      try {
        if (publicClient && chainInfo) {
          const _walletBalance = await publicClient.getBalance({ address: walletAddress })

          const walletBalance = Number(_walletBalance)
          const walletBalanceDisplay = walletBalance / 10 ** chainInfo.nativeCurrency.decimals

          walletBalanceDisplayText = `${walletBalanceDisplay.toLocaleString(undefined, { maximumFractionDigits: 8 })} ${chainInfo.nativeCurrency.symbol}`
        }
      } catch (error) {
        console.warn('Warning: Cannot get balance')
        console.warn(error)
      }

      // push the account to table
      table.push([accountId, walletAddress, walletBalanceDisplayText])
    } catch (error) {
      console.warn('Something went wrong while reading the account file for account ID:', accountId)
      console.warn(error)
    }
  }

  // Log output as table at the end
  console.log(table.toString())

  return table
}
