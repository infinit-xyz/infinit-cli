import axios from 'axios'

const ANALYTICS_ENDPOINT = 'https://analytics.infinit.tech'

export const analyticsInstance = axios.create({
  baseURL: ANALYTICS_ENDPOINT,
  timeout: 3000,
})

export enum EVENT_RESPONSE_MESSAGE {
  SUCCESS = 'Event sent successfully',
  FAILED = 'Failed to send event',
  WRONG_ENV = 'Not in production environment',
}

export type EventResponse = {
  result: 'success' | 'failed'
  message: EVENT_RESPONSE_MESSAGE
}

type OnChainEvent = {
  address: string
  module: string
  action: string
  chainId: number
  txHash: string
}

export const sendOnChainEvent = async (event: OnChainEvent): Promise<EventResponse> => {
  if (process.env.NODE_ENV !== 'production') {
    return {
      result: 'failed',
      message: EVENT_RESPONSE_MESSAGE.WRONG_ENV,
    }
  }

  try {
    await analyticsInstance.post('/events', { type: 'on-chain', events: [event] })
    return {
      result: 'success',
      message: EVENT_RESPONSE_MESSAGE.SUCCESS,
    }
  } catch {
    return {
      result: 'failed',
      message: EVENT_RESPONSE_MESSAGE.FAILED,
    }
  }
}

type OffChainEvent = {
  action: string
  //@ts-ignore
  payload: object
}

export const sendOffChainEvent = async (event: OffChainEvent): Promise<EventResponse> => {
  if (process.env.NODE_ENV !== 'production') {
    return {
      result: 'failed',
      message: EVENT_RESPONSE_MESSAGE.WRONG_ENV,
    }
  }

  try {
    await analyticsInstance.post('/events', { type: 'off-chain', events: [event] })

    return {
      result: 'success',
      message: EVENT_RESPONSE_MESSAGE.SUCCESS,
    }
  } catch {
    return {
      result: 'failed',
      message: EVENT_RESPONSE_MESSAGE.FAILED,
    }
  }
}
