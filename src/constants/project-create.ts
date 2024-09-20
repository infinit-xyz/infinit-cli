import { Cache } from '@classes/Cache/Cache'
import { FILE_NAMES } from '@constants'
import { cliReadFile } from '@utils/cli-readfile'

const GIT_IGNORE = require('@templates/project-create/gitignore')
const SCRIPT_README = require('@templates/project-create/scripts/README.md')
const SCRIPT_HISTORY_README = require('@templates/project-create/scripts-history-folder/README.md')
const REGISTRY = require('@templates/project-create/infinit.registry.json')
const CACHE_README = require('@templates/project-create/cache/README.md')

export const PROJECT_CREATE_FILES = {
  // project root
  '.gitignore': cliReadFile(GIT_IGNORE),
  // src/*
  'src/scripts/README.md': cliReadFile(SCRIPT_README),
  [`src/${FILE_NAMES.REGISTRY}`]: JSON.stringify(REGISTRY, undefined, 2),
  // scripts-history/*
  'scripts-history/README.md': cliReadFile(SCRIPT_HISTORY_README),
  // cache/*
  'cache/README.md': cliReadFile(CACHE_README),
  [`cache/${FILE_NAMES.CACHE}`]: JSON.stringify(Cache.getCacheDefault(), undefined, 2),
} satisfies Record<string, string>
