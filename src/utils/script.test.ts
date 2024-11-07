import { protocolModules } from '@constants/protocol-module'
import { PROTOCOL_MODULE } from '@enums/module'
import { generateScriptText } from '@utils/script'
import { zodGetDefaults } from '@utils/zod'
import { describe, expect, test } from 'vitest'
import type { AnyZodObject } from 'zod'

describe('generateScriptText', () => {
  const initialAction = protocolModules[PROTOCOL_MODULE.aave_v3].actions.init
  const libPath = protocolModules[PROTOCOL_MODULE.aave_v3].libPath
  const paramsSchema = initialAction.paramsSchema as AnyZodObject
  const generatedText = generateScriptText(initialAction, libPath, 'init')

  test('should generate script text correctly (partial match)', () => {
    expect(generatedText).toContain(`import { ${initialAction.actionClassName}, type actions } from '${libPath}/actions'`)

    const zodObjectDefault = zodGetDefaults(initialAction.paramsSchema)
    const allZodKeys = Object.keys(zodObjectDefault)

    expect(generatedText).toContain(`type Param = z.infer<typeof actions['init']['paramsSchema']>`)
    expect(generatedText).toContain(`const params: Param = {`)
    allZodKeys.forEach((key) => {
      expect(generatedText).toContain(`"${key}": undefined`)
      expect(generatedText).toContain(`// TODO: ${paramsSchema.shape[key].description ?? ''}`)
    })

    expect(generatedText).toContain(`const signer = {`)
    initialAction.signers.forEach((signer) => {
      expect(generatedText).toContain(`"${signer}": ""`)
    })

    expect(generatedText).toContain(`export default { params, signer, Action: ${initialAction.actionClassName} }`)
  })

  test('should generate script text correctly (exact match)', () => {
    expect(generatedText).toMatchSnapshot()
  })

  test('should generate script text correctly with deployer (exact match)', () => {
    const generatedTextWithDeployer = generateScriptText(initialAction, libPath, 'init', 'test-deployer')
    expect(generatedTextWithDeployer).toMatchSnapshot()
  })
})
