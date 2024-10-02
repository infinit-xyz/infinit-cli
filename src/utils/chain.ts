// import { ChainName, ChainNameList } from '@constants'

import { CHAINS } from '@constants/chains'
import type { CHAIN_ID } from '@enums/chain'

export const isChainNameSupported = (chainName?: string): boolean => {
  if (!chainName) return false
  const _chainName = chainName.toLowerCase()
  return Object.values(CHAINS).some((chain) => chain.name.toLowerCase() === _chainName || chain.shortName.toLowerCase() === _chainName)
}

/**
 * isSupportedChain
 * @param value hain name, short name or chain id
 * @returns
 */
export const isSupportedChain = (value: string) => {
  const _value = value.toString().toLowerCase()
  return Object.values(CHAINS).some(
    (chain) => chain.name.toLowerCase() === _value || chain.shortName.toLowerCase() === _value || chain.chainId.toString() === _value,
  )
}

export const toSupportedChainID = (chainName?: string): CHAIN_ID | undefined => {
  if (!chainName) return
  const _chainName = chainName.toLowerCase()
  return Object.values(CHAINS).find((chain) => chain.name.toLowerCase() === _chainName || chain.shortName.toLowerCase() === _chainName)?.chainId
}

export const isUrlValid = (url?: string): boolean => {
  if (!url) return false
  try {
    new URL(url)
    return true
  } catch (_) {
    return false
  }
}
