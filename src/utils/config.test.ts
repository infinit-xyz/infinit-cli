import { describe, expect, test, vi } from 'vitest'
import { getProjectChainInfo, getProjectRpc } from './config'

vi.mock('@classes/Config/Config', () => ({
  config: {
    getProjectConfig: () => ({
      chain_info: {
        name: 'Ethereum',
        network_id: 1,
        rpc_url: 'https://fakerpc.io/rpc',
      },
    }),
  },
}))

describe('Config', () => {
  describe('getProjectChainInfo', () => {
    test('should return chain info', () => {
      const chainInfo = getProjectChainInfo()
      expect(chainInfo.name).toBe('Ethereum Mainnet')
      expect(chainInfo.chainId).toBe('1')
    })
  })

  describe('getProjectRpc', () => {
    test('should return rpc url', () => {
      const rpcUrl = getProjectRpc()
      expect(rpcUrl).toBe('https://fakerpc.io/rpc')
    })
  })
})
