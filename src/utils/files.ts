import chalk from 'chalk'
import fs from 'fs'
import fsExtra from 'fs-extra'
import _ from 'lodash' // [TODO/INVESTIGATE] later on importing from lodash
import path from 'path'
import { match } from 'ts-pattern'
import type { Address } from 'viem'

import { FILE_NAMES } from '@constants'
import { chalkError, chalkSuccess } from '@constants/chalk'
import { FileNotFoundError, PermissionNotFoundError } from '@errors/fs'
import type { FolderStructure } from '@utils/files.type'

const { pathExistsSync } = fsExtra // prevent CLI failed to run due to fsExtra

export const getFilesCurrentDir = (_path?: string): string[] => {
  const path = _path ?? process.cwd()
  if (!fs.existsSync(path)) {
    return []
  }

  const files = fs.readdirSync(path)
  return files
}

/**
 * Check if the file exists and accessible
 * @param path file path
 * @param permissionMode fs.constants
 */
export const ensureAccessibilityAtPath = (path: string, permissionMode?: number) => {
  try {
    fs.accessSync(path, permissionMode ?? fs.constants.F_OK)
  } catch (_) {
    throw new PermissionNotFoundError()
  }
}

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

/**
 * Check if the current working directory is the root of the project
 * @returns {boolean} true if the files are equal, false otherwise
 */
export const isCwdRootProject = () => {
  // */project-name
  const currentCwd = process.cwd()

  // Get the path of the CLI which depending on the package manager
  // npm, bun, yarn: */<project-name>/node_modules/.bin/infinit
  // pnpm: */<project-name>/node_modules/<cli-package-name>/bin/cli.js
  const cliPath = process.argv[1]

  const isCwdDirectoryMatch = cliPath.includes(currentCwd)

  if (!isCwdDirectoryMatch) {
    return { currentCwd, isRunningFromRootProject: false }
  }

  // */project-name
  const isRunningFromRootProject = checkFilesExist({ src: { [FILE_NAMES.CONFIG]: true } }, currentCwd, 'require', true)

  return { currentCwd, isRunningFromRootProject }
}

/**
 * Ensure the current working directory is the root of the project
 * If not, exit the process with code 1
 */
export const ensureCwdRootProject = () => {
  const { currentCwd, isRunningFromRootProject } = isCwdRootProject()

  if (!isRunningFromRootProject) {
    console.error(chalkError(`Can't find ${chalk.bold(FILE_NAMES.CONFIG)}`))
    console.error(`Current path: ${currentCwd}`)
    process.exit(1)
  }
}

/**
 * Write file synchronously and create parent directory if not exist
 * @param file file path
 * @param data file content
 */
export const writeFileSync = (filePath: string, data: string) => {
  const parentPath = path.join(filePath, '..')
  const isPathExist = pathExistsSync(parentPath)

  if (!isPathExist) {
    fs.mkdirSync(parentPath, { recursive: true })
  }

  fs.writeFileSync(filePath, data)
}

/**
 * Get the project registry
 * @returns {Record<string, Address>} registry
 */
export const readProjectRegistry = () => {
  const registryPath = path.resolve(process.cwd(), 'src', FILE_NAMES.REGISTRY)
  if (!fs.existsSync(registryPath)) {
    throw new FileNotFoundError(registryPath)
  }

  const data = fs.readFileSync(registryPath, 'utf-8')
  return { registryPath, registry: JSON.parse(data.toString()) as Record<string, Address> }
}
