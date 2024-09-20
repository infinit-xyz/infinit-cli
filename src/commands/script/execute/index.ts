import { type Action as BaseAction, type InfinitCache, InfinitWallet } from '@infinit-xyz/core'
import type { CallbackKeys, CallbackParams } from '@infinit-xyz/core/types/callback'

import fs from 'fs'
import fsExtra from 'fs-extra'
import _ from 'lodash'
import ora, { type Ora } from 'ora'
import path from 'path'
import { match } from 'ts-pattern'
import * as tsx from 'tsx/cjs/api'

import { accounts } from '@classes'
import { cache } from '@classes/Cache/Cache'
import { TX_STATUS } from '@classes/Cache/Cache.enum'
import { FORK_CHAIN_URL, simulateExecute } from '@commands/script/execute/simulate'
import { getScriptFileDirectory, getScriptHistoryFileDirectory } from '@commands/script/generate/utils'
import { loadAccountFromPrompt } from '@commons/prompts/accounts'
import { chalkError, chalkInfo } from '@constants/chalk'
import { confirm } from '@inquirer/prompts'
import { checkIsAccountFound } from '@utils/account'
import { getProjectChainInfo } from '@utils/config'
import { ensureCwdRootProject, readProjectRegistry } from '@utils/files'
import type { Address } from 'viem'

// type casting
// biome-ignore lint/suspicious/noExplicitAny: must assign any from reading the file
const isSigner = (signer: any): signer is Record<string, string> => {
  return signer && typeof signer === 'object' && Object.keys(signer).length > 0 && Object.values(signer).every((value) => typeof value === 'string' && value)
}

export const executeActionCallbackHandler = (spinner: Ora, filename: string) => {
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

export const handleExecuteScript = async (fileName: string) => {
  ensureCwdRootProject()

  const scriptFileDirectory = getScriptFileDirectory()
  const target = path.resolve(scriptFileDirectory, fileName)

  console.log('🏃 Starting Execution...\n')
  const spinner = ora({ spinner: 'dots' })

  try {
    // check script file
    const isFound = fs.existsSync(target)
    if (!isFound) {
      throw new Error(`script ${fileName} is not found in ${target}`)
    }

    spinner.start('Reading configuration and registry...')

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
      throw new Error('Invalid signer')
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
      throw new Error('Invalid script file')
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
        throw new Error(`Account ${accountId} not found`)
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

      signerWalletRecord[signerKey] = new InfinitWallet(chainInfo.viemChainInstance, chainInfo.rpcList[0], privateKeyAccount)
      simulationSignerWalletRecord[signerKey] = new InfinitWallet(chainInfo.viemChainInstance, FORK_CHAIN_URL, privateKeyAccount)
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

    // setup the real action with real signer
    const action = new Action({ params, signer: signerWalletRecord }) as BaseAction
    const newRegistry = await action.run(registry, actionInfinitCache, executeActionCallbackHandler(spinner, fileName))

    // clear cache if all sub actions are finished
    cache.deleteTxActionCache(fileName)

    // write new registry
    fs.writeFileSync(registryPath, JSON.stringify(newRegistry, null, 2))

    // move file to archive
    const scriptFileHistoryDirectory = getScriptHistoryFileDirectory()
    await fsExtra.move(target, path.resolve(scriptFileHistoryDirectory, fileName), { overwrite: true })

    console.log()

    spinner.succeed(`Successfully execute ${chalkInfo(fileName)}, go to ${chalkInfo(`infinit.registry.json`)} to see the contract addesses.`)

    spinner.stop()
    process.exit(0)
  } catch (error) {
    console.log('\n\n' + chalkError(error))

    spinner.stop()
    process.exit(1)
  }
}
