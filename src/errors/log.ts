import { chalkError } from '@constants/chalk'

export const customErrorLog = (error: Error) => {
  console.error(chalkError(error.message))
  // console.log('')
  // console.error(chalkError(error.stack))
}
