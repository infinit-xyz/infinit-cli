import { Validation } from '@classes/Validation/Validation'
import { isPrivateKeyString } from '@utils/string'

const urlValidation = new Validation((val?: string) => {
  if (!val) return false
  try {
    new URL(val)
    return true
  } catch (_) {
    return false
  }
}, 'Invalid URL, please try again.')

const requiredValidation = new Validation((val?: string) => !!val?.trim(), 'This field is required')
const privateKeyValidation = new Validation(
  (val?: string) => !!val && isPrivateKeyString(val),
  'Invalid private key, it must start with 0x and be 64 characters long.',
)

export const validate = {
  required: requiredValidation,
  privatekey: privateKeyValidation,
  url: urlValidation,
} satisfies Record<string, Validation>
