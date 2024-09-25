import type { PROTOCOL_MODULE } from '@enums/module'
import { BaseError } from '@errors/base'

export class ProtocolModuleLibError extends BaseError {
  constructor(protocolModule: PROTOCOL_MODULE, errorMsg: string = '') {
    super(errorMsg, {
      name: `ProtocolModuleLibError-${protocolModule}`,
    })
  }
}
