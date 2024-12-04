import { type Action as BaseAction, type OffChainAction as BaseOffChainAction, type InfinitCache, InfinitWallet } from '@infinit-xyz/core'
import { confirm } from '@inquirer/prompts'
import fs from 'fs'
import _ from 'lodash'
import type { Ora } from 'ora'
import path from 'path'
import type { Address } from 'viem'

import { accounts } from '@classes'
import { cache } from '@classes/Cache/Cache'
import type { HandleExecuteScriptOption } from '@commands/script/execute'
import { executeOffChainActionCallbackHandler, executeOnChainActionCallbackHandler } from '@commands/script/execute/callback'
import { FORK_CHAIN_URL, simulateExecute } from '@commands/script/execute/simulate'
import { loadAccountFromPrompt } from '@commons/prompts/accounts'
import type { ChainInfo } from '@constants/chains'
import { chalkError, chalkInfo } from '@constants/chalk'
import type { PROTOCOL_MODULE } from '@enums/module'
import { AccountNotFoundError } from '@errors/account'
import { ERROR_MESSAGE_RECORD } from '@errors/errorList'
import { INFINITLibraryError } from '@errors/lib'
import { ValidateInputValueError } from '@errors/validate'
import type { InfinitConfigSchema } from '@schemas/generated'
import { checkIsAccountFound } from '@utils/account'
import { getProjectRpc } from '@utils/config'
import { writeFileSync } from '@utils/files'

// type casting
// biome-ignore lint/suspicious/noExplicitAny: must assign any from reading the file
const isSigner = (signer: any): signer is Record<string, string> => {
  return signer && typeof signer === 'object' && Object.keys(signer).length > 0 && Object.values(signer).every((value) => typeof value === 'string' && value)
}

export const executeOnChainAction = async (
  spinner: Ora,
  fileName: string,
  // biome-ignore lint/suspicious/noExplicitAny: must assign any from reading the file
  Action: any,
  // biome-ignore lint/suspicious/noExplicitAny: must assign any from reading the file
  params: any,
  signer: Record<string, string>,
  registry: Record<string, Address>,
  projectConfig: InfinitConfigSchema,
  chainInfo: ChainInfo,
  registryPath: string,
  option: HandleExecuteScriptOption = {},
): Promise<void> => {
  // 1. Validate signer and initialize signer wallets
  spinner.start('Validating signer...')
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
  const simulationSignerWalletRecord: Record<string, InfinitWallet> = {}
  const signerAddresses: Address[] = []

  for (const [signerKey, accountId] of Object.entries(signer)) {
    const privateKeyAccount = accounts.getAccoundById(accountId)

    if (!privateKeyAccount) {
      throw new AccountNotFoundError(ERROR_MESSAGE_RECORD.ACCOUNT_NOT_FOUND(accountId))
    }

    const signerAddress = privateKeyAccount.address

    signerWalletRecord[signerKey] = new InfinitWallet(chainInfo.viemChain.instance, getProjectRpc(), privateKeyAccount)
    simulationSignerWalletRecord[signerKey] = new InfinitWallet(chainInfo.viemChain.instance, FORK_CHAIN_URL, privateKeyAccount)
    signerAddresses.push(signerAddress)
  }

  spinner.stopAndPersist({
    symbol: '✅',
    text: `Signer wallets initialized.`,
  })

  // 2. Check cache
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
        text: ` Cache not found.`,
      })
    }
  }

  console.log()

  // 3. Simulate the action (optional)
  const isConfirmedSimulate = await confirm({
    message: `Do you want to ${chalkInfo('simulate')} the transactions to ${chalkInfo('estimate the gas cost')}?`,
    default: true,
  })
  if (isConfirmedSimulate) {
    // setup simulation for the action
    const simulationAction = new Action({ params, signer: simulationSignerWalletRecord }) as BaseAction
    await simulateExecute(simulationAction, registry, chainInfo, signerAddresses, spinner, actionCache)
  }

  const isConfirmedExecute = await confirm({ message: 'Confirm execution?', default: true })

  if (!isConfirmedExecute) {
    console.log(chalkError('Execution denied.'))
    return
  }

  // 4. Execute the action
  let newRegistry: object

  try {
    const action = new Action({ params, signer: signerWalletRecord }) as BaseAction
    newRegistry = await action.run(registry, actionCache, executeOnChainActionCallbackHandler(spinner, fileName, projectConfig, signerAddresses))
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
}

export const executeOffChainAction = async (
  spinner: Ora,
  fileName: string,
  // biome-ignore lint/suspicious/noExplicitAny: must assign any from reading the file
  Action: any,
  // biome-ignore lint/suspicious/noExplicitAny: must assign any from reading the file
  params: any,
  registry: Record<string, Address>,
  projectConfig: InfinitConfigSchema,
  scriptFileDirectory: string,
): Promise<string> => {
  const OFF_CHAIN_ACTION_RESULT_FOLDER_NAME = 'output'
  let data: object

  try {
    // 1. Execute the action
    const action = new Action() as BaseOffChainAction<object, object, object>
    const response = await action.run(registry, params, executeOffChainActionCallbackHandler(spinner, projectConfig, Action.name))

    data = response.data
  } catch (error) {
    let customError = error

    if (error instanceof Error) {
      customError = new INFINITLibraryError(projectConfig.protocol_module as PROTOCOL_MODULE, error.message)
    }

    throw customError
  }

  // 2. write data to output file
  const timestamp = new Date().getTime() // in ms
  const outputFileName = `${fileName.split('.')[0]}-${timestamp}.json`
  const executionResultFilePath = path.resolve(scriptFileDirectory, '..', OFF_CHAIN_ACTION_RESULT_FOLDER_NAME, outputFileName)
  writeFileSync(executionResultFilePath, JSON.stringify(data, null, 2))

  return `${OFF_CHAIN_ACTION_RESULT_FOLDER_NAME}/${outputFileName}`
}
