import { name as cliName, version as cliVersion } from 'package.json'
import { describe, expect, test } from 'vitest'

import { EXPECTED_NODE_VERSION } from '@constants'
import { ERROR_MESSAGE_RECORD } from '@errors/errorList'
import { FileNotFoundError, NodeValidateError, PermissionNotFoundError } from '@errors/index'

const nodeVersion = process.versions.node
describe('FileNotFoundError', () => {
  test('should match snapshot', () => {
    expect(new FileNotFoundError('value')).toMatchInlineSnapshot(`
        [FileNotFoundError: ${ERROR_MESSAGE_RECORD.FILE_PATH_NOT_FOUND('value')}
        ${cliName}: ${cliVersion}
        Node: ${nodeVersion}]
    `)
  })
})

describe('PermissionNotFoundError', () => {
  test('should match snapshot', () => {
    expect(new PermissionNotFoundError()).toMatchInlineSnapshot(`
        [PermissionNotFoundError: ${ERROR_MESSAGE_RECORD.PERMISSION_DENIED}
        ${cliName}: ${cliVersion}
        Node: ${nodeVersion}]
    `)
  })
})

describe('NodeValidateError', () => {
  test('should match snapshot', () => {
    expect(new NodeValidateError(EXPECTED_NODE_VERSION, nodeVersion)).toMatchInlineSnapshot(`
        [NodeValidateError: ${ERROR_MESSAGE_RECORD.NODE_VERSION_NOT_SUPPORTED(EXPECTED_NODE_VERSION, nodeVersion)}
        ${cliName}: ${cliVersion}
        Node: ${nodeVersion}]
    `)
  })
})
