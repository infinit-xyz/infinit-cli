import { cloneDeep, set } from 'lodash'
import { type MockInstance, afterEach, beforeAll, describe, expect, test, vi } from 'vitest'

import { Config, config } from '@classes'
import { protocolModules } from '@constants/protocol-module'
import { PROTOCOL_MODULE } from '@enums/module'
import type { InfinitConfigSchema } from '@schemas/generated'
import { type PublicClient, createPublicClient } from 'viem'
import { handleVerifyContract } from './index'
import { explorerApiKeyPrompt, explorerApiUrlPrompt, explorerUrlPrompt } from './index.prompt'

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
  chalkError: (str: string) => str,
  chalkSuccess: (str: string) => str,
}))
vi.mock('@constants/protocol-module')
vi.mock('./index.prompt')

const MOCK_PROJECT_CONFIG = {
  chain_info: {
    block_explorer: {
      api_url: 'FAKE_API_URL',
      api_key: 'FAKE_API_KEY',
      url: 'FALE_URL',
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

  beforeAll(() => {
    vi.mocked(protocolModules)['aave-v3'].Verifier = mockVerifier
    vi.mocked(createPublicClient).mockReturnValue(mockPublicClient)

    setProjectConfigBlockExplorerSpy = vi.spyOn(config, 'setProjectConfigBlockExplorer').mockImplementation(vi.fn())
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  test('should handle explorer info and call verify contract correctly', async () => {
    vi.spyOn(config, 'getProjectConfig').mockReturnValue(MOCK_PROJECT_CONFIG)

    await handleVerifyContract()

    expect(explorerApiUrlPrompt).not.toHaveBeenCalled()
    expect(explorerApiKeyPrompt).not.toHaveBeenCalled()
    expect(explorerUrlPrompt).not.toHaveBeenCalled()
    expect(setProjectConfigBlockExplorerSpy).not.toHaveBeenCalled()

    expect(mockVerifier).toHaveBeenCalledTimes(1)
    expect(mockVerifier).toHaveBeenCalledWith(mockPublicClient, {
      apiKey: MOCK_PROJECT_CONFIG.chain_info.block_explorer?.api_key,
      apiUrl: MOCK_PROJECT_CONFIG.chain_info.block_explorer?.api_url,
      url: MOCK_PROJECT_CONFIG.chain_info.block_explorer?.url,
    })

    expect(mockVerifyContract).toHaveBeenCalledTimes(1)
    expect(mockVerifyContract).toHaveBeenCalledWith({}, expect.any(Function))
  })

  describe('no block explorer info from config', () => {
    beforeAll(() => {
      const newMockConfig = cloneDeep(MOCK_PROJECT_CONFIG)
      set(newMockConfig, 'chain_info.block_explorer.api_url', '')
      set(newMockConfig, 'chain_info.block_explorer.api_key', '')
      set(newMockConfig, 'chain_info.block_explorer.url', '')

      vi.spyOn(config, 'getProjectConfig').mockReturnValue(newMockConfig)
    })

    test('should prompt for explorer info if not provided', async () => {
      const userInputApiUrl = 'FAKE_USER_INPUT_API_URL'
      const userInputApiKey = 'FAKE_USER_INPUT_API_KEY'
      const userInputUrl = 'FAKE_USER_INPUT_URL'

      vi.mocked(explorerApiUrlPrompt).mockResolvedValue(userInputApiUrl)
      vi.mocked(explorerApiKeyPrompt).mockResolvedValue(userInputApiKey)
      vi.mocked(explorerUrlPrompt).mockResolvedValue(userInputUrl)

      await handleVerifyContract()

      expect(explorerApiUrlPrompt).toHaveBeenCalledTimes(1)
      expect(explorerApiKeyPrompt).toHaveBeenCalledTimes(1)
      expect(explorerUrlPrompt).toHaveBeenCalledTimes(1)
      expect(setProjectConfigBlockExplorerSpy).toHaveBeenCalledTimes(1)

      expect(setProjectConfigBlockExplorerSpy).toHaveBeenCalledWith({
        api_url: userInputApiUrl,
        api_key: userInputApiKey,
        url: userInputUrl,
      })
    })

    test('should throw error if explorer info is missing', async () => {
      const userInputApiUrl = ''
      const userInputApiKey = ''
      const userInputUrl = ''

      vi.mocked(explorerApiUrlPrompt).mockResolvedValue(userInputApiUrl)
      vi.mocked(explorerApiKeyPrompt).mockResolvedValue(userInputApiKey)
      vi.mocked(explorerUrlPrompt).mockResolvedValue(userInputUrl)

      await expect(handleVerifyContract()).rejects.toThrow('Block explorer configuration is required')

      expect(explorerApiUrlPrompt).toHaveBeenCalledTimes(1)
      expect(explorerApiKeyPrompt).toHaveBeenCalledTimes(1)
      expect(explorerUrlPrompt).toHaveBeenCalledTimes(1)
      expect(setProjectConfigBlockExplorerSpy).not.toHaveBeenCalled()
      expect(mockVerifier).not.toHaveBeenCalled()
      expect(mockVerifyContract).not.toHaveBeenCalled()
    })
  })
})
