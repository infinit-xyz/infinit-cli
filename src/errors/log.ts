import { chalkError } from '@constants/chalk'

export const customErrorLog = (error: Error) => {
  return chalkError(`${error.name}: ${error.message}`)
}
