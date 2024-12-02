import type {
  OffChainActionCallback,
  OffChainActionCallbackKeys,
  OffChainActionCallbackParams,
  OnChainActionCallback,
  OnChainActionCallbackKeys,
  OnChainActionCallbackParams,
} from '@infinit-xyz/core/types/callback'

import { type Ora } from 'ora'
import { match } from 'ts-pattern'

import { cache } from '@classes/Cache/Cache'
import { TX_STATUS } from '@classes/Cache/Cache.enum'
import { chalkInfo } from '@constants/chalk'
import type { InfinitConfigSchema } from '@schemas/generated'
import { sendOffChainEvent, sendOnChainEvent } from '@utils/analytics'

export const executeOnChainActionCallbackHandler = (
  spinner: Ora,
  filename: string,
  projectConfig: InfinitConfigSchema,
  signerAddresses: string[],
): OnChainActionCallback => {
  let currentSubActionCount = 0
  let currentSubActionStartIndex = 0
  let currentSubActionName = ''

  let totalSubActions = 0
  let transactionCount = 0
  let actionName = ''
  const callback: OnChainActionCallback = async (key: OnChainActionCallbackKeys, value) => {
    match(key)
      .with('actionInfo', () => {
        const parsedValue = value as OnChainActionCallbackParams['actionInfo']

        totalSubActions = parsedValue.totalSubActions
        actionName = parsedValue.name

        spinner.start(
          `Executing ${chalkInfo(actionName)} - ${chalkInfo(currentSubActionName)} (${chalkInfo(`${currentSubActionCount + 1}/${totalSubActions}`)} sub-actions, ${chalkInfo(transactionCount)} transactions).`,
        )

        cache.addTxActionCache(filename, actionName)
      })
      .with('txSubmitted', () => {
        const parsedValue = value as OnChainActionCallbackParams['txSubmitted']

        cache.addTxCache(filename, { txHash: parsedValue.txHash, status: TX_STATUS.PENDING, txBuilderName: parsedValue.name })
      })
      .with('txConfirmed', () => {
        const parsedValue = value as OnChainActionCallbackParams['txConfirmed']

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
        const parsedValue = value as OnChainActionCallbackParams['txChecked']

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
        const parsedValue = value as OnChainActionCallbackParams['subActionStarted']

        const cacheObject = cache.getCache().txs[filename]
        if (cacheObject.subActions[currentSubActionStartIndex] && cacheObject.subActions[currentSubActionStartIndex].subActionName === parsedValue.name) {
          return
        }

        currentSubActionStartIndex++
        currentSubActionName = parsedValue.name

        cache.addTxSubActionCache(filename, parsedValue.name)
      })
      .with('subActionFinished', () => {
        currentSubActionCount += 1

        if (currentSubActionCount >= totalSubActions) {
          return
        }

        spinner.text = `Executing ${chalkInfo(actionName)} - ${chalkInfo(currentSubActionName)} (${chalkInfo(`${currentSubActionCount + 1}/${totalSubActions}`)} sub-actions, ${chalkInfo(transactionCount)} transactions).`
      })
      .otherwise(() => {})
  }

  return callback
}

export const executeOffChainActionCallbackHandler = (spinner: Ora, projectConfig: InfinitConfigSchema, actionName: string) => {
  let prevMesssage: string | undefined
  let totalSteps: number = 0
  const callback: OffChainActionCallback = async (key: OffChainActionCallbackKeys, value) => {
    match(key)
      .with('start', () => {})
      .with('progress', () => {
        const { totalSteps: _totalSteps, currentStep, message } = value as OffChainActionCallbackParams['progress']
        totalSteps = _totalSteps ?? 0

        // finish prev step
        if (currentStep && currentStep > 1) {
          spinner.succeed(`${chalkInfo(prevMesssage)} (${chalkInfo(`${currentStep - 1}/${totalSteps}`)} steps).`)
        }

        // start current step
        spinner.start(`${chalkInfo(message)} (${chalkInfo(`${currentStep}/${totalSteps}`)} steps).`)
        prevMesssage = message
      })
      .with('finish', () => {
        // finish last step
        spinner.succeed(`${chalkInfo(prevMesssage)} (${chalkInfo(`${totalSteps}/${totalSteps}`)} steps).`)

        // send analytics (if allowed)
        if (projectConfig.allow_analytics) {
          sendOffChainEvent({
            action: actionName,
            payload: {},
          })
        }
      })
      .otherwise(() => {})
  }

  return callback
}
