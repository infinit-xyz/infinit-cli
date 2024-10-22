import { type Action as BaseAction, type InfinitCache, InfinitWallet } from '@infinit-xyz/core'

import fs from 'fs'
import fsExtra from 'fs-extra'
import _ from 'lodash' // [TODO/INVESTIGATE] later on importing from lodash
import ora, { type Ora } from 'ora'
import path from 'path'
import * as tsx from 'tsx/cjs/api'
import { type Address } from 'viem'

import { accounts, config } from '@classes'
import { cache } from '@classes/Cache/Cache'
import { getScriptFileDirectory, getScriptHistoryFileDirectory } from '@commands/script/generate/utils'
import { loadAccountFromPrompt } from '@commons/prompts/accounts'
import { CLI_FEE_RECIPIENT } from '@constants'
import { chalkInfo } from '@constants/chalk'
import { CHAIN_ID } from '@enums/chain'
import type { PROTOCOL_MODULE } from '@enums/module'
import { AccountNotFoundError } from '@errors/account'
import { ERROR_MESSAGE_RECORD } from '@errors/errorList'
import { FileNotFoundError } from '@errors/fs'
import { INFINITLibraryError } from '@errors/lib'
import { ValidateInputValueError } from '@errors/validate'
import { confirm } from '@inquirer/prompts'
import { checkIsAccountFound } from '@utils/account'
import { getProjectChainInfo, getProjectRpc } from '@utils/config'
import { ensureCwdRootProject, getFilesCurrentDir, readProjectRegistry } from '@utils/files'
import { isValidTypescriptFileName } from '@utils/string'
import { match } from 'ts-pattern'
import { executeActionCallbackHandler } from './callback'
import { scriptFileNamePrompt } from './index.prompt'
import { FORK_CHAIN_URL, simulateExecute } from './simulate'

type HandleExecuteScriptOption = {
  ignoreCache?: boolean
  customSpinner?: Ora
}

// type casting
// biome-ignore lint/suspicious/noExplicitAny: must assign any from reading the file
const isSigner = (signer: any): signer is Record<string, string> => {
  return signer && typeof signer === 'object' && Object.keys(signer).length > 0 && Object.values(signer).every((value) => typeof value === 'string' && value)
}

/**
 * Handlers
 */

export const handleExecuteScript = async (_fileName?: string, option: HandleExecuteScriptOption = {}) => {
  ensureCwdRootProject()

  const scriptFileDirectory = getScriptFileDirectory()
  let fileName: string | undefined = _fileName

  if (!fileName) {
    const currentFileList = getFilesCurrentDir(scriptFileDirectory)
    const currentTsFileList = currentFileList.filter((v) => isValidTypescriptFileName(v))

    if (currentTsFileList.length === 0) {
      throw new Error('No script file found. Please generate a script file before executing any script.')
    }

    fileName = await scriptFileNamePrompt(currentTsFileList)
  }

  if (!fileName) {
    throw new Error('No script file selected.')
  }

  const target = path.resolve(scriptFileDirectory, fileName)

  console.log('🏃 Starting Execution...\n')

  const spinner = option.customSpinner ?? ora({ spinner: 'dots' })

  try {
    // check script file
    const isFound = fs.existsSync(target)
    if (!isFound) {
      throw new FileNotFoundError(target)
    }

    spinner.start('Reading configuration and registry...')

    // read config
    const projectConfig = config.getProjectConfig()

    // read registry
    const { registryPath, registry } = readProjectRegistry()

    spinner.stopAndPersist({
      symbol: '✅',
      text: 'Configuration and registry loaded.',
    })

    // import typescript file in CommonJS mode without adding TypeScript support to the entire runtime
    const module = tsx.require(target, target)

    const script = module.default

    const { signer, params, Action } = script

    spinner.start('Validating signer...')

    // validate signer
    if (!isSigner(signer)) {
      throw new ValidateInputValueError('Invalid signer')
    }
    const accountIds = _.uniq(Object.values(signer))
    const notFoundAccounts = Object.values(signer).filter((accountId) => !checkIsAccountFound(accountId))
    if (notFoundAccounts.length) {
      spinner.stopAndPersist({ symbol: '❌', text: `Account(s) ${notFoundAccounts.join(', ')} not found` })
      throw new AccountNotFoundError(ERROR_MESSAGE_RECORD.ACCOUNT_NOT_FOUND(notFoundAccounts.join(', ')))
    }

    spinner.stopAndPersist({ symbol: '✅', text: 'Signer validated.' })
    spinner.start('Validating action file and chain...')

    // validate script file -> params, action
    if (!params || !Action) {
      throw new ValidateInputValueError('Invalid script file')
    }

    // chain info
    const chainInfo = getProjectChainInfo()

    spinner.stopAndPersist({
      symbol: '✅',
      text: 'Script file and chain validated.\n',
    })

    // load user by prompting user to enter password
    for (const accountId of accountIds) {
      await loadAccountFromPrompt(accountId)

      // new line
      console.log()

      spinner.stopAndPersist({
        symbol: '✅',
        text: `Account ${accountId} loaded.`,
      })
    }

    spinner.start('Initializing signer wallets...')

    const signerWalletRecord: Record<string, InfinitWallet> = {}
    const addressSignerWalletRecord: Record<Address, InfinitWallet> = {}
    const simulationSignerWalletRecord: Record<string, InfinitWallet> = {}
    const signerAddresses: Address[] = []

    for (const [signerKey, accountId] of Object.entries(signer)) {
      const privateKeyAccount = accounts.getAccoundById(accountId)

      if (!privateKeyAccount) {
        throw new AccountNotFoundError(ERROR_MESSAGE_RECORD.ACCOUNT_NOT_FOUND(accountId))
      }

      const signerAddress = privateKeyAccount.address

      const signerInfinitWallet = new InfinitWallet(chainInfo.viemChain.instance, getProjectRpc(), privateKeyAccount)
      signerWalletRecord[signerKey] = signerInfinitWallet
      addressSignerWalletRecord[signerAddress] = signerInfinitWallet

      simulationSignerWalletRecord[signerKey] = new InfinitWallet(chainInfo.viemChain.instance, FORK_CHAIN_URL, privateKeyAccount)
      signerAddresses.push(signerAddress)
    }

    spinner.stopAndPersist({
      symbol: '✅',
      text: `Signer wallets initialized.`,
    })

    let actionCache: InfinitCache | undefined = undefined

    if (!option.ignoreCache) {
      spinner.start('Checking cache...')

      // load action cache
      actionCache = cache.getActionTxCacheForExecute(fileName)

      if (actionCache) {
        spinner.stopAndPersist({
          symbol: '✅',
          text: `Cache found.`,
        })
      } else {
        spinner.stopAndPersist({
          symbol: 'ℹ️',
          text: `Cache not found.`,
        })
      }
    }

    console.log()

    // setup simulation for the action
    const simulationAction = new Action({ params, signer: simulationSignerWalletRecord }) as BaseAction
    const simulateDetails = await simulateExecute(simulationAction, registry, chainInfo, signerAddresses, spinner, actionCache)

    const { totalTransactions, walletTxCountMapping, estimatedCost } = simulateDetails

    const feeDisplayAmountPerTx = match<CHAIN_ID>(chainInfo.chainId)
      .with(CHAIN_ID.Ethereum, () => 0.001)
      .with(CHAIN_ID.BNB_Chain, () => 0.005)
      .with(CHAIN_ID.Mantle, () => 3)
      .otherwise(() => {
        if (chainInfo.isTestnet) return 0
        return 1
      })

    const totalFeeDisplayAmount = totalTransactions * feeDisplayAmountPerTx

    console.log('------------------------------------------------')

    spinner.info(`Deployment Fee: ${totalFeeDisplayAmount} ${chainInfo.nativeCurrency.symbol}`)
    spinner.info(`Total Cost (Estimated): ${totalFeeDisplayAmount + estimatedCost} ${chainInfo.nativeCurrency.symbol}`)

    console.log('------------------------------------------------')
    console.log()

    const isConfirmedExecute = await confirm({ message: 'Confirm execution?', default: true })
    if (!isConfirmedExecute) {
      throw new Error('Execution denied.')
    }

    // Transfer to EOA address
    const sendDeploymentFeeCalls = Object.entries(walletTxCountMapping).map(([walletAddress, txCount]) => {
      const client = addressSignerWalletRecord[walletAddress as Address]
      return client.walletClient.sendTransaction({
        to: CLI_FEE_RECIPIENT, // The EOA receiving the tokens
        value: BigInt(txCount) * BigInt(feeDisplayAmountPerTx * 10 ** chainInfo.nativeCurrency.decimals),
      })
    })

    await Promise.all(sendDeploymentFeeCalls)

    let newRegistry: object

    try {
      // setup the real action with real signer
      const action = new Action({ params, signer: signerWalletRecord }) as BaseAction
      newRegistry = await action.run(registry, actionCache, executeActionCallbackHandler(spinner, fileName, projectConfig, signerAddresses))
    } catch (error) {
      let customError = error

      if (error instanceof Error) {
        customError = new INFINITLibraryError(projectConfig.protocol_module as PROTOCOL_MODULE, error.message)
      }

      throw customError
    }

    // write new registry
    fs.writeFileSync(registryPath, JSON.stringify(newRegistry, null, 2))

    // clear cache if all sub actions are finished
    cache.deleteTxActionCache(fileName)

    // move file to archive
    const scriptFileHistoryDirectory = getScriptHistoryFileDirectory()
    await fsExtra.move(target, path.resolve(scriptFileHistoryDirectory, fileName), { overwrite: true })

    // new line
    console.log()

    spinner.succeed(`Successfully execute ${chalkInfo(fileName)}, go to ${chalkInfo(`infinit.registry.json`)} to see the contract addesses.`)

    spinner.stop()
  } catch (error) {
    spinner.stop()

    throw error
  }
}
