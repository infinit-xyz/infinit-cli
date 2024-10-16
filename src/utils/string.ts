const PRIVATE_KEY_REGEX = /^0x[0-9a-fA-F]{64}$/
const TYPESCRIPT_FILE_REGEX = /^[\w\-. ]+\.ts$/

export const toLowerCase = (str?: string) => str?.toLowerCase()
export const trim = (str?: string) => str?.trim()
export const capitalize = (str?: string) => (str ? str.charAt(0).toUpperCase() + str.slice(1) : undefined)

export const isPrivateKeyString = (str?: string) => !!str && PRIVATE_KEY_REGEX.test(str)

export const isValidTypescriptFileName = (str?: string) => !!str && TYPESCRIPT_FILE_REGEX.test(str)
