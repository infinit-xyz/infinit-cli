import MuteStream from 'mute-stream'

import type { BufferedStream } from '@classes/BufferedStream/BufferedStream'

export type InjectedConsoleEventKeypress =
  | string
  | {
      name?: string | undefined
      ctrl?: boolean | undefined
      meta?: boolean | undefined
      shift?: boolean | undefined
    }

export type InjectedConsoleEvent = {
  keypress(key: InjectedConsoleEventKeypress): void
  type(text: string): void
}

export type InjectedScreen = (value?: { raw?: boolean }) => string

export type ConsoleReturn = {
  inputStream: MuteStream | undefined
  outputStream: BufferedStream | undefined
  events: InjectedConsoleEvent | undefined
  getScreen: InjectedScreen | undefined
  getFullOutput: (() => string) | undefined
}
