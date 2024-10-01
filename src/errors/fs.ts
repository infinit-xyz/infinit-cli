import { BaseError } from '@errors/base.ts'
import { ERROR_MESSAGE_RECORD } from '@errors/errorList'

export class FileNotFoundError extends BaseError {
  constructor(value: string) {
    super(ERROR_MESSAGE_RECORD.FILE_PATH_NOT_FOUND(value), {
      name: 'FileNotFoundError',
    })
  }
}

export class PermissionNotFoundError extends BaseError {
  constructor() {
    super(`${ERROR_MESSAGE_RECORD.PERMISSION_DENIED}`, {
      name: 'PermissionNotFoundError',
    })
  }
}

export class NodeValidateError extends BaseError {
  constructor(expectedVersion: string, currentVersion: string) {
    super(ERROR_MESSAGE_RECORD.NODE_VERSION_NOT_SUPPORTED(expectedVersion, currentVersion), {
      name: 'NodeValidateError',
    })
  }
}
