import type { InfinitAction } from '@infinit-xyz/core'
import { writeFileSync } from '@utils/files'
import fs from 'fs'
import path from 'path'

import { generateScriptText } from '@utils/script'
import _ from 'lodash' // [TODO/INVESTIGATE] later on importing from lodash

/**
 * Get the directory path for script files.
 *
 * @param {string} [projectDirectory] - The base project directory. Defaults to the current working directory.
 * @returns {string} The path to the script files directory.
 */
export const getScriptFileDirectory = (projectDirectory?: string): string => path.join(projectDirectory ?? process.cwd(), 'src', 'scripts')

/**
 * Get the directory path for script history files.s
 *
 * @param {string} [projectDirectory] - The base project directory. Defaults to the current working directory.
 * @returns {string} The path to the script history files directory.
 */
export const getScriptHistoryFileDirectory = (projectDirectory?: string): string => path.join(projectDirectory ?? process.cwd(), 'scripts-history')

/**
 * Generate a unique script file name.
 *
 * @param {string} actionClassName - The class name of the action.
 * @param {string} folderPath - The path to the folder where the script file will be saved.
 * @param {number} [customId] - An optional custom identifier to append to the file name.
 * @returns {string} A unique script file name.
 */
export const getUniqueScriptFileName = (actionClassName: string, folderPath: string, customId?: number): string => {
  const camelCaseActionName = _.camelCase(actionClassName)
  const scriptFileName = `${camelCaseActionName}${!!customId ? `_${customId}` : ''}`
  const filePath = path.resolve(folderPath, `${scriptFileName}.script.ts`)
  if (fs.existsSync(filePath)) {
    // file name duplicate
    return getUniqueScriptFileName(camelCaseActionName, folderPath, !!customId ? customId + 1 : 1)
  }

  return scriptFileName
}

/**
 * Handle the generation of a script file.
 *
 * @param {InfinitAction} infinitAction - The action to be converted into a script.
 * @param {string} actionKey - The key associated with the action.
 * @param {string} libPath - The library path to be used in the script.
 * @param {string} filename - The name of the script file.
 * @param {string} folderPath - The path to the folder where the script file will be saved.
 * @param {string} [deployerId] - An optional deployer identifier.
 * @returns {Promise<string>} The path to the generated script file.
 */
export const handleGenerateScriptFile = async (
  infinitAction: InfinitAction,
  actionKey: string,
  libPath: string,
  filename: string,
  folderPath: string,
  deployerId?: string,
): Promise<string> => {
  const scriptText = generateScriptText(infinitAction, libPath, actionKey, deployerId)

  const filePath = path.join(folderPath, `${filename}.script.ts`)
  writeFileSync(filePath, scriptText)

  return filePath
}
