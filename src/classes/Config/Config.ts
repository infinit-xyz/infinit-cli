import fs from 'fs'
import yaml from 'js-yaml'
import os from 'os'
import path from 'path'

import { FILE_NAMES } from '@constants'
import { FileNotFoundError } from '@errors/fs'
import type { InfinitConfigSchema } from '@schemas/generated'
import { checkFilesExist, ensureCwdRootProject } from '@utils/files'

export const HOME_DIRECTORY = os.homedir()
export const DATA_FOLDER = path.join(HOME_DIRECTORY, '.infinit')
export const DATA_SUBFOLDERS = ['accounts']

export class Config {
  private infinitConfig: InfinitConfigSchema | undefined

  constructor() {
    // NOTE: load network config brah brah...
    // this.infinitConfig = {} as InfinitConfigSchema
    // this.#loadConfig()
  }

  /**
   * Private
   */

  private getExpectedConfigPath() {
    return path.join(process.cwd(), 'src', FILE_NAMES.CONFIG)
  }

  private saveConfig() {
    ensureCwdRootProject()

    const expectedConfigPath = this.getExpectedConfigPath()
    fs.writeFileSync(expectedConfigPath, yaml.dump(this.infinitConfig))
  }

  /**
   * Public
   */
  public getProjectConfig(): InfinitConfigSchema {
    if (this.infinitConfig) {
      return this.infinitConfig
    }

    ensureCwdRootProject()

    const isConfigFileExist = checkFilesExist({ src: { [FILE_NAMES.CONFIG]: true } }, process.cwd(), 'require', true)
    const expectedConfigPath = this.getExpectedConfigPath()

    if (!isConfigFileExist) {
      throw new FileNotFoundError(expectedConfigPath)
    }

    const config = yaml.load(fs.readFileSync(expectedConfigPath, 'utf-8')) as InfinitConfigSchema
    this.infinitConfig = config
    return config
  }

  // check Blockscout
  public setProjectConfigBlockExplorer(config: Partial<InfinitConfigSchema['chain_info']['block_explorer']>) {
    const projectConfig = this.getProjectConfig()
    projectConfig.chain_info.block_explorer = {
      ...projectConfig.chain_info.block_explorer,
      ...config,
    }
    this.infinitConfig = projectConfig

    this.saveConfig()
  }
}

export const config = new Config()
