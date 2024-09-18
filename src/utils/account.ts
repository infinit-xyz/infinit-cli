import { DATA_FOLDER } from '@classes/Config/Config'
import { createDataFolder } from '@utils/config'
import { getFilesCurrentDir } from '@utils/files'
import fs from 'fs'
import path from 'path'

/**
 * Check if the account ID is found among existing accounts.
 * @param accountId
 * @returns
 */
export const checkIsAccountFound = (accountId: string) => {
  const accountsFolderPath = path.resolve(DATA_FOLDER, 'accounts')
  if (!fs.existsSync(accountsFolderPath)) {
    createDataFolder()
    return
  }
  const files = getFilesCurrentDir(accountsFolderPath)
  return files.includes(`${accountId}.json`)
}

export const getAccountsList = () => {
  const accountsFolderPath = path.join(DATA_FOLDER, 'accounts')
  const files = getFilesCurrentDir(accountsFolderPath)
  return { accountFiles: files, accountsFolderPath }
}
