import { spawnChild } from '@utils/childprocess'
import { checkIsFoundryInstalled } from '@utils/foundry'
import { describe, expect, test, vi } from 'vitest'

vi.mock('@utils/childprocess')

describe('foundry', () => {
  describe('checkIsFoundryInstalled', () => {
    test('should return true if foundry is installed', async () => {
      vi.mocked(spawnChild).mockImplementation(async () => {})
      const result = await checkIsFoundryInstalled()

      expect(result).toBeTruthy()
    })

    test('should return false if foundry is installed', async () => {
      vi.mocked(spawnChild).mockImplementation(async () => {
        throw new Error('error')
      })

      const result = await checkIsFoundryInstalled()
      expect(result).toBeFalsy()
    })
  })
})
