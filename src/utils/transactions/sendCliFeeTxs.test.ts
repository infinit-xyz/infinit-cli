import { INFINIT_CLI_FEE_RECEIVER } from '@constants'
import { CHAINS } from '@constants/chains'
import { CHAIN_ID } from '@enums/chain'
import { InfinitWallet } from '@infinit-xyz/core'
import { sendCliFeeTxs } from '@utils/transactions/sendCliFeeTxs'
import type { Address } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { beforeAll, describe, expect, test, vi } from 'vitest'

const chainInfo = CHAINS[CHAIN_ID.Ethereum]

const mockPrivateKey = '0xb720797817b4778fcdf5daa603973dec39acee7cecb516d44f59e67682384947'
const mockUserAddress = '0x3cf4d050143c776afcdf1ee7a252ab16c3f231f7'

const WALLET_TX_COUNT_MAPPING = {
  [mockUserAddress]: 2,
}

describe('sendCliFeeTxs', () => {
  let infinitWallet: InfinitWallet

  let addressSignerWalletRecord: Record<Address, InfinitWallet>

  beforeAll(() => {
    const privateKeyAccount = privateKeyToAccount(mockPrivateKey)
    infinitWallet = new InfinitWallet(chainInfo.viemChain.instance, chainInfo.rpcList[0], privateKeyAccount)
  })

  test('should get tx hash responses successfully', async () => {
    // mock tx hash response
    const mockSendTransaction = vi.fn().mockResolvedValue('0x1234567890')
    addressSignerWalletRecord = {
      [mockUserAddress]: {
        ...infinitWallet,
        walletClient: {
          ...infinitWallet.walletClient,
          sendTransaction: mockSendTransaction,
        },
      },
    }
    const txHashResponses = await sendCliFeeTxs(WALLET_TX_COUNT_MAPPING, addressSignerWalletRecord, chainInfo)

    expect(txHashResponses).toStrictEqual(['0x1234567890'])
    expect(mockSendTransaction).toHaveBeenCalledWith({
      to: INFINIT_CLI_FEE_RECEIVER,
      value: BigInt(WALLET_TX_COUNT_MAPPING[mockUserAddress]) * BigInt(chainInfo.feeDisplayAmountPerTx * 10 ** chainInfo.nativeCurrency.decimals),
    })
  })

  test('should throw error if wallet client not found', async () => {
    addressSignerWalletRecord = {}

    await expect(sendCliFeeTxs(WALLET_TX_COUNT_MAPPING, addressSignerWalletRecord, chainInfo)).rejects.toThrowError('Wallet client not found')
  })
})
