import { handleGenerateScript } from '@commands/script'
import { getScriptFileDirectory, getUniqueScriptFileName, handleGenerateScriptFile } from '@commands/script/generate/utils'
import { chalkError, chalkInfo } from '@constants/chalk'
import { confirm, select } from '@inquirer/prompts'
import { type Mock, type MockInstance, afterAll, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('@utils/files', async (importOriginal) => {
  const actual: object = await importOriginal()
  return { ...actual, ensureCwdRootProject: () => {} }
})
vi.mock('./utils')
vi.mock('@constants/protocol-module', () => ({
  protocolModules: {},
}))
vi.mock('@classes', () => ({
  config: {
    getProjectConfig: () => ({
      protocol_module: 'protocol-x',
    }),
  },
}))
vi.mock('@constants/protocol-module', () => ({
  protocolModules: {
    'protocol-x': {
      actions: {
        action1: {
          name: 'Action 1',
          actionClassName: 'Action1',
          paramsSchema: {},
          signers: ['action-1-signer'],
        },
        action2: {
          name: 'Action 2',
          actionClassName: 'Action2',
          paramsSchema: {},
          signers: ['action-2-signer'],
        },
      },
      libPath: 'protocol-x-lib',
    },
  },
}))
vi.mock('@inquirer/prompts')

describe('generate/index.ts', () => {
  let consoleLogSpy: MockInstance<Console['log']>
  let consoleErrorSpy: MockInstance<Console['error']>
  let promptSelectSpy: Mock
  let handleGenerateScriptFileSpy: Mock

  beforeAll(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined)
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    promptSelectSpy = vi.fn()
    handleGenerateScriptFileSpy = vi.fn().mockResolvedValue('mockGeneratedFilePath')
    vi.mocked(getUniqueScriptFileName).mockImplementation((actionName: string) => `${actionName}_1`)
    vi.mocked(getScriptFileDirectory).mockReturnValue('folderPath/src/scripts')
  })

  describe('handleGenerateScript', () => {
    beforeAll(() => {
      vi.mocked(select).mockImplementation(promptSelectSpy)
      vi.mocked(handleGenerateScriptFile).mockImplementation(handleGenerateScriptFileSpy)

      const mockDate = new Date(629557993000) // Wednesday, December 13, 1989 1:13:13 PM UTC
      vi.useFakeTimers()
      vi.setSystemTime(mockDate)
    })

    beforeEach(() => {
      promptSelectSpy.mockReset()
    })

    afterAll(() => {
      vi.useRealTimers()
    })

    test('should handle action generate command with actionId argument correctly', async () => {
      vi.mocked(confirm).mockResolvedValue(true)

      await expect(handleGenerateScript('action1')).resolves.toBeUndefined()

      expect(consoleErrorSpy).not.toHaveBeenCalled()
      expect(promptSelectSpy).not.toHaveBeenCalled()

      expect(handleGenerateScriptFileSpy).toHaveBeenCalledWith(
        {
          name: 'Action 1',
          actionClassName: 'Action1',
          paramsSchema: {},
          signers: ['action-1-signer'],
        },
        'action1',
        'protocol-x-lib',
        'Action1_1',
        'folderPath/src/scripts',
      )

      expect(consoleLogSpy).toHaveBeenCalledWith(`⚙ Generate ${chalkInfo('Action 1')} script successfully`)
    })

    test('should handle action generate command with no actionId argument correctly', async () => {
      promptSelectSpy.mockResolvedValue('action2')
      vi.mocked(confirm).mockResolvedValue(true)

      await expect(handleGenerateScript()).resolves.toBeUndefined()

      expect(consoleErrorSpy).not.toHaveBeenCalled()

      expect(promptSelectSpy).toHaveBeenCalledTimes(1)
      expect(promptSelectSpy).toHaveBeenLastCalledWith(
        {
          message: 'Select an action to generate',
          choices: [
            { name: 'Action 1', value: 'action1' },
            { name: 'Action 2', value: 'action2' },
          ],
        },
        {
          input: undefined,
          output: undefined,
        },
      )
      expect(handleGenerateScriptFileSpy).toHaveBeenCalledWith(
        {
          name: 'Action 2',
          actionClassName: 'Action2',
          paramsSchema: {},
          signers: ['action-2-signer'],
        },
        'action2',
        'protocol-x-lib',
        'Action2_1',
        'folderPath/src/scripts',
      )

      expect(consoleLogSpy).toHaveBeenCalledWith(`⚙ Generate ${chalkInfo('Action 2')} script successfully`)
    })

    test('should handle actionId not found', async () => {
      const invalidActionId = 'nonExistentAction'

      promptSelectSpy.mockResolvedValue('action1')

      await handleGenerateScript(invalidActionId)

      expect(consoleErrorSpy).toHaveBeenCalledWith(chalkError('Action nonExistentAction not found. Please select your desired action.'))
      expect(promptSelectSpy).toHaveBeenCalledTimes(1)
      expect(promptSelectSpy).toHaveBeenLastCalledWith(
        {
          message: 'Select an action to generate',
          choices: [
            { name: 'Action 1', value: 'action1' },
            { name: 'Action 2', value: 'action2' },
          ],
        },
        {
          input: undefined,
          output: undefined,
        },
      )
    })
  })
})
