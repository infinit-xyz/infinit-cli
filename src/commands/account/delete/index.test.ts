import { confirm } from '@inquirer/prompts'
import fs from 'fs'
import { type MockInstance, beforeAll, describe, expect, test, vi } from 'vitest'

import { accounts } from '@classes'
import { MOCK_FILENAME } from '@commands/account/__mock__'
import { chalkError, chalkInfo } from '@constants/chalk'
import { AccountValidateError } from '@errors/account'
import { PermissionNotFoundError } from '@errors/fs'
import { checkIsAccountFound } from '@utils/account'
import { ensureAccessibilityAtPath } from '@utils/files'

import { loadAccountFromPrompt } from '@commons/prompts/accounts'
import { Wallet } from '@ethereumjs/wallet'
import { handleDeleteAccount } from '.'

vi.mock('@utils/account')
vi.mock('@utils/files')
vi.mock('@commons/prompts/accounts')
vi.mock('@inquirer/prompts')
vi.mock('@classes')
vi.mock('fs')

describe('Command: accounts - delete', () => {
  const MOCK_ACCOUNT_FILE_PATH = 'MOCK_ACCOUNT_FILE_PATH'

  let consoleErrorSpy: MockInstance<Console['error']>
  let consoleLogSpy: MockInstance<Console['log']>
  let getAccountFilePathSpy: MockInstance<typeof accounts.getAccountFilePath>

  beforeAll(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined)
    getAccountFilePathSpy = vi.spyOn(accounts, 'getAccountFilePath').mockReturnValue(MOCK_ACCOUNT_FILE_PATH)

    vi.mocked(ensureAccessibilityAtPath).mockImplementation(() => {})
    vi.mocked(checkIsAccountFound).mockReturnValue(true)
    vi.mocked(loadAccountFromPrompt).mockImplementation(async () => Wallet.generate())
    vi.mocked(confirm).mockResolvedValue(true)
  })

  test('should delete account failed with wrong account id', async () => {
    vi.mocked(checkIsAccountFound).mockReturnValueOnce(false)

    await expect(handleDeleteAccount(MOCK_FILENAME)).rejects.toThrow(AccountValidateError)
  })

  test('should get error with permission denied', async () => {
    vi.mocked(ensureAccessibilityAtPath).mockImplementationOnce(() => {
      throw new PermissionNotFoundError()
    })

    const expectedError = new PermissionNotFoundError()

    await expect(handleDeleteAccount(MOCK_FILENAME)).rejects.toThrow(expectedError)
  })

  test('should get error user denied to delete the account', async () => {
    // mock
    vi.mocked(confirm).mockResolvedValueOnce(false)

    // call function
    await handleDeleteAccount(MOCK_FILENAME)

    // assert
    expect(consoleErrorSpy).toHaveBeenCalledWith(chalkError('User denied the confirmation to delete the account.'))
  })

  test('should delete the account successfully', async () => {
    const rmSyncSpy = vi.spyOn(fs, 'rmSync').mockImplementation(() => {})

    // call function
    await expect(handleDeleteAccount(MOCK_FILENAME)).resolves.toBeUndefined()

    // assert
    expect(getAccountFilePathSpy).toHaveBeenCalledWith(MOCK_FILENAME)

    expect(consoleLogSpy).toHaveBeenCalledWith(`Delete ${chalkInfo(MOCK_FILENAME)} successfully`)

    expect(rmSyncSpy).toHaveBeenCalledTimes(1)
    expect(rmSyncSpy).toHaveBeenCalledWith(MOCK_ACCOUNT_FILE_PATH)
  })
})
