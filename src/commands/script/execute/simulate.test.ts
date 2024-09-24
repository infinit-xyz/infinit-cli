import type { ChainInfo } from '@constants/chains'
import type { Action, InfinitCache } from '@infinit-xyz/core'
import type { Ora } from 'ora'
import { createServer } from 'prool'
import { anvil } from 'prool/instances'
import { type Address, type TestActions, createPublicClient, createTestClient } from 'viem'
import type { Mock } from 'vitest'
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'

import axios, { isAxiosError } from 'axios'
import { simulateExecute } from './simulate'

vi.mock('prool', () => ({
  createServer: vi.fn(),
}))

vi.mock('prool/instances', () => ({
  anvil: vi.fn(),
}))

vi.mock('viem', () => ({
  createPublicClient: vi.fn(),
  createTestClient: vi.fn(),
  http: vi.fn(),
}))

vi.mock('axios')

describe('simulateExecute', () => {
  let action: Action
  let registry: Record<string, Address>
  let chainInfo: ChainInfo
  let signerAddresses: Address[]
  let spinner: Ora
  let actionInfinitCache: InfinitCache | undefined
  let startMockServer: () => void
  let mockTestClient: Pick<TestActions, 'impersonateAccount' | 'setBalance'>

  beforeAll(() => {
    vi.spyOn(console, 'log').mockImplementation(() => undefined)
  })

  beforeEach(() => {
    action = {
      name: 'mockAction',
      run: vi.fn(),
    } as unknown as Action

    registry = {
      address1: '0x1234',
    }
    chainInfo = {
      chainId: '1',
      rpcList: ['https://fakerpc.io/rpc'],
      viemChainInstance: {},
      nativeCurrency: {
        decimals: 18,
        symbol: 'ETH',
      },
    } as unknown as ChainInfo

    signerAddresses = ['0x123', '0x3456']
    spinner = {
      start: vi.fn(),
      stopAndPersist: vi.fn(),
      fail: vi.fn(),
      info: vi.fn(),
      text: '',
    } as unknown as Ora

    actionInfinitCache = { name: 'mockAction' }

    startMockServer = vi.fn().mockResolvedValue(vi.fn())
    ;(createServer as Mock).mockReturnValue({ start: startMockServer })

    mockTestClient = {
      impersonateAccount: vi.fn(),
      setBalance: vi.fn(),
    }
    const publicClient = {
      getTransactionReceipt: vi.fn().mockResolvedValue({ gasUsed: 21000n }),
      getGasPrice: vi.fn().mockResolvedValue(100n),
    }
    ;(createTestClient as Mock).mockReturnValue(mockTestClient)
    ;(createPublicClient as Mock).mockReturnValue(publicClient)

    vi.mocked(axios.get).mockImplementation(() => Promise.resolve({ data: 'mockData' }))
    vi.mocked(isAxiosError).mockRejectedValue(true)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  test('should start and stop the server', async () => {
    const stopMockServer = vi.fn().mockName('stopMockServer')
    const startMockServer = vi.fn().mockName('startMockServer').mockResolvedValue(stopMockServer)
    const mockAnvilInstance = vi.fn().mockName('mockAnvilInstance')
    ;(createServer as Mock).mockReturnValue({ start: startMockServer })
    ;(anvil as Mock).mockReturnValue(mockAnvilInstance)

    await simulateExecute(action, registry, chainInfo, signerAddresses, spinner, actionInfinitCache)

    expect(anvil).toHaveBeenCalledWith({ chainId: 1, forkUrl: 'https://fakerpc.io/rpc' })

    expect(createServer).toHaveBeenCalledOnce()
    expect(createServer).toHaveBeenCalledWith({ instance: mockAnvilInstance, limit: 1, port: 8545 })

    expect(startMockServer).toHaveBeenCalledOnce()
    expect(stopMockServer).toHaveBeenCalledOnce()
  })

  test('should handle when start pool failed', async () => {
    vi.mocked(axios.get).mockImplementationOnce(() => {
      throw new Error('Test error')
    })

    const stopMockServer = vi.fn().mockName('stopMockServer')
    const startMockServer = vi.fn().mockName('startMockServer').mockResolvedValue(stopMockServer)
    const mockAnvilInstance = vi.fn().mockName('mockAnvilInstance')
    ;(createServer as Mock).mockReturnValue({ start: startMockServer })
    ;(anvil as Mock).mockReturnValue(mockAnvilInstance)

    await expect(simulateExecute(action, registry, chainInfo, signerAddresses, spinner, actionInfinitCache)).rejects.toThrowError(
      'Start fork chain error: Error: Test error',
    )
  })

  test('should simulate the action and log results', async () => {
    await simulateExecute(action, registry, chainInfo, signerAddresses, spinner, actionInfinitCache)

    expect(mockTestClient.impersonateAccount).toHaveBeenCalledTimes(2)
    expect(mockTestClient.impersonateAccount).toHaveBeenCalledWith({ address: '0x123' })

    expect(mockTestClient.setBalance).toHaveBeenCalledTimes(2)
    expect(mockTestClient.setBalance).toHaveBeenCalledWith({
      address: '0x123',
      value: 100n * 10n ** 18n,
    })

    expect(action.run).toHaveBeenCalledWith(
      {
        address1: '0x1234',
      },
      { name: 'mockAction' },
      expect.any(Function),
    )

    expect(spinner.stopAndPersist).toHaveBeenCalledWith({
      symbol: '✅',
      text: 'Simulation Completed.',
    })
    expect(spinner.info).toHaveBeenCalledTimes(4)
    expect(spinner.info).toHaveBeenCalledWith('Total Transactions: 0')
    expect(spinner.info).toHaveBeenCalledWith('Gas Used: 0 gas')
    expect(spinner.info).toHaveBeenCalledWith('Simulate Gas Price: 0 gwei')
    expect(spinner.info).toHaveBeenCalledWith('Estimated Cost: 0 ETH')
  })

  test('should handle errors and stop the server', async () => {
    const startMock = vi.fn().mockResolvedValue(vi.fn())
    ;(createServer as Mock).mockReturnValue({ start: startMock })
    ;(action.run as Mock).mockRejectedValue(new Error('Test error'))

    await expect(simulateExecute(action, registry, chainInfo, signerAddresses, spinner, actionInfinitCache)).rejects.toThrow('Test error')

    expect(spinner.fail).toHaveBeenCalledWith('Simulate failed')
  })
})
