import type { InfinitConfigSchema } from '@schemas/generated'
import { mainnet } from 'viem/chains'
import { describe, expect, test, vi } from 'vitest'
import { getProjectChainInfo, getProjectRpc } from './config'

const mockedChainInfo: InfinitConfigSchema['chain_info'] = {
  name: 'Ethereum',
  short_name: 'ETH',
  network_id: 1,
  native_currency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpc_url: 'https://fakerpc.io/rpc',
}

vi.mock('@classes/Config/Config', () => ({
  config: {
    getProjectConfig: () => ({
      chain_info: mockedChainInfo,
    }),
  },
}))

describe('Config', () => {
  describe('getProjectChainInfo', () => {
    test('should return chain info', () => {
      const chainInfo = getProjectChainInfo()
      expect(chainInfo.name).toBe('Ethereum')
      expect(chainInfo.chainId).toBe('1')
      expect(chainInfo.viemChain.instance.id).toBe(mainnet.id)
    })
  })

  describe('getProjectRpc', () => {
    test('should return rpc url', () => {
      const rpcUrl = getProjectRpc()
      expect(rpcUrl).toBe('https://fakerpc.io/rpc')
    })
  })
})
