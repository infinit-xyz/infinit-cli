import { EVENT_RESPONSE_MESSAGE, analyticsInstance, sendOffChainEvent, sendOnChainEvent } from '@utils/analytics'
import AxiosMockAdapter from 'axios-mock-adapter'
import { afterAll, beforeEach, describe, expect, test, vi } from 'vitest'

describe('analytics utils', () => {
  const mockOnChainEvent = {
    address: '0x123',
    module: 'module',
    action: 'action',
    chainId: 1,
    txHash: '0x123',
  }
  const mockOffChainEvent = {
    action: 'action',
    payload: { key: 'value' },
  }

  const mockInstance = new AxiosMockAdapter(analyticsInstance)

  beforeEach(() => {
    mockInstance.onPost('/events').reply(200, 'success bello')

    vi.stubEnv('NODE_ENV', 'production')
  })

  afterAll(() => {
    vi.unstubAllEnvs()
  })

  describe('sendOnChainEvent', async () => {
    test('should send the on-chain event successfully', async () => {
      const result = await sendOnChainEvent(mockOnChainEvent)

      expect(result).toEqual({
        result: 'success',
        message: EVENT_RESPONSE_MESSAGE.SUCCESS,
      })
    })

    test('should NOT send the on-chain event in the test environment', async () => {
      vi.stubEnv('NODE_ENV', 'test')

      const result = await sendOnChainEvent(mockOnChainEvent)

      expect(result).toEqual({
        result: 'failed',
        message: EVENT_RESPONSE_MESSAGE.WRONG_ENV,
      })
    })

    test('should silent the error even if the request fails', async () => {
      mockInstance.onPost('/events').reply(500, 'error')

      await expect(sendOnChainEvent(mockOnChainEvent)).resolves.not.toThrow()

      const result = await sendOnChainEvent(mockOnChainEvent)

      expect(result).toEqual({
        result: 'failed',
        message: EVENT_RESPONSE_MESSAGE.FAILED,
      })
    })
  })

  describe('sendOffChainEvent', () => {
    test('should send the off-chain event successfully', async () => {
      const result = await sendOffChainEvent(mockOffChainEvent)

      expect(result).toEqual({
        result: 'success',
        message: EVENT_RESPONSE_MESSAGE.SUCCESS,
      })
    })

    test('should NOT send the on-chain event in the test environment', async () => {
      vi.stubEnv('NODE_ENV', 'test')

      const result = await sendOffChainEvent(mockOffChainEvent)

      expect(result).toEqual({
        result: 'failed',
        message: EVENT_RESPONSE_MESSAGE.WRONG_ENV,
      })
    })

    test('should silent the error even if the request fails', async () => {
      mockInstance.onPost('/events').reply(500, 'error')

      await expect(sendOffChainEvent(mockOffChainEvent)).resolves.not.toThrow()

      const result = await sendOffChainEvent(mockOffChainEvent)

      expect(result).toEqual({
        result: 'failed',
        message: EVENT_RESPONSE_MESSAGE.FAILED,
      })
    })
  })
})
