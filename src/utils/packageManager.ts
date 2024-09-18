import { PACKAGE_MANAGER } from '@enums/package-managers'
import fs from 'fs'
import path from 'path'
import { match } from 'ts-pattern'

export const getPackageManagerInstallArgs = (packageManager: PACKAGE_MANAGER, isDevDependency: boolean) => {
  return match<PACKAGE_MANAGER>(packageManager)
    .with(PACKAGE_MANAGER.npm, () => ['install', '--no-audit', isDevDependency ? '--save-dev' : '--save', '--save-exact', '--loglevel', 'error'])
    .with(PACKAGE_MANAGER.yarn, () => ['add', ...(isDevDependency ? ['--dev'] : []), '--exact'])
    .with(PACKAGE_MANAGER.pnpm, () => ['install', isDevDependency ? '--save-dev' : '--save', '--save-exact', '--loglevel', 'error'])
    .with(PACKAGE_MANAGER.bun, () => ['install', '--no-audit', isDevDependency ? '--dev' : '--save', '--exact'])
    .exhaustive()
}

export const getPackageManager = (projectPath: string): PACKAGE_MANAGER => {
  if (fs.existsSync(path.resolve(projectPath, 'pnpm-lock.yaml'))) {
    return PACKAGE_MANAGER.pnpm
  } else if (fs.existsSync(path.resolve(projectPath, 'yarn.lock'))) {
    return PACKAGE_MANAGER.yarn
  } else if (fs.existsSync(path.resolve(projectPath, 'package-lock.json'))) {
    return PACKAGE_MANAGER.npm
  } else if (fs.existsSync(path.resolve(projectPath, 'bun.lockb'))) {
    return PACKAGE_MANAGER.bun
  } else {
    throw new Error('Package manager not found')
  }
}
