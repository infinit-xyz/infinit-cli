import { name as cliName, version as cliVersion } from 'package.json'
import { describe, expect, test } from 'vitest'

import { AccountNotFoundError, AccountValidateError } from '@errors/index'

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

describe('AccountNotFoundError', () => {
  test('should match snapshot', () => {
    expect(new AccountNotFoundError('account')).toMatchInlineSnapshot(`
          [AccountNotFoundError: account
          ${cliName}: ${cliVersion}
          Node: ${nodeVersion}]
      `)
  })
})
