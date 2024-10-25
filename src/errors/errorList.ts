export const ERROR_MESSAGE_RECORD = {
  ACCOUNT_NOT_FOUND: (id: string) => `Account with id ${id} not found`,
  FILE_PATH_NOT_FOUND: (path: string) => `File not found at ${path}`,

  PERMISSION_DENIED: 'Permission required, run the command with sudo permission',

  PROTOCOL_NOT_SUPPORTED: 'Protocol module not supported',

  NODE_VERSION_NOT_SUPPORTED: (expectedNodeVersion: string, currentVersion: string) =>
    `Node.js version must be ${expectedNodeVersion} or higher. You are using ${currentVersion}.`,

  INVALID_CONFIG: 'Invalid Config, please recheck the config with the documentation.\nhttps://dev.infinit.tech/guides/configuration',
}
