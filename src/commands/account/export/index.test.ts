import { accounts } from '@classes'
import { MOCK_FILENAME, MOCK_PASSWORD, MOCK_PRIVATE_KEY, MOCK_WALLET_ADDRESS } from '@commands/account/__mock__'
import { handleExportAccount } from '@commands/account/export'
import { chalkError, chalkInfo } from '@constants/chalk'
import { Wallet } from '@ethereumjs/wallet'
import { checkIsAccountFound } from '@utils/account'
import { describe, expect, test, vi } from 'vitest'

vi.mock('@utils/account')

describe('Command: accounts - export', () => {
  test('should export account failed with wrong account id', async () => {
    // mock
    vi.mocked(checkIsAccountFound).mockReturnValue(false)
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined)

    // call function
    await handleExportAccount('wrong')

    // assert
    expect(consoleSpy).toHaveBeenCalledWith(chalkError('Error: Account with id wrong not found'))
  })

  test('should export account successfully', async () => {
    // mock
    vi.mocked(checkIsAccountFound).mockReturnValue(true)

    vi.mock('@commands/account/prompt', () => ({
      passwordInputPrompt: vi.fn().mockReturnValue(MOCK_PASSWORD),
    }))
    const loadAccountSpy = vi
      .spyOn(accounts, 'load')
      .mockImplementation(async () => Wallet.fromPrivateKey(Buffer.from(MOCK_PRIVATE_KEY.slice(2, MOCK_PRIVATE_KEY.length), 'hex')))
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined)

    // call function
    await handleExportAccount(MOCK_FILENAME)

    // assert
    expect(consoleSpy).toHaveBeenCalledWith(`Wallet address: ${chalkInfo(MOCK_WALLET_ADDRESS)}`)
    expect(consoleSpy).toHaveBeenLastCalledWith(`Private key: ${chalkInfo(MOCK_PRIVATE_KEY)}`)
    expect(loadAccountSpy).toBeCalled()
  })
})
