import { chalkInfo } from '@constants/chalk'
import { getAccountsList } from '@utils/account'
import fs from 'fs'
import { type PublicClient, createPublicClient, getAddress } from 'viem'
import { type Mock, type MockInstance, afterEach, beforeAll, describe, expect, test, vi } from 'vitest'
import { handleListAccounts } from './index'

vi.mock('viem')
vi.mock('@utils/account')
vi.mock('@utils/config', () => ({
  getProjectChainInfo: () => ({
    name: 'Ethereum Mainnet',
    rpcList: [],
    nativeCurrency: {
      symbol: 'ETH',
      decimals: 18,
    },
  }),
}))

describe('Command: accounts - list', () => {
  let consoleLogSpy: MockInstance
  let consoleWarnSpy: MockInstance

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
    const handleListSpy = vi.fn(handleListAccounts)
    const tableResult = await handleListSpy()

    // assert
    expect(handleListSpy).toHaveResolved()
    expect(tableResult).toHaveLength(0)

    expect(consoleLogSpy).toHaveBeenCalledWith(`Found 0 account(s)`)
    expect(consoleLogSpy).toHaveBeenCalledTimes(1)
  })

  describe('accounts >0', () => {
    const mockedAccounts = ['1.json', '2.json', '3.json']
    let handleListSpy: Mock<typeof handleListAccounts>

    beforeAll(() => {
      vi.mocked(getAddress).mockImplementation((v) => `0x${v}`)
      vi.mocked(getAccountsList).mockImplementation(() => ({
        accountFiles: mockedAccounts,
        accountsFolderPath: '',
      }))

      vi.spyOn(fs, 'readFileSync').mockReturnValue('')
      vi.spyOn(JSON, 'parse').mockReturnValue({ address: '38a0c07f7288872eb759534af7514960a6fcc1a5' })

      handleListSpy = vi.fn(handleListAccounts)
    })

    test('should list local accounts', async () => {
      // mock
      vi.mocked(createPublicClient).mockImplementationOnce(
        () =>
          ({
            getBalance: () => 123456n * 10n ** 18n,
          }) as unknown as PublicClient,
      )

      // call function
      const tableResult = await handleListSpy()

      // assert
      expect(handleListSpy).toHaveResolved()
      expect(tableResult).toHaveLength(mockedAccounts.length)

      expect(consoleLogSpy).toHaveBeenCalledWith(`Found ${mockedAccounts.length} account(s)`)
      expect(consoleLogSpy).toHaveBeenCalledWith(`Accounts and balances on ${chalkInfo('Ethereum Mainnet')}`)
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
      const mockError = new Error("Can't create public client")

      vi.mocked(createPublicClient).mockImplementationOnce(() => {
        throw mockError
      })

      // call function
      const tableResult = await handleListSpy()

      // assert
      expect(handleListSpy).toHaveResolved()
      expect(tableResult).toHaveLength(mockedAccounts.length)

      expect(consoleWarnSpy).toHaveBeenNthCalledWith(1, 'Warning: Cannot setup public client')
      expect(consoleWarnSpy).toHaveBeenNthCalledWith(2, mockError)

      expect(consoleLogSpy).toHaveBeenCalledWith(
        `┌────────────┬──────────────────────────────────────────────┬─────────┐
│ Account ID │ Address                                      │ Balance │
│ 1          │ 0x0x38a0c07f7288872eb759534af7514960a6fcc1a5 │ -       │
│ 2          │ 0x0x38a0c07f7288872eb759534af7514960a6fcc1a5 │ -       │
│ 3          │ 0x0x38a0c07f7288872eb759534af7514960a6fcc1a5 │ -       │
└────────────┴──────────────────────────────────────────────┴─────────┘`,
      )
    })

    test('should handle when getBalance failed', async () => {
      const mockError = new Error("Can't get balance")

      vi.mocked(createPublicClient).mockImplementationOnce(
        () =>
          ({
            getBalance: () => {
              throw mockError
            },
          }) as unknown as PublicClient,
      )

      // call function
      const tableResult = await handleListSpy()

      // assert
      expect(handleListSpy).toHaveResolved()
      expect(tableResult).toHaveLength(mockedAccounts.length)

      expect(consoleWarnSpy).toHaveBeenNthCalledWith(1, 'Warning: Cannot get balance')
      expect(consoleWarnSpy).toHaveBeenNthCalledWith(2, mockError)

      expect(consoleLogSpy).toHaveBeenCalledWith(
        `┌────────────┬──────────────────────────────────────────────┬─────────┐
│ Account ID │ Address                                      │ Balance │
│ 1          │ 0x0x38a0c07f7288872eb759534af7514960a6fcc1a5 │ -       │
│ 2          │ 0x0x38a0c07f7288872eb759534af7514960a6fcc1a5 │ -       │
│ 3          │ 0x0x38a0c07f7288872eb759534af7514960a6fcc1a5 │ -       │
└────────────┴──────────────────────────────────────────────┴─────────┘`,
      )
    })
  })
})
