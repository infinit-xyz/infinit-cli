import fs from 'fs'
import path from 'path'
import { type Hex, type PrivateKeyAccount, hexToBytes } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

import type { KeystoreV3 } from '@classes/Accounts/Accounts.type'
import { AccountValidateError } from '@errors/account'
import { ERROR_MESSAGE_RECORD } from '@errors/errorList'
import { Wallet } from '@ethereumjs/wallet'
import { getAccountsFolderPath } from '@utils/account'
import { createDataFolder } from '@utils/config'
import { ensureAccessibilityAtPath } from '@utils/files'

// Account will holds all available `PrivateKeyAccount` objects.
export class Accounts {
  accounts: Record<string, PrivateKeyAccount>

  constructor() {
    this.accounts = {}
  }

  public getAccoundById(id: string): PrivateKeyAccount {
    return this.accounts[id]
  }

  /**
   * Encrypts the private key and saves it in a keystore json.
   * @param id used to identify the account
   * @param privateKey
   * @param password
   */
  public async save(id: string, privateKey: Hex, password: string): Promise<{ filePath: string; keystore: KeystoreV3 }> {
    // check is home directory accessible
    // call with `sudo`
    const accountsFolderPath = getAccountsFolderPath()
    ensureAccessibilityAtPath(accountsFolderPath, fs.constants.W_OK)

    createDataFolder()

    const filePath = this.getAccountFilePath(id)

    // encrypt
    const _privateKey = hexToBytes(privateKey)
    const wallet = Wallet.fromPrivateKey(_privateKey)

    // create the keystore object
    const keystore = (await wallet.toV3(password)) as KeystoreV3

    fs.writeFileSync(filePath, JSON.stringify(keystore))

    return { filePath, keystore }
  }

  /**
   * Load an account from a keystore file.
   * @param id used to identify the account
   * @param password
   * @returns wallet
   */
  public async load(id: string, password: string): Promise<Wallet> {
    const filePath = this.getAccountFilePath(id)

    // load json file
    if (!fs.existsSync(filePath)) {
      throw new AccountValidateError(ERROR_MESSAGE_RECORD.ACCOUNT_NOT_FOUND(id))
    }

    const file = fs.readFileSync(filePath, 'utf8')
    const keystoreEncypted = JSON.parse(file)

    // decrypt
    let wallet: Wallet
    try {
      wallet = await Wallet.fromV3(keystoreEncypted, password)
    } catch (_) {
      throw new AccountValidateError('Invalid password, please try again', { isStackDisabled: true })
    }

    const privateKey = wallet.getPrivateKeyString() as Hex

    this.add(id, privateKey)
    return wallet
  }

  public async add(id: string, privateKey: Hex) {
    const privateKeyAccount = privateKeyToAccount(privateKey)
    this.accounts[id] = privateKeyAccount
  }

  public getAccountFilePath(fileName: string) {
    const accountsFolderPath = getAccountsFolderPath()

    return path.join(accountsFolderPath, `${fileName}.json`)
  }
}

export const accounts = new Accounts()
