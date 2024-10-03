import axios from 'axios'

const ANALYTICS_ENDPOINT = 'https://analytics.infinit.tech'

export const analyticsInstance = axios.create({
  baseURL: ANALYTICS_ENDPOINT,
  timeout: 3000,
})

type OnChainEvent = {
  address: string
  module: string
  action: string
  chainId: number
  txHash: string
}

export type EventResponse = {
  result: string
  message: string
}

export const sendOnChainEvent = async (event: OnChainEvent): Promise<EventResponse> => {
  if (process.env.NODE_ENV !== 'production') {
    return {
      result: 'failed',
      message: 'Not in production environment',
    }
  }

  try {
    await analyticsInstance.post('/events', { type: 'on-chain', events: [event] })
    return {
      result: 'success',
      message: 'Event sent successfully',
    }
  } catch {
    return {
      result: 'failed',
      message: 'Failed to send event',
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
      message: 'Not in production environment',
    }
  }

  try {
    await analyticsInstance.post('/events', { type: 'off-chain', events: [event] })

    return {
      result: 'success',
      message: 'Event sent successfully',
    }
  } catch {
    return {
      result: 'failed',
      message: 'Failed to send event',
    }
  }
}
