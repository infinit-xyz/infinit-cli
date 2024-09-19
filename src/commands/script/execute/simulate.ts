import type { ChainInfo } from '@constants/chains'
import type { Action, InfinitCache } from '@infinit-xyz/core'
import type { CallbackKeys, CallbackParams, InfinitCallback } from '@infinit-xyz/core/types/callback'
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
) => {
  let stopServer: (() => Promise<void>) | undefined = undefined

  try {
    // create fork server with anvil and prool (with 1 pool)
    const server = createServer({
      instance: anvil({
        chainId: Number(chainInfo.chainId),
        forkUrl: chainInfo.rpcList[0],
      }),
      limit: 1, // force to have only 1 pool since we are going to run 1 consequently action.
      port: FORK_CHAIN_PORT,
    })

    // start the prool server
    stopServer = await server.start()

    spinner.start(getSpinnerProgressText(action.name, 0))

    // initialize test client and public client that connected to the fork chain.
    const testClient = createTestClient({
      mode: 'anvil',
      chain: chainInfo.viemChainInstance,
      transport: http(FORK_CHAIN_URL, { timeout: 60_000 }),
    })

    const publicClient = createPublicClient({ chain: chainInfo.viemChainInstance, transport: http(FORK_CHAIN_URL) })

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

    const callback: InfinitCallback = async (key, value) => {
      await match<CallbackKeys>(key)
        .with('txConfirmed', async () => {
          const parsedValue = value as CallbackParams['txConfirmed']

          const txReceipt = await publicClient.getTransactionReceipt({ hash: parsedValue.txHash })

          totalGasUsed += txReceipt.gasUsed
          ++txCount

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

    const simulatedGasPrice = await publicClient.getGasPrice()
    const totalGasCost = totalGasUsed * simulatedGasPrice
    const gasCurrencyDecimals = BigInt(10) ** BigInt(chainInfo.nativeCurrency.decimals)

    // log data from simulation
    spinner.info(`Total Transactions: ${txCount}`)
    spinner.info(`Gas Used: ${totalGasUsed} gas`)
    spinner.info(`Simulate Gas Price: ${simulatedGasPrice / BigInt(1e9)} gwei`)
    spinner.info(`Estimated Cost: ${Number(totalGasCost) / Number(gasCurrencyDecimals)} ${chainInfo.nativeCurrency.symbol}`)

    console.log()
  } catch (error) {
    spinner.fail('Simulate failed')

    throw error
  } finally {
    if (stopServer) {
      await stopServer()
    }
  }
}
