import type { OffChainActionCallback, OnChainActionCallback } from '@infinit-xyz/core/types/callback'

import type { Ora } from 'ora'
import ora from 'ora'
import { type MockInstance, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'

import { BufferedStream } from '@classes/BufferedStream/BufferedStream'
import { cache } from '@classes/Cache/Cache'
import { executeOffChainActionCallbackHandler, executeOnChainActionCallbackHandler } from '@commands/script/execute/callback'
import { PROTOCOL_MODULE } from '@enums/module'
import type { InfinitConfigSchema } from '@schemas/generated'

vi.mock('@classes/Cache/Cache', () => ({
  cache: {
    addTxCache: vi.fn(),
    updateTxCache: vi.fn(),
    deleteTxCache: vi.fn(),
    getCache: vi.fn(),
    addTxSubActionCache: vi.fn(),
    addTxActionCache: vi.fn(),
  },
}))
vi.mock('@constants/chalk', () => ({
  chalkInfo: (str: string) => str,
}))

const MOCK_PROJECT_CONFIG = {
  chain_info: {
    block_explorer: {
      name: 'FAKE_NAME',
      api_url: 'FAKE_API_URL',
      api_key: 'FAKE_API_KEY',
      url: 'FALE_URL',
    },
  },
  protocol_module: PROTOCOL_MODULE.aave_v3,
} as InfinitConfigSchema

describe('Execute action callback handler', () => {
  const filename = 'testfile'
  const currentSubActionStartIndex = 0

  let mockSpinner: Ora

  beforeAll(() => {
    const customStream = new BufferedStream()
    mockSpinner = ora({ spinner: 'dots', stream: customStream })
  })

  describe('executeOnChainActionCallbackHandler', () => {
    let callback: OnChainActionCallback
    beforeEach(() => {
      callback = executeOnChainActionCallbackHandler(mockSpinner, filename, MOCK_PROJECT_CONFIG, [])
    })

    test('should handle callback in sequence', () => {
      callback('actionInfo', { name: 'actionName', totalSubActions: 2 })

      expect(mockSpinner.text).toBe(`Executing actionName -  (${currentSubActionStartIndex + 1}/2 sub-actions, 0 transactions).`)

      expect(cache.addTxActionCache).toHaveBeenCalledTimes(1)
      expect(cache.addTxActionCache).toHaveBeenCalledWith(filename, 'actionName')

      vi.mocked(cache.getCache).mockReturnValue({
        txs: {
          [filename]: {
            subActions: [{ subActionName: 'subActionName1', txHashes: [] }],
          },
        },
      })

      callback('subActionStarted', { name: 'subActionName1' })

      expect(cache.addTxSubActionCache).toHaveBeenCalledTimes(0)

      callback('txSubmitted', { txHash: '0x1234', name: 'txName', walletAddress: '0x0' })

      expect(cache.addTxCache).toHaveBeenCalledTimes(1)
      expect(cache.addTxCache).toHaveBeenCalledWith(filename, { txHash: '0x1234', status: 'PENDING', txBuilderName: 'txName' })

      callback('txConfirmed', { txHash: '0x1234', name: 'txName', walletAddress: '0x0' })

      expect(mockSpinner.text).toBe(`Executing actionName -  (${currentSubActionStartIndex + 1}/2 sub-actions, 1 transactions).`)

      expect(cache.updateTxCache).toHaveBeenCalledTimes(1)

      callback('subActionFinished', { name: 'subActionName1' })

      expect(mockSpinner.text).toBe(`Executing actionName -  (${currentSubActionStartIndex + 2}/2 sub-actions, 1 transactions).`)
    })

    test('should handle when all subaction has finished', () => {
      callback('actionInfo', { name: 'actionName', totalSubActions: 3 })
      expect(mockSpinner.text).toBe(`Executing actionName -  (1/3 sub-actions, 0 transactions).`)

      callback('subActionFinished', { name: 'subActionName1' })
      expect(mockSpinner.text).toBe(`Executing actionName -  (2/3 sub-actions, 0 transactions).`)

      callback('subActionFinished', { name: 'subActionName2' })
      expect(mockSpinner.text).toBe(`Executing actionName -  (3/3 sub-actions, 0 transactions).`)

      callback('subActionFinished', { name: 'subActionName3' })

      // the last one shouldn't change the text
      expect(mockSpinner.text).toBe(`Executing actionName -  (3/3 sub-actions, 0 transactions).`)
    })

    describe('txChecked', () => {
      beforeEach(() => {
        vi.mocked(cache.updateTxCache).mockClear()
        vi.mocked(cache.deleteTxCache).mockClear()
      })

      test('should handle CONFIRMED', () => {
        callback('txChecked', { txHash: '0x1234', status: 'CONFIRMED', walletAddress: '0x0' })

        expect(cache.updateTxCache).toHaveBeenCalledTimes(1)
        expect(cache.updateTxCache).toHaveBeenCalledWith(filename, '0x1234', { status: 'CONFIRMED' })
      })

      test('should handle PENDING', () => {
        callback('txChecked', { txHash: '0x1234', status: 'PENDING', walletAddress: '0x0' })

        expect(cache.updateTxCache).toHaveBeenCalledTimes(1)
        expect(cache.updateTxCache).toHaveBeenCalledWith(filename, '0x1234', { status: 'PENDING' })
      })

      test('should handle REVERTED', () => {
        callback('txChecked', { txHash: '0x1234', status: 'REVERTED', walletAddress: '0x0' })

        expect(cache.deleteTxCache).toHaveBeenCalledTimes(1)
        expect(cache.deleteTxCache).toHaveBeenCalledWith(filename, '0x1234')
      })

      test('should handle NOT_FOUND', () => {
        callback('txChecked', { txHash: '0x1234', status: 'NOT_FOUND', walletAddress: '0x0' })

        expect(cache.deleteTxCache).toHaveBeenCalledTimes(1)
        expect(cache.deleteTxCache).toHaveBeenCalledWith(filename, '0x1234')
      })
    })

    describe('subActionStarted', () => {
      test('shouild handle subActionStarted within the same subAction', () => {
        vi.mocked(cache.getCache).mockReturnValue({
          txs: {
            [filename]: {
              subActions: [{ subActionName: 'subActionName', txHashes: [] }],
            },
          },
        })

        callback('subActionStarted', { name: 'subActionName' })

        expect(cache.addTxSubActionCache).toHaveBeenCalledTimes(0)
      })

      test('shouild handle subActionStarted within new subAction', () => {
        vi.mocked(cache.getCache).mockReturnValue({
          txs: {
            [filename]: {
              subActions: [{ subActionName: 'subActionName', txHashes: [] }],
            },
          },
        })

        callback('subActionStarted', { name: 'newSubActionName' })

        expect(cache.addTxSubActionCache).toHaveBeenCalledTimes(1)
        expect(cache.addTxSubActionCache).toHaveBeenCalledWith(filename, 'newSubActionName')
      })
    })
  })

  describe('executeOffChainActionCallbackHandler', () => {
    let callback: OffChainActionCallback
    let spinnerStartSpy: MockInstance<typeof mockSpinner.start>
    let spinnerSucceedSpy: MockInstance<typeof mockSpinner.succeed>

    beforeAll(() => {
      spinnerStartSpy = vi.spyOn(mockSpinner, 'start')
      spinnerSucceedSpy = vi.spyOn(mockSpinner, 'succeed')
    })

    beforeEach(() => {
      callback = executeOffChainActionCallbackHandler(mockSpinner, MOCK_PROJECT_CONFIG, 'action-name')
    })

    test('should handle callback in sequence', () => {
      callback('progress', { currentStep: 1, totalSteps: 2, message: 'Validating data' })

      expect(spinnerStartSpy).toBeCalledWith(`Validating data (1/2 steps).`)

      callback('progress', { currentStep: 2, totalSteps: 2, message: 'Executed' })
      expect(spinnerSucceedSpy).toBeCalledWith(`Validating data (1/2 steps).`)
      expect(spinnerStartSpy).toBeCalledWith(`Executed (2/2 steps).`)

      callback('finish')
      expect(spinnerSucceedSpy).toBeCalledWith(`Executed (2/2 steps).`)
    })
  })
})
