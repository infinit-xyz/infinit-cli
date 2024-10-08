import { capitalize, isPrivateKeyString, isValidTypescriptFileName, toLowerCase, trim } from '@utils/string'

import { describe, expect, test } from 'vitest'

describe('string', () => {
  describe('toLowerCase', () => {
    test('should return lowercase string correctly', () => {
      const result = toLowerCase('AbCd')

      expect(result).toBe('abcd')
    })

    test('should handle undefined correctly', () => {
      const result = toLowerCase()

      expect(result).toBeUndefined()
    })
  })

  describe('trim', () => {
    test('should trim string correctly', () => {
      const result = trim(' xxx ')

      expect(result).toBe('xxx')
    })

    test('should handle undefined correctly', () => {
      const result = trim()

      expect(result).toBeUndefined()
    })
  })

  describe('capitalize', () => {
    test('should capitalize string correctly', () => {
      const result = capitalize('thailand')

      expect(result).toBe('Thailand')
    })

    test('should handle undefined correctly', () => {
      const result = capitalize()

      expect(result).toBeUndefined()
    })
  })

  describe('isPrivateKeyString', () => {
    test('should handle valid privateKeyString correctly', () => {
      // random hash
      const result = isPrivateKeyString('0xa4dd40261fbabe977ab6ff77a7ea9f76cd3b286aa66290b0d62bdf4303f4382b')

      expect(result).toBeTruthy()
    })

    test('should handle invalid privateKeyString correctly', () => {
      const result1 = isPrivateKeyString('thailand')

      // random hash
      const result2 = isPrivateKeyString('a4dd40261fbabe977ab6ff77a7ea9f76cd3b286aa66290b0d62bdf4303f4382b')

      expect(result1).toBeFalsy()
      expect(result2).toBeFalsy()
    })

    test('should handle undefined correctly', () => {
      const result = isPrivateKeyString()

      expect(result).toBeFalsy()
    })
  })

  describe('isValidTypescriptFileName', () => {
    test('should handle valid typescript filename correctly', () => {
      const result1 = isValidTypescriptFileName('file.ts')
      const result2 = isValidTypescriptFileName('test.script.ts')
      const result3 = isValidTypescriptFileName('test-123.ts')

      expect(result1).toBeTruthy()
      expect(result2).toBeTruthy()
      expect(result3).toBeTruthy()
    })

    test('should handle invalid typescript filename correctly', () => {
      const result1 = isValidTypescriptFileName('file.js')
      const result2 = isValidTypescriptFileName('file')
      const result3 = isValidTypescriptFileName('.ts')

      expect(result1).toBeFalsy()
      expect(result2).toBeFalsy()
      expect(result3).toBeFalsy()
    })

    test('should handle undefined correctly', () => {
      const result = isValidTypescriptFileName()

      expect(result).toBeFalsy()
    })
  })
})
