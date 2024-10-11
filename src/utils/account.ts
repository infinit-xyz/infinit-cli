import fs from 'fs'
import path from 'path'

import { DATA_FOLDER } from '@classes/Config/Config'
import { createDataFolder } from '@utils/config'
import { getFilesCurrentDir } from '@utils/files'

const ACCOUNT_FILE_EXTENSION = '.json'

export const isValidAccountFileName = (str?: string) => !!str && /^[\w\-. ]+\.json$/.test(str)

export const getAccountIdFromAccountFileName = (fileName: string) => {
  if (!isValidAccountFileName(fileName)) {
    throw new Error(`Invalid account file name: ${fileName}`)
  }

  return fileName.slice(0, -ACCOUNT_FILE_EXTENSION.length)
}

export const getAccountFileNameFromAccountId = (accountId: string) => `${accountId}${ACCOUNT_FILE_EXTENSION}`

export const getAccountsFolderPath = () => path.resolve(DATA_FOLDER, 'accounts')

/**
 * Check if the account ID is found among existing accounts.
 * @param accountId
 * @returns
 */
export const checkIsAccountFound = (accountId: string): boolean => {
  const accountsFolderPath = getAccountsFolderPath()

  if (!fs.existsSync(accountsFolderPath)) {
    createDataFolder()
    return false
  }

  const files = getFilesCurrentDir(accountsFolderPath)
  return files.includes(getAccountFileNameFromAccountId(accountId))
}

export const getAccountsList = () => {
  const accountsFolderPath = getAccountsFolderPath()

  const files = getFilesCurrentDir(accountsFolderPath)

  return { accountFiles: files, accountsFolderPath }
}
