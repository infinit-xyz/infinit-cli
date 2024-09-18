import type { InfinitAction } from '@infinit-xyz/core'
import { writeFileSync } from '@utils/files'
import path from 'path'

import { generateScriptText } from '@utils/script'

export const handleGenerateScriptFile = async (
  infinitAction: InfinitAction,
  actionKey: string,
  libPath: string,
  filename: string,
  folderPath: string,
  deployerId?: string,
): Promise<string> => {
  const scriptText = generateScriptText(infinitAction, libPath, actionKey, deployerId)

  const filePath = path.join(folderPath, `${filename}.script.ts`)
  writeFileSync(filePath, scriptText)

  return filePath
}
