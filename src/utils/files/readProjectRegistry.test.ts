import { FileNotFoundError } from '@errors/fs'
import fs from 'fs'
import path from 'path'
import type { Address } from 'viem'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { readProjectRegistry } from './readProjectRegistry'

vi.mock('fs')
vi.mock('path')

describe('readProjectRegistry', () => {
  const mockRegistryPath = '/mock/path/src/registry.json'
  const mockRegistryData = JSON.stringify({
    '0x123': '0xabc',
  })

  beforeEach(() => {
    vi.mocked(path.resolve).mockReturnValue(mockRegistryPath)
  })

  test('should throw an error if the registry file does not exist', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false)

    const expectedError = new FileNotFoundError(mockRegistryPath)
    expect(() => readProjectRegistry()).toThrow(expectedError)
  })

  test('should return the registry data if the registry file exists', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(fs.readFileSync).mockReturnValue(mockRegistryData)

    const result = readProjectRegistry()
    expect(result).toEqual({
      registryPath: mockRegistryPath,
      registry: JSON.parse(mockRegistryData) as Record<string, Address>,
    })
  })
})
