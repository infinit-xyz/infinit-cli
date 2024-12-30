import { ContractProvider } from '@infinit-xyz/core'
import fs from 'fs'
import yaml from 'js-yaml'
import _ from 'lodash'
import ora from 'ora'
import os from 'os'
import path from 'path'
import { match } from 'ts-pattern'

import { getScriptFileDirectory, handleGenerateScriptFile } from '@commands/script/generate/utils'
import { DEFAULT_ACTION_KEY, FILE_NAMES } from '@constants'
import { CHAINS } from '@constants/chains'
import { chalkInfo } from '@constants/chalk'
import { PROJECT_CREATE_FILES } from '@constants/project-create'
import { protocolModules } from '@constants/protocol-module'
import type { CHAIN_ID } from '@enums/chain'
import { PROTOCOL_MODULE } from '@enums/module'
import type { PACKAGE_MANAGER } from '@enums/package-managers'
import { ValidateInputValueError } from '@errors/validate'
import type { InfinitConfigSchema } from '@schemas/generated'
import { sendOffChainEvent } from '@utils/analytics'
import { spawnChild } from '@utils/childprocess'
import { writeFileSync } from '@utils/files'
import { getPackageManagerInstallArgs } from '@utils/packageManager'

import { dependencies as packageJsonDependencies, name as packageJsonName } from 'package.json'

export const getProtocolModule = (protocolModule: PROTOCOL_MODULE) =>
  match<PROTOCOL_MODULE>(protocolModule)
    .with(PROTOCOL_MODULE.token, () => `token`)
    .with(PROTOCOL_MODULE.aave_v3, () => `aave-v3`)
    .with(PROTOCOL_MODULE.uniswap_v3, () => `uniswap-v3`)
    .with(PROTOCOL_MODULE.init_capital, () => `init-capital`)
    .with(PROTOCOL_MODULE.pendle, () => `pendle`)
    .exhaustive()

export const compileProject = async (projectDirectory: string, _protocolModule: PROTOCOL_MODULE) => {
  // 1. prepare contract directory
  const protocolModule = getProtocolModule(_protocolModule)

  const protocolModuleDirectory = path.join(projectDirectory, 'node_modules', `@infinit-xyz/${protocolModule}`)
  const contractDirectory = path.resolve(protocolModuleDirectory, 'contracts')

  // read only the contract folders
  const directories = fs.readdirSync(contractDirectory, { withFileTypes: true })
  const contracts = directories.filter((dir) => dir.isDirectory()).map((dir) => dir.name)

  const spinner = ora({ spinner: 'dots' }).start()

  // 2. start spinner progress
  spinner.start(`Compiling ${chalkInfo(contracts[0])} (${chalkInfo(1)}/${chalkInfo(contracts.length)}) sub-module(s)\n`)

  // 3. compile contracts
  const contractProvider = new ContractProvider()

  await contractProvider.compile(contractDirectory, (contractIdx: number, isSuccess: boolean) => {
    if (!isSuccess) {
      spinner.fail(`Failed to compile ${chalkInfo(contracts[contractIdx])} (${chalkInfo(contractIdx + 1)}/${chalkInfo(contracts.length)}) sub-module(s)\n`)
      process.exit(1)
    }
    spinner.text = `Compiling ${chalkInfo(contracts[contractIdx])} (${chalkInfo(contractIdx + 1)}/${chalkInfo(contracts.length)}) sub-module(s)\n`
  })

  // 4. done, stop progress bar
  spinner.stopAndPersist({ symbol: '✅', text: `Compiled ${chalkInfo(protocolModule)} module successfully.\n` })
}

/**
 * initializeCliProject initialize INFINIT Project
 * @param projectDirectory directory of the project
 * @param protocolModule
 * @param chainId
 * @param packageManager package manager that will be used to install dependencies
 */
export const initializeCliProject = async (
  projectDirectory: string,
  protocolModule: PROTOCOL_MODULE,
  chainId: CHAIN_ID,
  packageManager: PACKAGE_MANAGER,
  deployerId?: string,
  allowAnalytics?: boolean,
): Promise<{ generatedScriptFile: string }> => {
  const packageJsonFile = fs.readFileSync(path.join(projectDirectory, 'package.json'), 'utf-8')
  const projectName = JSON.parse(packageJsonFile).name

  const protocolModuleInfo = protocolModules[protocolModule]

  // Override package.json
  const oldPackageJsonFile = fs.readFileSync(path.join(projectDirectory, 'package.json'), 'utf-8')
  const oldPackageJson = JSON.parse(oldPackageJsonFile)
  const packageJson = {
    ...oldPackageJson,
    engines: {
      node: '>=22',
    },
  }

  fs.rmSync(path.join(projectDirectory, 'package.json'))
  fs.writeFileSync(path.join(projectDirectory, 'package.json'), JSON.stringify(packageJson, null, 2) + os.EOL)

  // Write files from constants
  for (const [filename, content] of Object.entries(PROJECT_CREATE_FILES)) {
    writeFileSync(path.join(projectDirectory, filename), content + os.EOL)
  }

  process.chdir(projectDirectory)

  // Write config file
  const CONFIG_SCHEMA = `../node_modules/${packageJsonName}/dist/schemas/config/${FILE_NAMES.CONFIG_SCHEMA}`
  const chainInfo = CHAINS[chainId]
  const config: InfinitConfigSchema = {
    project_name: projectName,
    protocol_module: protocolModule,
    chain_info: {
      name: chainInfo.name,
      short_name: chainInfo.shortName,
      network_id: parseInt(chainInfo.chainId),
      native_currency: chainInfo.nativeCurrency,
      rpc_url: chainInfo.rpcList[0],
      block_explorer: {
        name: chainInfo.viemChain.instance.blockExplorers?.default.name ?? '',
        url: chainInfo.viemChain.instance.blockExplorers?.default.url ?? '',
        api_url: chainInfo.viemChain.instance.blockExplorers?.default.apiUrl ?? '',
        api_key: '',
      },
    },
    allow_analytics: allowAnalytics,
  }
  fs.writeFileSync(path.join(projectDirectory, 'src', FILE_NAMES.CONFIG), `# yaml-language-server: $schema=${CONFIG_SCHEMA}\n\n` + yaml.dump(config) + os.EOL)

  // Write default action file
  const actions = protocolModuleInfo.actions
  const initAction = actions[DEFAULT_ACTION_KEY]

  if (!initAction) {
    throw new ValidateInputValueError('Initialize action not found')
  }
  const scriptFolderPath = getScriptFileDirectory(projectDirectory)
  const camelCaseActionName = _.camelCase(initAction.actionClassName)
  await handleGenerateScriptFile(initAction, DEFAULT_ACTION_KEY, protocolModuleInfo.libPath, camelCaseActionName, scriptFolderPath, deployerId)

  // Install dependencies
  console.log(`\n🚀 Initialize a project from ${chalkInfo(protocolModule)} module.`)
  console.log(`\n📦 Dependencies`)
  console.log(`- ${protocolModuleInfo.libPath}\n`)

  const libNameWithVersion = `${protocolModuleInfo.libPath}@${packageJsonDependencies[protocolModuleInfo.libPath]}`
  const dependencies = [libNameWithVersion]
  const devDependencies = ['hardhat', 'typescript']

  const args = getPackageManagerInstallArgs(packageManager, false).concat(dependencies)
  const devDependencyArgs = getPackageManagerInstallArgs(packageManager, true).concat(devDependencies)

  const spinner = ora({ spinner: 'dots' }).start()

  spinner.start(`Installing dependencies...`)

  await spawnChild(packageManager, args)
  await spawnChild(packageManager, devDependencyArgs)

  spinner.stopAndPersist({ symbol: '✅', text: `Dependencies installed successfully.` })

  if (allowAnalytics) {
    sendOffChainEvent({ action: 'init', payload: { project_name: projectName, protocol_module: protocolModule, chain_id: chainId } })
  }

  spinner.stop()

  return {
    generatedScriptFile: `${camelCaseActionName}.script.ts`,
  }
}
