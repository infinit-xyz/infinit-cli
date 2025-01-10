import { cloneDeep, set } from 'lodash'
import { type MockInstance, afterEach, beforeAll, describe, expect, test, vi } from 'vitest'

import { Config, config } from '@classes'
import { protocolModules } from '@constants/protocol-module'
import { PROTOCOL_MODULE } from '@enums/module'
import type { InfinitConfigSchema } from '@schemas/generated'
import { type PublicClient, createPublicClient } from 'viem'
import { handleVerifyContract } from './index'
import { getContractRoot } from '@utils/files/getContractRoot'
import { confirmPrompt, explorerApiKeyPrompt, explorerApiUrlPrompt, explorerNamePrompt, explorerUrlPrompt } from './index.prompt'

vi.mock('viem', () => ({
  createPublicClient: vi.fn(),
  http: vi.fn(),
}))
vi.mock('@classes')
vi.mock('@utils/files', () => ({
  readProjectRegistry: vi.fn().mockImplementation(() => ({ registry: {}, registryPath: '' })),
}))
vi.mock('@utils/config', () => ({
  getProjectChainInfo: vi.fn().mockReturnValue({ viemChain: { instance: 'FAKE_INSTANCE' } }),
  getProjectRpc: vi.fn(),
}))
vi.mock('@utils/verifyContract', () => ({
  verifyContract: vi.fn(),
}))
vi.mock('@constants/chalk', () => ({
  chalkInfo: (str: string) => str,
  chalkDim: (str: string) => str,
}))
vi.mock('@constants/protocol-module')
vi.mock('./index.prompt')

const MOCK_PROJECT_CONFIG = {
  chain_info: {
    block_explorer: {
      name: 'FAKE_NAME',
      api_url: 'FAKE_API_URL',
      api_key: 'FAKE_API_KEY',
      url: 'FAKE_URL',
    },
  },
  protocol_module: PROTOCOL_MODULE.aave_v3,
} as InfinitConfigSchema

const MOCK_PROJECT_WITH_BLOCKSCOUT_CONFIG = {
  chain_info: {
    block_explorer: {
      name: 'FAKE_NAME',
      api_url: 'https://eth-holesky.blockscout.com/api',
      url: 'FAKE_URL',
    },
  },
  protocol_module: PROTOCOL_MODULE.aave_v3,
} as InfinitConfigSchema

describe('handleVerifyContract', () => {
  const mockVerifyContract = vi.fn()
  const mockVerifier = vi.fn().mockImplementation(() => {
    return {
      verify: mockVerifyContract,
    }
  })
  const mockPublicClient = vi.fn() as unknown as PublicClient
  let setProjectConfigBlockExplorerSpy: MockInstance<Config['setProjectConfigBlockExplorer']>
  let consoleLogSpy: MockInstance

  beforeAll(() => {
    vi.mocked(protocolModules)['aave-v3'].Verifier = mockVerifier
    vi.mocked(createPublicClient).mockReturnValue(mockPublicClient)
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined)

    setProjectConfigBlockExplorerSpy = vi.spyOn(config, 'setProjectConfigBlockExplorer').mockImplementation(vi.fn())
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  test('should handle explorer info and call verify contract correctly', async () => {
    vi.spyOn(config, 'getProjectConfig').mockReturnValue(MOCK_PROJECT_CONFIG)
    vi.mocked(confirmPrompt).mockResolvedValue(true)

    await handleVerifyContract()

    expect(explorerNamePrompt).not.toHaveBeenCalled()
    expect(explorerApiUrlPrompt).not.toHaveBeenCalled()
    expect(explorerApiKeyPrompt).not.toHaveBeenCalled()
    expect(explorerUrlPrompt).not.toHaveBeenCalled()
    expect(setProjectConfigBlockExplorerSpy).not.toHaveBeenCalled()

    expect(consoleLogSpy).toHaveBeenCalledTimes(4)
    expect(consoleLogSpy).toHaveBeenCalledWith(`ℹ︎ Configuration:`)
    expect(consoleLogSpy).toHaveBeenCalledWith(
      `Block Explorer: ${MOCK_PROJECT_CONFIG.chain_info.block_explorer?.name} (${MOCK_PROJECT_CONFIG.chain_info.block_explorer?.url})`,
    )
    expect(consoleLogSpy).toHaveBeenCalledWith(`Block Explorer API URL:`, MOCK_PROJECT_CONFIG.chain_info.block_explorer?.api_url)
    expect(consoleLogSpy).toHaveBeenCalledWith(`Block Explorer API Key:`, 'FAK******KEY')

    expect(mockVerifier).toHaveBeenCalledTimes(1)
    expect(mockVerifier).toHaveBeenCalledWith(mockPublicClient, {
      apiKey: MOCK_PROJECT_CONFIG.chain_info.block_explorer?.api_key,
      apiUrl: MOCK_PROJECT_CONFIG.chain_info.block_explorer?.api_url,
      url: MOCK_PROJECT_CONFIG.chain_info.block_explorer?.url,
    })

    expect(mockVerifyContract).toHaveBeenCalledTimes(1)
    expect(mockVerifyContract).toHaveBeenCalledWith({}, getContractRoot(), expect.any(Function))
  })

  test('should handle explorer info and call verify contract correctly with Blockscout', async () => {
    vi.spyOn(config, 'getProjectConfig').mockReturnValue(MOCK_PROJECT_WITH_BLOCKSCOUT_CONFIG)
    vi.mocked(confirmPrompt).mockResolvedValue(true)

    await handleVerifyContract()

    expect(explorerNamePrompt).not.toHaveBeenCalled()
    expect(explorerApiUrlPrompt).not.toHaveBeenCalled()
    expect(explorerApiKeyPrompt).not.toHaveBeenCalled()
    expect(explorerUrlPrompt).not.toHaveBeenCalled()
    expect(setProjectConfigBlockExplorerSpy).not.toHaveBeenCalled()

    expect(consoleLogSpy).toHaveBeenCalledTimes(3)
    expect(consoleLogSpy).toHaveBeenCalledWith(`ℹ︎ Configuration:`)
    expect(consoleLogSpy).toHaveBeenCalledWith(
      `Block Explorer: ${MOCK_PROJECT_WITH_BLOCKSCOUT_CONFIG.chain_info.block_explorer?.name} (${MOCK_PROJECT_WITH_BLOCKSCOUT_CONFIG.chain_info.block_explorer?.url})`,
    )
    expect(consoleLogSpy).toHaveBeenCalledWith(`Block Explorer API URL:`, MOCK_PROJECT_WITH_BLOCKSCOUT_CONFIG.chain_info.block_explorer?.api_url)

    expect(mockVerifier).toHaveBeenCalledTimes(1)
    expect(mockVerifier).toHaveBeenCalledWith(mockPublicClient, {
      apiKey: MOCK_PROJECT_WITH_BLOCKSCOUT_CONFIG.chain_info.block_explorer?.api_key,
      apiUrl: MOCK_PROJECT_WITH_BLOCKSCOUT_CONFIG.chain_info.block_explorer?.api_url,
      url: MOCK_PROJECT_WITH_BLOCKSCOUT_CONFIG.chain_info.block_explorer?.url,
    })

    expect(mockVerifyContract).toHaveBeenCalledTimes(1)
    expect(mockVerifyContract).toHaveBeenCalledWith({}, getContractRoot(), expect.any(Function))
  })

  test('should throw error if block explorer is not blockscout but no api key', async () => {
    const MOCK_PROJECT_WITHOUT_API_KEY = {
      chain_info: {
        block_explorer: {
          name: 'FAKE_NAME',
          api_url: 'https://api-sepolia.arbiscan.io/api',
          url: 'FAKE_URL',
        },
      },
      protocol_module: PROTOCOL_MODULE.aave_v3,
    } as InfinitConfigSchema

    vi.spyOn(config, 'getProjectConfig').mockReturnValue(MOCK_PROJECT_WITHOUT_API_KEY)
    vi.mocked(explorerApiKeyPrompt).mockResolvedValue('FAKE_API_KEY')
    vi.mocked(confirmPrompt).mockResolvedValue(true)

    await handleVerifyContract()

    expect(explorerApiKeyPrompt).toHaveBeenCalledTimes(1)

    expect(consoleLogSpy).toHaveBeenCalledTimes(4)
    expect(consoleLogSpy).toHaveBeenCalledWith(`ℹ︎ Configuration:`)
    expect(consoleLogSpy).toHaveBeenCalledWith(
      `Block Explorer: ${MOCK_PROJECT_WITHOUT_API_KEY.chain_info.block_explorer?.name} (${MOCK_PROJECT_WITHOUT_API_KEY.chain_info.block_explorer?.url})`,
    )
    expect(consoleLogSpy).toHaveBeenCalledWith(`Block Explorer API URL:`, MOCK_PROJECT_WITHOUT_API_KEY.chain_info.block_explorer?.api_url)
    expect(consoleLogSpy).toHaveBeenCalledWith(`Block Explorer API Key:`, 'FAK******KEY')
  })

  describe('no block explorer info from config', () => {
    beforeAll(() => {
      const newMockConfig = cloneDeep(MOCK_PROJECT_CONFIG)
      set(newMockConfig, 'chain_info.block_explorer.name', '')
      set(newMockConfig, 'chain_info.block_explorer.api_url', '')
      set(newMockConfig, 'chain_info.block_explorer.api_key', '')
      set(newMockConfig, 'chain_info.block_explorer.url', '')

      vi.spyOn(config, 'getProjectConfig').mockReturnValue(newMockConfig)
    })

    test('should prompt for explorer info if not provided', async () => {
      const userInputName = 'FAKE_USER_INPUT_NAME'
      const userInputApiUrl = 'FAKE_USER_INPUT_API_URL'
      const userInputApiKey = 'FAKE_USER_INPUT_API_KEY'
      const userInputUrl = 'FAKE_USER_INPUT_URL'

      vi.mocked(explorerNamePrompt).mockResolvedValue(userInputName)
      vi.mocked(explorerApiUrlPrompt).mockResolvedValue(userInputApiUrl)
      vi.mocked(explorerApiKeyPrompt).mockResolvedValue(userInputApiKey)
      vi.mocked(explorerUrlPrompt).mockResolvedValue(userInputUrl)
      vi.mocked(confirmPrompt).mockResolvedValue(true)

      await handleVerifyContract()

      expect(explorerNamePrompt).toHaveBeenCalledTimes(1)
      expect(explorerApiUrlPrompt).toHaveBeenCalledTimes(1)
      expect(explorerApiKeyPrompt).toHaveBeenCalledTimes(1)
      expect(explorerUrlPrompt).toHaveBeenCalledTimes(1)
      expect(setProjectConfigBlockExplorerSpy).toHaveBeenCalledTimes(1)

      expect(setProjectConfigBlockExplorerSpy).toHaveBeenCalledWith({
        api_url: userInputApiUrl,
        api_key: userInputApiKey,
        name: userInputName,
        url: userInputUrl,
      })
    })

    test('should throw error if explorer info is missing', async () => {
      const userInputApiUrl = ''
      const userInputApiKey = ''
      const userInputUrl = ''
      const userInputName = ''

      vi.mocked(explorerNamePrompt).mockResolvedValue(userInputName)
      vi.mocked(explorerApiUrlPrompt).mockResolvedValue(userInputApiUrl)
      vi.mocked(explorerApiKeyPrompt).mockResolvedValue(userInputApiKey)
      vi.mocked(explorerUrlPrompt).mockResolvedValue(userInputUrl)
      vi.mocked(confirmPrompt).mockResolvedValue(true)

      await expect(handleVerifyContract()).rejects.toThrow('Invalid Config, please recheck the config with the documentation.')

      expect(explorerNamePrompt).toHaveBeenCalledTimes(1)
      expect(explorerApiUrlPrompt).toHaveBeenCalledTimes(1)
      expect(explorerApiKeyPrompt).toHaveBeenCalledTimes(1)
      expect(explorerUrlPrompt).toHaveBeenCalledTimes(1)
      expect(setProjectConfigBlockExplorerSpy).not.toHaveBeenCalled()
      expect(mockVerifier).not.toHaveBeenCalled()
      expect(mockVerifyContract).not.toHaveBeenCalled()
    })
  })
})
