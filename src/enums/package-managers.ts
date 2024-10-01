export enum PACKAGE_MANAGER {
  npm = 'npm',
  yarn = 'yarn',
  pnpm = 'pnpm',
  bun = 'bun',
}

export const PACKAGE_EXECUTE: Record<PACKAGE_MANAGER, string> = {
  [PACKAGE_MANAGER.npm]: 'npx',
  [PACKAGE_MANAGER.yarn]: 'yarn dlx',
  [PACKAGE_MANAGER.pnpm]: 'pnpm dlx',
  [PACKAGE_MANAGER.bun]: 'bunx',
}
