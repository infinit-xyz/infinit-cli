import { injectedConsole } from '@classes'
import { MOCK_PASSWORD } from '@commands/account/__mock__'
import { notDuplicatedAccountIdPrompt, passwordInputPrompt, passwordWithConfirmPrompt } from '@commands/account/prompt'
import { chalkError } from '@constants/chalk'
import { checkIsAccountFound } from '@utils/account'
import { beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('@utils/account')

describe('Prompt: account', () => {
  beforeEach(async () => {
    injectedConsole.setIsOnUnitTest()
  })

  describe('notDuplicatedAccountIdPrompt', () => {
    test('should not prompt for accountId if provided', async () => {
      vi.mocked(checkIsAccountFound).mockReturnValue(false)

      const { getScreen } = injectedConsole.getNewConsole()

      const promiseAccountIdPrompt = notDuplicatedAccountIdPrompt('mockedId')

      expect(getScreen?.()).toBe('')

      const result = await promiseAccountIdPrompt
      expect(result).toBe('mockedId')
    })

    test('should prompt for accountId if not', async () => {
      vi.mocked(checkIsAccountFound).mockReturnValue(false)

      const { events, getScreen } = injectedConsole.getNewConsole()

      const promiseAccountIdPrompt = notDuplicatedAccountIdPrompt()

      expect(getScreen?.()).toBe('? Enter account ID')

      events?.type('mock-prompt-id')
      await events?.keypress('enter')

      const result = await promiseAccountIdPrompt
      expect(result).toBe('mock-prompt-id')
    })

    test('should prompt for accountId again if duplicated', async () => {
      const duplicateId = 'duplicate-id'
      vi.mocked(checkIsAccountFound).mockImplementation((accountId) => (accountId === duplicateId ? true : false))
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined)

      const { events, getScreen } = injectedConsole.getNewConsole()

      const promiseAccountIdPrompt = notDuplicatedAccountIdPrompt()

      expect(getScreen?.()).toBe('? Enter account ID')

      events?.type(duplicateId)
      await events?.keypress('enter')

      expect(consoleSpy).toHaveBeenCalledWith(chalkError(`${duplicateId} is duplicated, please try again`))

      events?.type('mock-prompt-id')
      await events?.keypress('enter')

      const result = await promiseAccountIdPrompt
      expect(result).toBe('mock-prompt-id')
    })
  })

  describe('password', () => {
    test('should prompt for password and handle required validation correctly', async () => {
      const { events, getScreen } = injectedConsole.getNewConsole()

      const promisePasswordPrompt = passwordInputPrompt()

      expect(getScreen?.()).toBe('? Enter password [input is masked]')

      await events?.keypress('enter')

      expect(getScreen?.()).toBe('? Enter password [input is masked]\n' + '> This field is required')

      events?.type(MOCK_PASSWORD)

      await events?.keypress('enter')

      expect(getScreen?.()).toBe(`✔ Enter password`)

      const result = await promisePasswordPrompt
      expect(result).toBe(MOCK_PASSWORD)
    })

    test.skip('should prompt for password and handle confirmation validation correctly', async () => {
      const { events, getScreen } = injectedConsole.getNewConsole()

      const promisePasswordPrompt = passwordWithConfirmPrompt()

      expect(getScreen?.()).toBe('? Enter password [input is masked]')

      events?.type(MOCK_PASSWORD)
      await events?.keypress('enter')

      expect(getScreen?.()).toBe('? Enter confirm password [input is masked]')

      events?.type('1234')
      await events?.keypress('enter')

      expect(getScreen?.()).toBe('Password not matched, please try again\n? Enter password [input is masked]')

      // reset -> restart

      events?.type(MOCK_PASSWORD)
      await events?.keypress('enter')

      expect(getScreen?.()).toBe('? Enter confirm password [input is masked]')

      events?.type(MOCK_PASSWORD)
      await events?.keypress('enter')

      const result = await promisePasswordPrompt

      expect(result).toBe(MOCK_PASSWORD)
    })
  })
})
