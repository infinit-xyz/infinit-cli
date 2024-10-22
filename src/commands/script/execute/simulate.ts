import type { ChainInfo } from '@constants/chains'
import type { Action, InfinitCache } from '@infinit-xyz/core'
import type { CallbackKeys, CallbackParams, InfinitCallback } from '@infinit-xyz/core/types/callback'
import { getProjectRpc } from '@utils/config'
import axios from 'axios'
import type { Ora } from 'ora'

import { createServer } from 'prool'
import { anvil } from 'prool/instances'
import { match } from 'ts-pattern'
import { createPublicClient, createTestClient, http, type Address } from 'viem'

const FORK_CHAIN_HOST = 'http://127.0.0.1'
const FORK_CHAIN_PORT = 8545
export const FORK_CHAIN_URL = `${FORK_CHAIN_HOST}:${FORK_CHAIN_PORT}/1`

const getSpinnerProgressText = (actionName: string, txCount: number) => `Simulating ${actionName}... (${txCount} transactions)`

export const simulateExecute = async (
  action: Action,
  registry: Record<string, Address>,
  chainInfo: ChainInfo,
  signerAddresses: Address[],
  spinner: Ora,
  actionInfinitCache?: InfinitCache,
): Promise<{ totalTransactions: number; estimatedCost: number; walletTxCountMapping: Record<Address, number> }> => {
  let stopServer: (() => Promise<void>) | undefined = undefined

  try {
    // create fork server with anvil and prool (with 1 pool)
    const server = createServer({
      instance: anvil({
        chainId: Number(chainInfo.chainId),
        forkUrl: getProjectRpc(),
      }),
      limit: 1, // force to have only 1 pool since we are going to run 1 consequently action.
      port: FORK_CHAIN_PORT,
    })

    // start the prool server
    stopServer = await server.start()

    try {
      // ensure that pool 1 is started
      await axios.get(`${FORK_CHAIN_HOST}:${FORK_CHAIN_PORT}/1/start`)
    } catch (error) {
      throw new Error(`Start fork chain error: ${error}`)
    }

    spinner.start(getSpinnerProgressText(action.name, 0))

    // initialize test client and public client that connected to the fork chain.
    const testClient = createTestClient({
      mode: 'anvil',
      chain: chainInfo.viemChain.instance,
      transport: http(FORK_CHAIN_URL, { timeout: 60_000 }),
    })

    const forkClient = createPublicClient({ chain: chainInfo.viemChain.instance, transport: http(FORK_CHAIN_URL) })

    // impersonate signer accounts and set balance to pay for gas fee.
    for (const signerAddress of signerAddresses) {
      await testClient.impersonateAccount({ address: signerAddress })
      await testClient.setBalance({
        address: signerAddress,
        value: 100n * 10n ** BigInt(chainInfo.nativeCurrency.decimals),
      })
    }

    // setup callback to handle txConfirmed event
    let totalGasUsed = 0n
    let txCount = 0
    let walletTxCountMapping: Record<Address, number> = {}

    const callback: InfinitCallback = async (key, value) => {
      await match<CallbackKeys>(key)
        .with('txConfirmed', async () => {
          const parsedValue = value as CallbackParams['txConfirmed']

          const txReceipt = await forkClient.getTransactionReceipt({ hash: parsedValue.txHash })

          totalGasUsed += txReceipt.gasUsed
          ++txCount

          walletTxCountMapping = { ...walletTxCountMapping, [parsedValue.walletAddress]: (walletTxCountMapping[parsedValue.walletAddress] ?? 0) + 1 }

          spinner.text = getSpinnerProgressText(action.name, txCount)
        })
        .otherwise(() => {})
    }

    // run the action.
    // throw error if fail.
    await action.run(registry, actionInfinitCache, callback)

    spinner.stopAndPersist({
      symbol: '✅',
      text: `Simulation Completed.`,
    })

    // get latest gas price to calculate total gas cost -> use public client to get gas price
    const publicClient = createPublicClient({ chain: chainInfo.viemChain.instance, transport: http(getProjectRpc()) })
    const latestGasPrice = await publicClient.getGasPrice()

    const totalGasCost = totalGasUsed * latestGasPrice
    const gasCurrencyDecimals = BigInt(10) ** BigInt(chainInfo.nativeCurrency.decimals)

    const estimatedCost = Number(totalGasCost) / Number(gasCurrencyDecimals)

    // log data from simulation
    spinner.info(`Total Transactions: ${txCount}`)
    spinner.info(`Gas Used: ${totalGasUsed} gas`)
    spinner.info(`Simulate Gas Price: ${latestGasPrice / BigInt(1e9)} gwei`)
    spinner.info(`Estimated Cost: ${estimatedCost} ${chainInfo.nativeCurrency.symbol}`)

    console.log()

    return { totalTransactions: txCount, estimatedCost, walletTxCountMapping }
  } catch (error) {
    spinner.fail('Simulate failed')

    throw error
  } finally {
    if (stopServer) {
      await stopServer()
    }
  }
}
