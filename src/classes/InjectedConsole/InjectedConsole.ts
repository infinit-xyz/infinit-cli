import MuteStream from 'mute-stream'
import stripAnsi from 'strip-ansi'

import { BufferedStream } from '@classes/BufferedStream/BufferedStream'
import { sleep } from '@utils/sleep'
import type { ConsoleReturn, InjectedConsoleEvent, InjectedConsoleEventKeypress, InjectedScreen } from './InjectedConsole.type'

class InjectedConsole {
  #isActivateInjectedConsole: boolean = false

  #currentInputStream: MuteStream | undefined
  #currentOutputStream: BufferedStream | undefined
  #currentEvent: InjectedConsoleEvent | undefined
  #currentScreen: InjectedScreen | undefined
  #currentFullOutput: (() => string) | undefined

  constructor() {}

  public setIsOnUnitTest = () => {
    this.#isActivateInjectedConsole = true
  }

  public getNewConsole = (): ConsoleReturn => {
    if (!this.#isActivateInjectedConsole)
      return { inputStream: undefined, outputStream: undefined, events: undefined, getScreen: undefined, getFullOutput: undefined }
    this.#currentInputStream?.end()
    this.#currentOutputStream?.end()

    const newInputStream = new MuteStream()
    newInputStream.unmute()

    const newOutputStream = new BufferedStream()

    const events = {
      async keypress(key: InjectedConsoleEventKeypress) {
        if (typeof key === 'string') {
          newInputStream.emit('keypress', null, { name: key })
        } else {
          newInputStream.emit('keypress', null, key)
        }
        await sleep(100)
      },
      type(text: string) {
        newInputStream.write(text)
        for (const char of text) {
          newInputStream.emit('keypress', null, { name: char })
        }
      },
    }

    const getScreen: InjectedScreen = ({ raw } = {}) => {
      const lastScreen = newOutputStream.getLastChunk({ raw })
      return raw ? lastScreen : stripAnsi(lastScreen).trim()
    }

    const getFullOutput = () => {
      return newOutputStream.getFullOutput()
    }

    this.#currentInputStream = newInputStream
    this.#currentOutputStream = newOutputStream
    this.#currentEvent = events
    this.#currentScreen = getScreen
    this.#currentFullOutput = getFullOutput

    return { inputStream: newInputStream, outputStream: newOutputStream, events, getScreen, getFullOutput }
  }

  public getCurrentConsole = (): ConsoleReturn => {
    return {
      inputStream: this.#currentInputStream,
      outputStream: this.#currentOutputStream,
      events: this.#currentEvent,
      getScreen: this.#currentScreen,
      getFullOutput: this.#currentFullOutput,
    }
  }
}

export const injectedConsole = new InjectedConsole()
