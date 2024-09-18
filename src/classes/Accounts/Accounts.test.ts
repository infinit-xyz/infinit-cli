import { createDataFolder } from '@utils/config'
import fs from 'fs'
import { afterEach, beforeAll, describe, expect, test, vi } from 'vitest'
import { Accounts } from './Accounts'
import type { KeystoreV3 } from './Accounts.type'

vi.mock('@utils/config')

const MOCK_PRIVATE_KEY = '0xb720797817b4778fcdf5daa603973dec39acee7cecb516d44f59e67682384947'
const WALLET_ADDRESS = '0x3cf4d050143c776afcdf1ee7a252ab16c3f231f7'
const PASSWORD = '123456'
const FILENAME = 'test-save-load'

let tempKeystore: KeystoreV3 | undefined = undefined

describe('accounts.save', () => {
  const accounts = new Accounts()

  beforeAll(() => {
    vi.mocked(createDataFolder).mockImplementation(() => {})
  })

  test('should get error with permission denied', async () => {
    await expect(accounts.save(FILENAME, MOCK_PRIVATE_KEY, PASSWORD)).rejects.toThrow('Permission required, run the command with sudo permission')
  })

  test('should save account to JSON', async () => {
    vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {})
    vi.spyOn(fs, 'accessSync').mockImplementation(() => {})

    const { filePath, keystore } = await accounts.save(FILENAME, MOCK_PRIVATE_KEY, PASSWORD)
    tempKeystore = keystore

    expect(filePath).toBeDefined()
    expect(keystore).toBeDefined()
  })
})

describe('accounts.load', () => {
  const accounts = new Accounts()

  afterEach(() => {
    accounts.accounts = {}
  })

  test('should get wallet from private key', async () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(true)
    vi.spyOn(fs, 'readFileSync').mockReturnValue('')
    vi.spyOn(JSON, 'parse').mockReturnValue(tempKeystore)

    const wallet = await accounts.load(FILENAME, PASSWORD)

    expect(wallet).toBeDefined()
    expect(wallet?.getAddressString()).toBe(WALLET_ADDRESS)
  })

  test('should get error with wrong password', async () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(true)
    vi.spyOn(fs, 'readFileSync').mockReturnValue('')
    vi.spyOn(JSON, 'parse').mockReturnValue(tempKeystore)

    await expect(accounts.load(FILENAME, 'wrong')).rejects.toThrow('Invalid password')
  })
})
