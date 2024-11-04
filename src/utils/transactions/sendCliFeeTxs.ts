import { INFINIT_CLI_FEE_RECEIVER } from '@constants'
import type { ChainInfo } from '@constants/chains'
import type { InfinitWallet } from '@infinit-xyz/core'
import type { Address } from 'viem'

/**
 * Send transaction to pay for CLI fee
 * @param walletTxCountMapping
 * @param addressSignerWalletRecord
 * @param chainInfo
 * @returns Tx hash of transactions
 */
export const sendCliFeeTxs = async (
  walletTxCountMapping: Record<Address, number>,
  addressSignerWalletRecord: Record<Address, InfinitWallet>,
  chainInfo: ChainInfo,
): Promise<Address[]> => {
  const sendDeploymentFeeCalls = Object.entries(walletTxCountMapping).map(([walletAddress, txCount]) => {
    const client = addressSignerWalletRecord[walletAddress as Address]
    if (!client) {
      throw new Error('Wallet client not found')
    }

    return client.walletClient.sendTransaction({
      to: INFINIT_CLI_FEE_RECEIVER, // The EOA receiving the tokens
      value: BigInt(txCount) * BigInt(chainInfo.feeDisplayAmountPerTx * 10 ** chainInfo.nativeCurrency.decimals),
    })
  })

  const response = await Promise.all(sendDeploymentFeeCalls)
  return response
}
