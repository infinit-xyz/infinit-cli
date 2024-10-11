import fs from 'fs'
import { type PublicClient, createPublicClient, getAddress } from 'viem'
import { mainnet } from 'viem/chains'
import { type MockInstance, afterEach, beforeAll, describe, expect, test, vi } from 'vitest'

import type { ChainInfo } from '@constants/chains'
import { getAccountsList } from '@utils/account'

import { handleListAccounts } from '.'

vi.mock('viem')
vi.mock('@constants/chalk', () => ({
  chalkInfo: vi.fn((v) => v),
}))
vi.mock('@utils/account', async (importOriginal) => {
  const original = await importOriginal<typeof import('@utils/account')>()
  return {
    ...original,
    getAccountsList: vi.fn(),
  }
})
vi.mock('@utils/config', () => ({
  getProjectChainInfo: () =>
    ({
      name: 'Ethereum Mainnet',
      shortName: 'Ethereum',
      chainId: '1',
      viemChain: { name: 'mainnet', instance: mainnet },
      nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    }) as unknown as ChainInfo,
  getProjectRpc: () => 'https://fake-rpc.io',
}))

describe('Command: accounts - list', () => {
  let consoleLogSpy: MockInstance<Console['log']>
  let consoleWarnSpy: MockInstance<Console['warn']>

  beforeAll(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined)
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  test('should list zero local accounts', async () => {
    // mock
    vi.mocked(getAccountsList).mockImplementationOnce(() => ({
      accountFiles: [],
      accountsFolderPath: '',
    }))

    // call function
    const handleListAccountsSpy = vi.fn(handleListAccounts)
    const tableResult = await handleListAccountsSpy()

    // assert
    expect(handleListAccountsSpy).toHaveResolved()
    expect(tableResult).toHaveLength(0)

    expect(consoleLogSpy).toHaveBeenCalledWith(`Found 0 account(s)`)
    expect(consoleLogSpy).toHaveBeenCalledTimes(1)
  })

  describe('accounts >0', () => {
    const mockedAccounts = ['1.json', '2.json', '3.json']

    beforeAll(() => {
      vi.mocked(getAddress).mockImplementation((v) => `0x${v}`)
      vi.mocked(getAccountsList).mockImplementation(() => ({
        accountFiles: mockedAccounts,
        accountsFolderPath: '',
      }))

      vi.spyOn(fs, 'readFileSync').mockReturnValue('')
      vi.spyOn(JSON, 'parse').mockReturnValue({ address: '38a0c07f7288872eb759534af7514960a6fcc1a5' })
    })

    test('should list local accounts', async () => {
      // mock
      vi.mocked(createPublicClient).mockImplementationOnce(
        () =>
          ({
            getBalance: () => 123456n * 10n ** 18n,
          }) as unknown as PublicClient,
      )

      await expect(handleListAccounts()).resolves.toHaveLength(mockedAccounts.length)

      expect(consoleLogSpy).toHaveBeenCalledWith(`Found ${mockedAccounts.length} account(s)`)
      expect(consoleLogSpy).toHaveBeenCalledWith(`Accounts and balances on Ethereum Mainnet`)
      expect(consoleLogSpy).toHaveBeenCalledWith(
        `┌────────────┬──────────────────────────────────────────────┬─────────────┐
│ Account ID │ Address                                      │ Balance     │
│ 1          │ 0x0x38a0c07f7288872eb759534af7514960a6fcc1a5 │ 123,456 ETH │
│ 2          │ 0x0x38a0c07f7288872eb759534af7514960a6fcc1a5 │ 123,456 ETH │
│ 3          │ 0x0x38a0c07f7288872eb759534af7514960a6fcc1a5 │ 123,456 ETH │
└────────────┴──────────────────────────────────────────────┴─────────────┘`,
      )
    })

    test('should handle when createPublicClient failed', async () => {
      try {
        vi.mocked(createPublicClient).mockImplementationOnce(() => {
          throw new Error("Can't create public client")
        })

        await expect(handleListAccounts()).resolves.toHaveLength(mockedAccounts.length)

        expect(consoleWarnSpy).toHaveBeenCalledWith('Warning: Cannot setup public client')

        expect(consoleLogSpy).toHaveBeenCalledWith(
          `┌────────────┬──────────────────────────────────────────────┬─────────┐
│ Account ID │ Address                                      │ Balance │
│ 1          │ 0x0x38a0c07f7288872eb759534af7514960a6fcc1a5 │ -       │
│ 2          │ 0x0x38a0c07f7288872eb759534af7514960a6fcc1a5 │ -       │
│ 3          │ 0x0x38a0c07f7288872eb759534af7514960a6fcc1a5 │ -       │
└────────────┴──────────────────────────────────────────────┴─────────┘`,
        )
      } catch (e) {
        // some weird bug from vitest that doesn't log the error properly in this case
        console.error(`ERROR: ${e}`)
        throw e
      }
    })

    test('should handle when getBalance failed', async () => {
      try {
        const mockError = new Error("Can't get balance")

        vi.mocked(createPublicClient).mockImplementationOnce(
          () =>
            ({
              getBalance: () => {
                throw mockError
              },
            }) as unknown as PublicClient,
        )

        await expect(handleListAccounts()).resolves.toHaveLength(mockedAccounts.length)

        expect(consoleWarnSpy).toHaveBeenCalledWith('Warning: Cannot get balance')

        expect(consoleLogSpy).toHaveBeenCalledWith(
          `┌────────────┬──────────────────────────────────────────────┬─────────┐
│ Account ID │ Address                                      │ Balance │
│ 1          │ 0x0x38a0c07f7288872eb759534af7514960a6fcc1a5 │ -       │
│ 2          │ 0x0x38a0c07f7288872eb759534af7514960a6fcc1a5 │ -       │
│ 3          │ 0x0x38a0c07f7288872eb759534af7514960a6fcc1a5 │ -       │
└────────────┴──────────────────────────────────────────────┴─────────┘`,
        )
      } catch (e) {
        // some weird bug from vitest that doesn't log the error properly in this case
        console.error(`ERROR: ${e}`)
        throw e
      }
    })
  })
})
