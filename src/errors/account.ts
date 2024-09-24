import { BaseError, type BaseErrorOptions } from '@errors/base'

export class AccountValidateError extends BaseError {
  constructor(message: string = '', options: BaseErrorOptions = {}) {
    super(
      message,
      {
        name: 'AccountValidateError',
      },
      options,
    )
  }
}

export class AccountNotFoundError extends BaseError {
  constructor(message: string = '') {
    super(message, {
      name: 'AccountNotFoundError',
    })
  }
}
