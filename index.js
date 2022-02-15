const CacheConf = require('cache-conf')
const dotenv = require('dotenv')

const CodaApi = require('./coda-api')
const packageJson = require('./package.json')

const CLEAR_CACHE = 'clear-cache'

timeExecution(main)

async function main() {
  const inputQuery = process.argv[2]
  const env = getEnv()
  const cache = new CacheConf({ projectName: env.alfredWorkflowName })
  const cacheKey = `cache-${env.alfredWorkflowVersion}-${env.docId}-${env.docTableName}`

  if (inputQuery && inputQuery === CLEAR_CACHE) {
    cache.clear()

    console.error('Cache cleared.')

    return
  }

  let rows = cache.get(cacheKey)

  if (!rows) {
    const coda = new CodaApi(env.apiToken)

    rows = await coda.fetchAllItems({
      queryFn: (params) => {
        return coda.getTableRows(env.docId, env.docTableName, params)
      },
      params: {
        limit: 100,
        sortBy: 'natural',
        useColumnNames: true,
      },
    })

    cache.set(cacheKey, rows, {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    })
  }

  const items = [
    {
      uid: CLEAR_CACHE,
      title: 'clear cache',
      subtitle: 'Clear cached data so bookmarks are refreshed on next trigger',
      arg: CLEAR_CACHE,
    },
    ...rows.map((row) => {
      const { id, values } = row
      const { name, url } = values

      return {
        uid: id,
        title: name,
        subtitle: url,
        arg: url,
      }
    }),
  ]

  console.log(JSON.stringify({ items }))
}

function getEnv() {
  const alfredVersion = process.env.alfred_version
  const alfredWorkflowName =
    process.env.alfred_workflow_name || packageJson.name
  const alfredWorkflowVersion =
    process.env.alfred_workflow_version || packageJson.version

  // Load variables from .env when the script is not run by Alfred.
  if (!alfredVersion) {
    dotenv.config()
  }

  const apiToken = process.env.apiToken
  const docId = process.env.docId
  const docTableName = process.env.docTableName

  return {
    alfredVersion,
    alfredWorkflowName,
    alfredWorkflowVersion,
    apiToken,
    docId,
    docTableName,
  }
}

function timeExecution(fn) {
  const startMs = Date.now()

  fn().finally(() => {
    const endMs = Date.now()

    console.error(`\n✨  Done in ${(endMs - startMs) / 1000}s.`)
  })
}
