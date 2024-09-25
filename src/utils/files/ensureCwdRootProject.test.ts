import { FILE_NAMES } from '@constants'
import { chalkError } from '@constants/chalk'
import { isCwdRootProject } from '@utils/files/isCwdRootProject'
import chalk from 'chalk'
import { describe, expect, test, vi } from 'vitest'
import { ensureCwdRootProject } from './ensureCwdRootProject'

vi.mock('@utils/files/isCwdRootProject')

describe('ensureCwdRootProject', () => {
  const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => {
    throw new Error('process.exit() was called')
  })

  const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

  test('should not exit if running from root project', () => {
    vi.mocked(isCwdRootProject).mockReturnValue({
      currentCwd: '/current/project/path',
      isRunningFromRootProject: true,
    })

    expect(() => ensureCwdRootProject()).not.toThrow()
    expect(mockExit).not.toHaveBeenCalled()
  })

  test('should exit if not running from root project', () => {
    vi.mocked(isCwdRootProject).mockReturnValue({
      currentCwd: '/current/project/path',
      isRunningFromRootProject: false,
    })

    expect(() => ensureCwdRootProject()).toThrow('process.exit() was called')
    expect(mockExit).toHaveBeenCalledWith(1)
    expect(mockConsoleError).toHaveBeenCalledWith(chalkError(`Can't find ${chalk.bold(FILE_NAMES.CONFIG)}`))
    expect(mockConsoleError).toHaveBeenCalledWith('Current path: /current/project/path')
  })
})
