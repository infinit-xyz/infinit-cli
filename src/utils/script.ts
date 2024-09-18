import type { InfinitAction } from '@infinit-xyz/core'
import { pipeInto } from 'ts-functional-pipe'

import { stringifyWithUndefined } from '@utils/json'
import { zodGetDefaults } from '@utils/zod'

export const generateScriptText = (infinitAction: InfinitAction, libPath: string, actionKey: string, deployerId?: string) => {
  const signers = infinitAction.signers.reduce<Record<string, string>>((acc, signer) => {
    acc[signer] = signer === 'deployer' ? (deployerId ?? '') : ''
    return acc
  }, {})

  const generatedParamsText = pipeInto(infinitAction.paramSchema, zodGetDefaults, stringifyWithUndefined)
  const splittedParamsText = generatedParamsText.split('\n')
  const newSplistedParamsText = []

  for (const line of splittedParamsText) {
    const match = line.match(/"([^"]+)":/) // to get the key from the line in double quotes
    if (match) {
      const key = match[1]
      newSplistedParamsText.push('\n')
      newSplistedParamsText.push(`  // TODO: ${infinitAction.paramSchema.shape[key].description ?? ''}`)
    }
    newSplistedParamsText.push(line)
  }

  const scriptText = `
import { ${infinitAction.actionClassName}, type actions } from '${libPath}/actions'
import type { z } from 'zod'

type Param = z.infer<typeof actions['${actionKey}']['paramSchema']>

// TODO: Replace with actual params
const params: Param = ${newSplistedParamsText.join('\n')}

// TODO: Replace with actual signer id
const signer = ${JSON.stringify(signers, undefined, 2)}

export default { params, signer, Action: ${infinitAction.actionClassName} }

`

  return scriptText
}
