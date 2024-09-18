import { config } from '@classes'
import { SUPPORTED_PROTOCOL_MODULES } from '@constants'
import { chalkError } from '@constants/chalk'
import type { PROTOCOL_MODULE } from '@enums/module'
import { compileProject } from '@utils/project'
import path from 'path'

export const handleCompileProject = async () => {
  const root = path.resolve()
  const _config = config.getProjectConfig()

  // validate supported protocol module
  const protocolModule = _config.protocol_module as PROTOCOL_MODULE
  if (protocolModule && !SUPPORTED_PROTOCOL_MODULES.includes(protocolModule)) {
    console.log(chalkError(`protocol_module ${protocolModule} is not supported`))
    return
  }

  await compileProject(root, protocolModule)
}
