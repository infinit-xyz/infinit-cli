import fs from 'fs'

export const getFilesCurrentDir = (_path?: string): string[] => {
  const path = _path ?? process.cwd()
  if (!fs.existsSync(path)) {
    return []
  }

  const files = fs.readdirSync(path)
  return files
}
