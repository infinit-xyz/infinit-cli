import { chalkError } from '@constants/chalk'

export const customErrorLog = (error: Error) => {
  console.error(chalkError(error.message))
  console.error(chalkError(error.stack))
}
