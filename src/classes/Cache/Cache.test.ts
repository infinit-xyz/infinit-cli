import fs from 'fs'
import ora from 'ora'
import path from 'path'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'

import { executeActionCallbackHandler } from '@commands/script/execute/callback'
import { FILE_NAMES } from '@constants'
import { checkFilesExist, writeFileSync } from '@utils/files'
import { jsonSafeParse, parseDateReviver } from '@utils/json'

import { Cache, cache } from './Cache'
import { TX_STATUS } from './Cache.enum'
import { type InfinitCliCache, InfinitCliCacheZod } from './Cache.type'
import { example1, example1Parsed, mockProjectConfig } from './__mocks__/constants'

/**
 * Enable this snippet to separate the cache instance from the cache mock instance
 */
// import { FILE_NAMES } from '@constants'
// import { writeFileSync } from '@utils/files'
// import path from 'path'
// import { Cache } from './Cache'

// const cacheFilePath = path.join(__dirname, '..', '..', '..', '..', 'infinit-test-script-area', 'test-caches')
// writeFileSync(path.join(cacheFilePath, FILE_NAMES.CACHE), JSON.stringify(Cache.getCacheDefault(), undefined, 2))
// const cache = new Cache(cacheFilePath)
/**
 * End of snippet
 */

/**
 * Mock and constant
 */
vi.mock('@classes/Cache/Cache')

const getCacheFile = () => {
  const parsedCacheObject = JSON.parse(fs.readFileSync(cache.getCacheFilePath(), 'utf-8'), parseDateReviver)
  return InfinitCliCacheZod.parse(parsedCacheObject)
}

/**
 * Test
 */

describe('Cache', () => {
  beforeAll(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  beforeEach(() => {
    // tell vitest we use mocked time
    vi.useFakeTimers()
  })

  afterEach(() => {
    // restoring date after each test run
    vi.useRealTimers()
  })

  describe('Cache instance: new config file', () => {
    afterAll(() => {
      cache.deleteTxActionCache('action-01')
    })
    test('Should cache the value and write file correctly', () => {
      const date = new Date(1725584400_000) // Fri Sep 06 2024 01:00:00 GMT+0000
      vi.setSystemTime(date)

      cache.addTxActionCache('action-01', 'action-name-01')
      cache.addTxSubActionCache('action-01', 'sub-action-01')
      cache.addTxCache('action-01', {
        txHash: '0x001',
        status: TX_STATUS.PENDING,
        txBuilderName: 'tx-builder-name-01',
      })

      const expectedCacheObject: InfinitCliCache = {
        txs: {
          'action-01': {
            actionName: 'action-name-01',
            subActions: [
              {
                subActionName: 'sub-action-01',
                txHashes: [
                  {
                    txHash: '0x001',
                    txBuilderName: 'tx-builder-name-01',
                    status: TX_STATUS.PENDING,
                    createdAt: date,
                    updatedAt: date,
                  },
                ],
              },
            ],
          },
        },
      }

      // Read from cache instance
      const cacheObject = cache.getCache()
      expect(cacheObject.txs['action-01']).toBeDefined()
      expect(cacheObject.txs['action-01'].actionName).toBe('action-name-01')
      expect(cacheObject.txs['action-01'].subActions[0].subActionName).toBe('sub-action-01')
      expect(cacheObject.txs['action-01'].subActions[0].txHashes).toBeDefined()
      expect(cacheObject.txs['action-01'].subActions[0].txHashes[0].txHash).toBe('0x001')
      expect(cacheObject.txs['action-01'].subActions[0].txHashes[0].status).toBe(TX_STATUS.PENDING)
      expect(cacheObject.txs['action-01'].subActions[0].txHashes[0].createdAt).toBeInstanceOf(Date)
      expect(cacheObject.txs['action-01'].subActions[0].txHashes[0].updatedAt).toBeInstanceOf(Date)
      expect(
        cacheObject.txs['action-01'].subActions[0].txHashes[0].createdAt.getTime() ===
          cacheObject.txs['action-01'].subActions[0].txHashes[0].updatedAt.getTime(),
      ).toBeTruthy()

      expect(cacheObject.txs['action-02']).toBeUndefined()

      expect(cacheObject).toStrictEqual(expectedCacheObject)

      // Read from cache file
      const cacheFileObject = getCacheFile()
      expect(cacheFileObject.txs['action-01']).toBeDefined()
      expect(cacheFileObject.txs['action-01'].actionName).toBe('action-name-01')
      expect(cacheFileObject.txs['action-01'].subActions[0].subActionName).toBe('sub-action-01')
      expect(cacheFileObject.txs['action-01'].subActions[0].txHashes).toBeDefined()
      expect(cacheFileObject.txs['action-01'].subActions[0].txHashes[0].txHash).toBe('0x001')
      expect(cacheFileObject.txs['action-01'].subActions[0].txHashes[0].status).toBe(TX_STATUS.PENDING)
      expect(cacheFileObject.txs['action-01'].subActions[0].txHashes[0].createdAt).toBeInstanceOf(Date)
      expect(cacheFileObject.txs['action-01'].subActions[0].txHashes[0].updatedAt).toBeInstanceOf(Date)
      expect(
        cacheFileObject.txs['action-01'].subActions[0].txHashes[0].createdAt.getTime() ===
          cacheFileObject.txs['action-01'].subActions[0].txHashes[0].updatedAt.getTime(),
      ).toBeTruthy()

      expect(cacheFileObject.txs['action-02']).toBeUndefined()

      expect(cacheFileObject).toStrictEqual(expectedCacheObject)
    })

    test('Should update the cache correctly', () => {
      const createdAtDate = new Date(1725584400_000) // Fri Sep 06 2024 01:00:00 GMT+0000
      const updatedAtDate = new Date(1725584460_001) // Fri Sep 06 2024 01:01:00 GMT+0000
      vi.setSystemTime(updatedAtDate)

      cache.updateTxCache('action-01', '0x001', { status: TX_STATUS.CONFIRMED })

      const expectedCacheObject: InfinitCliCache = {
        txs: {
          'action-01': {
            actionName: 'action-name-01',
            subActions: [
              {
                subActionName: 'sub-action-01',
                txHashes: [
                  {
                    txHash: '0x001',
                    txBuilderName: 'tx-builder-name-01',
                    status: TX_STATUS.CONFIRMED,
                    createdAt: createdAtDate,
                    updatedAt: updatedAtDate,
                  },
                ],
              },
            ],
          },
        },
      }

      // Read from cache instance
      const cacheObject = cache.getCache()
      expect(cacheObject.txs['action-01']).toBeDefined()
      expect(cacheObject.txs['action-01'].actionName).toBe('action-name-01')
      expect(cacheObject.txs['action-01'].subActions[0].subActionName).toBe('sub-action-01')
      expect(cacheObject.txs['action-01'].subActions[0].txHashes).toBeDefined()
      expect(cacheObject.txs['action-01'].subActions[0].txHashes[0].txHash).toBe('0x001')
      expect(cacheObject.txs['action-01'].subActions[0].txHashes[0].status).toBe(TX_STATUS.CONFIRMED)
      expect(cacheObject.txs['action-01'].subActions[0].txHashes[0].createdAt).toBeInstanceOf(Date)
      expect(cacheObject.txs['action-01'].subActions[0].txHashes[0].updatedAt).toBeInstanceOf(Date)

      const createdAtTimestamp = cacheObject.txs['action-01'].subActions[0].txHashes[0].createdAt.getTime()
      const updatedAtTimestamp = cacheObject.txs['action-01'].subActions[0].txHashes[0].updatedAt.getTime()
      expect(createdAtTimestamp === updatedAtTimestamp).toBeFalsy()
      expect(updatedAtTimestamp > createdAtTimestamp).toBeTruthy()

      expect(cacheObject.txs['action-02']).toBeUndefined()

      expect(cacheObject).toStrictEqual(expectedCacheObject)

      // Read from cache file
      const cacheFileObject = cache.getCache()
      expect(cacheFileObject.txs['action-01']).toBeDefined()
      expect(cacheFileObject.txs['action-01'].subActions[0].subActionName).toBe('sub-action-01')
      expect(cacheFileObject.txs['action-01'].subActions[0].txHashes).toBeDefined()
      expect(cacheFileObject.txs['action-01'].subActions[0].txHashes[0].txHash).toBe('0x001')
      expect(cacheFileObject.txs['action-01'].subActions[0].txHashes[0].status).toBe(TX_STATUS.CONFIRMED)
      expect(cacheFileObject.txs['action-01'].subActions[0].txHashes[0].createdAt).toBeInstanceOf(Date)
      expect(cacheFileObject.txs['action-01'].subActions[0].txHashes[0].updatedAt).toBeInstanceOf(Date)

      const createdAtFileTimestamp = cacheFileObject.txs['action-01'].subActions[0].txHashes[0].createdAt.getTime()
      const updatedAtFileTimestamp = cacheFileObject.txs['action-01'].subActions[0].txHashes[0].updatedAt.getTime()
      expect(createdAtFileTimestamp === updatedAtFileTimestamp).toBeFalsy()
      expect(updatedAtFileTimestamp > createdAtFileTimestamp).toBeTruthy()

      expect(cacheFileObject.txs['action-02']).toBeUndefined()

      expect(cacheFileObject).toStrictEqual(expectedCacheObject)
    })

    test('Should delete the tx cache correctly', () => {
      cache.deleteTxCache('action-01', '0x001')

      const expectedCacheObject: InfinitCliCache = {
        txs: {
          'action-01': {
            actionName: 'action-name-01',
            subActions: [
              {
                subActionName: 'sub-action-01',
                txHashes: [],
              },
            ],
          },
        },
      }

      // Read from cache instance
      const cacheObject = cache.getCache()
      expect(cacheObject.txs['action-01']).toStrictEqual({ actionName: 'action-name-01', subActions: [{ subActionName: 'sub-action-01', txHashes: [] }] })
      expect(cacheObject.txs['action-02']).toBeUndefined()

      expect(cacheObject).toStrictEqual(expectedCacheObject)

      // Read from cache file
      const cacheFileObject = getCacheFile()
      expect(cacheFileObject.txs['action-01']).toStrictEqual({ actionName: 'action-name-01', subActions: [{ subActionName: 'sub-action-01', txHashes: [] }] })
      expect(cacheFileObject.txs['action-02']).toBeUndefined()

      expect(cacheFileObject).toStrictEqual(expectedCacheObject)
    })

    test('Should delete the tx action cache correctly', () => {
      const dateTx01 = new Date(1725584400_000) // Fri Sep 06 2024 01:00:00 GMT+0000
      const dateTx02 = new Date(1725584460_000) // Fri Sep 06 2024 01:01:00 GMT+0000

      vi.setSystemTime(dateTx01)
      cache.addTxCache('action-01', {
        txHash: '0x001',
        status: TX_STATUS.PENDING,
        txBuilderName: 'tx-builder-name-01',
      })

      vi.setSystemTime(dateTx02)
      cache.addTxCache('action-01', {
        txHash: '0x002',
        status: TX_STATUS.PENDING,
        txBuilderName: 'tx-builder-name-02',
      })

      cache.deleteTxActionCache('action-01')

      const expectedCacheObject: InfinitCliCache = { txs: {} }

      // Read from cache instance
      const cacheObject = cache.getCache()
      expect(cacheObject.txs['action-01']).toBeUndefined()
      expect(cacheObject.txs['action-02']).toBeUndefined()

      expect(cacheObject).toStrictEqual(expectedCacheObject)

      // Read from cache file
      const cacheFileObject = getCacheFile()
      expect(cacheFileObject.txs['action-01']).toBeUndefined()
      expect(cacheFileObject.txs['action-02']).toBeUndefined()

      expect(cacheFileObject).toStrictEqual(expectedCacheObject)
    })

    test('Should delete the sub action cache correctly', () => {
      const dateTx01 = new Date(1725584400_000) // Fri Sep 06 2024 01:00:00 GMT+0000
      const dateTx02 = new Date(1725584460_000) // Fri Sep 06 2024 01:01:00 GMT+0000

      cache.addTxActionCache('action-01', 'action-name-01')

      vi.setSystemTime(dateTx01)
      cache.addTxSubActionCache('action-01', 'sub-action-01')
      cache.addTxCache('action-01', {
        txHash: '0x001',
        status: TX_STATUS.PENDING,
        txBuilderName: 'tx-builder-name-01',
      })

      vi.setSystemTime(dateTx02)
      cache.addTxSubActionCache('action-01', 'sub-action-02')
      cache.addTxCache('action-01', {
        txHash: '0x002',
        status: TX_STATUS.PENDING,
        txBuilderName: 'tx-builder-name-02',
      })

      cache.deleteTxSubActionCache('action-01', 'sub-action-01')

      const expectedCacheObject: InfinitCliCache = {
        txs: {
          'action-01': {
            actionName: 'action-name-01',
            subActions: [
              {
                subActionName: 'sub-action-02',
                txHashes: [
                  {
                    txHash: '0x002',
                    txBuilderName: 'tx-builder-name-02',
                    status: TX_STATUS.PENDING,
                    createdAt: dateTx02,
                    updatedAt: dateTx02,
                  },
                ],
              },
            ],
          },
        },
      }

      // Read from cache instance
      const cacheObject = cache.getCache()
      expect(cacheObject.txs['action-01']).toBeDefined()
      expect(cacheObject.txs['action-01'].actionName).toBe('action-name-01')
      expect(cacheObject.txs['action-01'].subActions.length).toBe(1)
      expect(cacheObject.txs['action-01'].subActions[0].subActionName).toBe('sub-action-02')
      expect(cacheObject.txs['action-01'].subActions[0].txHashes.length).toBe(1)
      expect(cacheObject.txs['action-01'].subActions[0].txHashes[0].txHash).toBe('0x002')
      expect(cacheObject.txs['action-01'].subActions[0].txHashes[0].status).toBe(TX_STATUS.PENDING)

      expect(cacheObject.txs['action-02']).toBeUndefined()

      expect(cacheObject).toStrictEqual(expectedCacheObject)

      // Read from cache file
      const cacheFileObject = getCacheFile()
      expect(cacheFileObject.txs['action-01']).toBeDefined()
      expect(cacheObject.txs['action-01'].actionName).toBe('action-name-01')
      expect(cacheFileObject.txs['action-01'].subActions.length).toBe(1)
      expect(cacheFileObject.txs['action-01'].subActions[0].subActionName).toBe('sub-action-02')
      expect(cacheFileObject.txs['action-01'].subActions[0].txHashes.length).toBe(1)
      expect(cacheFileObject.txs['action-01'].subActions[0].txHashes[0].txHash).toBe('0x002')
      expect(cacheFileObject.txs['action-01'].subActions[0].txHashes[0].status).toBe(TX_STATUS.PENDING)

      expect(cacheFileObject.txs['action-02']).toBeUndefined()

      expect(cacheFileObject).toStrictEqual(expectedCacheObject)

      // Delete TxSubActionCache

      cache.deleteTxSubActionCache('action-01', 'sub-action-02')

      const expectedCacheObjectAfterDelete: InfinitCliCache = {
        txs: {
          ['action-01']: { actionName: 'action-name-01', subActions: [] },
        },
      }

      // Read from cache instance
      const cacheObject2 = cache.getCache()
      expect(cacheObject2.txs['action-01'].subActions.length).toBe(0)
      expect(cacheObject2).toStrictEqual(expectedCacheObjectAfterDelete)

      // Read from cache file
      const cacheFileObject2 = getCacheFile()
      expect(cacheFileObject2.txs['action-01'].subActions.length).toBe(0)
      expect(cacheFileObject2).toStrictEqual(expectedCacheObjectAfterDelete)
    })
  })

  describe('Cache instance: existing config file', () => {
    const cacheFolderPath = path.join(__dirname, '..', '..', '..', '..', 'infinit-test-script-area', 'test-caches-2')
    const cacheFilePath = path.join(cacheFolderPath, FILE_NAMES.CACHE)
    writeFileSync(cacheFilePath, example1)
    const cache = new Cache(cacheFolderPath)

    afterAll(() => {
      fs.unlinkSync(cacheFilePath)
    })

    test('Should load the cache correctly', () => {
      const cacheObject = cache.getCache()

      expect(cacheObject).toStrictEqual(jsonSafeParse(example1, parseDateReviver).parsedJson)
      expect(cacheObject).toStrictEqual(example1Parsed)
    })
  })

  describe('Action Callback Cache', () => {
    const spinner = ora({ spinner: 'dots' })

    const actionCb01Callback = executeActionCallbackHandler(spinner, 'action-cb-01', mockProjectConfig, ['0x123'])

    const txHash01 = '0x001'
    const txHash02 = '0x002'
    const txHash03 = '0x003'

    const date00 = new Date(1725584400_000) // Fri Sep 06 2024 01:00:00 GMT+0000
    const date01 = new Date(1725584460_000) // Fri Sep 06 2024 01:01:00 GMT+0000
    const date02 = new Date(1725584520_000) // Fri Sep 06 2024 01:02:00 GMT+0000
    const date03 = new Date(1725584580_000) // Fri Sep 06 2024 01:03:00 GMT+0000

    test('actionInfo', () => {
      actionCb01Callback('actionInfo', { name: 'action-name-01' })

      const expectedCacheObject: InfinitCliCache = {
        txs: {
          ['action-cb-01']: { actionName: 'action-name-01', subActions: [] },
        },
      }

      const cacheObject = cache.getCache()
      expect(cacheObject.txs['action-cb-01']).toBeDefined()
      expect(cacheObject.txs['action-cb-01'].actionName).toBe('action-name-01')
      expect(cacheObject.txs['action-cb-01'].subActions).toBeDefined()
      expect(cacheObject.txs['action-cb-01'].subActions.length).toBe(0)
      expect(cacheObject).toStrictEqual({ txs: { ['action-cb-01']: { actionName: 'action-name-01', subActions: [] } } })

      expect(cacheObject).toStrictEqual(expectedCacheObject)

      const cacheFileObject = getCacheFile()
      expect(cacheFileObject.txs['action-cb-01']).toBeDefined()
      expect(cacheFileObject.txs['action-cb-01'].actionName).toBe('action-name-01')
      expect(cacheFileObject.txs['action-cb-01'].subActions).toBeDefined()
      expect(cacheFileObject.txs['action-cb-01'].subActions.length).toBe(0)
      expect(cacheFileObject).toStrictEqual({ txs: { ['action-cb-01']: { actionName: 'action-name-01', subActions: [] } } })

      expect(cacheFileObject).toStrictEqual(expectedCacheObject)
    })

    test('txSubmitted', () => {
      const duringCallback = date00

      vi.setSystemTime(date00)
      actionCb01Callback('actionInfo', { name: 'action-name-01' })
      actionCb01Callback('subActionStarted', { name: 'sub-action-01' })
      actionCb01Callback('txSubmitted', { txHash: txHash01, name: 'tx-builder-name-01' })

      const expectedCacheObject: InfinitCliCache = {
        txs: {
          ['action-cb-01']: {
            actionName: 'action-name-01',
            subActions: [
              {
                subActionName: 'sub-action-01',
                txHashes: [
                  {
                    txHash: txHash01,
                    txBuilderName: 'tx-builder-name-01',
                    status: TX_STATUS.PENDING,
                    createdAt: duringCallback,
                    updatedAt: duringCallback,
                  },
                ],
              },
            ],
          },
        },
      }

      const cacheObject = cache.getCache()
      expect(cacheObject.txs['action-cb-01']).toBeDefined()
      expect(cacheObject.txs['action-cb-01'].subActions[0].subActionName).toBe('sub-action-01')
      expect(cacheObject.txs['action-cb-01'].subActions[0].txHashes).toBeDefined()
      expect(cacheObject.txs['action-cb-01'].subActions[0].txHashes[0].txHash).toBe(txHash01)
      expect(cacheObject.txs['action-cb-01'].subActions[0].txHashes[0].status).toBe(TX_STATUS.PENDING)
      expect(cacheObject.txs['action-cb-01'].subActions[0].txHashes[0].createdAt).toBeInstanceOf(Date)
      expect(cacheObject.txs['action-cb-01'].subActions[0].txHashes[0].updatedAt).toBeInstanceOf(Date)

      expect(cacheObject).toStrictEqual(expectedCacheObject)

      const cacheFileObject = getCacheFile()
      expect(cacheFileObject.txs['action-cb-01']).toBeDefined()
      expect(cacheFileObject.txs['action-cb-01'].subActions[0].subActionName).toBe('sub-action-01')
      expect(cacheFileObject.txs['action-cb-01'].subActions[0].txHashes).toBeDefined()
      expect(cacheFileObject.txs['action-cb-01'].subActions[0].txHashes[0].txHash).toBe(txHash01)
      expect(cacheFileObject.txs['action-cb-01'].subActions[0].txHashes[0].status).toBe(TX_STATUS.PENDING)
      expect(cacheFileObject.txs['action-cb-01'].subActions[0].txHashes[0].createdAt).toBeInstanceOf(Date)
      expect(cacheFileObject.txs['action-cb-01'].subActions[0].txHashes[0].updatedAt).toBeInstanceOf(Date)

      expect(cacheFileObject).toStrictEqual(expectedCacheObject)
    })

    test('txConfirmed', () => {
      const createdAt = date00
      const updatedAt = date01

      vi.setSystemTime(updatedAt)
      actionCb01Callback('txConfirmed', { txHash: txHash01, status: 'CONFIRMED', walletAddress: '0x0' })

      const expectedCacheObject: InfinitCliCache = {
        txs: {
          ['action-cb-01']: {
            actionName: 'action-name-01',
            subActions: [
              {
                subActionName: 'sub-action-01',
                txHashes: [
                  {
                    txHash: txHash01,
                    txBuilderName: 'tx-builder-name-01',
                    status: TX_STATUS.CONFIRMED,
                    createdAt,
                    updatedAt,
                  },
                ],
              },
            ],
          },
        },
      }

      const cacheObject = cache.getCache()
      expect(cacheObject.txs['action-cb-01']).toBeDefined()
      expect(cacheObject.txs['action-cb-01'].subActions[0].txHashes[0].txHash).toBe(txHash01)
      expect(cacheObject.txs['action-cb-01'].subActions[0].txHashes[0].status).toBe(TX_STATUS.CONFIRMED)
      expect(cacheObject.txs['action-cb-01'].subActions[0].txHashes[0].createdAt).toBeInstanceOf(Date)
      expect(cacheObject.txs['action-cb-01'].subActions[0].txHashes[0].updatedAt).toBeInstanceOf(Date)

      expect(cacheObject).toStrictEqual(expectedCacheObject)

      const cacheFileObject = getCacheFile()
      expect(cacheFileObject.txs['action-cb-01']).toBeDefined()
      expect(cacheFileObject.txs['action-cb-01'].subActions[0].txHashes[0].txHash).toBe(txHash01)
      expect(cacheFileObject.txs['action-cb-01'].subActions[0].txHashes[0].status).toBe(TX_STATUS.CONFIRMED)
      expect(cacheFileObject.txs['action-cb-01'].subActions[0].txHashes[0].createdAt).toBeInstanceOf(Date)
      expect(cacheFileObject.txs['action-cb-01'].subActions[0].txHashes[0].updatedAt).toBeInstanceOf(Date)

      expect(cacheFileObject).toStrictEqual(expectedCacheObject)
    })

    test('txChecked, CONFIRMED & PENDING', () => {
      const createdAt = date02
      const updatedAt = date03

      vi.setSystemTime(createdAt)
      actionCb01Callback('txSubmitted', { txHash: txHash02, name: 'tx-builder-name-02' })
      actionCb01Callback('txSubmitted', { txHash: txHash03, name: 'tx-builder-name-03' })

      vi.setSystemTime(updatedAt)
      actionCb01Callback('txChecked', { txHash: txHash02, status: 'CONFIRMED', walletAddress: '0x0' })
      actionCb01Callback('txChecked', { txHash: txHash03, status: 'PENDING', walletAddress: '0x0' })

      const expectedCacheObject: InfinitCliCache = {
        txs: {
          ['action-cb-01']: {
            actionName: 'action-name-01',
            subActions: [
              {
                subActionName: 'sub-action-01',
                txHashes: [
                  {
                    txHash: txHash01,
                    txBuilderName: 'tx-builder-name-01',
                    status: TX_STATUS.CONFIRMED,
                    createdAt: date00,
                    updatedAt: date01,
                  },
                  {
                    txHash: txHash02,
                    txBuilderName: 'tx-builder-name-02',
                    status: TX_STATUS.CONFIRMED,
                    createdAt,
                    updatedAt,
                  },
                  {
                    txHash: txHash03,
                    txBuilderName: 'tx-builder-name-03',
                    status: TX_STATUS.PENDING,
                    createdAt,
                    updatedAt,
                  },
                ],
              },
            ],
          },
        },
      }

      const cacheObject = cache.getCache()
      expect(cacheObject.txs['action-cb-01']).toBeDefined()
      expect(cacheObject.txs['action-cb-01'].subActions[0].txHashes[1].txHash).toBe(txHash02)
      expect(cacheObject.txs['action-cb-01'].subActions[0].txHashes[1].status).toBe(TX_STATUS.CONFIRMED)
      expect(cacheObject.txs['action-cb-01'].subActions[0].txHashes[1].createdAt).toBeInstanceOf(Date)
      expect(cacheObject.txs['action-cb-01'].subActions[0].txHashes[1].updatedAt).toBeInstanceOf(Date)

      expect(cacheObject.txs['action-cb-01'].subActions[0].txHashes[2].txHash).toBe(txHash03)
      expect(cacheObject.txs['action-cb-01'].subActions[0].txHashes[2].status).toBe(TX_STATUS.PENDING)
      expect(cacheObject.txs['action-cb-01'].subActions[0].txHashes[2].createdAt).toBeInstanceOf(Date)
      expect(cacheObject.txs['action-cb-01'].subActions[0].txHashes[2].updatedAt).toBeInstanceOf(Date)

      expect(cacheObject).toStrictEqual(expectedCacheObject)

      const cacheFileObject = getCacheFile()
      expect(cacheFileObject.txs['action-cb-01']).toBeDefined()
      expect(cacheFileObject.txs['action-cb-01'].subActions[0].txHashes[1].txHash).toBe(txHash02)
      expect(cacheFileObject.txs['action-cb-01'].subActions[0].txHashes[1].status).toBe(TX_STATUS.CONFIRMED)
      expect(cacheFileObject.txs['action-cb-01'].subActions[0].txHashes[1].createdAt).toBeInstanceOf(Date)
      expect(cacheFileObject.txs['action-cb-01'].subActions[0].txHashes[1].updatedAt).toBeInstanceOf(Date)

      expect(cacheFileObject.txs['action-cb-01'].subActions[0].txHashes[2].txHash).toBe(txHash03)
      expect(cacheFileObject.txs['action-cb-01'].subActions[0].txHashes[2].status).toBe(TX_STATUS.PENDING)
      expect(cacheFileObject.txs['action-cb-01'].subActions[0].txHashes[2].createdAt).toBeInstanceOf(Date)
      expect(cacheFileObject.txs['action-cb-01'].subActions[0].txHashes[2].updatedAt).toBeInstanceOf(Date)

      expect(cacheFileObject).toStrictEqual(expectedCacheObject)
    })

    test('txChecked, REVERTED', () => {
      actionCb01Callback('txChecked', { txHash: txHash02, status: 'REVERTED', walletAddress: '0x0' })

      const expectedCacheObject: InfinitCliCache = {
        txs: {
          ['action-cb-01']: {
            actionName: 'action-name-01',
            subActions: [
              {
                subActionName: 'sub-action-01',
                txHashes: [
                  {
                    txHash: txHash01,
                    txBuilderName: 'tx-builder-name-01',
                    status: TX_STATUS.CONFIRMED,
                    createdAt: date00,
                    updatedAt: date01,
                  },
                  {
                    txHash: txHash03,
                    txBuilderName: 'tx-builder-name-03',
                    status: TX_STATUS.PENDING,
                    createdAt: date02,
                    updatedAt: date03,
                  },
                ],
              },
            ],
          },
        },
      }

      const cacheObject = cache.getCache()
      expect(cacheObject.txs['action-cb-01']).toBeDefined()
      expect(cacheObject.txs['action-cb-01'].subActions[0].txHashes[1].txHash).toBe(txHash03) // txHash02 should be deleted

      expect(cacheObject).toStrictEqual(expectedCacheObject)

      const cacheFileObject = getCacheFile()
      expect(cacheFileObject.txs['action-cb-01']).toBeDefined()
      expect(cacheFileObject.txs['action-cb-01'].subActions[0].txHashes[1].txHash).toBe(txHash03) // txHash02 should be deleted

      expect(cacheFileObject).toStrictEqual(expectedCacheObject)
    })

    test('txChecked, NOT_FOUND', () => {
      actionCb01Callback('txChecked', { txHash: txHash03, status: 'NOT_FOUND', walletAddress: '0x0' })

      const expectedCacheObject: InfinitCliCache = {
        txs: {
          ['action-cb-01']: {
            actionName: 'action-name-01',
            subActions: [
              {
                subActionName: 'sub-action-01',
                txHashes: [
                  {
                    txHash: txHash01,
                    txBuilderName: 'tx-builder-name-01',
                    status: TX_STATUS.CONFIRMED,
                    createdAt: date00,
                    updatedAt: date01,
                  },
                ],
              },
            ],
          },
        },
      }

      const cacheObject = cache.getCache()
      expect(cacheObject.txs['action-cb-01']).toBeDefined()
      expect(cacheObject.txs['action-cb-01'].subActions[1]).toBeUndefined()

      expect(cacheObject).toStrictEqual(expectedCacheObject)

      const cacheFileObject = getCacheFile()
      expect(cacheFileObject.txs['action-cb-01']).toBeDefined()
      expect(cacheFileObject.txs['action-cb-01'].subActions[1]).toBeUndefined()

      expect(cacheFileObject).toStrictEqual(expectedCacheObject)
    })

    test('subActionStarted', () => {
      actionCb01Callback('subActionStarted', { name: 'sub-action-02' })

      const expectedCacheObject: InfinitCliCache = {
        txs: {
          ['action-cb-01']: {
            actionName: 'action-name-01',
            subActions: [
              {
                subActionName: 'sub-action-01',
                txHashes: [
                  {
                    txHash: txHash01,
                    txBuilderName: 'tx-builder-name-01',
                    status: TX_STATUS.CONFIRMED,
                    createdAt: date00,
                    updatedAt: date01,
                  },
                ],
              },
              { subActionName: 'sub-action-02', txHashes: [] },
            ],
          },
        },
      }

      const cacheObject = cache.getCache()
      expect(cacheObject.txs['action-cb-01']).toBeDefined()
      expect(cacheObject.txs['action-cb-01'].subActions[1].subActionName).toBe('sub-action-02')
      expect(cacheObject.txs['action-cb-01'].subActions[1].txHashes).toBeDefined()
      expect(cacheObject.txs['action-cb-01'].subActions[1].txHashes.length).toBe(0)

      expect(cacheObject).toStrictEqual(expectedCacheObject)

      const cacheFileObject = getCacheFile()
      expect(cacheFileObject.txs['action-cb-01']).toBeDefined()
      expect(cacheFileObject.txs['action-cb-01'].subActions[1].subActionName).toBe('sub-action-02')
      expect(cacheFileObject.txs['action-cb-01'].subActions[1].txHashes).toBeDefined()
      expect(cacheFileObject.txs['action-cb-01'].subActions[1].txHashes.length).toBe(0)

      expect(cacheFileObject).toStrictEqual(expectedCacheObject)
    })
  })

  describe('Corrupted cache', () => {
    test('Blank cache file', () => {
      const date = new Date(1725584400_000) // Fri Sep 06 2024 01:00:00 GMT+0000
      vi.setSystemTime(date)
      const expectedBackupCacheName = `infinit-1725584400.cache.bak.json`

      const blankCachePath = path.join(__dirname, '..', '..', '..', '..', 'infinit-test-script-area', 'test-caches')
      writeFileSync(path.join(blankCachePath, FILE_NAMES.CACHE), '')

      const cache = new Cache(blankCachePath)
      expect(cache.getCache()).toStrictEqual(Cache.getCacheDefault())

      const blankFileRead = fs.readFileSync(path.join(blankCachePath, expectedBackupCacheName), 'utf-8')
      expect(blankFileRead).toStrictEqual('')

      cache.addTxActionCache('action-01', 'action-name-01') // to trigger the cache to be written to file

      expect(checkFilesExist({ [FILE_NAMES.CACHE]: true, [expectedBackupCacheName]: true }, blankCachePath)).toBeTruthy()

      checkFilesExist({ [FILE_NAMES.CACHE]: true, [expectedBackupCacheName]: true }, blankCachePath)

      const newCacheFileObject = fs.readFileSync(path.join(blankCachePath, FILE_NAMES.CACHE), 'utf-8')
      const parsedNewCacheFileObject = JSON.parse(newCacheFileObject, parseDateReviver)
      expect(parsedNewCacheFileObject).toStrictEqual({ txs: { ['action-01']: { actionName: 'action-name-01', subActions: [] } } })

      // Clean up
      fs.unlinkSync(path.join(blankCachePath, FILE_NAMES.CACHE))
      fs.unlinkSync(path.join(blankCachePath, expectedBackupCacheName))
    })

    test('Wrong schema file', () => {
      const date = new Date(1725584401_000) // Fri Sep 06 2024 01:00:01 GMT+0000
      vi.setSystemTime(date)
      const expectedBackupCacheName = `infinit-1725584401.cache.bak.json`

      const blankCachePath = path.join(__dirname, '..', '..', '..', '..', 'infinit-test-script-area', 'test-caches')
      writeFileSync(path.join(blankCachePath, FILE_NAMES.CACHE), JSON.stringify({ txs: [] }))

      const cache = new Cache(blankCachePath)
      expect(cache.getCache()).toStrictEqual(Cache.getCacheDefault())

      const blankFileRead = fs.readFileSync(path.join(blankCachePath, expectedBackupCacheName), 'utf-8')
      expect(blankFileRead).toStrictEqual('{"txs":[]}')

      cache.addTxActionCache('action-01', 'action-name-01') // to trigger the cache to be written to file

      expect(checkFilesExist({ [FILE_NAMES.CACHE]: true, [expectedBackupCacheName]: true }, blankCachePath)).toBeTruthy()

      const newCacheFileObject = fs.readFileSync(path.join(blankCachePath, FILE_NAMES.CACHE), 'utf-8')
      const parsedNewCacheFileObject = JSON.parse(newCacheFileObject, parseDateReviver)
      expect(parsedNewCacheFileObject).toStrictEqual({ txs: { ['action-01']: { actionName: 'action-name-01', subActions: [] } } })

      // Clean up
      fs.unlinkSync(path.join(blankCachePath, FILE_NAMES.CACHE))
      fs.unlinkSync(path.join(blankCachePath, expectedBackupCacheName))
    })
  })

  describe('InfinitCliCacheZod', () => {
    test('parse wrong schema 1', () => {
      const parsedResult = InfinitCliCacheZod.parse({ hello: 'world' })
      expect(parsedResult).toStrictEqual(Cache.getCacheDefault())
    })

    test('parse wrong schema 2', () => {
      expect(() => InfinitCliCacheZod.parse({ txs: [] })).toThrowError()
    })

    test('parse wrong schema 3', () => {
      expect(() => InfinitCliCacheZod.parse({ txs: { 'action-01': { actionName: 'action-name-01' } } })).toThrowError()
    })

    test('parse correct schema 1', () => {
      const parsedJson = jsonSafeParse(example1, parseDateReviver)

      expect(parsedJson.success).toBeTruthy()

      let parsedCache: InfinitCliCache | undefined

      expect(() => {
        parsedCache = InfinitCliCacheZod.parse(parsedJson.parsedJson)
      }).not.toThrowError()

      expect(parsedCache).toBeDefined()
      expect(parsedCache).toStrictEqual(example1Parsed)
    })
  })
})
