import { config } from '@classes'
import { handleListAction } from '@commands/action/list'
import { protocolModules } from '@constants/protocol-module'
import { PROTOCOL_MODULE } from '@enums/module'
import { describe, expect, test, vi } from 'vitest'

describe('Action: list', () => {
  test('should list available actions', async () => {
    // mock
    vi.spyOn(console, 'log').mockImplementation(() => undefined)

    const mockedProtocol = PROTOCOL_MODULE.aave_v3
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
        viem: { name: 'arbitrumSepolia' },
      },
    }))

    const protocolDetails = protocolModules[mockedProtocol]
    const actions = protocolDetails.actions

    // call function
    const table = handleListAction()

    // assert
    expect(table).toBeDefined()
    expect(table.length).toBe(Object.keys(actions).length)
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
        viem: { name: 'arbitrumSepolia' },
      },
    }))

    // assert
    expect(() => handleListAction()).toThrowError('Protocol module not supported')
  })
})
