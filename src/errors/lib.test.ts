import { name as cliName, version as cliVersion } from 'package.json'
import { describe, expect, test } from 'vitest'

import { PROTOCOL_MODULE } from '@enums/module'
import { ProtocolModuleLibError } from '@errors/index'

describe('ProtocolModuleLibError', () => {
  const nodeVersion = process.versions.node
  test('should match snapshot', () => {
    expect(new ProtocolModuleLibError(PROTOCOL_MODULE.aave_v3, 'error')).toMatchInlineSnapshot(`
        [ProtocolModuleLibError-${PROTOCOL_MODULE.aave_v3}: error
        ${cliName}: ${cliVersion}
        Node: ${nodeVersion}]
    `)

    expect(new ProtocolModuleLibError(PROTOCOL_MODULE.token, 'error')).toMatchInlineSnapshot(`
        [ProtocolModuleLibError-${PROTOCOL_MODULE.token}: error
        ${cliName}: ${cliVersion}
        Node: ${nodeVersion}]
    `)
  })
})
