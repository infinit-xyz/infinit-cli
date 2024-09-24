import type { PROTOCOL_MODULE } from '@enums/module'
import { BaseError, type BaseErrorParameters } from '@errors/base'

export class ProtocolModuleLibError extends BaseError {
  constructor(protocolModule: PROTOCOL_MODULE, errorMsg: string = '', _errorArgs?: BaseErrorParameters) {
    super(errorMsg, {
      name: `ProtocolModuleLibError-${protocolModule}`,
      // ...errorArgs,
    })
  }
}
