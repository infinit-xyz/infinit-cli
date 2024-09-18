import { accounts } from '@classes'
import { MOCK_FILENAME, MOCK_PASSWORD, MOCK_PRIVATE_KEY } from '@commands/account/__mock__'
import { handleDeleteAccount } from '@commands/account/delete'
import { passwordInputPrompt } from '@commands/account/prompt'
import { chalkError, chalkInfo } from '@constants/chalk'
import { Wallet } from '@ethereumjs/wallet'
import { confirm } from '@inquirer/prompts'
import { checkIsAccountFound } from '@utils/account'
import { ensureAccessibilityAtPath } from '@utils/files'
import { describe, expect, test, vi } from 'vitest'

vi.mock('@utils/account')
vi.mock('@utils/files')
vi.mock('@commands/account/prompt')
vi.mock('@inquirer/prompts')

describe('Command: accounts - delete', () => {
  test('should delete account failed with wrong account id', async () => {
    vi.mocked(checkIsAccountFound).mockReturnValue(false)
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    await handleDeleteAccount(MOCK_FILENAME)

    expect(consoleSpy).toHaveBeenCalledWith(chalkError(`Error: Account with id ${MOCK_FILENAME} not found`))
  })

  test('should get error with permission denied', async () => {
    vi.mocked(checkIsAccountFound).mockReturnValue(true)
    vi.mocked(ensureAccessibilityAtPath).mockImplementation(() => {
      throw new Error('Permission required, run the command with sudo permission')
    })

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    // call function
    await handleDeleteAccount(MOCK_FILENAME)

    // assert
    expect(consoleSpy).toHaveBeenCalledWith(chalkError('Error: Permission required, run the command with sudo permission'))
  })

  test('should get error user denied to delete the account', async () => {
    // mock
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    vi.mocked(checkIsAccountFound).mockReturnValue(true)
    vi.mocked(ensureAccessibilityAtPath).mockImplementation(() => {})

    vi.mocked(passwordInputPrompt).mockImplementation(async () => MOCK_PASSWORD)

    const loadAccountSpy = vi
      .spyOn(accounts, 'load')
      .mockImplementation(async () => Wallet.fromPrivateKey(Buffer.from(MOCK_PRIVATE_KEY.slice(2, MOCK_PRIVATE_KEY.length), 'hex')))

    vi.mocked(confirm).mockResolvedValue(false)

    // call function
    await handleDeleteAccount(MOCK_FILENAME)

    // assert
    expect(consoleSpy).toHaveBeenCalledWith(chalkError('User denied the confirmation to delete the account.'))
    expect(loadAccountSpy).toBeCalled()
  })

  test('should delete the account successfully', async () => {
    // mock
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined)

    vi.mocked(checkIsAccountFound).mockReturnValue(true)
    vi.mocked(ensureAccessibilityAtPath).mockImplementation(() => {})

    vi.mocked(passwordInputPrompt).mockImplementation(async () => MOCK_PASSWORD)

    const loadAccountSpy = vi
      .spyOn(accounts, 'load')
      .mockImplementation(async () => Wallet.fromPrivateKey(Buffer.from(MOCK_PRIVATE_KEY.slice(2, MOCK_PRIVATE_KEY.length), 'hex')))

    vi.mocked(confirm).mockResolvedValue(true)

    // call function
    await handleDeleteAccount(MOCK_FILENAME)

    // assert
    expect(consoleSpy).toHaveBeenCalledWith(`Delete ${chalkInfo(MOCK_FILENAME)} successfully`)
    expect(loadAccountSpy).toBeCalled()
  })
})
