import { config } from '@classes'
import { chalkInfo } from '@constants/chalk'
import { protocolModules } from '@constants/protocol-module'
import type { PROTOCOL_MODULE } from '@enums/module'
import type { ContractVerifierCallbackParams } from '@infinit-xyz/core/internal'
import { getProjectChainInfo, getProjectRpc } from '@utils/config'
import { readProjectRegistry } from '@utils/files'
import chalk from 'chalk'
import ora, { type Ora } from 'ora'
import { match } from 'ts-pattern'
import { createPublicClient, http } from 'viem'
import { explorerApiKeyPrompt, explorerApiUrlPrompt, explorerUrlPrompt } from './index.prompt'

type CallbackParams = ContractVerifierCallbackParams

export const verifyContractCallbackHandler = (spinner: Ora) => {
  let totalContracts = 0
  let verifiedContracts = 0

  return async (key: keyof CallbackParams, value: CallbackParams[keyof CallbackParams]) => {
    match(key)
      .with('contractVerificationInfo', () => {
        const parsedValue = value as CallbackParams['contractVerificationInfo']
        totalContracts = parsedValue.totalContracts

        console.log('')
        console.log(`📝 Total contracts: ${totalContracts}`)
      })
      .with('contractVerificationStarted', () => {
        const parsedValue = value as CallbackParams['contractVerificationStarted']
        spinner.start(
          `(${verifiedContracts + 1}/${totalContracts}) 🔍 Verifying... ${chalk.bold(chalkInfo(parsedValue.contractName))} ${chalk.dim(`(${parsedValue.address})`)}`,
        )
      })
      .with('contractVerificationSubmitted', () => {
        const parsedValue = value as CallbackParams['contractVerificationSubmitted']
        spinner.start(
          `(${verifiedContracts + 1}/${totalContracts}) 🚀 Submitted ${chalk.bold(chalkInfo(parsedValue.contractName))} ${chalk.dim(`(${parsedValue.address})`)}`,
        )
      })
      .with('contractVerificationFinished', () => {
        const parsedValue = value as CallbackParams['contractVerificationFinished']
        spinner.succeed(
          `(${verifiedContracts + 1}/${totalContracts}) Verified ${chalk.bold(chalkInfo(parsedValue.contractName))} ${chalk.dim(`(${parsedValue.address})`)}`,
        )
        verifiedContracts++

        if (verifiedContracts === totalContracts) {
          spinner.stopAndPersist({ symbol: '🎉', text: `All ${totalContracts} contract${totalContracts > 1 ? 's' : ''} have been verified!` })
        }
      })
      .exhaustive()
  }
}

export const handleVerifyContract = async () => {
  const projectConfig = config.getProjectConfig()
  const { registry } = readProjectRegistry()

  let explorerApiUrl: string = projectConfig.chain_info.block_explorer.api_url?.trim()
  if (explorerApiUrl === '') {
    explorerApiUrl = await explorerApiUrlPrompt()
  }

  let apiKey: string = projectConfig.chain_info.block_explorer.api_key?.trim()
  if (apiKey === '') {
    apiKey = await explorerApiKeyPrompt()
  }

  let explorerUrl: string = projectConfig.chain_info.block_explorer.url?.trim()
  if (explorerUrl === '') {
    explorerUrl = await explorerUrlPrompt()
  }

  config.setProjectConfigBlockExplorer({
    api_url: explorerApiUrl,
    api_key: apiKey,
    url: explorerUrl,
  })

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
