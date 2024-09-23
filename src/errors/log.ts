import { chalkError } from '@constants/chalk'

export const customErrorLog = (error: Error) => {
  console.log(chalkError(error.message))
  console.log(chalkError(error.stack))
}
