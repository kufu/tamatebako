const getParentDir = (filename) => {
  const dir = filename.match(/^(.+?)\..+?$/)[1].split('/')
  dir.pop()

  return dir.join('/')
}

module.exports = { getParentDir }
