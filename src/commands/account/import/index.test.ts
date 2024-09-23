import { MOCK_PASSWORD, MOCK_PRIVATE_KEY, MOCK_WALLET_ADDRESS } from '@commands/account/__mock__'
import { handleImportAccount } from '@commands/account/import'
import { notDuplicatedAccountIdPrompt, passwordWithConfirmPrompt, privateKeyInputPrompt } from '@commands/account/prompt'
import { CHAINS } from '@constants/chains'
import { chalkError, chalkInfo } from '@constants/chalk'
import { checkIsAccountFound } from '@utils/account'
import { createDataFolder, getProjectChainInfo } from '@utils/config'
import { ensureAccessibilityAtPath } from '@utils/files'
import fs from 'fs'
import { describe, expect, test, vi } from 'vitest'

vi.mock('@utils/account')
vi.mock('@utils/files')
vi.mock('@commands/account/prompt')
vi.mock('@utils/config')

describe('Command: accounts - import', () => {
  test('should get error with permission denied', async () => {
    vi.mocked(checkIsAccountFound).mockReturnValue(false)
    vi.mocked(ensureAccessibilityAtPath).mockImplementation(() => {
      throw new Error('Permission required, run the command with sudo permission')
    })
    vi.spyOn(fs, 'accessSync').mockImplementation(() => {
      throw new Error('Permission required, run the command with sudo permission')
    })

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    // call function
    const mockedAccountId = 'new'
    await expect(handleImportAccount(mockedAccountId)).resolves.toBeUndefined()

    // assert
    expect(consoleSpy).toHaveBeenCalledWith(chalkError('Error: Permission required, run the command with sudo permission'))
  })

  test('should import an account successfully', async () => {
    // mock
    const mockedAccountId = 'mocked'
    vi.mocked(checkIsAccountFound).mockReturnValue(false)
    vi.mocked(ensureAccessibilityAtPath).mockImplementation(() => {})
    vi.mocked(privateKeyInputPrompt).mockImplementation(async () => MOCK_PRIVATE_KEY)
    vi.mocked(passwordWithConfirmPrompt).mockImplementation(async () => MOCK_PASSWORD)
    vi.mocked(getProjectChainInfo).mockImplementation(() => CHAINS[1])
    vi.mocked(notDuplicatedAccountIdPrompt).mockImplementation(async () => mockedAccountId)

    vi.mocked(createDataFolder).mockImplementation(() => {})
    vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {}) // not write file

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined)

    const expectedWalletAddress = MOCK_WALLET_ADDRESS

    // call function
    await expect(handleImportAccount()).resolves.toBeUndefined()

    // assert
    expect(consoleSpy).toHaveBeenNthCalledWith(1, `Import your account successfully with the id ${chalkInfo(mockedAccountId)}`)
    expect(consoleSpy).toHaveBeenNthCalledWith(2, `Wallet address: ${chalkInfo(expectedWalletAddress)}`)
    expect(consoleSpy).toHaveBeenNthCalledWith(3, '\n')
    expect(consoleSpy).toHaveBeenNthCalledWith(
      4,
      `Please transfer ETH to the address ${chalkInfo(expectedWalletAddress)} account on ${chalkInfo('Ethereum Mainnet')} blockchain to cover gas fees.`,
    )
  })
})
