import fs from 'fs'
import * as tsx from 'tsx/cjs/api'
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'

import { accounts, config } from '@classes'
import { handleExecuteScript } from '@commands/script/execute'
import { scriptFileNamePrompt } from '@commands/script/execute/index.prompt'
import { getScriptFileDirectory } from '@commands/script/generate/utils'
import { CHAINS } from '@constants/chains'
import { protocolModules } from '@constants/protocol-module'
import { CHAIN_ID } from '@enums/chain'
import { PROTOCOL_MODULE } from '@enums/module'
import { AccountNotFoundError } from '@errors/account'
import { ValidateInputValueError } from '@errors/validate'
import type { InfinitConfigSchema } from '@schemas/generated'
import { checkIsAccountFound } from '@utils/account'
import { getProjectChainInfo } from '@utils/config'
import { getFilesCurrentDir, readProjectRegistry } from '@utils/files'
import { privateKeyToAccount } from 'viem/accounts'

vi.mock('fs')
vi.mock('@classes')
vi.mock('@utils/files')
vi.mock('@utils/config')
vi.mock('@utils/account')
vi.mock('@commands/script/generate/utils')
vi.mock('@commons/prompts/accounts')
vi.mock('./callback')
vi.mock('./index.prompt')
vi.mock('tsx/cjs/api')

describe('execute', () => {
  const MOCK_PROTOCOL_MODULE = PROTOCOL_MODULE.aave_v3
  const ACTION_DETAILS = protocolModules[MOCK_PROTOCOL_MODULE].actions.init
  const MOCK_ONCHAIN_ACTION = {
    name: ACTION_DETAILS.actionClassName,
  }

  beforeAll(() => {
    vi.spyOn(console, 'log').mockImplementation(() => undefined)
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  beforeEach(() => {
    vi.spyOn(config, 'getProjectConfig').mockReturnValue({
      protocol_module: MOCK_PROTOCOL_MODULE,
    } as unknown as InfinitConfigSchema)
    vi.mocked(getProjectChainInfo).mockReturnValue(CHAINS[CHAIN_ID.Ethereum])
    vi.mocked(readProjectRegistry).mockReturnValue({ registryPath: '', registry: {} })
    vi.mocked(getScriptFileDirectory).mockImplementation(() => '')

    vi.spyOn(fs, 'existsSync').mockReturnValue(true)
    vi.spyOn(tsx, 'require').mockReturnValue({
      default: {
        signer: {
          deployer: 'account1',
        },
        params: {},
        Action: MOCK_ONCHAIN_ACTION,
      },
    })
    vi.mocked(checkIsAccountFound).mockReturnValue(true)
    vi.spyOn(accounts, 'getAccoundById').mockReturnValue(privateKeyToAccount('0xa4dd40261fbabe977ab6ff77a7ea9f76cd3b286aa66290b0d62bdf4303f4382b')) // mock PK
  })

  describe('handleExecuteScript', async () => {
    test('should ask for a prompt to select a script file with 2 files', async () => {
      vi.mocked(getFilesCurrentDir).mockImplementation((_path?: string) => ['file1.ts', 'file2.ts'])

      await expect(handleExecuteScript()).rejects.toThrowError()

      expect(scriptFileNamePrompt).toHaveBeenCalledTimes(1)
    })

    test('should ask for a prompt to select a script file with 0 file', async () => {
      vi.mocked(getFilesCurrentDir).mockImplementation((_path?: string) => [])

      await expect(handleExecuteScript()).rejects.toThrowError('No script file found. Please generate a script file before executing any script.')
    })

    test('should throw error when has no filename', async () => {
      vi.mocked(getFilesCurrentDir).mockImplementation((_path?: string) => ['file1.ts'])

      await expect(handleExecuteScript()).rejects.toThrowError('No script file selected.')
    })

    test('should throw error when script file not found', async () => {
      vi.spyOn(fs, 'existsSync').mockReturnValue(false)

      await expect(handleExecuteScript('file2.ts')).rejects.toThrowError()
    })

    test('should throw error when script file is invalid (params not found)', async () => {
      vi.spyOn(tsx, 'require').mockReturnValue({
        default: {
          signer: {
            deployer: 'account1',
          },
          Action: MOCK_ONCHAIN_ACTION,
        },
      })

      await expect(handleExecuteScript('file1.ts')).rejects.toThrowError(new ValidateInputValueError('Invalid script file'))
    })

    test('should throw error when script file is invalid (Action not found)', async () => {
      vi.spyOn(tsx, 'require').mockReturnValue({
        default: {
          signer: {
            deployer: 'account1',
          },
        },
      })

      await expect(handleExecuteScript('file1.ts')).rejects.toThrowError(new ValidateInputValueError('Invalid script file'))
    })

    test('should throw error when account not found for on-chain action', async () => {
      vi.spyOn(accounts, 'getAccoundById').mockReturnValue(undefined)

      await expect(handleExecuteScript('file1.ts')).rejects.toThrow(AccountNotFoundError)
    })

    test('should throw error when signer is invalid for on-chain action', async () => {
      vi.spyOn(tsx, 'require').mockReturnValue({
        default: {
          signer: {},
          params: {
            param1: 'value1',
          },
          Action: MOCK_ONCHAIN_ACTION,
        },
      })

      await expect(handleExecuteScript('file1.ts')).rejects.toThrow(new ValidateInputValueError('Invalid signer'))
    })
  })
})
