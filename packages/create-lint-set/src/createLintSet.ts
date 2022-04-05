import { program } from 'commander'
import chalk from 'chalk'
import spawn from 'cross-spawn'
const path = require('path')
const fs = require('fs-extra')

import { Item, items } from './items'

// CLI 実行時のオプションを取得
const getOptions = () => {
  const packageJson = require('../package.json')
  let projectPath = '.'
  program
    .name(packageJson.name)
    .version(packageJson.version)
    .argument('[project-path]', 'path to your project', '.')
    .usage(`${chalk.green('[project-path]')}`)
    .action((name) => {
      projectPath = name
    })
    .parse(process.argv)

  return { projectPath }
}

// すでにインストールされているパッケージを除く
const filterInstallPackages = (targetDir: string, itemList: Item[]) => {
  const packageJsonPath = path.resolve(targetDir, 'package.json')
  if (!fs.existsSync(packageJsonPath)) {
    console.error(chalk.red('package.json was not found.'))
    process.exit(1)
  }
  const packageJson = require(packageJsonPath)
  const installedPackages = [
    ...Object.keys(packageJson.dependencies ?? {}),
    ...Object.keys(packageJson.devDependencies ?? {}),
  ]

  return itemList.map((item) => ({
    ...item,
    packages: item.packages.filter((itemPackage) => !installedPackages.includes(itemPackage)),
  }))
}

// インストール
const installPackages = async (
  targetDir: string,
  itemList: Item[],
  useYarn: boolean,
): Promise<void> => {
  const targetPackages = itemList.map((item) => item.packages).flat()
  let command: string
  let args: string[]
  if (useYarn) {
    command = 'yarn'
    args = ['add', '--dev', '--exact', '--cwd', targetDir, ...targetPackages]
  } else {
    command = 'npm'
    args = ['install', '--save-dev', '--save-exact', '--prefix', targetDir, ...targetPackages]
  }

  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit' })
    child.on('close', (code) => {
      if (code !== 0) {
        reject()
      }
      resolve()
    })
  })
}

// すでに設定ファイルが存在するかどうかの確認
const shouldCreateConfigFile = (regex: RegExp, fileNames: string[]) => {
  let shouldCreate = true
  for (const fileName of fileNames) {
    if (shouldCreate && regex.test(fileName)) shouldCreate = false
  }
  return shouldCreate
}

// 設定ファイルの作成
const createConfigFiles = (
  scriptDir: string,
  targetDir: string,
  targetDirFiles: string[],
  itemList: Item[],
) => {
  itemList.forEach((item) => {
    if (shouldCreateConfigFile(item.configFilePattern, targetDirFiles)) {
      const templateDir = scriptDir + '/templates/' + item.templateDirName
      fs.copySync(templateDir, targetDir)
    }
  })
}

const printMessage = (itemList: Item[]) => {
  const installedPackageCount = itemList.map((item) => item.packages).flat().length
  if (installedPackageCount > 0) {
    let isFirst = true
    let packageListString = ''

    itemList.forEach((installedItem) => {
      if (installedItem.packages.length && installedItem.npmScriptsSample) {
        packageListString += `${isFirst ? '' : ','}\n  ${installedItem.npmScriptsSample}`
        isFirst = false
      }
    })
    console.info(
      chalk.green(
        'Packages were successfully installed!🍺\nAdd something like below to your package.json.\n',
      ),
    )
    // 下記のような文字列の出力
    // "scripts": {
    //   "eslint": "eslint './**/*.ts{,x}'"
    // }
    console.info(chalk.cyan(`"scripts": {${packageListString}\n}\n`))
  } else {
    console.info(chalk.green('No packages were added.'))
  }
}

export const init = async () => {
  const { projectPath } = getOptions()
  const scriptDir: string = __dirname // このスクリプト自体があるディレクトリ
  const currentDir: string = path.resolve() // npx が実行されているディレクトリ
  const targetDir: string = path.join(currentDir, projectPath) // 対象プロジェクトのディレクトリ
  const targetDirFiles: string[] = fs.readdirSync(targetDir) // 対象プロジェクトの直下のファイル名配列
  const isUsingYarn: boolean = targetDirFiles.includes('yarn.lock')

  const itemsWithFilteredPackages = filterInstallPackages(targetDir, items)
  await installPackages(targetDir, itemsWithFilteredPackages, isUsingYarn)
  createConfigFiles(scriptDir, targetDir, targetDirFiles, items)
  printMessage(itemsWithFilteredPackages)
}
