import Module from 'module'

/**
 * Run require resolve from a given path
 */
export function requireResolveFrom(moduleId: string, fromDir: string): string | undefined {
  try {
    const resolvedPath = require.resolve(moduleId, {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      paths: (Module as any)._nodeModulePaths(fromDir),
    })

    return resolvedPath
  } catch {
    return undefined
  }
}
