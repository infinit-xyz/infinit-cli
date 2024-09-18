import { pipeInto } from 'ts-functional-pipe'
import { z } from 'zod'

export function zodGetDefaults<Schema extends z.AnyZodObject>(schema: Schema) {
  const entriesHandler = (entries: [string, z.AnyZodObject][]) => {
    return entries.map(([key, shape]) => {
      if (shape.isOptional()) return [undefined, undefined] as [string | undefined, undefined]
      return [key, undefined] as [string | undefined, undefined]
    })
  }

  const entriesFilter = (entries: [string | undefined, undefined][]): [string, undefined][] => {
    return entries.filter(([key]) => key !== undefined) as [string, undefined][]
  }

  return pipeInto(schema.shape, Object.entries, entriesHandler, entriesFilter, Object.fromEntries)
}
