import { MOCK_FILENAME, MOCK_PASSWORD } from '@commands/account/__mock__'
import { handleGenerateAccount } from '@commands/account/generate'
import { notDuplicatedAccountIdPrompt, passwordWithConfirmPrompt } from '@commands/account/prompt'
import { chalkError, chalkInfo } from '@constants/chalk'
import { checkIsAccountFound } from '@utils/account'
import { ensureAccessibilityAtPath } from '@utils/files'
import { beforeAll, describe, expect, test, vi } from 'vitest'

import { accounts, config } from '@classes'
import type { KeystoreV3 } from '@classes/Accounts/Accounts.type'
import { mockProjectConfig } from '@classes/Cache/__mocks__/constants'
import { CHAIN_ID } from '@enums/chain'
import { PermissionNotFoundError } from '@errors/fs'
import { Wallet } from '@ethereumjs/wallet'
import { getProjectChainInfo } from '@utils/config'
import { hexToBytes } from 'viem'
import { mainnet } from 'viem/chains'

vi.mock('@utils/account')
vi.mock('@utils/files')
vi.mock('@commands/account/prompt')
vi.mock('@utils/config')
vi.mock('@classes')

describe('Command: accounts - generate', () => {
  beforeAll(() => {
    vi.mocked(config).getProjectConfig.mockReturnValue(mockProjectConfig)
  })

  test('should get error with permission denied', async () => {
    vi.mocked(checkIsAccountFound).mockReturnValue(false)
    vi.mocked(ensureAccessibilityAtPath).mockImplementation(() => {
      throw new PermissionNotFoundError()
    })

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    // call function
    await expect(handleGenerateAccount(MOCK_FILENAME)).resolves.toBeUndefined()

    // assert
    const permissionNotFoundError = new PermissionNotFoundError()
    expect(consoleErrorSpy).toHaveBeenCalledWith(chalkError(permissionNotFoundError.message))
  })

  test('should generate the account successfully', async () => {
    // mock
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined)

    vi.mocked(getProjectChainInfo).mockImplementation(() => ({
      chainId: CHAIN_ID.Ethereum,
      name: 'Ethereum Mainnet',
      shortName: 'Ethereum',
      rpcList: [],
      nativeCurrency: {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18,
      },
      viemChain: {
        instance: mainnet,
        name: 'mainnet',
      },
    }))
    vi.mocked(checkIsAccountFound).mockReturnValue(false)
    vi.mocked(ensureAccessibilityAtPath).mockImplementation(() => {})

    vi.mocked(passwordWithConfirmPrompt).mockImplementation(async () => MOCK_PASSWORD)
    vi.mocked(notDuplicatedAccountIdPrompt).mockImplementation(async () => MOCK_FILENAME)

    let generatedWalletAddress = ''
    const saveAccountSpy = vi.spyOn(accounts, 'save').mockImplementation(async (accountId, privateKey, password) => {
      const filePath = accounts.getAccountFilePath(accountId)
      const privateKeyBytes = hexToBytes(privateKey)
      const wallet = Wallet.fromPrivateKey(privateKeyBytes)
      const keystore = (await wallet.toV3(password)) as KeystoreV3
      generatedWalletAddress = keystore.address
      return { filePath, keystore }
    })

    // call function
    await expect(handleGenerateAccount()).resolves.toBeUndefined()

    const walletAddress = `0x${generatedWalletAddress}`

    // assert
    expect(consoleLogSpy).toHaveBeenNthCalledWith(1, 'Generating a new private key...')
    expect(consoleLogSpy).toHaveBeenNthCalledWith(2, `Generate your account successfully with the id ${chalkInfo(MOCK_FILENAME)}`)
    expect(consoleLogSpy).toHaveBeenNthCalledWith(3, `Wallet address: ${chalkInfo(walletAddress)}`)
    expect(consoleLogSpy).toHaveBeenNthCalledWith(4, '\n')
    expect(consoleLogSpy).toHaveBeenNthCalledWith(
      5,
      `Please transfer ETH to the address ${chalkInfo(walletAddress)} account on ${chalkInfo('Ethereum Mainnet')} blockchain to cover gas fees.`,
    )

    expect(saveAccountSpy).toBeCalled()
  })
})
