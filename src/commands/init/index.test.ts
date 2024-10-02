import fs from 'fs'
import path from 'path'
import { type MockInstance, afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { projectPathPrompt } from '@commands/init/index.prompt'
import type { InitProjectInput } from '@commands/init/index.type'
import { chainNamePrompt, protocolModulePrompt, selectDeployerPrompt } from '@commands/project/create.prompt'
import { CHAIN_ID } from '@enums/chain'
import { PROTOCOL_MODULE } from '@enums/module'
import { PACKAGE_MANAGER } from '@enums/package-managers'
import { confirm } from '@inquirer/prompts'
import { getAccountsList } from '@utils/account'
import { isSupportedChain } from '@utils/chain'
import { isCwdRootProject } from '@utils/files'
import { getPackageManager } from '@utils/packageManager'
import { compileProject, initializeCliProject } from '@utils/project'

import { handleInitializeCli } from './index'

vi.mock('fs')
vi.mock('path')
vi.mock('@inquirer/prompts', () => ({
  confirm: vi.fn(),
}))

vi.mock('@constants/chalk', () => ({
  chalkError: (str: string) => str,
  chalkInfo: (str: string) => str,
  chalkSuccess: (str: string) => str,
  chalkWarning: (str: string) => str,
}))
vi.mock('@utils/files', () => ({
  isCwdRootProject: vi.fn(),
}))
vi.mock('@commands/init/index.prompt', () => ({
  projectPathPrompt: vi.fn(),
}))
vi.mock('@commands/project/create.prompt', () => ({
  chainNamePrompt: vi.fn(),
  protocolModulePrompt: vi.fn(),
  selectDeployerPrompt: vi.fn(),
}))
vi.mock('@utils/project', () => ({
  compileProject: vi.fn(),
  initializeCliProject: vi.fn().mockResolvedValue({ generatedScriptFile: 'action1.script.ts' }),
}))
vi.mock('@utils/chain', async (importOriginal) => {
  return {
    ...(await importOriginal<typeof import('@utils/chain')>()),
    isSupportedChain: vi.fn(),
  }
})
vi.mock('@utils/account', () => ({
  getAccountsList: vi.fn(),
}))
vi.mock('@utils/packageManager', () => ({
  getPackageManager: vi.fn(),
}))

describe('handleInitializeCli', () => {
  const defaultProjectDirectory = '/default/project/directory'

  // mock correct value for cmd input
  const cmdInput = {
    directory: '/mock/project/directory',
    chain: 'Ethereum',
    module: 'aave-v3',
    deployer: 'deployer-1',
  } satisfies InitProjectInput

  let consoleLogSpy: MockInstance<typeof console.log>
  let consoleErrorSpy: MockInstance<typeof console.error>
  let consoleWarnSpy: MockInstance<typeof console.error>

  const mockIsProjectDirectoryExist = (isExist: boolean) => {
    vi.mocked(fs.existsSync).mockReturnValue(isExist)
  }
  const mockIsRunningInExistingProject = (isExist: boolean) => {
    vi.mocked(isCwdRootProject).mockReturnValue({ currentCwd: '', isRunningFromRootProject: isExist })
  }
  const mockIsSupportedChain = (isSupport: boolean) => {
    vi.mocked(isSupportedChain).mockReturnValue(isSupport)
  }
  const mockGetAccountsList = (accountFiles: string[] = []) => {
    vi.mocked(getAccountsList).mockReturnValue({ accountFiles, accountsFolderPath: '/mock/accounts/folder' })
  }
  const mockConfirmAnalytics = (value: boolean) => {
    vi.mocked(confirm).mockResolvedValue(value)
  }

  beforeEach(() => {
    vi.mocked(path.resolve).mockReturnValue(defaultProjectDirectory)
    vi.mocked(getPackageManager).mockReturnValue(PACKAGE_MANAGER.bun)
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  test('should run successfully', async () => {
    mockIsProjectDirectoryExist(true)
    mockIsRunningInExistingProject(false)
    vi.mocked(chainNamePrompt).mockResolvedValue(CHAIN_ID.Ethereum)
    mockIsSupportedChain(true)
    mockGetAccountsList()

    await expect(handleInitializeCli(cmdInput)).resolves.toBeUndefined()

    expect(consoleLogSpy).toHaveBeenLastCalledWith('🔥 Successfully initialized a project, go to src/scripts/action1.script.ts to start building.')
  })

  describe('project directory', () => {
    test('should prompt for project directory if not provided', async () => {
      vi.mocked(projectPathPrompt).mockResolvedValue('/mock/project/directory')

      const mockCmdInput: InitProjectInput = { ...cmdInput }
      delete mockCmdInput.directory

      await expect(handleInitializeCli(mockCmdInput)).resolves.toBeUndefined()

      expect(projectPathPrompt).toHaveBeenCalled()
    })

    test('should use provided project directory if available', async () => {
      await expect(handleInitializeCli(cmdInput)).resolves.toBeUndefined()

      expect(projectPathPrompt).not.toHaveBeenCalled()
    })

    test('should show error if project directory does not exist', async () => {
      mockIsProjectDirectoryExist(false)

      await expect(handleInitializeCli(cmdInput)).resolves.toBeUndefined()

      expect(consoleErrorSpy).toHaveBeenLastCalledWith('Project directory does not exist')
    })

    test('should show error if INFINIT project already exists in the directory', async () => {
      mockIsProjectDirectoryExist(true)
      mockIsRunningInExistingProject(true)

      await expect(handleInitializeCli(cmdInput)).resolves.toBeUndefined()

      expect(consoleErrorSpy).toHaveBeenLastCalledWith('INFINIT Project already exists in that directory. Please try another directory.')
    })
  })

  describe('chain', () => {
    beforeEach(() => {
      mockIsProjectDirectoryExist(true)
      mockIsRunningInExistingProject(false)
    })

    test('should prompt for chain name if not provided or invalid', async () => {
      mockIsSupportedChain(true)

      vi.mocked(chainNamePrompt).mockResolvedValue(CHAIN_ID.Ethereum)

      await expect(handleInitializeCli({ ...cmdInput, chain: '' })).resolves.toBeUndefined()

      expect(chainNamePrompt).toHaveBeenCalled()
      expect(consoleErrorSpy).not.toHaveBeenCalled()
    })

    test('should use provided chain name if available', async () => {
      mockIsSupportedChain(true)

      await expect(handleInitializeCli(cmdInput)).resolves.toBeUndefined()

      expect(chainNamePrompt).not.toHaveBeenCalled()
      expect(consoleErrorSpy).not.toHaveBeenCalled()
    })

    test('should show error if no chain id', async () => {
      vi.mocked(chainNamePrompt).mockResolvedValue('' as CHAIN_ID)

      await expect(handleInitializeCli({ ...cmdInput, chain: '' })).resolves.toBeUndefined()

      expect(consoleErrorSpy).toHaveBeenLastCalledWith('Chain is required')
    })

    test('should show error if got unsupported chain', async () => {
      mockIsSupportedChain(false)

      vi.mocked(chainNamePrompt).mockResolvedValue('unsupported-chain' as CHAIN_ID)

      await expect(handleInitializeCli({ ...cmdInput, chain: '' })).resolves.toBeUndefined()

      expect(consoleErrorSpy).toHaveBeenLastCalledWith('Chain is not supported')
    })
  })

  describe('protocol module', () => {
    beforeEach(() => {
      mockIsProjectDirectoryExist(true)
      mockIsRunningInExistingProject(false)
      mockIsSupportedChain(true)
    })

    test('should prompt for protocol module if not provided or invalid', async () => {
      vi.mocked(protocolModulePrompt).mockResolvedValue(PROTOCOL_MODULE.aave_v3)

      await expect(handleInitializeCli({ ...cmdInput, module: '' })).resolves.toBeUndefined()

      expect(protocolModulePrompt).toHaveBeenCalled()
      expect(consoleErrorSpy).not.toHaveBeenCalled()
    })

    test('should use provided protocol module if available', async () => {
      await expect(handleInitializeCli(cmdInput)).resolves.toBeUndefined()

      expect(projectPathPrompt).not.toHaveBeenCalled()
      expect(consoleErrorSpy).not.toHaveBeenCalled()
    })

    test('should show error if protocol module is not supported', async () => {
      vi.mocked(protocolModulePrompt).mockResolvedValue('' as PROTOCOL_MODULE)

      await expect(handleInitializeCli({ ...cmdInput, module: '' })).resolves.toBeUndefined()

      expect(consoleErrorSpy).toHaveBeenLastCalledWith('Protocol module is not supported')
    })
  })

  describe('deployer', () => {
    beforeEach(() => {
      mockIsProjectDirectoryExist(true)
      mockIsRunningInExistingProject(false)
      mockIsSupportedChain(true)
    })

    test('should prompt for deployer account if not provided', async () => {
      mockGetAccountsList(['deployer-1.json'])
      vi.mocked(selectDeployerPrompt).mockResolvedValue('deployer-1')

      const mockCmdInput: InitProjectInput = { ...cmdInput }
      delete mockCmdInput.deployer

      await expect(handleInitializeCli(mockCmdInput)).resolves.toBeUndefined()

      expect(selectDeployerPrompt).toHaveBeenCalled()
      expect(consoleErrorSpy).not.toHaveBeenCalled()
      expect(initializeCliProject).toHaveBeenCalledWith('/mock/project/directory', 'aave-v3', '1', 'bun', 'deployer-1', undefined)
    })

    test('should not prompt for deployer account if provided', async () => {
      mockGetAccountsList(['deployer-1.json'])

      await expect(handleInitializeCli(cmdInput)).resolves.toBeUndefined()

      expect(selectDeployerPrompt).not.toHaveBeenCalled()
      expect(consoleErrorSpy).not.toHaveBeenCalled()
      expect(initializeCliProject).toHaveBeenCalledWith('/mock/project/directory', 'aave-v3', '1', 'bun', 'deployer-1', undefined)
    })

    test('should not input any deployer if not provided', async () => {
      mockGetAccountsList([])

      const mockCmdInput: InitProjectInput = { ...cmdInput }
      delete mockCmdInput.deployer

      await expect(handleInitializeCli(cmdInput)).resolves.toBeUndefined()

      expect(selectDeployerPrompt).not.toHaveBeenCalled()
      expect(consoleErrorSpy).not.toHaveBeenCalled()
      expect(initializeCliProject).toHaveBeenCalledWith('/mock/project/directory', 'aave-v3', '1', 'bun', undefined, undefined)
    })
  })

  describe('analytics', () => {
    beforeEach(() => {
      mockIsProjectDirectoryExist(true)
      mockIsRunningInExistingProject(false)
      mockIsSupportedChain(true)
      mockGetAccountsList([])
    })

    test('should prompt for analytics confirmation', async () => {
      await expect(handleInitializeCli(cmdInput)).resolves.toBeUndefined()

      expect(confirm).toHaveBeenCalled()
    })

    test('should handle confirm analytics correctly', async () => {
      mockConfirmAnalytics(true)

      await expect(handleInitializeCli(cmdInput)).resolves.toBeUndefined()

      expect(confirm).toHaveBeenCalled()
      expect(consoleErrorSpy).not.toHaveBeenCalled()
      expect(initializeCliProject).toHaveBeenCalledWith('/mock/project/directory', 'aave-v3', '1', 'bun', undefined, true)
    })

    test('should handle reject analytics correctly', async () => {
      mockConfirmAnalytics(false)

      await expect(handleInitializeCli(cmdInput)).resolves.toBeUndefined()

      expect(confirm).toHaveBeenCalled()
      expect(consoleErrorSpy).not.toHaveBeenCalled()
      expect(initializeCliProject).toHaveBeenCalledWith('/mock/project/directory', 'aave-v3', '1', 'bun', undefined, false)
    })

    test('should not prompt for analytics if ignored', async () => {
      await expect(handleInitializeCli({ ...cmdInput, ignoreAnalytics: true })).resolves.toBeUndefined()

      expect(confirm).not.toHaveBeenCalled()
      expect(consoleErrorSpy).not.toHaveBeenCalled()
      expect(initializeCliProject).toHaveBeenCalledWith('/mock/project/directory', 'aave-v3', '1', 'bun', undefined, false)
    })
  })

  describe('package manager', () => {
    beforeEach(() => {
      mockIsProjectDirectoryExist(true)
      mockIsRunningInExistingProject(false)
      mockIsSupportedChain(true)
      mockGetAccountsList([])
      mockConfirmAnalytics(false)
    })

    test('should parse correct package manager', async () => {
      vi.mocked(getPackageManager)
        .mockReset()
        .mockReturnValue('XXX' as PACKAGE_MANAGER)

      await expect(handleInitializeCli(cmdInput)).resolves.toBeUndefined()

      expect(initializeCliProject).toHaveBeenCalledWith('/mock/project/directory', 'aave-v3', '1', 'XXX', undefined, false)
    })
  })

  describe('compile project', () => {
    beforeEach(() => {
      mockIsProjectDirectoryExist(true)
      mockIsRunningInExistingProject(false)
      mockIsSupportedChain(true)
      mockGetAccountsList([])
      mockConfirmAnalytics(false)
    })

    test('should compile project successfully', async () => {
      vi.mocked(compileProject).mockResolvedValue()

      await expect(handleInitializeCli(cmdInput)).resolves.toBeUndefined()

      expect(consoleLogSpy).toHaveBeenLastCalledWith('🔥 Successfully initialized a project, go to src/scripts/action1.script.ts to start building.')
      expect(consoleWarnSpy).not.toHaveBeenCalled()
    })

    test('should show warning if failed to compile project', async () => {
      vi.mocked(compileProject).mockRejectedValueOnce(new Error('Failed to compile project'))

      await expect(handleInitializeCli(cmdInput)).resolves.toBeUndefined()

      expect(consoleWarnSpy).toHaveBeenLastCalledWith(
        '⚠️ Failed to compile the project. Please run `bunx infinit project compile` to compile the project after initializing.',
      )
      expect(consoleLogSpy).toHaveBeenLastCalledWith('🔥 Successfully initialized a project, go to src/scripts/action1.script.ts to start building.')
      expect(consoleErrorSpy).not.toHaveBeenCalled()
    })
  })
})
