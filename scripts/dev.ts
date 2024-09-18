import { $ } from 'bun'
import { watch } from 'fs'

const _output = await $`bun run build`.text()
console.log(_output)
console.log('Watching for changes...\n')

const watcher = watch(`src`, { recursive: true }, async (event, filename) => {
  console.log(`Detected ${event} in ${filename}`)
  const output = await $`bun run build`.text()
  console.log(output)
})

process.on('SIGINT', () => {
  // close watcher when Ctrl-C is pressed
  console.log('Closing...')
  watcher.close()

  process.exit(0)
})
