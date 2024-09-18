export const toLowerCase = (str?: string) => str?.toLowerCase()
export const trim = (str?: string) => str?.trim()
export const capitalize = (str?: string) => (str ? str.charAt(0).toUpperCase() + str.slice(1) : undefined)

export const isPrivateKeyString = (str?: string) => !!str && /^0x[0-9a-fA-F]{64}$/.test(str)
