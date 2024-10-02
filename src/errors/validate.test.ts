import { name as cliName, version as cliVersion } from 'package.json'
import { describe, expect, test } from 'vitest'

import { ValidateInputValueError } from '@errors/index'

describe('ValidateInputValueError', () => {
  const nodeVersion = process.versions.node
  test('should match snapshot', () => {
    expect(new ValidateInputValueError('error')).toMatchInlineSnapshot(`
        [ValidateInputValueError: error
        ${cliName}: ${cliVersion}
        Node: ${nodeVersion}]
    `)
  })
})
