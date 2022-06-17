import chalk from 'chalk'

import { init } from './createLintSet'

const currentNodeVersion = process.versions.node
const versions = currentNodeVersion.split('.')
const majorVersion = Number(versions[0])

if (majorVersion < 14) {
  console.error(chalk.red('Requires Node 14 or higher.'))
  process.exit(1)
}

init()
