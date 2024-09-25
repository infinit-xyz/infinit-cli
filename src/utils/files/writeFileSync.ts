import fs from 'fs'
import fsExtra from 'fs-extra'
import path from 'path'

const { pathExistsSync } = fsExtra // prevent CLI failed to run due to fsExtra

/**
 * Write file synchronously and create parent directory if not exist
 * @param file file path
 * @param data file content
 */
export const writeFileSync = (filePath: string, data: string) => {
  const parentPath = path.join(filePath, '..')
  const isPathExist = pathExistsSync(parentPath)

  if (!isPathExist) {
    fs.mkdirSync(parentPath, { recursive: true })
  }

  fs.writeFileSync(filePath, data)
}
