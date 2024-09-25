import fs from 'fs'
import fsExtra from 'fs-extra'
import path from 'path'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { writeFileSync } from './writeFileSync'

vi.mock('fs')
vi.mock('fs-extra')
vi.mock('path')

describe('writeFileSync', () => {
  const mockFilePath = '/mock/path/to/file.txt'
  const mockData = 'file content'
  const mockParentPath = '/mock/path/to'

  beforeEach(() => {
    vi.resetAllMocks()

    vi.mocked(path.join).mockReturnValue(mockParentPath)
  })

  test('should create parent directory if it does not exist', () => {
    vi.mocked(fsExtra.pathExistsSync).mockReturnValue(false)
    vi.mocked(fs.mkdirSync).mockImplementation(() => '')

    writeFileSync(mockFilePath, mockData)

    expect(path.join).toHaveBeenCalledWith(mockFilePath, '..')
    expect(fsExtra.pathExistsSync).toHaveBeenCalledWith(mockParentPath)
    expect(fs.mkdirSync).toHaveBeenCalledWith(mockParentPath, { recursive: true })
    expect(fs.writeFileSync).toHaveBeenCalledWith(mockFilePath, mockData)
  })

  test('should not create parent directory if it exists', () => {
    vi.mocked(fsExtra.pathExistsSync).mockReturnValue(true)

    writeFileSync(mockFilePath, mockData)

    expect(path.join).toHaveBeenCalledWith(mockFilePath, '..')
    expect(fsExtra.pathExistsSync).toHaveBeenCalledWith(mockParentPath)
    expect(fs.mkdirSync).not.toHaveBeenCalled()
    expect(fs.writeFileSync).toHaveBeenCalledWith(mockFilePath, mockData)
  })
})
