import fs from 'fs'
import type { Dirent } from 'fs-extra'
import { describe, expect, test, vi } from 'vitest'
import { getFilesCurrentDir } from './getFilesCurrentDir' // Adjust the import path as necessary

vi.mock('fs')

describe('getFilesCurrentDir', () => {
  test('should return an empty array if the path does not exist', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false)

    const result = getFilesCurrentDir('/non/existent/path')
    expect(result).toEqual([])
  })

  test('should return the list of files if the path exists', () => {
    const mockFiles = ['file1.txt', 'file2.txt']
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(fs.readdirSync).mockReturnValue(mockFiles as unknown as Dirent[])

    const result = getFilesCurrentDir('/existent/path')
    expect(result).toEqual(mockFiles)
  })

  test('should use the current working directory if no path is provided', () => {
    const mockFiles = ['file1.txt', 'file2.txt']
    const cwd = '/current/working/directory'
    vi.spyOn(process, 'cwd').mockReturnValue(cwd)
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(fs.readdirSync).mockReturnValue(mockFiles as unknown as Dirent[])

    const result = getFilesCurrentDir()
    expect(result).toEqual(mockFiles)
    expect(fs.existsSync).toHaveBeenCalledWith(cwd)
    expect(fs.readdirSync).toHaveBeenCalledWith(cwd)
  })
})
