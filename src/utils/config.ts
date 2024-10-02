import fs from 'fs'
import path from 'path'

import { DATA_FOLDER, DATA_SUBFOLDERS, HOME_DIRECTORY, config } from '@classes/Config/Config'
import { CHAINS, type ChainInfo } from '@constants/chains'
import type { CHAIN_ID } from '@enums/chain'
import { ValidateInputValueError } from '@errors/validate'
import { ensureAccessibilityAtPath } from '@utils/files'
import { defineChain } from 'viem'

/**
 *  create data folder structure
 */
export const createDataFolder = () => {
  const isAllPathExists = fs.existsSync(DATA_FOLDER) && DATA_SUBFOLDERS.every((subFolder) => fs.existsSync(path.join(DATA_FOLDER, subFolder)))
  if (isAllPathExists) return

  // check is home directory accessible
  ensureAccessibilityAtPath(HOME_DIRECTORY, fs.constants.W_OK)

  if (!fs.existsSync(DATA_FOLDER)) {
    fs.mkdirSync(DATA_FOLDER)
  }
  for (const subFolder of DATA_SUBFOLDERS) {
    const subFolderPath = path.join(DATA_FOLDER, subFolder)
    if (!fs.existsSync(subFolderPath)) {
      fs.mkdirSync(subFolderPath)
    }
  }
}

export const getProjectChainInfo = (): ChainInfo => {
  const _config = config.getProjectConfig()

  if (!_config.chain_info || !_config.chain_info.network_id) {
    throw new ValidateInputValueError(`Chain not found`)
  }

  const chainInfo = CHAINS[_config.chain_info.network_id.toString() as CHAIN_ID]

  if (!chainInfo) {
    throw new ValidateInputValueError(`Chain ${_config.chain_info.network_id} is not supported`)
  }

  const customInstance = defineChain({
    id: _config.chain_info.network_id,
    name: _config.chain_info.name,
    nativeCurrency: _config.chain_info.native_currency,
    rpcUrls: {
      default: {
        http: [_config.chain_info.rpc_url],
      },
    },
  })
  const viemInstance = chainInfo?.viemChain.instance ?? customInstance

  return {
    name: _config.chain_info.name,
    shortName: _config.chain_info.short_name,
    chainId: _config.chain_info.network_id.toString() as CHAIN_ID,
    nativeCurrency: _config.chain_info.native_currency,
    rpcList: [_config.chain_info.rpc_url],
    viemChain: {
      instance: viemInstance,
    },
  }
}

export const getProjectRpc = (): string => {
  const _config = config.getProjectConfig()
  const rpcUrl = _config.chain_info.rpc_url ?? getProjectChainInfo().rpcList[0]

  return rpcUrl
}
