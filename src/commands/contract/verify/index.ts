import ora from 'ora'
import { createPublicClient, http } from 'viem'

import { config } from '@classes'
import { chalkDim, chalkInfo } from '@constants/chalk'
import { protocolModules } from '@constants/protocol-module'
import type { PROTOCOL_MODULE } from '@enums/module'
import { getProjectChainInfo, getProjectRpc } from '@utils/config'
import { readProjectRegistry } from '@utils/files'

import { ERROR_MESSAGE_RECORD } from '@errors/errorList'
import { isBlockscout } from '@infinit-xyz/core/internal'
import { verifyContractCallbackHandler } from './callback'
import { confirmPrompt, explorerApiKeyPrompt, explorerApiUrlPrompt, explorerNamePrompt, explorerUrlPrompt } from './index.prompt'
import { getContractRoot } from '@utils/files/getContractRoot'

export const handleVerifyContract = async () => {
  const projectConfig = config.getProjectConfig()
  const { registry } = readProjectRegistry()

  let isExplorerInfoUpdated = false

  let explorerName: string | undefined = projectConfig.chain_info.block_explorer?.name?.trim()
  if (explorerName === '' || !explorerName) {
    explorerName = await explorerNamePrompt()
    isExplorerInfoUpdated = true
  }

  let explorerApiUrl: string | undefined = projectConfig.chain_info.block_explorer?.api_url?.trim()
  if (explorerApiUrl === '') {
    explorerApiUrl = await explorerApiUrlPrompt()
    isExplorerInfoUpdated = true
  }

  let isBlockscoutExplorerApi: boolean
  try {
    isBlockscoutExplorerApi = await isBlockscout(explorerApiUrl!)
  } catch (_error) {
    isBlockscoutExplorerApi = false
  }

  let apiKey: string | undefined = projectConfig.chain_info.block_explorer?.api_key?.trim()
  if (!apiKey) {
    if (!isBlockscoutExplorerApi) {
      // no need api key for Blockscout API
      apiKey = await explorerApiKeyPrompt()
      isExplorerInfoUpdated = true
    }
  }

  let explorerUrl: string | undefined = projectConfig.chain_info.block_explorer?.url?.trim()
  if (explorerUrl === '') {
    explorerUrl = await explorerUrlPrompt()
    isExplorerInfoUpdated = true
  }

  if (!explorerName || !explorerApiUrl || (!isBlockscoutExplorerApi && !apiKey) || !explorerUrl) {
    throw new Error(ERROR_MESSAGE_RECORD.INVALID_CONFIG)
  }

  const SHOW_API_LENGTH = 6
  const maskedApiKey = apiKey
    ? apiKey.slice(0, SHOW_API_LENGTH / 2) + '*'.repeat(apiKey.length - SHOW_API_LENGTH) + apiKey.slice(-SHOW_API_LENGTH / 2)
    : undefined

  console.log(`ℹ︎ Configuration:`)
  console.log(`Block Explorer: ${chalkInfo(explorerName)} ${chalkDim(`(${explorerUrl})`)}`)
  console.log('Block Explorer API URL:', chalkInfo(explorerApiUrl))
  if (maskedApiKey) {
    console.log('Block Explorer API Key:', chalkInfo(maskedApiKey))
  }

  const isConfirm = await confirmPrompt()

  if (!isConfirm) {
    console.log('User denied the confirmation to verify the contract.')
    process.exit(0)
  }

  if (isExplorerInfoUpdated) {
    config.setProjectConfigBlockExplorer({
      name: explorerName,
      api_url: explorerApiUrl,
      api_key: apiKey ?? '',
      url: explorerUrl,
    })
  }

  const chainInfo = getProjectChainInfo()
  const publicClient = createPublicClient({
    chain: chainInfo.viemChain.instance,
    transport: http(getProjectRpc()),
  })

  const verifier = new protocolModules[projectConfig.protocol_module as PROTOCOL_MODULE].Verifier(publicClient, {
    apiKey,
    apiUrl: explorerApiUrl,
    url: explorerUrl,
  })

  // Spinner
  const spinner = ora({ spinner: 'dots' })

  const contractRoot = getContractRoot()

  // Verify
  verifier.verify(registry, contractRoot, verifyContractCallbackHandler(spinner, explorerUrl))
}
