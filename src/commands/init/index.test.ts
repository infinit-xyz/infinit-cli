import { PACKAGE_MANAGER } from '@enums/package-managers'
import { ValidateInputValueError } from '@errors/validate'
import { spawnChild } from '@utils/childprocess'
import { InfinitCLI } from '@utils/invoke-cli'
import { getPackageManagerInstallArgs } from '@utils/packageManager'
import fs from 'fs'
import { name as packageJsonName } from 'package.json'
import path from 'path'
import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest'

describe('Command: init', () => {
  const cwdPath = path.join(__dirname, '..', '..', '..', '..', 'infinit-test-script-area')
  const projectName = 'test-' + (Math.random() * 1000).toFixed(0)
  const newProjectPath = path.join(cwdPath, projectName)

  beforeAll(async () => {
    if (!fs.existsSync(cwdPath)) {
      fs.mkdirSync(cwdPath)
    }
    if (!fs.existsSync(newProjectPath)) {
      fs.mkdirSync(newProjectPath)
    }
    process.chdir(newProjectPath)

    // init npm project
    await spawnChild('npm', ['init', '-y'])
  })

  afterAll(() => {
    // Delete the project folder
    if (fs.existsSync(newProjectPath)) {
      fs.rmSync(newProjectPath, { recursive: true })
    }
  })

  describe('functionality with npm', () => {
    beforeAll(async () => {
      // install cli
      const cliInstallCommand = `${packageJsonName}@${path.join(process.argv[1], '..', '..', '..', '..', '..')}`
      const dependencies = [cliInstallCommand]
      const args = getPackageManagerInstallArgs(PACKAGE_MANAGER.npm, false).concat(dependencies)

      await spawnChild(PACKAGE_MANAGER.npm, args)
    })

    test('should initialize INFINIT project successfully with npm', async () => {
      const [exitCode, logs] = await InfinitCLI()
        .setCwd(cwdPath)
        .invoke(['init', '--directory', newProjectPath, '--chain', 'ARB_SEPOLIA', '--module', 'aave-v3', '--ignore-deployer'])

      logs.should.contain('Successfully initialized a project')

      expect(exitCode).toBe(0)
    })

    test('should throw error with project directory does not exist', async () => {
      const [exitCode, _logs, errorLogs] = await InfinitCLI()
        .setCwd(cwdPath)
        .invoke(['init', '--directory', 'wrong', '--chain', 'ARB_SEPOLIA', '--module', 'aave_v3', '--ignore-deployer'])

      const expectedError = new ValidateInputValueError('Project directory does not exist')
      errorLogs.should.contain(expectedError.message)
      expect(exitCode).toBe(0)
    })

    test('should throw error with protocol module is not supported', async () => {
      const [exitCode, _logs, errorLogs] = await InfinitCLI()
        .setCwd(cwdPath)
        .invoke(['init', '--directory', newProjectPath, '--chain', 'ARB_SEPOLIA', '--module', 'abcd', '--ignore-deployer'])

      const expectedError = new ValidateInputValueError('Protocol module is not supported')
      errorLogs.should.contain(expectedError.message)
      expect(exitCode).toBe(0)
    })
  })

  describe('package manager', () => {
    beforeEach(() => {
      const lockFiles = ['pnpm-lock.yaml', 'yarn.lock', 'package-lock.json', 'bun.lockb']

      lockFiles.forEach((lockFile) => {
        const lockFilePath = path.join(newProjectPath, lockFile)
        if (fs.existsSync(lockFilePath)) {
          fs.rmSync(lockFilePath)
        }
      })
    })

    test('should initialize INFINIT project successfully with bun', async () => {
      const packageManager = PACKAGE_MANAGER.bun

      // install cli
      const cliInstallCommand = `${packageJsonName}@${path.join(process.argv[1], '..', '..', '..', '..', '..')}`
      const dependencies = [cliInstallCommand]
      const args = getPackageManagerInstallArgs(packageManager, false).concat(dependencies)

      await spawnChild(packageManager, args)

      const [exitCode, logs] = await InfinitCLI()
        .setCwd(cwdPath)
        .invoke(['init', '--directory', newProjectPath, '--chain', 'ARB_SEPOLIA', '--module', 'aave-v3', '--ignore-deployer'])

      logs.should.contain('Successfully initialized a project')

      expect(exitCode).toBe(0)
    }, 30000)
  })
})
