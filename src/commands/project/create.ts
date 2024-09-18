import chalk from 'chalk'
import fs from 'fs'
import fsExtra from 'fs-extra'
import os from 'os'
import path from 'path'
import { pipeInto } from 'ts-functional-pipe'

import { chainNamePrompt, packageMangerSelectionPrompt, projectNamePrompt, protocolModulePrompt, selectDeployerPrompt } from '@commands/project/create.prompt'
import type { CreateInput, GetProjectNameParams } from '@commands/project/create.type'
import { chalkError, chalkInfo, chalkSuccess } from '@constants/chalk'
import { protocolModules } from '@constants/protocol-module'
import type { CHAIN_ID } from '@enums/chain'
import { PACKAGE_MANAGER } from '@enums/package-managers'
import { confirm } from '@inquirer/prompts'
import { getAccountsList } from '@utils/account'
import { toSupportedChainID } from '@utils/chain'
import { getFilesCurrentDir } from '@utils/files'
import { compileProject, initializeCliProject } from '@utils/project'
import { getProtocolModule } from '@utils/protocol-module'
import { trim } from '@utils/string'

/**
 * Utils
 */

const getProjectName = async ({ currentDirectoryFiles, currentProjectName }: GetProjectNameParams): Promise<string> => {
  try {
    const projectName = currentProjectName ?? (await projectNamePrompt())

    // shouldn't happen
    if (!projectName) {
      throw new Error('Project name is required')
    }
    // check if the project name folder is already exist
    else if (currentDirectoryFiles.includes(projectName)) {
      throw new Error(`${projectName} is already exists`)
    }

    return projectName
  } catch (error) {
    console.log(chalkError(error))

    // retry
    const newProjectName = await projectNamePrompt()
    return getProjectName({ currentDirectoryFiles, currentProjectName: newProjectName })
  }
}

/**
 * @deprecated handleProjectCreate handle project creation
 * @param cmdInput
 * @returns
 */
export const handleProjectCreate = async (cmdInput: CreateInput) => {
  try {
    /**
     * Name
     */
    const cmdProjectName = pipeInto(cmdInput.name, trim)
    const currentDirectoryFiles = getFilesCurrentDir()

    const projectName = await getProjectName({ currentDirectoryFiles, currentProjectName: cmdProjectName })

    /**
     * Chain
     */
    const cmdChainId: CHAIN_ID | undefined = pipeInto(cmdInput.chain, trim, toSupportedChainID)
    const chainId = cmdChainId ?? (await chainNamePrompt())

    if (!chainId) {
      throw new Error('Chain is required')
    }

    /**
     * Protocol
     */
    const inputModule = cmdInput.module
    let protocolModule = getProtocolModule(inputModule)

    if (!protocolModule) {
      const protocolPrompt = await protocolModulePrompt()
      protocolModule = protocolPrompt
    }

    if (!protocolModule) {
      throw new Error('Protocol module is required')
    }

    /**
     * Deployer Account
     */
    const { accountFiles } = getAccountsList()
    const isSignerIncludeDeployer = (protocolModules[protocolModule].actions.init.signers as string[]).includes('deployer')

    let deployerId: string | undefined

    if (cmdInput.deployer) {
      if (accountFiles.includes(`${cmdInput.deployer}.json`)) {
        deployerId = cmdInput.deployer
      }
    }

    if (accountFiles.length > 0 && isSignerIncludeDeployer && deployerId === undefined) {
      deployerId = await selectDeployerPrompt()
    }

    /**
     * Package Manager
     */

    let packageManager: PACKAGE_MANAGER | undefined
    if (cmdInput.useNpm) {
      packageManager = PACKAGE_MANAGER.npm
    } else if (cmdInput.useYarn) {
      packageManager = PACKAGE_MANAGER.yarn
    } else if (cmdInput.usePnpm) {
      packageManager = PACKAGE_MANAGER.pnpm
    } else if (cmdInput.useBun) {
      packageManager = PACKAGE_MANAGER.bun
    }

    if (!packageManager) {
      packageManager = await packageMangerSelectionPrompt()
    }

    /**
     * Custom Chain
     */

    // if (chainPrompt === 'custom') {
    //   // const customChainRpcUrl = await chainCustomRpcPrompt()
    // }

    // const _isImportDeployer = cmdInput.importDeployer
    // const isImportDeployer = _isImportDeployer ?? (await confirm({ message: 'Do you want to import deployer now?', default: false }))

    /**
     * Confirm
     */

    let isConfirmedCreate = cmdInput.confirm

    if (isConfirmedCreate === undefined) {
      isConfirmedCreate = await confirm({ message: 'Do you confirm to create the project?', default: true })
    }

    if (!isConfirmedCreate) {
      console.log(chalkError('User denied the confirmation to creating new project.'))
      return
    }

    /**
     * Create Project
     */
    const projectDirectory = path.resolve(projectName)
    fs.mkdirSync(projectDirectory)
    fsExtra.ensureDirSync(projectDirectory)

    console.log('Creating a new INFINIT project in', chalkInfo(projectDirectory))

    // create package.json
    const packageJson = {
      name: projectName,
      version: '1.0.0',
      private: true,
      peerDependencies: {
        typescript: '^5.0.0',
      },
    }

    fs.writeFileSync(path.join(projectDirectory, 'package.json'), JSON.stringify(packageJson, null, 2) + os.EOL)

    console.log(chalk.cyan('------------------------------------------------'))

    await initializeCliProject(projectDirectory, protocolModule, chainId, packageManager, deployerId)
    await compileProject(projectDirectory, protocolModule)

    console.log('')
    console.log(`${chalkSuccess('Create project successfully!')} You can go to the project with the following command.\n`)
    console.log(`cd ${chalkInfo(projectDirectory)}`)
  } catch (error) {
    console.log(chalkError(error))
  }
}
