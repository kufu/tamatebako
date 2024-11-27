'use strict'

const stylelint = require('stylelint')
const path = require('path')

const runLintWithFixtures = async (configFile, target) => {
  const result = await stylelint.lint({
    configFile: configFile,
    files: target
  })

  return JSON.parse(result.output).reduce((output, { source, warnings }) => {
    return Object.assign(output, {
      [path.basename(source)]: warnings.map(({ rule, severity, text }) => ({ rule, severity, text }))
    })
  }, {})
}

module.exports = runLintWithFixtures
