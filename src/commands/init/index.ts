import { confirm } from '@inquirer/prompts'
import { isSupportedChain, toSupportedChainID } from '@utils/chain'
import { trim } from '@utils/string'

import { projectPathPrompt } from '@commands/init/index.prompt'
import type { InitProjectInput } from '@commands/init/index.type'
import { chainNamePrompt, protocolModulePrompt, selectDeployerPrompt } from '@commands/project/create.prompt'
import { chalkError, chalkInfo, chalkSuccess, chalkWarning } from '@constants/chalk'
import { protocolModules } from '@constants/protocol-module'
import type { CHAIN_ID } from '@enums/chain'
import { getAccountsList } from '@utils/account'
import { getPackageManager } from '@utils/packageManager'
import { compileProject, initializeCliProject } from '@utils/project'
import { getProtocolModule } from '@utils/protocol-module'
import fs from 'fs'
import path from 'path'
import { pipeInto } from 'ts-functional-pipe'

export const handleInitializeCli = async (cmdInput: InitProjectInput) => {
  const defaultProjectDirectory = path.resolve()

  try {
    const cmdProjectDirectory = pipeInto(cmdInput.directory, trim)
    const projectDirectory = cmdProjectDirectory ?? (await projectPathPrompt(defaultProjectDirectory))

    if (!projectDirectory) {
      throw new Error('Project directory is required')
    } else if (!fs.existsSync(projectDirectory)) {
      throw new Error('Project directory does not exist')
    }

    /**
     * Chain
     */
    const cmdChainId: CHAIN_ID | undefined = pipeInto(cmdInput.chain, trim, toSupportedChainID)
    const chainId = cmdChainId ?? (await chainNamePrompt())

    if (!chainId) {
      throw new Error('Chain is required')
    } else if (!isSupportedChain(chainId)) {
      throw new Error('Chain is not supported')
    }

    /**
     * Protocol Template
     */
    const inputModule = cmdInput.module
    let protocolModule = getProtocolModule(inputModule)

    if (!inputModule) {
      const protocolPrompt = await protocolModulePrompt()
      protocolModule = protocolPrompt
    }

    if (!protocolModule) {
      throw new Error('Protocol module is not supported')
    }

    /**
     * Deployer Account
     */
    let deployerId: string | undefined

    if (!cmdInput.ignoreDeployer) {
      const { accountFiles } = getAccountsList()
      const isSignerIncludeDeployer = (protocolModules[protocolModule].actions.init.signers as string[]).includes('deployer')

      if (cmdInput.deployer) {
        if (accountFiles.includes(`${cmdInput.deployer}.json`)) {
          deployerId = cmdInput.deployer
        }
      }

      if (accountFiles.length > 0 && isSignerIncludeDeployer && deployerId === undefined) {
        deployerId = await selectDeployerPrompt()
      }
    }

    /**
     * Analytics
     */
    let allowAnalytics = false

    if (!cmdInput.ignoreAnalytics) {
      allowAnalytics = await confirm({
        message: `Do you allow INFINIT CLI to send usage data to help improve the tool? (This can be changed later in the config file)`,
        default: true,
      })
    }

    /**
     * Package Manager
     */

    const packageManager = getPackageManager(projectDirectory)

    /**
     * Initialize CLI Project
     */

    const { generatedScriptFile } = await initializeCliProject(projectDirectory, protocolModule, chainId, packageManager, deployerId, allowAnalytics)

    try {
      await compileProject(projectDirectory, protocolModule)
    } catch {
      console.log(
        chalkWarning('⚠️ Failed to compile the project. Please run ' + chalkInfo('`bunx infinit compile`') + 'to compile the project after initializing.'),
      )
    }

    console.log(chalkSuccess(`🔥 Successfully initialized a project, go to ${chalkInfo(`src/scripts/${generatedScriptFile}`)} to start building.`))
  } catch (error) {
    console.error(chalkError(error))
  }
}
