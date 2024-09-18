import type { JsonReviver } from '@classes/Cache/Cache.type'

export const stringifyWithUndefined = (value: object): string => {
  const str = JSON.stringify(value, (_k, v) => (v === undefined ? '__UNDEFINED__' : v), 2)
  return str.replaceAll('"__UNDEFINED__"', 'undefined')
}

/**
 * this function is used to stringify date objects in JSON.stringify
 * to make Date objects serializable
 * the format is Date(unix timestamp)
 * @param this to be used as this in JSON.stringify
 * @param key key of the object
 * @param value value of the object
 * @returns stringified value
 */
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function stringifyDateReplacer(this: any, key: string, value: string) {
  if (this[key] instanceof Date) return `Date(${this[key].getTime()})`
  return value
}

/**
 * this function is used to parse date objects in JSON.parse which were stringified by stringifyDateReplacer function
 * @param _key not used
 * @param value value of the object
 * @returns return Date object if value is in Date(unix timestamp) format, else return value
 */
export const parseDateReviver = (_key: string, value: string) => {
  const a = /Date\(([^)]+)\)/.exec(value)
  if (a) return new Date(+a[1])

  return value
}

/**
 * Parses a JSON string safely.
 * @param jsonString The JSON string to parse.
 * @returns An object with the success status and the parsed JSON.
 */
export function jsonSafeParse<T, R>(jsonString: string, reviver?: JsonReviver<R>): { success: true; parsedJson: T }
export function jsonSafeParse<_T, R>(jsonString: string, reviver?: JsonReviver<R>): { success: false }
// biome-ignore lint/complexity/noUselessTypeConstraint: <explanation>
export function jsonSafeParse<T extends any, R extends any>(jsonString: string, reviver?: JsonReviver<R>): { success: boolean; parsedJson?: T } {
  try {
    return { success: true, parsedJson: JSON.parse(jsonString, reviver) }
  } catch (error) {
    console.error('Error parsing JSON', error)
    return { success: false }
  }
}
