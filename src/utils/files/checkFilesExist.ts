import fs from 'fs'
import _ from 'lodash'
import path from 'path'
import { match } from 'ts-pattern'

import { chalkError, chalkSuccess } from '@constants/chalk'
import type { FolderStructure } from '@utils/files/files.type'

/**
 *
 * @param folderStructure Expected folder structure
 * @param folderPath Path to the folder
 * @param mode for 'all' all of the required files must exactly match the existing files , for 'require' only the required files must exist
 * @param isDisableLog Disable log
 * @returns {boolean} true if the files are equal, false otherwise
 */
export const checkFilesExist = (
  folderStructure: FolderStructure,
  folderPath: string,
  mode: 'all' | 'require' = 'all',
  isDisableLog: boolean = false,
): boolean => {
  const files = fs.readdirSync(folderPath)
  const expectedFiles = Object.keys(folderStructure)

  const sortedFiles = _.sortBy(files)
  const sortedExpectedFiles = _.sortBy(expectedFiles)
  const isFilesEqual = match(mode)
    .with('all', () => _.isEqual(sortedFiles, sortedExpectedFiles))
    .with('require', () => expectedFiles.every((file) => files.includes(file)))
    .exhaustive()

  if (!isFilesEqual) {
    if (!isDisableLog) {
      console.error(chalkError(`Files are not equal on path ${folderPath}`))

      console.error(`\nExpected: `)
      console.error(chalkSuccess(sortedExpectedFiles.join(', ')))
      console.error(`\nActual: `)
      console.error(chalkError(sortedFiles.join(', ')))
    }

    return false
  }

  for (const key in folderStructure) {
    const filePath = path.join(folderPath, key)
    if (folderStructure[key] === true) {
      if (!fs.existsSync(filePath)) {
        if (!isDisableLog) {
          console.error(chalkError(`File ${filePath} does not exist`))
        }
        return false
      }
    } else {
      const newFolderStructure = folderStructure[key] as FolderStructure
      if (!checkFilesExist(newFolderStructure, filePath, mode, isDisableLog)) {
        return false
      }
    }
  }

  return true
}
