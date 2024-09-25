import { checkFilesExist } from '@utils/files/checkFilesExist'
import { isCwdRootProject } from '@utils/files/isCwdRootProject'
import { afterEach, describe, expect, test, vi } from 'vitest'

vi.mock('@utils/files/checkFilesExist')

describe('isCwdRootProject', async () => {
  const mockProcessArgv = (cliPath: string) => {
    process.argv[1] = cliPath
  }

  const mockCheckFilesExist = (exists: boolean) => {
    vi.mocked(checkFilesExist).mockReturnValue(exists)
  }

  afterEach(() => {
    vi.resetAllMocks()
  })

  test('should return false if CLI path does not include current CWD', async () => {
    mockProcessArgv('/some/other/path/node_modules/.bin/infinit')

    const result = isCwdRootProject('/current/project/path')

    expect(result).toEqual({ currentCwd: '/current/project/path', isRunningFromRootProject: false })
  })

  test('should return true if CLI path includes current CWD and config file exists', async () => {
    mockProcessArgv('/current/project/path/node_modules/.bin/infinit')
    mockCheckFilesExist(true)

    const result = isCwdRootProject('/current/project/path')

    expect(result).toEqual({ currentCwd: '/current/project/path', isRunningFromRootProject: true })
  })

  test('should return false if CLI path includes current CWD but config file does not exist', () => {
    mockProcessArgv('/current/project/path/node_modules/.bin/infinit')
    mockCheckFilesExist(false)

    const result = isCwdRootProject('/current/project/path')

    expect(result).toEqual({ currentCwd: '/current/project/path', isRunningFromRootProject: false })
  })
})
