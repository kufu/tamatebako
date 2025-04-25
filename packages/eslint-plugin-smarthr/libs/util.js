const PARENT_DIR_REGEX = /^(.+)\/.+?$/
const getParentDir = (filename) => filename.match(PARENT_DIR_REGEX)?.[1] || ''

module.exports = { getParentDir }
