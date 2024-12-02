import fs from 'fs'
import fsExtra from 'fs-extra'
import ora from 'ora'
import path from 'path'
import * as tsx from 'tsx/cjs/api'

import { config } from '@classes'
import { executeOffChainAction, executeOnChainAction } from '@commands/script/execute/executeAction'
import { scriptFileNamePrompt } from '@commands/script/execute/index.prompt'
import { getScriptFileDirectory, getScriptHistoryFileDirectory } from '@commands/script/generate/utils'
import { chalkInfo } from '@constants/chalk'
import { protocolModules } from '@constants/protocol-module'
import type { PROTOCOL_MODULE } from '@enums/module'
import { FileNotFoundError } from '@errors/fs'
import { ValidateInputValueError } from '@errors/validate'
import { getProjectChainInfo } from '@utils/config'
import { ensureCwdRootProject, getFilesCurrentDir, readProjectRegistry } from '@utils/files'
import { isValidTypescriptFileName } from '@utils/string'

export type HandleExecuteScriptOption = {
  ignoreCache?: boolean
}

/**
 * Handlers
 */

export const handleExecuteScript = async (_fileName?: string, option: HandleExecuteScriptOption = {}) => {
  ensureCwdRootProject()

  const scriptFileDirectory = getScriptFileDirectory()

  let fileName: string | undefined = _fileName

  if (!fileName) {
    const currentFileList = getFilesCurrentDir(scriptFileDirectory)
    const currentTsFileList = currentFileList.filter((v) => isValidTypescriptFileName(v))

    if (currentTsFileList.length === 0) {
      throw new Error('No script file found. Please generate a script file before executing any script.')
    }

    fileName = await scriptFileNamePrompt(currentTsFileList)
  }

  if (!fileName) {
    throw new Error('No script file selected.')
  }

  const target = path.resolve(scriptFileDirectory, fileName)

  console.log('🏃 Starting Execution...\n')

  const spinner = ora({ spinner: 'dots' })

  try {
    // check script file
    const isFound = fs.existsSync(target)
    if (!isFound) {
      throw new FileNotFoundError(target)
    }

    spinner.start('Reading configuration and registry...')

    // read config
    const projectConfig = config.getProjectConfig()
    const chainInfo = getProjectChainInfo()

    // read registry
    const { registryPath, registry } = readProjectRegistry()

    spinner.succeed('Configuration and registry loaded.\n')

    // import typescript file in CommonJS mode without adding TypeScript support to the entire runtime
    const module = tsx.require(target, target)

    const script = module.default

    const { signer, params, Action } = script

    // validate script file -> params, action
    if (!params || !Action) {
      throw new ValidateInputValueError('Invalid script file')
    }

    const protocolModule = protocolModules[projectConfig.protocol_module as PROTOCOL_MODULE]

    const actionDetails = Object.values(protocolModule.actions).find((action) => action.actionClassName === Action.name)
    const actionType: 'on-chain' | 'off-chain' = actionDetails.type

    if (actionType === 'on-chain') {
      await executeOnChainAction(spinner, fileName, Action, params, signer, registry, projectConfig, chainInfo, registryPath, option)

      // move file to archive
      const scriptFileHistoryDirectory = getScriptHistoryFileDirectory()
      await fsExtra.move(target, path.resolve(scriptFileHistoryDirectory, fileName), { overwrite: true })

      // new line
      console.log('')

      spinner.stopAndPersist({
        symbol: '🎉',
        text: `Successfully execute ${chalkInfo(fileName)}, go to ${chalkInfo('infinit.registry.json')} to see the contract addesses.`,
      })
    } else if (actionType === 'off-chain') {
      const outputFilePath = await executeOffChainAction(spinner, fileName, Action, params, registry, projectConfig, scriptFileDirectory)

      // move file to archive
      const scriptFileHistoryDirectory = getScriptHistoryFileDirectory()
      await fsExtra.move(target, path.resolve(scriptFileHistoryDirectory, fileName), { overwrite: true })

      // new line
      console.log('')

      spinner.stopAndPersist({ symbol: '🎉', text: `Successfully execute ${chalkInfo(fileName)}, go to ${chalkInfo(outputFilePath)} to see the result.` })
    } else {
      // unknown action type
      spinner.stop()
      return
    }

    process.exit(0)
  } catch (error) {
    spinner.stop()

    throw error
  }
}
