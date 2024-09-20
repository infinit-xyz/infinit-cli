import { getScriptFileDirectory, getScriptHistoryFileDirectory, handleGenerateScriptFile } from '@commands/script/generate/utils'
import { protocolModules } from '@constants/protocol-module'
import { PROTOCOL_MODULE } from '@enums/module'
import { writeFileSync } from '@utils/files'
import { zodGetDefaults } from '@utils/zod'
import fs from 'fs'
import path from 'path'
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest'

const folderPath = path.join(__dirname, '..', '..', '..', 'generate')
const mockProcessCwd = '<PROJECT_CWD>'

describe('generate/utils.ts', () => {
  beforeAll(() => {
    vi.spyOn(process, 'cwd').mockReturnValue(mockProcessCwd)
    writeFileSync(path.join(folderPath, '.temp'), 'test-generate')
  })

  afterAll(() => {
    // Delete the test project folder
    if (fs.existsSync(folderPath)) {
      fs.rmSync(folderPath, { recursive: true })
    }
  })

  describe('getScriptFileDirectory', () => {
    test('should get correct script file directory', async () => {
      expect(getScriptFileDirectory()).toBe(`${mockProcessCwd}/src/scripts`)
    })

    test('should get correct script file directory with custom project root', async () => {
      expect(getScriptFileDirectory('FAKE_ROOT')).toBe(`FAKE_ROOT/src/scripts`)
    })
  })

  describe('getScriptHistoryFileDirectory', () => {
    test('should get correct script history file directory', async () => {
      expect(getScriptHistoryFileDirectory()).toBe(`${mockProcessCwd}/src/scripts-history`)
    })

    test('should get correct script history file directory with custom project root', async () => {
      expect(getScriptHistoryFileDirectory('FAKE_ROOT')).toBe(`FAKE_ROOT/src/scripts-history`)
    })
  })

  describe('handleGenerateScriptFile', () => {
    test('should generate a script file with correct name and content', async () => {
      const protocolModule = protocolModules[PROTOCOL_MODULE.aave_v3]
      const infinitAction = protocolModule.actions.setLiquidationBonusAction

      const generatedFilePath = await handleGenerateScriptFile(infinitAction, 'setLiquidationBonusAction', protocolModule.libPath, 'test-generate', folderPath)

      const readFileContent = fs.readFileSync(generatedFilePath, 'utf-8')

      const zodObjectDefault = zodGetDefaults(infinitAction.paramsSchema)
      const allZodKeys = Object.keys(zodObjectDefault)

      expect(generatedFilePath.split('/').at(-1)).toBe('test-generate.script.ts')

      expect(readFileContent).toContain(`import { ${infinitAction.actionClassName}, type actions } from '${protocolModule.libPath}/actions'`)
      allZodKeys.forEach((key) => {
        expect(readFileContent).toContain(`"${key}": undefined`)
      })
    })
  })
})
