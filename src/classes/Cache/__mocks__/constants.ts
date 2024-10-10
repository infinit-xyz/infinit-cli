import type { InfinitConfigSchema } from '@schemas/generated'

export const example1 = `{"txs":{"default.script.ts":{"actionName":"DeployAaveV3Action","subActions":[{"subActionName":"DeployAaveV3","txHashes":[{"txHash":"0x546bd95b53d9ca051cc0070796e4878ff9694db9b490ab5ecab80413e906810f","status":"CONFIRMED","txBuilderName":"DeployPoolAddressesProviderRegistrySubAction","createdAt":"Date(1726134955633)","updatedAt":"Date(1726134956705)"},{"txHash":"0x1d29aa68951e491da46e47ab6e916d95a17574eba94f24740c12c5c06b1fb620","status":"CONFIRMED","txBuilderName":"DeploySupplyLogicSubAction","createdAt":"Date(1726134958140)","updatedAt":"Date(1726134959205)"},{"txHash":"0x598ae33e5b36498370ada82afa005e5a7bc44773748ca128d793c80cf325ebbe","status":"CONFIRMED","txBuilderName":"DeployBorrowLogicSubAction","createdAt":"Date(1726134960822)","updatedAt":"Date(1726134961463)"},{"txHash":"0x51f4843fbe3e77def5a335fd72b4bf46ff489cb96fae603c5c2cf15c2f576a88","status":"CONFIRMED","txBuilderName":"DeployLiquidationLogicSubAction","createdAt":"Date(1726134963255)","updatedAt":"Date(1726134964319)"},{"txHash":"0x6b29c77a8a3cd71d2e623a8f92fe623e1d04c78abf563202ec6de748b97a9603","status":"CONFIRMED","txBuilderName":"DeployEModeLogicSubAction","createdAt":"Date(1726134965756)","updatedAt":"Date(1726134966820)"},{"txHash":"0x86a828468c58056314b705a222cd8c2a10f6d85342b0f142a16462c973f54303","status":"CONFIRMED","txBuilderName":"DeployBridgeLogicSubAction","createdAt":"Date(1726134968297)","updatedAt":"Date(1726134969386)"},{"txHash":"0xbeba9b87041e0ec746ad34543be4e45410d05edb8bee25860976af395dc27451","status":"CONFIRMED","txBuilderName":"DeployConfiguratorLogicSubAction","createdAt":"Date(1726134970924)","updatedAt":"Date(1726134971560)"},{"txHash":"0x517c3adb04adfbbea708f701946cc043b8fddfbe65e23c6689bbdfbc06f15b9b","status":"CONFIRMED","txBuilderName":"DeployPoolLogicSubAction","createdAt":"Date(1726134973159)","updatedAt":"Date(1726134974219)"},{"txHash":"0xd69f3b528b85c54bdc718e3a9748ee6fa0bb6e273b06d6cea601a7a63fca504c","status":"CONFIRMED","txBuilderName":"DeployInitializableAdminUpgradeabilityProxySubAction","createdAt":"Date(1726134975774)","updatedAt":"Date(1726134976821)"},{"txHash":"0x6fedf10d971fc320cd6d33cb608141d38560c6f185f45931b471602895093454","status":"CONFIRMED","txBuilderName":"DeployAaveEcosystemReserveControllerTxBuilder","createdAt":"Date(1726134978176)","updatedAt":"Date(1726134979231)"},{"txHash":"0x8be9d2cbcaec417e8b484845bfcadeeb028ca87ba3d838af6f30f9f58bf03a41","status":"CONFIRMED","txBuilderName":"DeployAaveEcosystemReserveV2SubAction","createdAt":"Date(1726134980894)","updatedAt":"Date(1726134981624)"},{"txHash":"0x8acd2bd77f5a3e899d97c8ae32b3f77d74bef249d8f555e14608af6d79b2e0ef","status":"CONFIRMED","txBuilderName":"DeployPoolAddressProviderSubAction","createdAt":"Date(1726134983057)","updatedAt":"Date(1726134984117)"},{"txHash":"0x30537b0949a8b3366c04c79fc481d07009a01545155065f6301ab371c011ca1a","status":"CONFIRMED","txBuilderName":"DeployReservesSetupHelperSubAction","createdAt":"Date(1726134985565)","updatedAt":"Date(1726134986622)"},{"txHash":"0xc54556eec14dd5b1d455fad7d3b69f2f24f08f3137672482c356359530e12728","status":"CONFIRMED","txBuilderName":"DeployWalletBalanceProviderSubAction","createdAt":"Date(1726134987918)","updatedAt":"Date(1726134988549)"},{"txHash":"0x9795b32cd3b1d977fbd765aafe4ceeed91c9a64a64599f6785120fb4887d87d3","status":"CONFIRMED","txBuilderName":"DeployUiIncentiveDataProviderV3SubAction","createdAt":"Date(1726134990073)","updatedAt":"Date(1726134991117)"},{"txHash":"0xe8c15eb94cea70a646eb22d3980062d2a87c11390fc416cd33653f5ce9001a2e","status":"CONFIRMED","txBuilderName":"DeployUiPoolDataProviderV3SubAction","createdAt":"Date(1726134992660)","updatedAt":"Date(1726134993712)"}]},{"subActionName":"DeployAaveV3_2","txHashes":[{"txHash":"0xb60d134ab4a82938de8c72b2647100260cb2dfe303d305833103f9b898f8e4e7","status":"CONFIRMED","txBuilderName":"SetACLAdminSubAction","createdAt":"Date(1726135005574)","updatedAt":"Date(1726135006213)"},{"txHash":"0x058e10a5d5ceb97474239ac065fc484fda78b8fdb3567ec62cef815d484efab3","status":"CONFIRMED","txBuilderName":"DeployAaveProtocolDataProvider","createdAt":"Date(1726135007748)","updatedAt":"Date(1726135008816)"},{"txHash":"0x8b0475f75e2d69ec5b076255c67b1f6a0704e822ee04cbd1eb31d20b7d34f58a","status":"CONFIRMED","txBuilderName":"DeployFlashLoanLogicSubAction","createdAt":"Date(1726135010257)","updatedAt":"Date(1726135011318)"},{"txHash":"0xbdd73c09a399d0e1d6407ca56584d018fd7a84c55f72144b4c30563e6642f6ac","status":"CONFIRMED","txBuilderName":"DeployPoolConfiguratorSubAction","createdAt":"Date(1726135013076)","updatedAt":"Date(1726135013806)"},{"txHash":"0xbb756ba1e984ac1557dc6cd06edbeb56a7e469c520093f2d41f670b27998495c","status":"CONFIRMED","txBuilderName":"DeployACLManagerSubAction","createdAt":"Date(1726135015262)","updatedAt":"Date(1726135016343)"},{"txHash":"0x650198bd4e4c673ed49d1134494d2dd628b3e91e1ffe4caed51b8b604548781e","status":"CONFIRMED","txBuilderName":"DeployOracleSubAction","createdAt":"Date(1726135017798)","updatedAt":"Date(1726135018872)"}]}]}}}`
export const example1Parsed = {
  txs: {
    'default.script.ts': {
      actionName: 'DeployAaveV3Action',
      subActions: [
        {
          subActionName: 'DeployAaveV3',
          txHashes: [
            {
              txHash: '0x546bd95b53d9ca051cc0070796e4878ff9694db9b490ab5ecab80413e906810f',
              status: 'CONFIRMED',
              txBuilderName: 'DeployPoolAddressesProviderRegistrySubAction',
              createdAt: new Date(1726134955633),
              updatedAt: new Date(1726134956705),
            },
            {
              txHash: '0x1d29aa68951e491da46e47ab6e916d95a17574eba94f24740c12c5c06b1fb620',
              status: 'CONFIRMED',
              txBuilderName: 'DeploySupplyLogicSubAction',
              createdAt: new Date(1726134958140),
              updatedAt: new Date(1726134959205),
            },
            {
              txHash: '0x598ae33e5b36498370ada82afa005e5a7bc44773748ca128d793c80cf325ebbe',
              status: 'CONFIRMED',
              txBuilderName: 'DeployBorrowLogicSubAction',
              createdAt: new Date(1726134960822),
              updatedAt: new Date(1726134961463),
            },
            {
              txHash: '0x51f4843fbe3e77def5a335fd72b4bf46ff489cb96fae603c5c2cf15c2f576a88',
              status: 'CONFIRMED',
              txBuilderName: 'DeployLiquidationLogicSubAction',
              createdAt: new Date(1726134963255),
              updatedAt: new Date(1726134964319),
            },
            {
              txHash: '0x6b29c77a8a3cd71d2e623a8f92fe623e1d04c78abf563202ec6de748b97a9603',
              status: 'CONFIRMED',
              txBuilderName: 'DeployEModeLogicSubAction',
              createdAt: new Date(1726134965756),
              updatedAt: new Date(1726134966820),
            },
            {
              txHash: '0x86a828468c58056314b705a222cd8c2a10f6d85342b0f142a16462c973f54303',
              status: 'CONFIRMED',
              txBuilderName: 'DeployBridgeLogicSubAction',
              createdAt: new Date(1726134968297),
              updatedAt: new Date(1726134969386),
            },
            {
              txHash: '0xbeba9b87041e0ec746ad34543be4e45410d05edb8bee25860976af395dc27451',
              status: 'CONFIRMED',
              txBuilderName: 'DeployConfiguratorLogicSubAction',
              createdAt: new Date(1726134970924),
              updatedAt: new Date(1726134971560),
            },
            {
              txHash: '0x517c3adb04adfbbea708f701946cc043b8fddfbe65e23c6689bbdfbc06f15b9b',
              status: 'CONFIRMED',
              txBuilderName: 'DeployPoolLogicSubAction',
              createdAt: new Date(1726134973159),
              updatedAt: new Date(1726134974219),
            },
            {
              txHash: '0xd69f3b528b85c54bdc718e3a9748ee6fa0bb6e273b06d6cea601a7a63fca504c',
              status: 'CONFIRMED',
              txBuilderName: 'DeployInitializableAdminUpgradeabilityProxySubAction',
              createdAt: new Date(1726134975774),
              updatedAt: new Date(1726134976821),
            },
            {
              txHash: '0x6fedf10d971fc320cd6d33cb608141d38560c6f185f45931b471602895093454',
              status: 'CONFIRMED',
              txBuilderName: 'DeployAaveEcosystemReserveControllerTxBuilder',
              createdAt: new Date(1726134978176),
              updatedAt: new Date(1726134979231),
            },
            {
              txHash: '0x8be9d2cbcaec417e8b484845bfcadeeb028ca87ba3d838af6f30f9f58bf03a41',
              status: 'CONFIRMED',
              txBuilderName: 'DeployAaveEcosystemReserveV2SubAction',
              createdAt: new Date(1726134980894),
              updatedAt: new Date(1726134981624),
            },
            {
              txHash: '0x8acd2bd77f5a3e899d97c8ae32b3f77d74bef249d8f555e14608af6d79b2e0ef',
              status: 'CONFIRMED',
              txBuilderName: 'DeployPoolAddressProviderSubAction',
              createdAt: new Date(1726134983057),
              updatedAt: new Date(1726134984117),
            },
            {
              txHash: '0x30537b0949a8b3366c04c79fc481d07009a01545155065f6301ab371c011ca1a',
              status: 'CONFIRMED',
              txBuilderName: 'DeployReservesSetupHelperSubAction',
              createdAt: new Date(1726134985565),
              updatedAt: new Date(1726134986622),
            },
            {
              txHash: '0xc54556eec14dd5b1d455fad7d3b69f2f24f08f3137672482c356359530e12728',
              status: 'CONFIRMED',
              txBuilderName: 'DeployWalletBalanceProviderSubAction',
              createdAt: new Date(1726134987918),
              updatedAt: new Date(1726134988549),
            },
            {
              txHash: '0x9795b32cd3b1d977fbd765aafe4ceeed91c9a64a64599f6785120fb4887d87d3',
              status: 'CONFIRMED',
              txBuilderName: 'DeployUiIncentiveDataProviderV3SubAction',
              createdAt: new Date(1726134990073),
              updatedAt: new Date(1726134991117),
            },
            {
              txHash: '0xe8c15eb94cea70a646eb22d3980062d2a87c11390fc416cd33653f5ce9001a2e',
              status: 'CONFIRMED',
              txBuilderName: 'DeployUiPoolDataProviderV3SubAction',
              createdAt: new Date(1726134992660),
              updatedAt: new Date(1726134993712),
            },
          ],
        },
        {
          subActionName: 'DeployAaveV3_2',
          txHashes: [
            {
              txHash: '0xb60d134ab4a82938de8c72b2647100260cb2dfe303d305833103f9b898f8e4e7',
              status: 'CONFIRMED',
              txBuilderName: 'SetACLAdminSubAction',
              createdAt: new Date(1726135005574),
              updatedAt: new Date(1726135006213),
            },
            {
              txHash: '0x058e10a5d5ceb97474239ac065fc484fda78b8fdb3567ec62cef815d484efab3',
              status: 'CONFIRMED',
              txBuilderName: 'DeployAaveProtocolDataProvider',
              createdAt: new Date(1726135007748),
              updatedAt: new Date(1726135008816),
            },
            {
              txHash: '0x8b0475f75e2d69ec5b076255c67b1f6a0704e822ee04cbd1eb31d20b7d34f58a',
              status: 'CONFIRMED',
              txBuilderName: 'DeployFlashLoanLogicSubAction',
              createdAt: new Date(1726135010257),
              updatedAt: new Date(1726135011318),
            },
            {
              txHash: '0xbdd73c09a399d0e1d6407ca56584d018fd7a84c55f72144b4c30563e6642f6ac',
              status: 'CONFIRMED',
              txBuilderName: 'DeployPoolConfiguratorSubAction',
              createdAt: new Date(1726135013076),
              updatedAt: new Date(1726135013806),
            },
            {
              txHash: '0xbb756ba1e984ac1557dc6cd06edbeb56a7e469c520093f2d41f670b27998495c',
              status: 'CONFIRMED',
              txBuilderName: 'DeployACLManagerSubAction',
              createdAt: new Date(1726135015262),
              updatedAt: new Date(1726135016343),
            },
            {
              txHash: '0x650198bd4e4c673ed49d1134494d2dd628b3e91e1ffe4caed51b8b604548781e',
              status: 'CONFIRMED',
              txBuilderName: 'DeployOracleSubAction',
              createdAt: new Date(1726135017798),
              updatedAt: new Date(1726135018872),
            },
          ],
        },
      ],
    },
  },
}

export const mockProjectConfig: InfinitConfigSchema = {
  project_name: 'My Project',
  protocol_module: 'infinit',
  chain_info: {
    name: 'Ethereum',
    short_name: 'Ethereum',
    network_id: 1,
    rpc_url: 'https://example.com',
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
  },
  allow_analytics: false,
}
