import type { protocolModules } from '@constants/protocol-module'

export type ProtocolModuleActionKey = keyof (typeof protocolModules)[keyof typeof protocolModules]['onChainActions']
