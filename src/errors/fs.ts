import { BaseError } from '@errors/base.ts'
import { ERROR_MESSAGE_RECORD } from '@errors/errorList'
import { match } from 'ts-pattern'

export class FileNotFoundError extends BaseError {
  constructor(isNotFoundType: 'path' | 'name', value: string) {
    const message = match(isNotFoundType)
      .with('path', () => ERROR_MESSAGE_RECORD.FILE_PATH_NOT_FOUND(value))
      .with('name', () => ERROR_MESSAGE_RECORD.FILE_NAME_NOT_FOUND(value))
      .exhaustive()

    super(message, {
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
