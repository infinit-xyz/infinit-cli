import { describe, expect, test } from 'vitest'
import { PROTOCOL_MODULE } from '@enums/module'

describe('getContractRoot', () => {
  test('should ', () => {
    for (const protocolModule in PROTOCOL_MODULE) {
      const module = protocolModule.replaceAll('_', '-')
      expect(module.includes('_')).toBeFalsy()
    }
  })
})
