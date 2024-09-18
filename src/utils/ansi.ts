import stripAnsi from 'strip-ansi'
import { pipeInto } from 'ts-functional-pipe'

export const completelyRemoveAnsi = (str: string) => pipeInto(str, JSON.stringify, JSON.parse, stripAnsi)
