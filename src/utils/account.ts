import fs from 'fs'
import path from 'path'

import { DATA_FOLDER } from '@classes/Config/Config'
import { createDataFolder } from '@utils/config'
import { getFilesCurrentDir } from '@utils/files'

const ACCOUNT_FILE_EXTENSION = '.json'

/**
 * Checks if the provided string is a valid account file name.
 * A valid account file name ends with '.json'.
 *
 * @param str - The string to check.
 * @returns True if the string is a valid account file name, false otherwise.
 */
export const isValidAccountFileName = (str?: string) => !!str && /^[\w\-. ]+\.json$/.test(str)

/**
 * Extracts the account ID from the account file name.
 *
 * @param fileName - The account file name.
 * @returns The account ID.
 * @throws Will throw an error if the file name is not valid.
 */
export const getAccountIdFromAccountFileName = (fileName: string) => {
  if (!isValidAccountFileName(fileName)) {
    throw new Error(`Invalid account file name: ${fileName}`)
  }

  return fileName.slice(0, -ACCOUNT_FILE_EXTENSION.length)
}

/**
 * Generates the account file name from the account ID.
 *
 * @param accountId - The account ID.
 * @returns The account file name.
 */
export const getAccountFileNameFromAccountId = (accountId: string) => `${accountId}${ACCOUNT_FILE_EXTENSION}`

/**
 * Gets the path to the accounts folder.
 *
 * @returns The accounts folder path.
 */
export const getAccountsFolderPath = () => path.resolve(DATA_FOLDER, 'accounts')

/**
 * Checks if the account ID is found among existing accounts.
 *
 * @param accountId - The account ID to check.
 * @returns true if the account ID is found, false otherwise.
 */
export const checkIsAccountFound = (accountId: string): boolean => {
  const accountsFolderPath = getAccountsFolderPath()

  if (!fs.existsSync(accountsFolderPath)) {
    createDataFolder()
    return false
  }

  const files = getFilesCurrentDir(accountsFolderPath)
  const accountFileName = getAccountFileNameFromAccountId(accountId)

  return files.includes(accountFileName)
}

/**
 * Gets the list of account files and the accounts folder path.
 *
 * @returns An object containing the account files and the accounts folder path.
 */
export const getAccountsList = () => {
  const accountsFolderPath = getAccountsFolderPath()

  const files = getFilesCurrentDir(accountsFolderPath)

  return { accountFiles: files, accountsFolderPath }
}
