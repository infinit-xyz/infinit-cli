import { PermissionNotFoundError } from '@errors/fs'
import fs from 'fs'
import { describe, expect, test, vi } from 'vitest'
import { ensureAccessibilityAtPath } from './ensureAccessibilityAtPath' // Adjust the import path as necessary

vi.mock('fs')

describe('ensureAccessibilityAtPath', () => {
  test('should not throw an error if the file is accessible', () => {
    vi.mocked(fs.accessSync).mockImplementation(() => {})

    expect(() => ensureAccessibilityAtPath('/path/to/file')).not.toThrow()
  })

  test('should throw an error if the file is not accessible', () => {
    vi.mocked(fs.accessSync).mockImplementation(() => {
      throw new Error('Permission denied')
    })

    const expectedError = new PermissionNotFoundError()
    expect(() => ensureAccessibilityAtPath('/path/to/file')).toThrow(expectedError)
  })

  test('should use the provided permission mode', () => {
    const permissionMode = fs.constants.R_OK
    vi.mocked(fs.accessSync).mockImplementation(() => {})

    ensureAccessibilityAtPath('/path/to/file', permissionMode)
    expect(fs.accessSync).toHaveBeenCalledWith('/path/to/file', permissionMode)
  })

  test('should use F_OK as the default permission mode', () => {
    vi.mocked(fs.accessSync).mockImplementation(() => {})

    ensureAccessibilityAtPath('/path/to/file')
    expect(fs.accessSync).toHaveBeenCalledWith('/path/to/file', fs.constants.F_OK)
  })
})
