import fs from 'fs'

/**
 * Check if the file exists and accessible
 * @param path file path
 * @param permissionMode fs.constants
 */
export const ensureAccessibilityAtPath = (path: string, permissionMode?: number) => {
  try {
    fs.accessSync(path, permissionMode ?? fs.constants.F_OK)
  } catch (_) {
    throw new Error('Permission required, run the command with sudo permission')
  }
}
