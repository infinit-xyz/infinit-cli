import { config } from '@classes'
import { handleListAction } from '@commands/action/list'
import { protocolModules } from '@constants/protocol-module'
import { PROTOCOL_MODULE } from '@enums/module'
import { describe, expect, test, vi } from 'vitest'

describe('Action: list', () => {
  test('should list available actions', async () => {
    // mock
    vi.spyOn(console, 'log').mockImplementation(() => undefined)

    const mockedProtocol = PROTOCOL_MODULE.token
    const projectConfigSpy = vi.spyOn(config, 'getProjectConfig').mockImplementation(() => ({
      project_name: 'test',
      protocol_module: mockedProtocol,
      chain_info: {
        name: 'Arbitrum Sepolia',
        short_name: 'ARB Sepolia',
        network_id: 421614,
        rpc_url: 'https://arbitrum-sepolia.blockpi.network/v1/rpc/public',
        native_currency: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
        block_explorer: {
          name: '',
          url: '',
          api_url: '',
          api_key: '',
        },
        viem: { name: 'arbitrumSepolia' },
      },
    }))

    const protocolDetails = protocolModules[mockedProtocol]
    const actions = protocolDetails.onChainActions
    const offChainActions = protocolDetails.offChainActions

    // call function
    const { onChainActiontable, offChainActiontable } = handleListAction()

    // assert
    expect(onChainActiontable).toBeDefined()
    expect(onChainActiontable.length).toBe(Object.keys(actions).length)

    expect(offChainActiontable).toBeDefined()
    expect(offChainActiontable.length).toBe(Object.keys(offChainActions).length)

    expect(projectConfigSpy).toHaveBeenCalled()
  })

  test('should get error for incorrect config protocol in config file', async () => {
    // mock
    const mockedProtocol = 'wrong_protocol'
    vi.spyOn(config, 'getProjectConfig').mockImplementation(() => ({
      project_name: 'test',
      protocol_module: mockedProtocol as PROTOCOL_MODULE,
      chain_info: {
        name: 'Arbitrum Sepolia',
        short_name: 'ARB Sepolia',
        network_id: 421614,
        rpc_url: 'https://arbitrum-sepolia.blockpi.network/v1/rpc/public',
        native_currency: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
        block_explorer: {
          name: '',
          url: '',
          api_url: '',
          api_key: '',
        },
        viem: { name: 'arbitrumSepolia' },
      },
    }))

    // assert
    expect(() => handleListAction()).toThrowError('Protocol module not supported')
  })
})
