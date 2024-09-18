import { handleGenerateScriptFile } from '@commands/script/generate/utils'
import { protocolModules } from '@constants/protocol-module'
import { PROTOCOL_MODULE } from '@enums/module'
import { writeFileSync } from '@utils/files'
import { zodGetDefaults } from '@utils/zod'
import fs from 'fs'
import path from 'path'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

const folderPath = path.join(__dirname, '..', '..', '..', 'generate')

describe('generate/utils.ts', () => {
  beforeAll(() => {
    writeFileSync(path.join(folderPath, '.temp'), 'test-generate')
  })

  afterAll(() => {
    // Delete the project folder
    if (fs.existsSync(folderPath)) {
      fs.rmSync(folderPath, { recursive: true })
    }
  })

  describe('handleGenerateScriptFile', () => {
    test('should generate a script file with correct name and content', async () => {
      const protocolModule = protocolModules[PROTOCOL_MODULE.aave_v3]
      const infinitAction = protocolModule.actions.setLiquidationBonusAction

      const generatedFilePath = await handleGenerateScriptFile(infinitAction, 'setLiquidationBonusAction', protocolModule.libPath, 'test-generate', folderPath)

      const readFileContent = fs.readFileSync(generatedFilePath, 'utf-8')

      const zodObjectDefault = zodGetDefaults(infinitAction.paramSchema)
      const allZodKeys = Object.keys(zodObjectDefault)

      expect(generatedFilePath.split('/').at(-1)).toBe('test-generate.script.ts')

      expect(readFileContent).toContain(`import { ${infinitAction.actionClassName}, type actions } from '${protocolModule.libPath}/actions'`)
      allZodKeys.forEach((key) => {
        expect(readFileContent).toContain(`"${key}": undefined`)
      })
    })
  })
})
