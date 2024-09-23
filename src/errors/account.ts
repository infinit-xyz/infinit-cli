import { BaseError } from '@errors/base'

export class AccountValidateError extends BaseError {
  constructor(message: string = '') {
    super(message, {
      name: 'AccountValidateError',
    })
  }
}
