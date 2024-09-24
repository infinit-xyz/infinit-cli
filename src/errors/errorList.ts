export const ERROR_MESSAGE_RECORD = {
  ACCOUNT_NOT_FOUND: (id: string) => `Account with id ${id} not found`,
  FILE_PATH_NOT_FOUND: (path: string) => `File not found at ${path}`,
  FILE_NAME_NOT_FOUND: (name: string) => `File ${name} not found`,

  PERMISSION_DENIED: 'Permission required, run the command with sudo permission',

  PROTOCOL_NOT_SUPPORTED: 'Protocol module not supported',
}
