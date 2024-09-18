import { Stream } from 'node:stream'
import ansiEscapes from 'ansi-escapes'
import stripAnsi from 'strip-ansi'
import { pipeInto } from 'ts-functional-pipe'

import { completelyRemoveAnsi } from '@utils/ansi'

const ignoredAnsi = new Set([ansiEscapes.cursorHide, ansiEscapes.cursorShow])

/**
 * This class is originally from https://github.com/SBoudrias/Inquirer.js/blob/main/packages/testing/src/index.mts
 * with some modifications for compatibility with ValidatePrompt and fix some types.
 */
export class BufferedStream extends Stream.Writable {
  #_fullOutput: string = ''
  #_chunks: Array<string> = []
  #_rawChunks: Array<string> = []

  override _write(chunk: Buffer, _encoding: string, callback: () => void) {
    const str = pipeInto(chunk.toString(), completelyRemoveAnsi)

    this.#_fullOutput += str

    // There's some ANSI Inquirer just send to keep state of the terminal clear; we'll ignore those since they're
    // unlikely to be used by end users or part of prompt code.
    if (!ignoredAnsi.has(str)) {
      this.#_rawChunks.push(str)
    }

    // Stripping the ANSI codes here because Inquirer will push commands ANSI (like cursor move.)
    // This is probably fine since we don't care about those for testing; but this could become
    // an issue if we ever want to test for those.
    if (stripAnsi(str).trim().length > 0) {
      this.#_chunks.push(str)
    }

    callback()
  }

  getLastChunk({ raw }: { raw?: boolean }): string {
    const chunks = raw ? this.#_rawChunks : this.#_chunks
    const lastChunk = chunks.at(-1)
    return lastChunk ?? ''
  }

  getFullOutput(): string {
    return this.#_fullOutput
  }
}
