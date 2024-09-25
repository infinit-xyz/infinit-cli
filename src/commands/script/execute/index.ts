import { type Action as BaseAction, type InfinitCache, InfinitWallet } from '@infinit-xyz/core'
import type { CallbackKeys, CallbackParams } from '@infinit-xyz/core/types/callback'

import fs from 'fs'
import fsExtra from 'fs-extra'
import _ from 'lodash' // [TODO/INVESTIGATE] later on importing from lodash
import ora, { type Ora } from 'ora'
import path from 'path'
import { match } from 'ts-pattern'
import * as tsx from 'tsx/cjs/api'
import { type Address } from 'viem'

import { accounts, config } from '@classes'
import { cache } from '@classes/Cache/Cache'
import { TX_STATUS } from '@classes/Cache/Cache.enum'
import { FORK_CHAIN_URL, simulateExecute } from '@commands/script/execute/simulate'
import { getScriptFileDirectory, getScriptHistoryFileDirectory } from '@commands/script/generate/utils'
import { loadAccountFromPrompt } from '@commons/prompts/accounts'
import { chalkError, chalkInfo } from '@constants/chalk'
import type { PROTOCOL_MODULE } from '@enums/module'
import { AccountNotFoundError } from '@errors/account'
import { ERROR_MESSAGE_RECORD } from '@errors/errorList'
import { FileNotFoundError } from '@errors/fs'
import { ProtocolModuleLibError } from '@errors/lib'
import { customErrorLog } from '@errors/log'
import { ValidateInputValueError } from '@errors/validate'
import { confirm } from '@inquirer/prompts'
import type { InfinitConfigSchema } from '@schemas/generated'
import { checkIsAccountFound } from '@utils/account'
import { sendOnChainEvent } from '@utils/analytics'
import { getProjectChainInfo, getProjectRpc } from '@utils/config'
import { ensureCwdRootProject, getFilesCurrentDir, readProjectRegistry } from '@utils/files'
import { scriptFileNamePrompt } from './index.prompt'

// type casting
// biome-ignore lint/suspicious/noExplicitAny: must assign any from reading the file
const isSigner = (signer: any): signer is Record<string, string> => {
  return signer && typeof signer === 'object' && Object.keys(signer).length > 0 && Object.values(signer).every((value) => typeof value === 'string' && value)
}

export const executeActionCallbackHandler = (spinner: Ora, filename: string, projectConfig: InfinitConfigSchema, signerAddresses: string[]) => {
  let currentSubActionCount = 0
  let currentSubActionStartIndex = 0
  let currentSubActionName = ''

  let totalSubActions = 0
  let transactionCount = 0
  let actionName = ''
  return async (key: CallbackKeys, value: CallbackParams[CallbackKeys]) => {
    match(key)
      .with('actionInfo', () => {
        const parsedValue = value as CallbackParams['actionInfo']

        totalSubActions = parsedValue.totalSubActions
        actionName = parsedValue.name

        spinner.start(
          `Executing ${chalkInfo(actionName)} - ${chalkInfo(currentSubActionName)} (${chalkInfo(`${currentSubActionCount + 1}/${totalSubActions}`)} sub-actions, ${chalkInfo(transactionCount)} transactions).`,
        )

        cache.addTxActionCache(filename, actionName)
      })
      .with('subActionFinished', () => {
        currentSubActionCount += 1
        spinner.text = `Executing ${chalkInfo(actionName)} - ${chalkInfo(currentSubActionName)} (${chalkInfo(`${currentSubActionCount + 1}/${totalSubActions}`)} sub-actions, ${chalkInfo(transactionCount)} transactions).`
      })
      .with('txSubmitted', () => {
        const parsedValue = value as CallbackParams['txSubmitted']

        cache.addTxCache(filename, { txHash: parsedValue.txHash, status: TX_STATUS.PENDING, txBuilderName: parsedValue.name })
      })
      .with('txConfirmed', () => {
        const parsedValue = value as CallbackParams['txConfirmed']

        transactionCount += 1

        spinner.text = `Executing ${chalkInfo(actionName)} - ${chalkInfo(currentSubActionName)} (${chalkInfo(`${currentSubActionCount + 1}/${totalSubActions}`)} sub-actions, ${chalkInfo(transactionCount)} transactions).`

        if (projectConfig.allow_analytics) {
          sendOnChainEvent({
            // [TODO]: Add multiple signer
            address: signerAddresses[0],
            module: projectConfig.protocol_module,
            action: actionName,
            txHash: parsedValue.txHash,
            chainId: projectConfig.chain_info.network_id,
          })
        }

        cache.updateTxCache(filename, parsedValue.txHash, { status: TX_STATUS.CONFIRMED })
      })
      .with('txChecked', () => {
        const parsedValue = value as CallbackParams['txChecked']

        match(parsedValue.status)
          .with('CONFIRMED', () => {
            cache.updateTxCache(filename, parsedValue.txHash, { status: TX_STATUS.CONFIRMED })
          })
          .with('PENDING', () => {
            cache.updateTxCache(filename, parsedValue.txHash, { status: TX_STATUS.PENDING })
          })
          .with('REVERTED', 'NOT_FOUND', () => {
            cache.deleteTxCache(filename, parsedValue.txHash)
          })
          .exhaustive()
      })
      .with('subActionStarted', () => {
        const parsedValue = value as CallbackParams['subActionStarted']

        const cacheObject = cache.getCache().txs[filename]
        if (cacheObject.subActions[currentSubActionStartIndex] && cacheObject.subActions[currentSubActionStartIndex].subActionName === parsedValue.name) {
          return
        }

        currentSubActionStartIndex++
        currentSubActionName = parsedValue.name

        cache.addTxSubActionCache(filename, parsedValue.name)
      })
      .otherwise(() => {})
  }
}

/**
 * Handlers
 */

export const handleExecuteScript = async (_fileName?: string) => {
  ensureCwdRootProject()

  const scriptFileDirectory = getScriptFileDirectory()
  let fileName = _fileName

  if (!fileName) {
    const currentFileList = getFilesCurrentDir(scriptFileDirectory)
    if (currentFileList.length === 0) {
      throw new Error('No script file found. Please generate a script file before executing any script.')
    }

    fileName = await scriptFileNamePrompt(currentFileList)
  }

  if (!fileName) {
    throw new Error('No script file selected.')
  }

  const target = path.resolve(scriptFileDirectory, fileName)
  console.log('🏃 Starting Execution...\n')
  const spinner = ora({ spinner: 'dots' })

  try {
    // check script file
    const isFound = fs.existsSync(target)
    if (!isFound) {
      throw new FileNotFoundError('path', target)
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
      return
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
      const isAccountFound = checkIsAccountFound(accountId)

      if (!isAccountFound) {
        throw new AccountNotFoundError(ERROR_MESSAGE_RECORD.ACCOUNT_NOT_FOUND(accountId))
      }

      await loadAccountFromPrompt(accountId)

      console.log()

      spinner.stopAndPersist({
        symbol: '✅',
        text: `Account ${accountId} loaded.`,
      })
    }

    spinner.start('Initializing signer wallets...')

    const signerWalletRecord: Record<string, InfinitWallet> = {}
    const simulationSignerWalletRecord: Record<string, InfinitWallet> = {}
    const signerAddresses: Address[] = []

    for (const [signerKey, accountId] of Object.entries(signer)) {
      const privateKeyAccount = accounts.accounts[accountId]
      const signerAddress = privateKeyAccount.address

      signerWalletRecord[signerKey] = new InfinitWallet(chainInfo.viemChain.instance, getProjectRpc(), privateKeyAccount)
      simulationSignerWalletRecord[signerKey] = new InfinitWallet(chainInfo.viemChain.instance, FORK_CHAIN_URL, privateKeyAccount)
      signerAddresses.push(signerAddress)
    }

    spinner.stopAndPersist({
      symbol: '✅',
      text: `Signer wallets initialized.`,
    })

    // load action cache
    const actionInfinitCache: InfinitCache | undefined = cache.getActionTxCacheForExecute(fileName)

    if (actionInfinitCache) {
      spinner.stopAndPersist({
        symbol: '✅',
        text: `Cache found.`,
      })
    }

    console.log()

    const isConfirmedSimulate = await confirm({
      message: `Do you want to ${chalkInfo('simulate')} the transactions to ${chalkInfo('estimate the gas cost')}?`,
      default: true,
    })
    if (isConfirmedSimulate) {
      // setup simulation for the action
      const simulationAction = new Action({ params, signer: simulationSignerWalletRecord }) as BaseAction
      await simulateExecute(simulationAction, registry, chainInfo, signerAddresses, spinner, actionInfinitCache)
    }

    const isConfirmedExecute = await confirm({ message: 'Confirm execution?', default: true })

    if (!isConfirmedExecute) {
      console.log(chalkError('Execution denied.'))
      return
    }

    try {
      // setup the real action with real signer
      const action = new Action({ params, signer: signerWalletRecord }) as BaseAction
      const newRegistry = await action.run(registry, actionInfinitCache, executeActionCallbackHandler(spinner, fileName, projectConfig, signerAddresses))

      // write new registry
      fs.writeFileSync(registryPath, JSON.stringify(newRegistry, null, 2))
    } catch (error) {
      if (error instanceof Error) {
        const customError = new ProtocolModuleLibError(projectConfig.protocol_module as PROTOCOL_MODULE, error.message)

        console.error(customErrorLog(customError))
      }
    }

    // clear cache if all sub actions are finished
    cache.deleteTxActionCache(fileName)

    // move file to archive
    const scriptFileHistoryDirectory = getScriptHistoryFileDirectory()
    await fsExtra.move(target, path.resolve(scriptFileHistoryDirectory, fileName), { overwrite: true })

    console.log()

    spinner.succeed(`Successfully execute ${chalkInfo(fileName)}, go to ${chalkInfo(`infinit.registry.json`)} to see the contract addesses.`)

    spinner.stop()
    process.exit(0)
  } catch (error) {
    spinner.stop()
    customErrorLog(error as Error)
    process.exit(1)
  }
}
