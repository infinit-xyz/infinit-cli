import { injectedConsole } from '@classes'
import { select } from '@inquirer/prompts'
import { beforeEach, describe, expect, test } from 'vitest'
import { PromptWrapper } from '.'

const choices = [
  { name: 'action1', value: 'value1' },
  { name: 'action2', value: 'value2' },
  { name: 'action3', value: 'value3' },
]

beforeEach(() => {
  injectedConsole.setIsOnUnitTest()
  injectedConsole.getNewConsole()
})

describe('Prompt Wrapper', () => {
  test('should prompt for select and return result correctly', async () => {
    const { events, getScreen } = injectedConsole.getCurrentConsole()

    const promisePrompt = PromptWrapper(select, { message: 'Select action', choices })

    expect(getScreen?.()).toBe('? Select action (Use arrow keys)\n' + `❯ action1\n` + `  action2\n` + `  action3`)

    events?.keypress('down')
    events?.keypress('down')

    expect(getScreen?.()).toBe('? Select action\n' + `  action1\n` + `  action2\n` + `❯ action3`)

    events?.keypress('enter')

    expect(getScreen?.()).toBe('? Select action action3')

    const result = await promisePrompt

    expect(result).toBe('value3')
  })
})
