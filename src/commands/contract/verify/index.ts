import ora from 'ora'
import { createPublicClient, http } from 'viem'

import { config } from '@classes'
import { protocolModules } from '@constants/protocol-module'
import type { PROTOCOL_MODULE } from '@enums/module'
import { getProjectChainInfo, getProjectRpc } from '@utils/config'
import { readProjectRegistry } from '@utils/files'

import { verifyContractCallbackHandler } from './callback'
import { explorerApiKeyPrompt, explorerApiUrlPrompt, explorerUrlPrompt } from './index.prompt'

export const handleVerifyContract = async () => {
  const projectConfig = config.getProjectConfig()
  const { registry } = readProjectRegistry()

  let isExplorerInfoUpdated = false

  let explorerApiUrl: string | undefined = projectConfig.chain_info.block_explorer?.api_url?.trim()
  if (explorerApiUrl === '') {
    explorerApiUrl = await explorerApiUrlPrompt()
    isExplorerInfoUpdated = true
  }

  let apiKey: string | undefined = projectConfig.chain_info.block_explorer?.api_key?.trim()
  if (apiKey === '') {
    apiKey = await explorerApiKeyPrompt()
    isExplorerInfoUpdated = true
  }

  let explorerUrl: string | undefined = projectConfig.chain_info.block_explorer?.url?.trim()
  if (explorerUrl === '') {
    explorerUrl = await explorerUrlPrompt()
    isExplorerInfoUpdated = true
  }

  if (!explorerApiUrl || !apiKey || !explorerUrl) {
    throw new Error('Block explorer configuration is required')
  }

  if (isExplorerInfoUpdated) {
    config.setProjectConfigBlockExplorer({
      api_url: explorerApiUrl,
      api_key: apiKey,
      url: explorerUrl,
    })
  }

  const chainInfo = getProjectChainInfo()
  const publicClient = createPublicClient({ chain: chainInfo.viemChain.instance, transport: http(getProjectRpc()) })

  const verifier = new protocolModules[projectConfig.protocol_module as PROTOCOL_MODULE].Verifier(publicClient, {
    apiKey,
    apiUrl: explorerApiUrl,
    url: explorerUrl,
  })

  // Spinner
  const spinner = ora({ spinner: 'dots' })

  // Verify
  verifier.verify(registry, verifyContractCallbackHandler(spinner))
}
