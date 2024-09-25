import { name as cliName, version as cliVersion } from 'package.json'
import { describe, expect, test } from 'vitest'

import { AccountValidateError } from '@errors/index'

const nodeVersion = process.versions.node
describe('AccountValidateError', () => {
  test('should match snapshot', () => {
    expect(new AccountValidateError('account')).toMatchInlineSnapshot(`
        [AccountValidateError: account
        ${cliName}: ${cliVersion}
        Node: ${nodeVersion}]
    `)
  })
})

describe('AccountValidateError', () => {
  test('should match snapshot', () => {
    expect(new AccountValidateError('account')).toMatchInlineSnapshot(`
          [AccountValidateError: account
          ${cliName}: ${cliVersion}
          Node: ${nodeVersion}]
      `)
  })
})
