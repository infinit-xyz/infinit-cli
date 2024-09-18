import { protocolModules } from '@constants/protocol-module'
import type { PROTOCOL_MODULE } from '@enums/module'

export const getProtocolModule = (input?: string): PROTOCOL_MODULE | undefined => {
  if (!input) return undefined

  let protocolKey: PROTOCOL_MODULE | undefined = undefined

  protocolKey = protocolModules[input as PROTOCOL_MODULE]?.key

  if (!protocolKey) {
    const protocolByKeyReplace = protocolModules[input.replaceAll('-', '_') as PROTOCOL_MODULE]?.key
    protocolKey = protocolByKeyReplace
  }

  if (!protocolKey) {
    const protocolByName = Object.values(protocolModules).find((protocol) => protocol.name.toLowerCase() === input.toLowerCase())?.key
    protocolKey = protocolByName
  }

  return protocolKey
}
