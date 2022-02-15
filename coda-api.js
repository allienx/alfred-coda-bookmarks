const axios = require('axios')

class NotionApi {
  apiToken = null

  constructor(apiToken) {
    this.apiToken = apiToken
  }

  async getTableRows(docId, docTableName, params = {}) {
    const url = `https://coda.io/apis/v1/docs/${docId}/tables/${docTableName}/rows`
    const headers = {
      Authorization: `Bearer ${this.apiToken}`,
    }

    const result = await axios.get(url, { headers, params })

    return result.data
  }

  async fetchAllItems({ queryFn, params = {} }) {
    const data = []
    const limit = params.limit || 100

    let firstRequest = true
    let pageToken = null

    while (firstRequest || pageToken) {
      try {
        const res = await queryFn({ ...params, limit, pageToken })

        data.push(...res.items)

        if (res.nextPageToken) {
          pageToken = res.nextPageToken
        }
      } catch (err) {
        console.error(err)

        pageToken = null
      }

      firstRequest = false
    }

    return data
  }
}

module.exports = NotionApi
