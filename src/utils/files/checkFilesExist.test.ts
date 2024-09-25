import type { FolderStructure } from '@utils/files/files.type'
import fs from 'fs'
import type { Dirent } from 'fs-extra'
import { describe, expect, test, vi } from 'vitest'
import { checkFilesExist } from './checkFilesExist'

vi.mock('fs')
vi.mock('@constants/chalk', () => ({
  chalkError: (str: string) => str,
  chalkSuccess: (str: string) => str,
}))

describe('checkFilesExist', () => {
  const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

  const folderStructure: FolderStructure = {
    'file1.txt': true,
    'file2.txt': true,
  }

  const mockFsExistsSync = (exists: boolean) => {
    vi.mocked(fs.existsSync).mockReturnValue(exists)
  }

  test('should return true if all files match in "all" mode', () => {
    vi.mocked(fs.readdirSync).mockReturnValue(['file1.txt', 'file2.txt'] as unknown as Dirent[])
    mockFsExistsSync(true)

    const result = checkFilesExist(folderStructure, '/path/to/folder', 'all')
    expect(result).toBe(true)
  })

  test('should return false if files do not match in "all" mode', () => {
    vi.mocked(fs.readdirSync).mockReturnValue(['file1.txt'] as unknown as Dirent[])

    const result = checkFilesExist(folderStructure, '/path/to/folder', 'all')
    expect(result).toBe(false)
    expect(mockConsoleError).toHaveBeenCalledWith('Files are not equal on path /path/to/folder')
  })

  test('should return true if required files exist in "require" mode', () => {
    vi.mocked(fs.readdirSync).mockReturnValue(['file1.txt', 'file2.txt', 'file3.txt'] as unknown as Dirent[])

    const result = checkFilesExist(folderStructure, '/path/to/folder', 'require')
    expect(result).toBe(true)
  })

  test('should return false if required files do not exist in "require" mode', () => {
    vi.mocked(fs.readdirSync).mockReturnValue(['file1.txt'] as unknown as Dirent[])

    const result = checkFilesExist(folderStructure, '/path/to/folder', 'require')
    expect(result).toBe(false)
    expect(mockConsoleError).toHaveBeenCalledWith('Files are not equal on path /path/to/folder')
  })

  test('should not log errors if isDisableLog is true', () => {
    mockConsoleError.mockReset()

    vi.mocked(fs.readdirSync).mockReturnValue(['file1.txt'] as unknown as Dirent[])

    const result = checkFilesExist(folderStructure, '/path/to/folder', 'all', true)
    expect(result).toBe(false)
    expect(mockConsoleError).not.toHaveBeenCalled()
  })
})
