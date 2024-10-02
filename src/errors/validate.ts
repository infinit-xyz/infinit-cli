import { BaseError } from '@errors/base.ts'

export type ValidateInputValueErrorType = ValidateInputValueError & {
  name: 'ValidateInputValueError'
}
export class ValidateInputValueError extends BaseError {
  constructor(errorMsg: string = '') {
    super(errorMsg, {
      name: 'ValidateInputValueError',
    })
  }
}
