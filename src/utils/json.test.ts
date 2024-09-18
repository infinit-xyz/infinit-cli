import { describe, expect, it, vi } from 'vitest'
import { jsonSafeParse } from './json'

describe('jsonSafeParse', () => {
  it('should parse a valid JSON string', () => {
    const jsonString = '{"name": "John", "age": 30}'
    const expected = { name: 'John', age: 30 }
    const result = jsonSafeParse(jsonString)

    expect(result.success).toBe(true)
    expect(result.parsedJson).toStrictEqual(expected)
    expect(result.parsedJson).toEqual(JSON.parse(jsonString))
  })

  it('should return false for an invalid JSON string', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    const jsonString = '{"name": "John", "age": 30'
    const result = jsonSafeParse(jsonString)

    expect(result.success).toBe(false)
    expect(consoleErrorSpy).toHaveBeenCalledOnce()
  })

  it('should parse a valid JSON string with a reviver function', () => {
    const jsonString = '{"name": "John", "age": 30}'
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const reviver = (key: string, value: any) => {
      if (key === 'age') return value + 1
      return value
    }
    const result = jsonSafeParse(jsonString, reviver)

    expect(result.success).toBe(true)
    expect(result.parsedJson).toStrictEqual({ name: 'John', age: 31 })
  })
})
