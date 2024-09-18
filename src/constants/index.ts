import { PROTOCOL_MODULE } from '@enums/module'

export const SUPPORTED_PROTOCOL_MODULES = [PROTOCOL_MODULE.aave_v3, PROTOCOL_MODULE.uniswap_v3, PROTOCOL_MODULE.token]

export const FILE_NAMES = {
  CONFIG: 'infinit.config.yaml',
  REGISTRY: 'infinit.registry.json',
  CACHE: 'infinit.cache.json',

  // JSON Schema
  CONFIG_SCHEMA: 'config.schema.json',
}

export const DEFAULT_ACTION_KEY = 'init'
