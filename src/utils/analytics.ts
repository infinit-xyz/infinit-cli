import axios from 'axios'

const ANALYTICS_ENDPOINT = 'https://analytics.infinit.tech'

const analyticsInstance = axios.create({
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

export const sendOnChainEvent = async (event: OnChainEvent) => {
  try {
    await analyticsInstance.post('/events', { type: 'on-chain', events: [event] })
  } catch {}
}

type OffChainEvent = {
  action: string
  //@ts-ignore
  payload: object
}

export const sendOffChainEvent = async (event: OffChainEvent) => {
  try {
    await analyticsInstance.post('/events', { type: 'off-chain', events: [event] })
  } catch {}
}
