import { pipeInto } from 'ts-functional-pipe'
import { expect } from 'vitest'
import { completelyRemoveAnsi } from './ansi'

export function createLogsMatcher(_output: string) {
  const output = pipeInto(_output, completelyRemoveAnsi)

  return {
    logOutput() {
      console.log(output)
    },

    should: {
      contain: (match: string) => expect(output).toContain(match),
      not: {
        contain: (match: string) => expect(output).not.toContain(match),
      },
    },
  }
}
