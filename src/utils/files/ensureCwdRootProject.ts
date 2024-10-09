import { FILE_NAMES } from '@constants'
import { chalkBold, chalkError } from '@constants/chalk'
import { isCwdRootProject } from '@utils/files/isCwdRootProject'

/**
 * Ensure the current working directory is the root of the project
 * If not, exit the process with code 1
 */
export const ensureCwdRootProject = () => {
  const { currentCwd, isRunningFromRootProject } = isCwdRootProject()

  if (!isRunningFromRootProject) {
    console.error(chalkError(`Can't find ${chalkBold(FILE_NAMES.CONFIG)}`))
    console.error(`Current path: ${currentCwd}`)
    process.exit(1)
  }
}
