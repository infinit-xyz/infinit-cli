import { FILE_NAMES } from '@constants'
import fs from 'fs'
import type { Dirent } from 'fs-extra'
import path from 'path'
import { describe, expect, test, vi } from 'vitest'
import { ensureCwdRootProject, isCwdRootProject } from './files'

vi.mock('fs')
vi.mock('path')

describe('file.ts', () => {
  describe('isCwdRootProject', () => {
    const mockProcessArgv = (cliPath: string) => {
      process.argv[1] = cliPath
    }

    const mockFs = (exists: boolean) => {
      vi.mocked(fs.readdirSync).mockReturnValue((exists ? ['src', FILE_NAMES.CONFIG] : []) as unknown as Dirent[])
      vi.mocked(fs.existsSync).mockReturnValue(exists)
    }

    test('should return false if CLI path does not include current CWD', () => {
      mockProcessArgv('/some/other/path/node_modules/.bin/infinit')
      const result = isCwdRootProject('/current/project/path')
      expect(result).toEqual({ currentCwd: '/current/project/path', isRunningFromRootProject: false })
    })

    test('should return true if CLI path includes current CWD and config file exists', async () => {
      mockProcessArgv('/current/project/path/node_modules/.bin/infinit')
      mockFs(true)

      const result = isCwdRootProject('/current/project/path')
      expect(result).toEqual({ currentCwd: '/current/project/path', isRunningFromRootProject: true })
    })

    test('should return false if CLI path includes current CWD but config file does not exist', () => {
      mockProcessArgv('/current/project/path/node_modules/.bin/infinit')
      mockFs(false)
      const result = isCwdRootProject('/current/project/path')
      expect(result).toEqual({ currentCwd: '/current/project/path', isRunningFromRootProject: false })
    })
  })

  describe.skip('ensureCwdRootProject', () => {
    const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit() was called')
    })

    test('should not exit if running from root project', () => {
      vi.spyOn(fs, 'existsSync').mockReturnValue(true)
      vi.spyOn(path, 'join').mockReturnValue('/current/project/path/node_modules/.bin/infinit')
      expect(() => ensureCwdRootProject()).not.toThrow()
    })

    test('should exit if not running from root project', () => {
      vi.spyOn(fs, 'existsSync').mockReturnValue(false)
      vi.spyOn(path, 'join').mockReturnValue('/some/other/path/node_modules/.bin/infinit')
      expect(() => ensureCwdRootProject()).toThrow('process.exit() was called')
      expect(mockExit).toHaveBeenCalledWith(1)
    })
  })
})
