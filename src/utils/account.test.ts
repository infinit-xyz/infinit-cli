import { createDataFolder } from '@utils/config'
import { getFilesCurrentDir } from '@utils/files'
import fs from 'fs'
import { describe, expect, test, vi } from 'vitest'

import {
  checkIsAccountFound,
  getAccountFileNameFromAccountId,
  getAccountIdFromAccountFileName,
  getAccountsFolderPath,
  getAccountsList,
  isValidAccountFileName,
} from './account' // Adjust the import path as necessary

vi.mock('fs')
vi.mock('@utils/files', () => ({
  getFilesCurrentDir: vi.fn(),
}))
vi.mock('@utils/config', () => ({
  createDataFolder: vi.fn(),
}))
vi.mock('@classes/Config/Config', () => ({
  DATA_FOLDER: '/home/user/.infinit',
}))

describe('account.ts', () => {
  describe('isValidAccountFileName', () => {
    test('should return true for valid account file name', () => {
      expect(isValidAccountFileName('account1.json')).toBe(true)
      expect(isValidAccountFileName('account1.eth.json')).toBe(true)
      expect(isValidAccountFileName('account1-.json')).toBe(true)
      expect(isValidAccountFileName(' .json')).toBe(true)
    })

    test('should return false for invalid account file name', () => {
      expect(isValidAccountFileName('account1.txt')).toBe(false)
      expect(isValidAccountFileName('account1')).toBe(false)
      expect(isValidAccountFileName('.json')).toBe(false)
    })
  })

  describe('getAccountIdFromAccountFileName', () => {
    test('should return account ID from valid account file name', () => {
      expect(getAccountIdFromAccountFileName('account1.json')).toBe('account1')
      expect(getAccountIdFromAccountFileName('account1.eth.json')).toBe('account1.eth')
    })

    test('should throw an error for invalid account file name', () => {
      const invalidFileName = 'account1.txt'

      expect(() => getAccountIdFromAccountFileName(invalidFileName)).toThrow(`Invalid account file name: ${invalidFileName}`)
    })
  })

  describe('getAccountFileNameFromAccountId', () => {
    test('should return account file name from account ID', () => {
      expect(getAccountFileNameFromAccountId('testAccount')).toBe(`testAccount.json`)
    })
  })

  describe('getAccountsFolderPath', () => {
    test('should return accounts folder path', () => {
      const result = getAccountsFolderPath()

      expect(result).toBe('/home/user/.infinit/accounts')
    })
  })

  describe('checkIsAccountFound', () => {
    const accountId = 'testAccount'

    test('should create data folder if accounts folder does not exist', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false)

      const result = checkIsAccountFound(accountId)

      expect(createDataFolder).toHaveBeenCalledTimes(1)
      expect(result).toBe(false)
    })

    test('should return true if account file is found', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true)
      vi.mocked(getFilesCurrentDir).mockReturnValue([`${accountId}.json`])

      const result = checkIsAccountFound(accountId)

      expect(result).toBe(true)
    })

    test('should return false if account file is not found', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true)
      vi.mocked(getFilesCurrentDir).mockReturnValue(['fakeAccount.json'])

      const result = checkIsAccountFound(accountId)

      expect(result).toBe(false)
    })
  })

  describe('getAccountsList', () => {
    test('should return account files and accounts folder path', () => {
      const mockFiles = ['account1.json', 'account2.json']
      vi.mocked(getFilesCurrentDir).mockReturnValue(mockFiles)

      const result = getAccountsList()

      expect(result).toStrictEqual({
        accountFiles: mockFiles,
        accountsFolderPath: '/home/user/.infinit/accounts',
      })
    })
  })
})
