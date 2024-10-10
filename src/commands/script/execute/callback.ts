import type { CallbackKeys, CallbackParams } from '@infinit-xyz/core/types/callback'

import { type Ora } from 'ora'
import { match } from 'ts-pattern'

import { cache } from '@classes/Cache/Cache'
import { TX_STATUS } from '@classes/Cache/Cache.enum'
import { chalkInfo } from '@constants/chalk'
import type { InfinitConfigSchema } from '@schemas/generated'
import { sendOnChainEvent } from '@utils/analytics'

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
      .with('subActionFinished', () => {
        currentSubActionCount += 1

        if (currentSubActionCount >= totalSubActions) {
          return
        }

        spinner.text = `Executing ${chalkInfo(actionName)} - ${chalkInfo(currentSubActionName)} (${chalkInfo(`${currentSubActionCount + 1}/${totalSubActions}`)} sub-actions, ${chalkInfo(transactionCount)} transactions).`
      })
      .otherwise(() => {})
  }
}
