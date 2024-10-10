import { injectedConsole } from '@classes'
import { handleExecuteScript } from '@commands/script/execute'
import { getScriptFileDirectory } from '@commands/script/generate/utils'
import { getFilesCurrentDir } from '@utils/files'
import { beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('@utils/files')
vi.mock('@commands/script/generate/utils')
vi.mock('./callback')

describe('execute', () => {
  beforeEach(async () => {
    injectedConsole.setIsOnUnitTest()
    injectedConsole.getNewConsole()

    vi.spyOn(console, 'log').mockImplementation(() => undefined)
    vi.spyOn(console, 'error').mockImplementation(() => undefined)

    vi.mocked(getScriptFileDirectory).mockImplementation(() => '')
  })

  describe('handleExecuteScript', () => {
    test('should ask for a prompt to select a script file with 2 files', () => {
      const { getScreen } = injectedConsole.getCurrentConsole()

      vi.mocked(getFilesCurrentDir).mockImplementation((_path?: string) => ['file1.ts', 'file2.ts'])

      handleExecuteScript()
      expect(getScreen?.()).toBe(`? Select script file (Use arrow keys)\n` + `❯ file1.ts\n` + `  file2.ts`)
    })

    test('should ask for a prompt to select a script file with 0 file', async () => {
      vi.mocked(getFilesCurrentDir).mockImplementation((_path?: string) => [])

      expect(async () => await handleExecuteScript()).rejects.toThrowError('No script file found. Please generate a script file before executing any script.')
    })
  })
})
