import { CHAIN_ID } from '@enums/chain'
import type { Chain } from 'viem'
import * as viemChains from 'viem/chains'

type TokenDetail = {
  name: string
  symbol: string
  decimals: number
}

export type ChainInfo = {
  chainId: CHAIN_ID
  name: string
  shortName: string
  description?: string
  nativeCurrency: TokenDetail
  rpcList: string[]
  viemChain: {
    instance: Chain
  }
}

export const CHAINS: Record<CHAIN_ID, ChainInfo> = {
  [CHAIN_ID.Ethereum]: {
    chainId: CHAIN_ID.Ethereum,
    name: 'Ethereum Mainnet',
    shortName: 'Ethereum',
    rpcList: [
      'https://1rpc.io/eth',
      'https://eth.llamarpc.com',
      'https://rpc.ankr.com/eth',
      'https://eth-pokt.nodies.app',
      'https://eth-mainnet.public.blastapi.io',
      'https://eth.meowrpc.com',
    ],
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    viemChain: {
      instance: viemChains.mainnet,
    },
  },
  [CHAIN_ID.Mantle]: {
    chainId: CHAIN_ID.Mantle,
    name: 'Mantle',
    shortName: 'Mantle',
    rpcList: ['https://rpc.mantle.xyz', 'https://rpc.ankr.com/mantle'],
    nativeCurrency: {
      name: 'Mantle',
      symbol: 'MNT',
      decimals: 18,
    },
    viemChain: {
      instance: viemChains.mantle,
    },
  },
  [CHAIN_ID.Sepolia]: {
    chainId: CHAIN_ID.Sepolia,
    name: '[Testnet] Sepolia',
    shortName: 'Sepolia',
    rpcList: ['https://eth-sepolia.public.blastapi.io', 'https://endpoints.omniatech.io/v1/eth/sepolia/public', 'https://rpc2.sepolia.org'],
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    viemChain: {
      instance: viemChains.sepolia,
    },
  },
  [CHAIN_ID.Holesky]: {
    chainId: CHAIN_ID.Holesky,
    name: '[Testnet] Holesky',
    shortName: 'Holesky',
    rpcList: ['https://holesky.drpc.org', 'https://ethereum-holesky-rpc.publicnode.com', 'https://ethereum-holesky.blockpi.network/v1/rpc/public'],
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    viemChain: {
      instance: viemChains.holesky,
      name: 'holesky',
    },
  },
  // [CHAIN_ID.BSC]: {
  //   chainId: CHAIN_ID.BSC,
  //   name: 'BNB Smart Chain',
  //   shortName: 'BSC',
  //   rpcList: [
  //     'https://1rpc.io/bnb',
  //     'https://binance.llamarpc.com',
  //     'https://rpc.ankr.com/bsc',
  //     'https://bsc-dataseed1.bnbchain.org',
  //     'https://bsc-dataseed2.bnbchain.org',
  //     'https://bsc-dataseed3.bnbchain.org',
  //     'https://bsc-dataseed4.bnbchain.org',
  //   ],
  //   nativeCurrency: {
  //     name: 'Binance Coin',
  //     symbol: 'BNB',
  //     decimals: 18,
  //   },
  //   viemChainInstance: bsc,
  // },
  // [CHAIN_ID.Arbitrum]: {
  //   chainId: CHAIN_ID.Arbitrum,
  //   name: 'Arbitrum One',
  //   shortName: 'Arbitrum',
  //   rpcList: ['https://arbitrum.llamarpc.com', 'https://arbitrum.drpc.org', 'https://1rpc.io/arb', 'https://rpc.ankr.com/arbitrum'],
  //   nativeCurrency: {
  //     name: 'Ethereum',
  //     symbol: 'ETH',
  //     decimals: 18,
  //   },
  //   viemChainInstance: arbitrum,
  // },
  // [CHAIN_ID.ARB_SEPOLIA]: {
  //   chainId: CHAIN_ID.ARB_SEPOLIA,
  //   name: 'Arbitrum Sepolia',
  //   shortName: 'ARB_SEPOLIA',
  //   rpcList: ['https://sepolia-rollup.arbitrum.io/rpc', 'https://arbitrum-sepolia.blockpi.network/v1/rpc/public'],
  //   nativeCurrency: {
  //     name: 'Ethereum',
  //     symbol: 'ETH',
  //     decimals: 18,
  //   },
  //   viemChainInstance: arbitrumSepolia,
  // },
}
