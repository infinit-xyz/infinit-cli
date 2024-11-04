import fs from 'fs'
import * as tsx from 'tsx/cjs/api'
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'

import { accounts, config } from '@classes'
import { cache } from '@classes/Cache/Cache'
import { handleExecuteScript } from '@commands/script/execute'
import { MockAction } from '@commands/script/execute/__mocks__/action'
import { scriptFileNamePrompt } from '@commands/script/execute/index.prompt'
import { simulateExecute } from '@commands/script/execute/simulate'
import { getScriptFileDirectory, getScriptHistoryFileDirectory } from '@commands/script/generate/utils'
import { loadAccountFromPrompt } from '@commons/prompts/accounts'
import { CHAINS } from '@constants/chains'
import { chalkInfo } from '@constants/chalk'
import { CHAIN_ID } from '@enums/chain'
import { AccountNotFoundError } from '@errors/account'
import { ERROR_MESSAGE_RECORD } from '@errors/errorList'
import { ValidateInputValueError } from '@errors/validate'
import { Wallet } from '@ethereumjs/wallet'
import { confirm } from '@inquirer/prompts'
import type { InfinitConfigSchema } from '@schemas/generated'
import { checkIsAccountFound } from '@utils/account'
import { getProjectChainInfo } from '@utils/config'
import { getFilesCurrentDir, readProjectRegistry } from '@utils/files'
import fsExtra from 'fs-extra'
import type { Ora } from 'ora'
import path from 'path'
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
vi.mock('@commands/script/execute/simulate')
vi.mock('@inquirer/prompts', () => ({
  confirm: vi.fn(),
}))
vi.mock('@infinit-xyz/core', async (importOriginal) => {
  const actual: object = await importOriginal()
  const InfinitWallet = vi.fn()

  InfinitWallet.prototype.walletClient = {
    sendTransaction: vi.fn(),
  }

  return { ...actual, InfinitWallet }
})
vi.mock('@classes/Cache/Cache')

const mockUserAddress = '0x1c642ee5401ec18C68725968491Ae2A7f50b929E'
const mockFileName = 'file1.ts'

describe('execute', () => {
  let mockSpinner: Ora

  beforeAll(() => {
    vi.spyOn(console, 'log').mockImplementation(() => undefined)
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  beforeEach(() => {
    mockSpinner = {
      start: vi.fn(),
      stopAndPersist: vi.fn(),
      fail: vi.fn(),
      info: vi.fn(),
      text: '',
      stop: vi.fn(),
      succeed: vi.fn(),
    } as unknown as Ora

    vi.spyOn(config, 'getProjectConfig').mockReturnValue({
      protocol_module: 'aave-v3',
    } as unknown as InfinitConfigSchema)
    vi.mocked(getProjectChainInfo).mockReturnValue(CHAINS[CHAIN_ID.Ethereum])
    vi.mocked(readProjectRegistry).mockReturnValue({ registryPath: '', registry: {} })
    vi.mocked(getScriptFileDirectory).mockImplementation(() => '')
    vi.mocked(getScriptHistoryFileDirectory).mockReturnValue('')

    vi.spyOn(fs, 'existsSync').mockReturnValue(true)
    vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {})
    vi.spyOn(fsExtra, 'move').mockImplementation(() => {})

    vi.spyOn(tsx, 'require').mockReturnValue({
      default: {
        signer: {
          deployer: 'account1',
        },
        params: {},
        Action: 'action',
      },
    })
    vi.mocked(checkIsAccountFound).mockReturnValue(true)
    vi.spyOn(accounts, 'getAccoundById').mockReturnValue(privateKeyToAccount('0xa4dd40261fbabe977ab6ff77a7ea9f76cd3b286aa66290b0d62bdf4303f4382b')) // mock PK
    vi.mocked(loadAccountFromPrompt).mockImplementation(async () => Wallet.generate())

    vi.spyOn(cache, 'deleteTxActionCache').mockImplementation(() => {})

    vi.spyOn(path, 'resolve')
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
      vi.mocked(getFilesCurrentDir).mockImplementation((_path?: string) => [mockFileName])

      await expect(handleExecuteScript()).rejects.toThrowError('No script file selected.')
    })

    test('should throw error when script file not found', async () => {
      vi.spyOn(fs, 'existsSync').mockReturnValue(false)

      await expect(handleExecuteScript('file2.ts')).rejects.toThrowError()
    })

    test('should throw error when signer is invalid', async () => {
      vi.spyOn(tsx, 'require').mockReturnValue({
        default: {
          signer: {},
          params: {},
          Action: '',
        },
      })

      await expect(handleExecuteScript(mockFileName)).rejects.toThrow(new ValidateInputValueError('Invalid signer'))
    })

    test('should throw error when script file is invalid', async () => {
      vi.spyOn(tsx, 'require').mockReturnValue({
        default: {
          signer: {
            deployer: 'account1',
          },
        },
      })

      await expect(handleExecuteScript(mockFileName)).rejects.toThrowError(new ValidateInputValueError('Invalid script file'))
    })

    test('should throw error when account not found', async () => {
      vi.spyOn(accounts, 'getAccoundById').mockReturnValue(undefined)

      await expect(handleExecuteScript(mockFileName)).rejects.toThrow(AccountNotFoundError)
    })

    test('should throw error signer account not found', async () => {
      vi.mocked(checkIsAccountFound).mockReturnValue(false)

      await expect(handleExecuteScript(mockFileName)).rejects.toThrowError(new AccountNotFoundError(ERROR_MESSAGE_RECORD.ACCOUNT_NOT_FOUND('account1')))
    })

    test('should throw error execution denied', async () => {
      vi.spyOn(tsx, 'require').mockReturnValue({
        default: {
          signer: {
            deployer: 'account1',
          },
          params: {},
          Action: MockAction,
        },
      })

      const simulateExecutedResult = {
        totalTransactions: 1,
        estimatedCost: 1,
        walletTxCountMapping: {
          [mockUserAddress]: 1,
        },
      }
      vi.mocked(simulateExecute).mockResolvedValue(simulateExecutedResult)

      vi.mocked(confirm).mockResolvedValue(false)

      await expect(handleExecuteScript(mockFileName, { customSpinner: mockSpinner })).rejects.toThrowError('Execution denied.')

      const totalFeeDisplayAmount = simulateExecutedResult.totalTransactions * 0.001

      expect(mockSpinner.info).toHaveBeenCalledTimes(2)
      expect(mockSpinner.info).toHaveBeenCalledWith(`Deployment Fee: ${totalFeeDisplayAmount} ETH`)
      expect(mockSpinner.info).toHaveBeenCalledWith(`Total Cost (Estimated): ${totalFeeDisplayAmount + simulateExecutedResult.estimatedCost} ETH`)
    })

    test('should execute action successfully', async () => {
      vi.spyOn(tsx, 'require').mockReturnValue({
        default: {
          signer: {
            deployer: 'account1',
          },
          params: {},
          Action: MockAction,
        },
      })

      const simulateExecutedResult = {
        totalTransactions: 1,
        estimatedCost: 1,
        walletTxCountMapping: {
          [mockUserAddress]: 1,
        },
      }
      vi.mocked(simulateExecute).mockResolvedValue(simulateExecutedResult)

      vi.mocked(confirm).mockResolvedValue(true)

      await handleExecuteScript(mockFileName, { customSpinner: mockSpinner })

      const totalFeeDisplayAmount = simulateExecutedResult.totalTransactions * 0.001

      expect(mockSpinner.info).toHaveBeenCalledTimes(2)
      expect(mockSpinner.info).toHaveBeenCalledWith(`Deployment Fee: ${totalFeeDisplayAmount} ETH`)
      expect(mockSpinner.info).toHaveBeenCalledWith(`Total Cost (Estimated): ${totalFeeDisplayAmount + simulateExecutedResult.estimatedCost} ETH`)

      expect(mockSpinner.succeed).toHaveBeenCalledWith(
        `Successfully execute ${chalkInfo(mockFileName)}, go to ${chalkInfo(`infinit.registry.json`)} to see the contract addesses.`,
      )
    })
  })
})
