const { execSync } = require('child_process')
const { renameSync } = require('fs')
const path = require('path')

main()

function main() {
  const executableName = 'alfred-coda-bookmarks'
  const command = [
    'pkg',
    '--target',
    'macos',
    '--output',
    executableName,
    'index.js',
  ].join(' ')

  console.log(command)
  console.log(execSync(command, { encoding: 'utf8' }))

  const dest = process.argv[2]

  if (dest) {
    renameSync(executableName, path.join(dest, executableName))
  }
}
