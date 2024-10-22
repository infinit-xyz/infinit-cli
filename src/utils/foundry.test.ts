import { checkIsFoundryInstalled } from '@utils/foundry'
import { describe, expect, test } from 'vitest'

describe('foundry', () => {
  describe('checkIsFoundryInstalled', () => {
    test('should return true if foundry is installed', async () => {
      const result = await checkIsFoundryInstalled()

      expect(result).toBeTruthy()
    })
  })
})
