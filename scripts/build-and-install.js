const { execSync } = require('child_process')
const { renameSync } = require('fs')
const path = require('path')

const packageJson = require('../package.json')

main()

function main() {
  const executableName = packageJson.name
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
