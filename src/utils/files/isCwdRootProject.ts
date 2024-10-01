import { FILE_NAMES } from '@constants'
import { checkFilesExist } from '@utils/files/checkFilesExist'

/**
 * Determines if the current working directory (CWD) is the root of the project.
 *
 * This function checks if the CLI is running from the root directory of the project
 * by comparing the CLI path with the current working directory and verifying the existence
 * of specific configuration files.
 *
 * @param {string} [currentCwd=process.cwd()] - The current working directory. Defaults to the process's current working directory.
 * @returns {Object} An object containing:
 * - `currentCwd` (string): The current working directory.
 * - `isRunningFromRootProject` (boolean): A flag indicating whether the CLI is running from the root project directory.
 */
export const isCwdRootProject = (currentCwd = process.cwd()) => {
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
