import { pipeInto } from 'ts-functional-pipe'

import { PromptWrapper, ValidatePrompt } from '@commons/prompt-wrapper'

import { CHAINS } from '@constants/chains'
import { protocolModules } from '@constants/protocol-module'
import { CHAIN_ID } from '@enums/chain'
import type { PROTOCOL_MODULE } from '@enums/module'
import { PACKAGE_MANAGER } from '@enums/package-managers'
import { Separator, input, select } from '@inquirer/prompts'
import { getAccountsList } from '@utils/account'
import { capitalize } from '@utils/string'
import { validate } from '@utils/validations'
import fs from 'fs'
import path from 'path'

export const projectNamePrompt = () => {
  return ValidatePrompt(input, { message: 'Project name' }, undefined, validate.required)
}

export const chainNamePrompt = () => {
  return PromptWrapper(
    select<CHAIN_ID>,
    // TODO: Chain name prompt will need to support custom chain in the future
    // return select<CHAIN_ID | 'custom'>,
    {
      message: 'Chain',
      choices: [
        ...Object.entries(CHAINS).map(([chainId, chainInfo]) => ({ name: pipeInto(chainInfo.name, capitalize), value: chainId as CHAIN_ID })),
        new Separator(),
        // { name: 'Custom', value: 'custom' },
        // new Separator(),
      ],
    },
    undefined,
  )
}

export const protocolModulePrompt = () => {
  return PromptWrapper(
    select<PROTOCOL_MODULE>,
    {
      message: 'Protocol Module',
      choices: [...Object.values(protocolModules).map((protocol) => ({ name: protocol.name, value: protocol.key }))],
    },
    undefined,
  )
}

export const chainCustomRpcPrompt = () => {
  return ValidatePrompt(input, { message: 'RPC URL' }, undefined, validate.required, validate.url)
}

export const packageMangerSelectionPrompt = (): Promise<PACKAGE_MANAGER> => {
  return PromptWrapper(
    select<PACKAGE_MANAGER>,
    {
      message: 'Package Manager',
      choices: [...Object.values(PACKAGE_MANAGER).map((packageManager) => ({ name: packageManager, value: packageManager }))],
    },
    undefined,
  ) as Promise<PACKAGE_MANAGER>
}

export const selectDeployerPrompt = () => {
  const { accountFiles, accountsFolderPath } = getAccountsList()
  const longestAccountId = accountFiles.reduce((acc, file) => {
    const accountId = file.split('.')[0]
    return accountId.length > acc ? accountId.length : acc
  }, 0)

  const choices = accountFiles.map((file) => {
    const keystore = JSON.parse(fs.readFileSync(path.join(accountsFolderPath, file), 'utf-8'))
    const accountId = file.split('.')[0]

    return { name: `${accountId.padEnd(longestAccountId, ' ')} (0x${keystore.address})`, value: accountId }
  })

  return PromptWrapper(
    select<string>,
    {
      message: 'Deployer account',
      choices,
    },
    undefined,
  )
}
