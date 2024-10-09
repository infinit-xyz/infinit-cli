import type { PROTOCOL_MODULE } from '@enums/module'
import { BaseError } from '@errors/base'

export class INFINITLibraryError extends BaseError {
  constructor(protocolModule: PROTOCOL_MODULE, errorMsg: string = '') {
    super(errorMsg, {
      name: `INFINITLibraryError-${protocolModule}`,
    })
  }
}
