import { name as cliName, version as cliVersion } from 'package.json'
import { describe, expect, test } from 'vitest'

import { PROTOCOL_MODULE } from '@enums/module'
import { INFINITLibraryError } from '@errors/index'

describe('INFINITLibraryError', () => {
  const nodeVersion = process.versions.node
  test('should match snapshot', () => {
    expect(new INFINITLibraryError(PROTOCOL_MODULE.aave_v3, 'error')).toMatchInlineSnapshot(`
        [INFINITLibraryError-${PROTOCOL_MODULE.aave_v3}: error
        ${cliName}: ${cliVersion}
        Node: ${nodeVersion}]
    `)

    expect(new INFINITLibraryError(PROTOCOL_MODULE.token, 'error')).toMatchInlineSnapshot(`
        [INFINITLibraryError-${PROTOCOL_MODULE.token}: error
        ${cliName}: ${cliVersion}
        Node: ${nodeVersion}]
    `)

    expect(new INFINITLibraryError(PROTOCOL_MODULE.init_capital, 'error')).toMatchInlineSnapshot(`
      [INFINITLibraryError-${PROTOCOL_MODULE.init_capital}: error
      ${cliName}: ${cliVersion}
      Node: ${nodeVersion}]
  `)
  })
})
