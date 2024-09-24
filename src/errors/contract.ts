import { BaseError } from '@errors/base.ts'

export type ContractValidateErrorType = ContractValidateError & {
  name: 'ContractValidateError'
}
export class ContractValidateError extends BaseError {
  constructor(extraMsg: string = '') {
    super(['ContractValidateError:', extraMsg].join('\n'), {
      name: 'ContractValidateError',
    })
  }
}
